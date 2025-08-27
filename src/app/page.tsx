import { getFeedPage } from '@/app/actions';
import { Header } from '@/components/header';
import { FeedGrid } from '@/components/feed-grid';
import { AgeGate } from '@/components/age-gate';

export default async function Home() {
  const initialItems = await getFeedPage(1);

  return (
    <AgeGate>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <FeedGrid initialItems={initialItems} />
        </main>
      </div>
    </AgeGate>
  );
}
