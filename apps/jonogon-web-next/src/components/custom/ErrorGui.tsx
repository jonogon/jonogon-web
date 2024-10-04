import {Button} from '@/components/ui/button';
import {FaceFrownIcon} from '@heroicons/react/24/solid';
import {Ban, ServerCrash, Wifi} from 'lucide-react';
import Link from 'next/link';
import PetitionActionButton from './PetitionActionButton';

interface ErrorGuiProps {
    errorCode: 400 | 403 | 404 | 427 | 500;
    customMessage?: string;
    customErrorCode?: string;
}

export default function ErrorGui({
    errorCode,
    customMessage,
    customErrorCode,
}: ErrorGuiProps) {
    const errorContent = {
        400: {
            title: '400 - Bad Request',
            message: 'Oops! The request could not be understood by the server.',
            icon: <FaceFrownIcon className="w-16 h-16 text-destructive" />,
        },
        401: {
            title: '401 - Unauthorized',
            message: 'You are not authorized to access this page.',
            icon: <Ban className="w-16 h-16 text-destructive" />,
        },

        403: {
            title: '403 - Forbidden',
            message: "Sorry, you don't have permission to access this page.",
            icon: <Ban className="w-16 h-16 text-destructive" />,
        },
        404: {
            title: '404 - Page Not Found',
            message:
                'Sorry, the page you are looking for does not exist or has been moved.',
            icon: <FaceFrownIcon className="w-16 h-16 text-destructive" />,
        },
        427: {
            title: '427 - Connection Issue',
            message: 'There seems to be a problem with the network connection.',
            icon: <Wifi className="w-16 h-16 text-destructive" />,
        },
        500: {
            title: '500 - Internal Server Error',
            message:
                "Oops! Something went wrong on our end. We're working to fix it.",
            icon: <ServerCrash className="w-16 h-16 text-destructive" />,
        },
    };

    const {title, message, icon} = errorContent[errorCode];

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <div className="flex justify-center mb-4">{icon}</div>
                <h1 className="text-3xl lg:text-4xl font-bold text-destructive mb-4">
                    {customErrorCode || title}
                </h1>
                <p className="text-lg text-secondary-foreground mb-8">
                    {customMessage || message}
                </p>
                <div className="flex flex-col space-y-4">
                    <Button asChild>
                        <Link href="/">Go to Homepage</Link>
                    </Button>
                    {errorCode !== 403 && (
                        <PetitionActionButton
                            variant={'outline'}
                            className="shadow-none"
                        />
                    )}
                    {errorCode === 500 && (
                        <Button variant="outline">Try Again</Button>
                    )}
                </div>
            </div>
            <footer className="mt-16 text-sm text-muted-foreground">
                <p>Jonogon is built for the people, by the people.</p>
            </footer>
        </div>
    );
}
