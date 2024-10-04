'use client';

import ErrorGui from '@/components/custom/ErrorGui';
import {useEffect} from 'react';

export const runtime = 'edge';

export default function Error({error}: {error: Error & {digest?: string}}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <ErrorGui
            errorCode={400}
            customMessage={`The petition ID is invalid. Please try with a valid ID.`}
        />
    );
}
