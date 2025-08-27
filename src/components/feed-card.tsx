import Image from 'next/image';
import type { FeedItem } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShareButton } from './share-button';
import { Globe } from 'lucide-react';

export function FeedCard({ item }: { item: FeedItem }) {
  return (
    <div className="flex animate-in fade-in-50 duration-500">
      <Card className="flex flex-col overflow-hidden rounded-lg border-border bg-card shadow-sm transition-all duration-300 hover:shadow-accent/20 hover:shadow-lg hover:-translate-y-1">
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          {item.imageUrl && (
            <Image
              src={item.imageUrl}
              alt={item.altText}
              width={item.imageWidth}
              height={item.imageHeight}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJoc2woMjYwIDE0JSA5NyUpIiAvPgo8L3N2Zz4="
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              data-ai-hint="portrait woman"
            />
          )}
        </div>
        <CardHeader className="p-4">
          <CardTitle className="font-headline text-lg leading-tight tracking-tight line-clamp-2">
            {item.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow p-4 pt-0">
          <p className="text-sm text-muted-foreground">
            {new Date(item.pubDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-2 p-4 pt-0">
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <a href={item.link} target="_blank" rel="noopener noreferrer">
              <Globe className="mr-2 h-4 w-4" />
              View Source
            </a>
          </Button>
          <ShareButton url={item.link} />
        </CardFooter>
      </Card>
    </div>
  );
}
