'use client';

import {useAuthState} from '@/auth/token-manager';
import {trpc} from '@/trpc/client';
import {useRouter} from 'next/navigation';
import {Button, ButtonProps} from '../ui/button';

interface Props {
    className?: string;
    variant?: ButtonProps['variant'];
}

const PetitionActionButton = (props: Props) => {
    const router = useRouter();
    const authState = useAuthState();

    const {mutate: createPetition} = trpc.petitions.create.useMutation({
        onSuccess(response) {
            router.push(`/petitions/${response.data.id}/edit?fresh=true`);
        },
    });

    const handlePetitionCreate = async () => {
        if (!authState) {
            router.push('/petition/draft');
        } else {
            createPetition();
        }
    };

    return (
        <Button
            size={'lg'}
            variant={props.variant ?? 'default'}
            className={
                props.className
                    ? props.className
                    : 'bg-red-500 font-bold shadow-2xl drop-shadow-xl'
            }
            onClick={handlePetitionCreate}>
            Submit a দাবি
        </Button>
    );
};

export default PetitionActionButton;
