import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/trpc/client';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowRight, ThumbsUp, ThumbsDown } from 'lucide-react';
import debounce from 'lodash/debounce';
import { removeStopwords, eng, ben } from 'stopword';
import Image from 'next/image';

interface SimilarPetition {
    id: string;
    title: string | null;
    match_count: number;
    upvotes: number;
    downvotes: number;
}

interface SimilarPetitionsSuggestionsProps {
    title: string;
    onClose: () => void;
}

export default function SimilarPetitionsSuggestions({ title, onClose }: SimilarPetitionsSuggestionsProps) {
    const [similarPetitions, setSimilarPetitions] = useState<SimilarPetition[]>([]);

    const { data: suggestionResults, refetch } = trpc.petitions.suggestSimilar.useQuery(
        { title },
        { enabled: false }
    );

    const debouncedSuggest = useCallback(
        debounce((searchTerm: string) => {
            const words = searchTerm.split(' ').filter(word => word.trim() !== '');
            const cleanedWords = removeStopwords(words, [...eng, ...ben]);
            const cleanedTitle = cleanedWords.join(' ').trim();

            if (cleanedWords.length >= 2 && cleanedTitle.length >= 5) {
                refetch();
            } else {
                setSimilarPetitions([]);
            }
        }, 300),
        [refetch, setSimilarPetitions]
    );

    useEffect(() => {
        debouncedSuggest(title);
    }, [title, debouncedSuggest]);

    useEffect(() => {
        if (suggestionResults) {
            setSimilarPetitions(suggestionResults.data);
        }
    }, [suggestionResults]);

    if (similarPetitions.length === 0) {
        return null;
    }

    const displayedPetitions = similarPetitions.slice(0, 3);
    const hasMorePetitions = similarPetitions.length > 3;

    return (
        <Card className="mt-2 bg-background border-red-500">
            <CardHeader className="flex flex-row items-center space-x-2 py-2">
                <div className="flex items-center">
                    <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
                    <CardTitle className="text-lg font-bold text-red-500">Similar Petitions Found</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="py-2">
                <p className="mb-2 text-xs text-stone-600 font-medium">
                    We found some petitions that might be similar to yours. Please check if your petition already exists:
                </p>
                <ul className="space-y-1 divide-y divide-gray-200">
                    {displayedPetitions.map((petition) => (
                        <li key={petition.id} className="py-1">
                            <Link href={`/petitions/${petition.id}`} className="text-neutral-900 flex items-center justify-between hover:bg-gray-50 rounded p-1 transition-colors duration-200" target="_blank" rel="noopener noreferrer">
                                <div className="flex items-center">
                                    <Image src="/images/icon.svg" alt="Petition icon" width={20} height={20} className="mr-2" />
                                    <span>{petition.title || 'Untitled Petition'}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <span className="flex items-center">
                                        <ThumbsUp className="w-4 h-4 text-green-500 mr-1" />
                                        {petition.upvotes}
                                    </span>
                                    <span className="flex items-center">
                                        <ThumbsDown className="w-4 h-4 text-red-500 mr-1" />
                                        {petition.downvotes}
                                    </span>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
                {hasMorePetitions && (
                    <p className="mt-1 text-xs text-stone-500 italic">
                        And {similarPetitions.length - 3} more similar petitions...
                    </p>
                )}
                <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full justify-between text-xs py-1"
                    onClick={onClose}
                >
                    Continue with my petition
                    <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
            </CardContent>
        </Card>
    );
}
