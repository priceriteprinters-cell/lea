'use server';

import { getFeedItems } from '@/lib/rss';
import type { FeedItem } from '@/lib/types';

export async function getFeedPage(page: number, pageSize = 12): Promise<FeedItem[]> {
  const allItems = await getFeedItems();
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return allItems.slice(start, end);
}
