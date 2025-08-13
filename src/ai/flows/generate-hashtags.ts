
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating hashtags based on a caption, product, and city.
 *
 * - generateHashtags - A function that generates hashtags.
 * - GenerateHashtagsInput - The input type for the generateHashtags function.
 * - GenerateHashtagsOutput - The return type for the generateHashtags function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const GenerateHashtagsInputSchema = z.object({
  caption: z.string().describe('The caption of the social media post.'),
  product: z.string().describe('The product being featured in the post.'),
  city: z.string().optional().describe('An optional city for local geotags.'),
});
export type GenerateHashtagsInput = z.infer<typeof GenerateHashtagsInputSchema>;

const GenerateHashtagsOutputSchema = z.object({
  hashtags: z.array(z.string()).describe('An array of generated hashtags.'),
});
export type GenerateHashtagsOutput = z.infer<typeof GenerateHashtagsOutputSchema>;

export async function generateHashtags(input: GenerateHashtagsInput): Promise<GenerateHashtagsOutput> {
  return generateHashtagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHashtagsPrompt',
  input: {schema: GenerateHashtagsInputSchema},
  output: {schema: GenerateHashtagsOutputSchema},
  model: googleAI.model('gemini-2.0-flash'),
  prompt: `Given caption: "{{caption}}", product: "{{product}}", {{#if city}}city: "{{city}}"{{/if}}
Return 12 hashtags: 8 Turkish, 4 English, mix sizes. No banned or misleading tags.
`,
});

const generateHashtagsFlow = ai.defineFlow(
  {
    name: 'generateHashtagsFlow',
    inputSchema: GenerateHashtagsInputSchema,
    outputSchema: GenerateHashtagsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate hashtags.');
    }
    return output;
  }
);
