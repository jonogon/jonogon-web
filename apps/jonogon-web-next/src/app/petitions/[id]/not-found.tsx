import ErrorGui from '@/components/custom/ErrorGui';

export const runtime = 'edge';

export default function NotFound() {
    return (
        <ErrorGui
            errorCode={404}
            customErrorCode="PETITION_NOT_FOUND"
            customMessage="Sorry, the petition you are looking for does not exist or has been moved"
        />
    );
}
