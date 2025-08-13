'use server';

/**
 * @fileOverview This file defines a Genkit flow for moderating text content.
 *
 * - moderateText - A function that moderates a given text.
 * - ModerateTextInput - The input type for the moderateText function.
 * - ModerateTextOutput - The return type for the moderateText function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const ModerateTextInputSchema = z.object({
  textToModerate: z.string().describe('The text content to be moderated.'),
});
export type ModerateTextInput = z.infer<typeof ModerateTextInputSchema>;

const ModerateTextOutputSchema = z.object({
  isSafe: z.boolean().describe('Whether the text is considered safe or not.'),
  reason: z.string().optional().describe('The reason why the text was flagged as unsafe.'),
});
export type ModerateTextOutput = z.infer<typeof ModerateTextOutputSchema>;

export async function moderateText(input: ModerateTextInput): Promise<ModerateTextOutput> {
  return moderateTextFlow(input);
}

const moderationPrompt = ai.definePrompt({
  name: 'moderationPrompt',
  input: {schema: ModerateTextInputSchema},
  output: {schema: ModerateTextOutputSchema},
  model: googleAI.model('gemini-2.0-flash'),
  prompt: `Analyze the following text for any unsafe content.
Text: "{{{textToModerate}}}"

Evaluate against these categories:
- Hate Speech
- Dangerous Content
- Harassment
- Sexually Explicit Content

If the text violates any of these, set isSafe to false and provide a brief reason. Otherwise, set isSafe to true.`,
  // Stricter safety settings for moderation tasks
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_LOW_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
    ],
  },
});

const moderateTextFlow = ai.defineFlow(
  {
    name: 'moderateTextFlow',
    inputSchema: ModerateTextInputSchema,
    outputSchema: ModerateTextOutputSchema,
  },
  async input => {
    try {
      const {output} = await moderationPrompt(input);
      // If the prompt succeeds and returns an output, we trust its assessment.
      return output!;
    } catch (e: any) {
      // If the underlying call to the model fails due to a safety block,
      // we interpret this as the content being unsafe.
      if (e.message.includes('SAFETY')) {
        return {
          isSafe: false,
          reason: 'Content was blocked by the safety filter.',
        };
      }
      // Re-throw other errors
      throw e;
    }
  }
);
