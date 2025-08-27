import { getFeedPage } from '@/app/actions';
import { Header } from '@/components/header';
import { FeedGrid } from '@/components/feed-grid';

export default async function Home() {
  const initialItems = await getFeedPage(1);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <FeedGrid initialItems={initialItems} />
      </main>
    </div>
  );
}
