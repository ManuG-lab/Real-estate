'use server';

import { suggestProperties } from '@/ai/flows/ai-property-suggestions';
import { properties } from '@/lib/data';
import type { Property } from '@/lib/types';

export async function getAiSuggestions(
  preferences: string,
  viewingHistory: string[]
): Promise<{
  suggestedProperties: Property[];
  error?: string;
}> {
  try {
    const result = await suggestProperties({
      viewingHistory: viewingHistory.join(','),
      preferences: preferences,
    });

    if (!result.suggestions) {
      return { suggestedProperties: [] };
    }

    const suggestedIds = result.suggestions.split(',').map((id) => id.trim());
    const suggestedProperties = properties.filter((p) =>
      suggestedIds.includes(p.id)
    );

    return { suggestedProperties };
  } catch (e) {
    console.error(e);
    return {
      suggestedProperties: [],
      error: 'Failed to get AI suggestions. Please try again later.',
    };
  }
}
