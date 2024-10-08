'use client';

export const runtime = 'edge';

import {useCallback, useEffect, useState} from 'react';

import {useRouter} from 'next/navigation';
import z from 'zod';
import {Label} from '@/components/ui/label';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {AutoCompleteInput} from '@/components/ui/input-autocomplete';
import {petitionLocations, petitionTargets} from '@/lib/constants';
import { useAuthState } from '@/auth/token-manager';

import SimilarPetitionsSuggestions from '@/components/custom/SimilarPetitionsSuggestions';

function storeDraftPetition<T>(data: T) {
    localStorage.setItem('draft-petition', JSON.stringify(data));
}

export default function EditLoggedOutDraftPetition() {
    const isAuthenticated = useAuthState()
    const [isLoading, setIsLoading] = useState(false);

    const [showSimilarPetitions, setShowSimilarPetitions] = useState(true);

    const router = useRouter();

    const [nextPetitionData, setNextPetitionData] = useState<{
        target?: string;
        location?: string;
        title?: string;
        description?: string;
    }>({});

    const petitionData = nextPetitionData;

    const handleUpdateData = useCallback(
        (key: keyof typeof nextPetitionData, val: string) => {
            setNextPetitionData((nextPetitionData) => ({
                ...nextPetitionData,
                [key]: val,
            }));
        },
        [setNextPetitionData],
    );

    const isValid = z
        .object({
            title: z.string().min(12),
            target: z.string().min(6),
            location: z.string().min(3),
            description: z.string().optional(),
        })
        .safeParse(petitionData).success;

    const redirectToLogin = () => {
        setIsLoading(true);

        const hasPetitionDraftData = Object.values(petitionData).some((v) => v && v.length > 0);
        if (hasPetitionDraftData) {
            storeDraftPetition(petitionData);
        }

        router.push(`/login?next=${encodeURIComponent('/petition/draft')}`);
    }

    useEffect(() => {
        if (isAuthenticated) {
            router.replace('/');
        }
    }, [isAuthenticated]);

    return (
        <div className="flex flex-col gap-2 sm:gap-4 max-w-screen-sm mx-auto pt-5 pb-16 px-4">
            <div className="flex flex-col-reverse gap-6 sm:flex-row sm:gap-2 justify-between py-4 sm:py-12 md:py-10">
                <h1
                    className={
                        'text-3xl sm:text-5xl font-regular text-stone-600 leading-0'
                    }>
                    ✊ Create New দাবি
                </h1>
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
                {showSimilarPetitions && (
                    <SimilarPetitionsSuggestions
                    title={petitionData.title ?? ''}
                    onClose={() => setShowSimilarPetitions(false)}
                    />
                )}
                <div className="flex flex-col gap-2">
                    <Label htmlFor="target">
                        <div className={'font-bold text-lg'}>
                            Who are you petitioning to? *
                        </div>
                        <div className={'text-stone-500'}>
                            আপনি কার কাছে দাবি করছেন?
                        </div>
                    </Label>
                    <AutoCompleteInput
                        options={petitionTargets}
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
                    <AutoCompleteInput
                        options={petitionLocations}
                        id="target"
                        value={petitionData.location ?? ''}
                        className="bg-card text-card-foreground"
                        onChange={(e) =>
                            handleUpdateData('location', e.target.value)
                        }
                        placeholder="Ex: Entire Bangladesh"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="pictures">
                        <div className={'font-bold text-lg'}>
                            Pictures{' '}
                            <span
                                className={'font-light italic text-stone-600'}>
                                (optional)
                            </span>
                        </div>
                        <div className={'text-stone-500'}>
                            কিছু ছবি upload করতে পারেন
                        </div>
                    </Label>
                    <div className={'flex flex-row flex-wrap gap-2'}>
                        <div
                            className={
                                'flex justify-center items-center border-4 w-24 h-20 rounded-lg relative bg-card hover:bg-card/30 cursor-pointer opacity-30'
                            }>
                            <span
                                className={
                                    'text-5xl text-stone-400 drop-shadow-sm cursor-pointer'
                                }>
                                +
                            </span>
                            <button
                                className={
                                    'absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer m-0 p-0'
                                }
                                disabled={true}
                            />
                        </div>
                        <div className={'flex flex-row items-center flex-1'}>
                            <p className={'text-stone-400 text-sm sm:text-lg'}>
                                Image upload করতে draft save অথবা submit করুন
                            </p>
                        </div>
                    </div>
                </div>
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
                        disabled={!isValid || isLoading}
                        onClick={redirectToLogin}>
                        Submit দাবি
                    </Button>

                    <Button
                        variant={isValid ? 'outline' : 'default'}
                        size={'lg'}
                        disabled={isLoading}
                        onClick={redirectToLogin}>
                        Save Draft
                    </Button>
                </div>
            </div>
        </div>
    );
}
