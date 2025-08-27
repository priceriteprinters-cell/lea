'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Share2, Check } from 'lucide-react';

export function ShareButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    if (!url || url === '#') {
      toast({
        variant: 'destructive',
        title: 'No link available',
        description: 'There is no source link to share for this item.',
      });
      return;
    }

    navigator.clipboard.writeText(url).then(
      () => {
        setCopied(true);
        toast({
          title: 'Copied to clipboard!',
          description: 'You can now share the link.',
        });
        setTimeout(() => setCopied(false), 2000);
      },
      (err) => {
        toast({
          variant: 'destructive',
          title: 'Failed to copy',
          description: 'Could not copy the link to the clipboard.',
        });
        console.error('Could not copy text: ', err);
      }
    );
  };

  return (
    <Button variant="secondary" onClick={handleCopy}>
      {copied ? (
        <>
          <Check className="mr-2 h-4 w-4 text-green-500" />
          Copied
        </>
      ) : (
        <>
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </>
      )}
    </Button>
  );
}
