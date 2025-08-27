'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getFeedPage } from '@/app/actions';
import type { FeedItem } from '@/lib/types';
import { FeedCard } from './feed-card';
import { SkeletonCard } from './skeleton-card';

export function FeedGrid({ initialItems }: { initialItems: FeedItem[] }) {
  const [items, setItems] = useState<FeedItem[]>(initialItems);
  const [page, setPage] = useState(2);
  const [hasMore, setHasMore] = useState(initialItems.length > 0);
  const [isLoading, setIsLoading] = useState(false);
  const loader = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    const newItems = await getFeedPage(page);
    if (newItems.length > 0) {
      setItems((prevItems) => [...prevItems, ...newItems]);
      setPage((prevPage) => prevPage + 1);
    } else {
      setHasMore(false);
    }
    setIsLoading(false);
  }, [page, isLoading, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    const currentLoader = loader.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [loadMore]);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <FeedCard key={item.id} item={item} />
        ))}
        {isLoading && Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={`skeleton-${i}`} />)}
      </div>
      <div ref={loader} className="h-10" />
      {!hasMore && !isLoading && (
        <p className="py-8 text-center text-muted-foreground">You've reached the end!</p>
      )}
    </>
  );
}
