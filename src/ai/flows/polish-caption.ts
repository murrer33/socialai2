'use server';

/**
 * @fileOverview This file defines a Genkit flow for polishing a given text caption based on brand tones.
 *
 * - polishCaption - A function that refines a caption.
 * - PolishCaptionInput - The input type for the polishCaption function.
 * - PolishCaptionOutput - The return type for the polishCaption function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const PolishCaptionInputSchema = z.object({
  caption: z.string().describe('The original caption text to be polished.'),
  tone: z
    .object({
      friendly: z.number().min(0).max(100),
      playful: z.number().min(0).max(100),
      simple: z.number().min(0).max(100),
    })
    .describe('The desired tone of the brand, represented by three values.'),
});

export type PolishCaptionInput = z.infer<typeof PolishCaptionInputSchema>;

const PolishCaptionOutputSchema = z.object({
  polishedCaption: z.string().describe('The revised, polished caption.'),
});

export type PolishCaptionOutput = z.infer<typeof PolishCaptionOutputSchema>;

export async function polishCaption(input: PolishCaptionInput): Promise<PolishCaptionOutput> {
  return polishCaptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'polishCaptionPrompt',
  input: {schema: PolishCaptionInputSchema},
  output: {schema: PolishCaptionOutputSchema},
  model: googleAI.model('gemini-2.0-flash'),
  prompt: `Polish the caption to match tone sliders and avoid generic phrases.
Ensure Turkish grammar is correct, avoid spammy emojis/hashtags, keep it 120-180 words.
Return only the revised caption.

Tone Sliders:
- Friendly: {{{tone.friendly}}}
- Playful: {{{tone.playful}}}
- Simple: {{{tone.simple}}}

Caption to Polish:
"{{{caption}}}"
`,
});

const polishCaptionFlow = ai.defineFlow(
  {
    name: 'polishCaptionFlow',
    inputSchema: PolishCaptionInputSchema,
    outputSchema: PolishCaptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate polished caption.');
    }
    return {
      polishedCaption: output.polishedCaption,
    };
  }
);
