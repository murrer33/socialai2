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
  confidenceLevel: z.number().describe('The AI confidence level for the generated reply, from 0 to 1.'),
});
export type AutoReplyToMessageOutput = z.infer<typeof AutoReplyToMessageOutputSchema>;

export async function autoReplyToMessage(input: AutoReplyToMessageInput): Promise<AutoReplyToMessageOutput> {
  return autoReplyToMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'autoReplyToMessagePrompt',
  input: {schema: AutoReplyToMessageInputSchema},
  output: {schema: AutoReplyToMessageOutputSchema},
  prompt: `You are a polite, concise, and helpful customer support agent for a Turkish business. Your goal is to answer user questions based on the provided knowledge base and follow the given policy. Always reply in Turkish unless the user's message is in English.

You are provided with the following information:
- Detected Intent: {{{detectedIntent}}}
- Knowledge Base Facts: "{{{knowledgeBaseFacts}}}"
- Policy: "{{{policy}}}"
- Inbound Message: "{{{messageText}}}"

Your task:
1.  Carefully analyze the inbound message and the detected intent.
2.  Use the "Knowledge Base Facts" to formulate a direct and accurate 1-2 sentence answer.
3.  Adhere strictly to the "Policy". If confidence is low or the topic is sensitive, politely state that a team member will follow up.
4.  Include a friendly, optional follow-up question to encourage further engagement if it feels natural.
5.  Estimate your confidence level (0.0 to 1.0) based on how well the knowledge base answers the user's specific question. If the answer is a direct match, confidence should be high (e.g., >0.9). If you have to infer, it should be lower.

Compose your response now.
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
