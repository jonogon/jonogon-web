'use client';

import {firebaseAuth} from '@/firebase';

export const runtime = 'edge';

import {useCallback, useEffect, useState} from 'react';
import {useMutation} from '@tanstack/react-query';
import {scope} from 'scope-utilities';
import {TrashIcon} from '@radix-ui/react-icons';
import {useAuthState} from '@/auth/token-manager';

import {useParams, useRouter, useSearchParams} from 'next/navigation';
import {trpc} from '@/trpc/client';
import z from 'zod';
import {Label} from '@/components/ui/label';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {toast} from '@/components/ui/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import PetitionFileUploader from '@/components/custom/PetitionFileUploader';
// import {AutoCompleteInput} from '@/components/ui/input-autocomplete';
// import {petitionLocations, petitionTargets} from '@/lib/constants';

export default function EditPetition() {
    const utils = trpc.useUtils();

    const params = useSearchParams();

    const {id: petition_id} = useParams<{id: string}>();
    const router = useRouter();

    const isAuthenticated = useAuthState();

    const {data: selfResponse, isLoading: isLoadingSelf} =
        trpc.users.getSelf.useQuery(undefined, {
            enabled: !!isAuthenticated,
        });

    const {mutate: updatePetition, isLoading: isPetitionSaving} =
        trpc.petitions.update.useMutation({
            onSuccess: async () => {
                await utils.petitions.get.invalidate({id: petition_id});
                router.push(`/petitions/${petition_id}?status=submitted`);
            },
        });

    const {data: petitionRemoteData, isLoading: isPetitionLoading} =
        trpc.petitions.get.useQuery({
            id: petition_id!,
        });

    const [nextPetitionData, setNextPetitionData] = useState<{
        target?: string;
        location?: string;
        title?: string;
        description?: string;
    }>({});

    const freshValue =
        params.get('fresh') ||
        petitionRemoteData?.data === null ||
        petitionRemoteData?.data === undefined;

    const petitionData = {
        target:
            nextPetitionData.target ??
            petitionRemoteData?.data.target ??
            undefined,
        location:
            nextPetitionData.location ??
            petitionRemoteData?.data.location ??
            undefined,
        title:
            nextPetitionData.title ??
            petitionRemoteData?.data.title ??
            undefined,
        description:
            nextPetitionData.description ??
            petitionRemoteData?.data.description ??
            undefined,
    };

    const handleUpdateData = useCallback(
        (key: keyof typeof nextPetitionData, val: string) => {
            setNextPetitionData((nextPetitionData) => ({
                ...nextPetitionData,
                [key]: val,
            }));
        },
        [setNextPetitionData],
    );

    const handleUpdatePetition = () => {
        updatePetition({
            id: Number(petition_id),
            data: petitionData,
        });
    };

    const handlePetitionSubmission = () => {
        updatePetition({
            id: Number(petition_id),
            data: petitionData,
            also_submit: true,
        });
    };

    const softDeleteMutation = trpc.petitions.softDeletePetition.useMutation({
        onSuccess: () => {
            // Show success message
            toast({
                title: 'Success',
                description: 'Petition has been successfully deleted.',
                variant: 'destructive',
            });

            // Redirect to home page after a short delay
            setTimeout(() => {
                router.push('/?type=own');
            }, 2000); // Redirect after 2 seconds
        },
    });

    const handleSoftDelete = async () => {
        await softDeleteMutation.mutateAsync({id: Number(petition_id)});
    };

    const {mutate: uploadAttachment} = useMutation({
        mutationFn: async (data: {type: 'image' | 'file'; file: File}) => {
            const user = firebaseAuth().currentUser;

            if (!user) {
                return;
            }

            const search = new URLSearchParams({
                type: data.type,
                filename: data.file.name,
            });

            const response = await fetch(
                process.env.NODE_ENV === 'development'
                    ? `http://${window.location.hostname}:12001/petitions/${petition_id}/attachments?${search}`
                    : `https://core.jonogon.org/petitions/${petition_id}/attachments?${search}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/octet-stream',
                        Authorization: `Bearer ${await user.getIdToken()}`,
                    },
                    body: data.file,
                },
            );

            return (await response.json()) as {
                message: 'image-added' | 'attachment-added';
            };
        },
        onSuccess: async (response) => {
            await utils.petitions.get.invalidate({id: petition_id});
        },
    });

    const handleAttachmentUpload = (attachment: {
        type: 'image' | 'file';
        file: File;
    }) => {
        uploadAttachment({
            type: attachment.type,
            file: attachment.file,
        });
    };
    const {mutate: removeAttachment} =
        trpc.petitions.removeAttachment.useMutation({
            onSuccess: async () => {
                await utils.petitions.get.invalidate({id: petition_id});
            },
        });

    const validation = z
        .object({
            title: z.string().min(3),
            target: z.string().min(3),
            location: z.string().min(3),
            description: z.string().optional(),
        })
        .safeParse(petitionData);

    const isValid = validation.success;
    const validationErrors = !validation.success ? validation.error : undefined;

    const isOwnPetition =
        petitionRemoteData &&
        selfResponse &&
        `${petitionRemoteData?.data.created_by}` === `${selfResponse?.data.id}`;

    const isAdmin = !!selfResponse?.meta.token.is_user_admin;
    const isMod = !!selfResponse?.meta.token.is_user_moderator;

    useEffect(() => {
        if (isAuthenticated === false) {
            router.replace(
                `/login?next=${encodeURIComponent(`/petitions/${petition_id}/edit`)}`,
            );
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (isPetitionLoading || isLoadingSelf) {
            return;
        }

        if (isAuthenticated && !isOwnPetition && !isAdmin) {
            router.push(`/petitions/${petition_id}`);

            toast({
                title: 'You are not authorized to edit this petition',
                variant: 'destructive',
            });
        }
    }, [isAdmin, isOwnPetition, isPetitionLoading, isLoadingSelf]);

    return (
        <div className="flex flex-col gap-2 sm:gap-4 max-w-screen-sm mx-auto pt-5 pb-16 px-4">
            <div className="flex flex-col-reverse gap-6 sm:flex-row sm:gap-2 justify-between py-4 sm:py-12 md:py-10">
                <h1
                    className={
                        'text-3xl sm:text-5xl font-regular text-stone-600 leading-0'
                    }>
                    {freshValue ? '✊ Create New দাবি' : '✊ Update দাবি'}
                </h1>
                {freshValue ? (
                    ''
                ) : (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                size={'lg'}
                                disabled={isPetitionSaving}
                                variant={'outline'}>
                                Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete your account and remove
                                    your data from our servers.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleSoftDelete}>
                                    Confirm
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
            <div className="flex flex-col gap-2 sm:gap-5 py-4">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="title">
                        <div className={'font-bold text-lg'}>Title *</div>
                        <div className={'text-stone-500'}>
                            আপনার আবেদনের শিরোনাম লিখুন
                        </div>
                    </Label>
                    <Input
                        className="bg-card text-card-foreground px-3 sm:text-2xl py-2 sm:py-7"
                        id="title"
                        value={petitionData.title ?? ''}
                        onChange={(e) =>
                            handleUpdateData('title', e.target.value)
                        }
                        placeholder="Ex: Make Primary Education Better"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="target">
                        <div className={'font-bold text-lg'}>
                            Who are you petitioning to? *
                        </div>
                        <div className={'text-stone-500'}>
                            আপনি কার কাছে দাবি করছেন?
                        </div>
                    </Label>
                    <Input
                        // options={petitionTargets}
                        className="bg-card text-card-foreground"
                        id="target"
                        value={petitionData.target ?? ''}
                        onChange={(e) =>
                            handleUpdateData('target', e.target.value)
                        }
                        placeholder="Ex: Minister, Ministry, Department, Politician, Prime Minister"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="target">
                        <div className={'font-bold text-lg'}>
                            Area it affects *
                        </div>
                        <div className={'text-stone-500'}>
                            কোন এলাকার মানুষের জন্য প্রযোজ্য?
                        </div>
                    </Label>
                    <Input
                        // options={petitionLocations}
                        id="target"
                        value={petitionData.location ?? ''}
                        className="bg-card text-card-foreground"
                        onChange={(e) =>
                            handleUpdateData('location', e.target.value)
                        }
                        placeholder="Ex: Entire Bangladesh"
                    />
                </div>
                <PetitionFileUploader
                    label="Pictures"
                    banglaLabel="ছবি"
                    fileType="image"
                    files={petitionRemoteData?.data?.attachments || []}
                    onAttachmentsChange={(attachment) =>
                        handleAttachmentUpload(attachment)
                    }
                    removeAttachment={(attachment) =>
                        removeAttachment(attachment)
                    }
                    petitionId={Number(petition_id)}
                />
                <PetitionFileUploader
                    label="Files"
                    banglaLabel="ফাইল"
                    fileType="file"
                    files={petitionRemoteData?.data?.attachments || []}
                    onAttachmentsChange={(attachment) =>
                        handleAttachmentUpload(attachment)
                    }
                    removeAttachment={(attachment) =>
                        removeAttachment(attachment)
                    }
                    petitionId={Number(petition_id)}
                />
                <div className="flex flex-col gap-2">
                    <Label>
                        <div className={'font-bold text-lg'}>
                            Petition Details
                        </div>
                        <div className={'text-stone-500'}>বিস্তারিত লিখুন</div>
                    </Label>
                    <textarea
                        className={'font-mono p-3 h-48'}
                        placeholder={'Enter Details Here...'}
                        value={petitionData.description ?? ''}
                        onChange={(e) =>
                            handleUpdateData('description', e.target.value)
                        }></textarea>
                </div>
                <div className={'flex flex-row space-x-2'}>
                    <Button
                        className={'flex-1'}
                        size={'lg'}
                        disabled={isPetitionSaving || !isValid}
                        onClick={handlePetitionSubmission}>
                        Submit দাবি
                    </Button>

                    <Button
                        variant={isValid ? 'outline' : 'default'}
                        size={'lg'}
                        disabled={isPetitionSaving}
                        onClick={handleUpdatePetition}>
                        Save Draft
                    </Button>
                </div>
            </div>
        </div>
    );
}
