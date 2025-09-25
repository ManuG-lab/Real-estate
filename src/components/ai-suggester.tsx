'use client';

import { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Wand2, Loader2 } from 'lucide-react';
import { getAiSuggestions } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { Property } from '@/lib/types';
import { PropertyCard } from './property-card';

export function AiSuggester() {
  const [open, setOpen] = useState(false);
  const [preferences, setPreferences] = useState('');
  const [suggestions, setSuggestions] = useState<Property[]>([]);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSubmit = async () => {
    startTransition(async () => {
      // Mock viewing history as per project requirements
      const viewingHistory = ['prop-1', 'prop-5', 'prop-12'];
      const result = await getAiSuggestions(preferences, viewingHistory);
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
      } else {
        if (result.suggestedProperties.length === 0) {
            toast({
                title: 'No Matches Found',
                description: 'We couldn\'t find any properties matching your preferences. Try being a bit more general.'
            })
        }
        setSuggestions(result.suggestedProperties);
      }
    });
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
        setSuggestions([]);
        setPreferences('');
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-primary hover:bg-primary/90">
          <Wand2 className="mr-2 h-5 w-5" />
          Get AI-Powered Suggestions
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">AI Property Matcher</DialogTitle>
          <DialogDescription>
            Describe your ideal rental, and our AI will find the perfect match
            for you. e.g., "A 2-bedroom apartment near a park with a modern kitchen."
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="Type your preferences here..."
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            rows={4}
          />
        </div>

        {suggestions.length > 0 && (
            <div className="mt-4">
                <h3 className="font-headline text-xl mb-4">Here are your matches:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[40vh] overflow-y-auto p-1">
                    {suggestions.map(property => (
                        <PropertyCard key={property.id} property={property} />
                    ))}
                </div>
            </div>
        )}

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isPending || !preferences}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Thinking...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Suggestions
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
