import { generateImageAltText } from '@/ai/flows/generate-image-alt-text';
import type { FeedItem } from './types';

let cachedFeed: FeedItem[] | null = null;
let cacheTimestamp: number | null = null;

const CACHE_DURATION = 1000 * 60 * 10; // 10 minutes

function parseDescription(description: string): Omit<FeedItem, 'id' | 'pubDate' | 'altText' | 'title'> & { title: string | null } {
  const nameMatch = description.match(/NAME:\s*(.*?)(?:<br>|$)/i);
  const titleMatch = nameMatch ? nameMatch : description.match(/\*\*(.*?)\*\*/);
  const linkMatch = description.match(/<a href="(.*?)"/);
  const imgMatch = description.match(/<img src="(.*?)"/);
  const widthMatch = description.match(/width="(\d+)"/);
  const heightMatch = description.match(/height="(\d+(?:\.\d+)?)"/);

  let title = 'Untitled';
  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].trim();
  }

  return {
    title: title,
    link: linkMatch ? linkMatch[1] : '#',
    imageUrl: imgMatch ? imgMatch[1] : '',
    imageWidth: widthMatch ? parseInt(widthMatch[1], 10) : 600,
    imageHeight: heightMatch ? Math.round(parseFloat(heightMatch[1])) : 800,
  };
}


export async function getFeedItems(): Promise<FeedItem[]> {
    const now = Date.now();
    if (cachedFeed && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
        return cachedFeed;
    }

    try {
        const response = await fetch('https://rsshub.app/telegram/channel/admavenpost', { next: { revalidate: 600 } });
        if (!response.ok) {
            throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
        }
        const xmlText = await response.text();
        
        const itemsXml = xmlText.split('<item>').slice(1);
        const feedItemPromises: Promise<FeedItem | null>[] = [];

        for (const itemXml of itemsXml) {
            const promise = async (): Promise<FeedItem | null> => {
                const guidMatch = itemXml.match(/<guid.*?>([\s\S]*?)<\/guid>/)?.[1].trim();
                if (!guidMatch) return null;

                const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/);
                const descriptionMatch = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/);
                const rawTitleMatch = itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/);

                if (descriptionMatch && descriptionMatch[1]) {
                    const parsedDesc = parseDescription(descriptionMatch[1]);
                    
                    let finalTitle = parsedDesc.title;
                    if (finalTitle === 'Untitled' && rawTitleMatch && rawTitleMatch[1]) {
                        finalTitle = rawTitleMatch[1].trim().replace(/🖼/g, '').trim();
                    }
                    
                    if (finalTitle && parsedDesc.imageUrl) {
                        try {
                            const altTextResponse = await generateImageAltText({ title: finalTitle });
                            return {
                                id: guidMatch,
                                ...parsedDesc,
                                title: finalTitle,
                                pubDate: pubDateMatch ? pubDateMatch[1] : new Date().toUTCString(),
                                altText: altTextResponse.altText,
                            };
                        } catch (aiError) {
                             console.error("AI alt text generation failed for:", finalTitle, aiError);
                             return {
                                id: guidMatch,
                                ...parsedDesc,
                                title: finalTitle,
                                pubDate: pubDateMatch ? pubDateMatch[1] : new Date().toUTCString(),
                                altText: `A portrait of ${finalTitle}`,
                            };
                        }
                    }
                }
                return null;
            }
            feedItemPromises.push(promise());
        }
        
        const resolvedItems = await Promise.all(feedItemPromises);
        const validItems = resolvedItems.filter((item): item is FeedItem => item !== null);

        cachedFeed = validItems;
        cacheTimestamp = now;
        return validItems;

    } catch (error) {
        console.error("Error fetching or parsing feed:", error);
        return cachedFeed || []; // Return old cache if fetch fails
    }
}
