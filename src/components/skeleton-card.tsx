import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function SkeletonCard() {
  return (
    <Card className="flex flex-col overflow-hidden">
      <Skeleton className="aspect-[3/4] w-full" />
      <CardHeader className="p-4">
        <Skeleton className="h-5 w-3/4" />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-2 p-4 pt-0">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}
