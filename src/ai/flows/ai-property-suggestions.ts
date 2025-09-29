'use server';

/**
 * @fileOverview Provides personalized property suggestions based on viewing history and preferences.
 *
 * - suggestProperties - A function that generates property suggestions.
 * - SuggestPropertiesInput - The input type for the suggestProperties function.
 * - SuggestPropertiesOutput - The return type for the suggestProperties function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPropertiesInputSchema = z.object({
  viewingHistory: z
    .string()
    .describe('The user viewing history, as a comma separated list of property ids.'),
  preferences: z.string().describe('The user preferences for a rental property.'),
});
export type SuggestPropertiesInput = z.infer<typeof SuggestPropertiesInputSchema>;

const SuggestPropertiesOutputSchema = z.object({
  suggestions: z
    .string()
    .describe('A comma separated list of property ids that are suggested for the user.'),
});
export type SuggestPropertiesOutput = z.infer<typeof SuggestPropertiesOutputSchema>;

export async function suggestProperties(input: SuggestPropertiesInput): Promise<SuggestPropertiesOutput> {
  return suggestPropertiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPropertiesPrompt',
  input: {schema: SuggestPropertiesInputSchema},
  output: {schema: SuggestPropertiesOutputSchema},
  prompt: `You are an expert real estate agent specializing in rental properties.

You will use the user's viewing history and preferences to suggest rental properties that the user might be interested in.

Viewing History: {{{viewingHistory}}}
Preferences: {{{preferences}}}

Suggestions:`,
});

const suggestPropertiesFlow = ai.defineFlow(
  {
    name: 'suggestPropertiesFlow',
    inputSchema: SuggestPropertiesInputSchema,
    outputSchema: SuggestPropertiesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
