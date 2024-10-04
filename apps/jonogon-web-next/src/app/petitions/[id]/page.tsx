import {trpcVanilla} from '@/trpc/server';
import Petition from '@/app/petitions/[id]/_page';
import {generateDescription} from './_helpers';

export const runtime = 'edge';

export async function generateMetadata({params}: {params: {id: string}}) {
    try {
        const response = await trpcVanilla.petitions.get.query({id: params.id});
        const {
            id,
            title,
            description,
            attachments,
            petition_upvote_count,
            petition_downvote_count,
        } = response.data;

        const totalVoteCount = petition_upvote_count + petition_downvote_count;

        const originalTitle = title ?? '';
        const originalDescription = description ?? '';
        const siteTitle =
            originalTitle.length > 64
                ? `${originalTitle.substring(0, 64)}... - Jonogon`
                : `${originalTitle} - Jonogon`;

        const metaTitle = title ?? '';
        const metaDescription = generateDescription(totalVoteCount);
        const imageAttachments = attachments.filter(
            (attachment) => attachment.type === 'image',
        );
        const metaImage = imageAttachments.length
            ? [
                  {
                      url: `${imageAttachments[0].thumbnail}`.replace(
                          '$CORE_HOSTNAME',
                          'localhost',
                      ),
                      width: 1200,
                      height: 630,
                      alt: originalTitle,
                  },
              ]
            : [];
        return {
            title: siteTitle,
            description: originalDescription,
            openGraph: {
                title: metaTitle,
                description: metaDescription,
                url: `https://jonogon.org/petitions/${id}`,
                type: 'website',
                siteName: 'jonogon.org',
                images: metaImage,
            },
            twitter: {
                card: 'summary_large_image',
                title: metaTitle,
                description: metaDescription,
                images: metaImage,
            },
        };
    } catch (error) {
        return {};
    }
}

export default async function PetitionStatic() {
    return <Petition />;
}
