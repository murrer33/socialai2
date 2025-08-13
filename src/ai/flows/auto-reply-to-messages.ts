'use server';

/**
 * @fileOverview Automatically replies to basic comments/DMs based on predefined intents, using a curated knowledge base.
 *
 * - autoReplyToMessage - A function that handles the auto-reply process.
 * - AutoReplyToMessageInput - The input type for the autoReplyToMessage function.
 * - AutoReplyToMessageOutput - The return type for the autoReplyToMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutoReplyToMessageInputSchema = z.object({
  detectedIntent: z
    .string()
    .describe('The intent detected in the inbound message (price, availability, hours, faq).'),
  knowledgeBaseFacts: z
    .string()
    .describe('Relevant facts from the knowledge base to help formulate the reply.'),
  policy: z
    .string()
    .describe(
      'Policy guidelines (e.g., never promise unavailable features, escalate on low confidence).'
    ),
  messageText: z
    .string()
    .describe('The text content of the inbound message from the user.'),
});
export type AutoReplyToMessageInput = z.infer<typeof AutoReplyToMessageInputSchema>;

const AutoReplyToMessageOutputSchema = z.object({
  reply: z
    .string()
    .describe('The AI-generated reply to the inbound message.'),
  followUpQuestion: z
    .string()
    .optional()
    .describe('An optional follow-up question to engage the user further.'),
  confidenceLevel: z.number().describe('The AI confidence level.'),
});
export type AutoReplyToMessageOutput = z.infer<typeof AutoReplyToMessageOutputSchema>;

export async function autoReplyToMessage(input: AutoReplyToMessageInput): Promise<AutoReplyToMessageOutput> {
  return autoReplyToMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'autoReplyToMessagePrompt',
  input: {schema: AutoReplyToMessageInputSchema},
  output: {schema: AutoReplyToMessageOutputSchema},
  prompt: `You are a polite, concise customer support agent.

You are provided with the following information:

Detected Intent: {{{detectedIntent}}}
Knowledge Base Facts: {{{knowledgeBaseFacts}}}
Policy: {{{policy}}}

Given the inbound message: {{{messageText}}},

Compose a 1-2 sentence reply based on the detected intent, knowledge base facts, and policy.  Include an optional follow-up question to encourage further engagement. Also, output a confidence level between 0 and 1 for the reply.
`,
});

const autoReplyToMessageFlow = ai.defineFlow(
  {
    name: 'autoReplyToMessageFlow',
    inputSchema: AutoReplyToMessageInputSchema,
    outputSchema: AutoReplyToMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
