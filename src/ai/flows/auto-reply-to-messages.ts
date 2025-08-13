'use server';

/**
 * @fileOverview Automatically replies to basic comments/DMs based on predefined intents, using a curated knowledge base.
 *
 * - autoReplyToMessage - A function that handles the auto-reply process.
 * - AutoReplyToMessageInput - The input type for the autoReplyToMessage function.
 * - AutoReplyToMessageOutput - The return type for the autoReplyToMessage function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const AutoReplyToMessageInputSchema = z.object({
  messageText: z
    .string()
    .describe('The text content of the inbound message from the user.'),
  knowledgeBaseFacts: z
    .string()

    .describe('Relevant facts from the knowledge base to help formulate the reply (e.g. store hours, policies).'),
  policy: z
    .string()
    .describe(
      'Policy guidelines (e.g., never promise unavailable features, escalate on low confidence).'
    ),
});
export type AutoReplyToMessageInput = z.infer<typeof AutoReplyToMessageInputSchema>;

const AutoReplyToMessageOutputSchema = z.object({
  suggestedReply: z
    .string()
    .describe('The AI-generated reply to the inbound message. If the message is a complaint or sensitive, this should be an empty string.'),
  confidence: z.number().describe('The AI confidence level for the generated reply, from 0 to 1.'),
  label: z.enum(['FAQ', 'Engagement', 'Complaint', 'Sensitive']).describe('The classification label for the message.'),
});
export type AutoReplyToMessageOutput = z.infer<typeof AutoReplyToMessageOutputSchema>;

export async function autoReplyToMessage(input: AutoReplyToMessageInput): Promise<AutoReplyToMessageOutput> {
  return autoReplyToMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'autoReplyToMessagePrompt',
  input: {schema: AutoReplyToMessageInputSchema},
  output: {schema: AutoReplyToMessageOutputSchema},
  model: googleAI.model('gemini-2.0-flash'),
  prompt: `You are a customer support agent for a Turkish business. Your task is to classify an inbound message and, if appropriate, draft a helpful reply in Turkish.

  1.  **Classify the message:** Analyze the user's message and classify it into one of these labels:
      *   **FAQ**: The user is asking a factual question (price, hours, address, availability).
      *   **Engagement**: The user is leaving a compliment or positive feedback.
      *   **Complaint**: The user is expressing dissatisfaction.
      *   **Sensitive**: The user is mentioning a sensitive topic that requires a human.

  2.  **Draft a Reply (or Don't):**
      *   If the label is **Complaint** or **Sensitive**, DO NOT draft a reply. The \`suggestedReply\` field in your output must be an empty string. A human must handle this.
      *   If the label is **FAQ** or **Engagement**, draft a polite, concise, 1-2 sentence reply in Turkish using the provided "Knowledge Base Facts". Adhere strictly to the "Policy".
      *   Estimate your confidence level (0.0 to 1.0) based on how well the knowledge base answers the user's question.

  **User Message:** "{{{messageText}}}"
  **Knowledge Base Facts:** "{{{knowledgeBaseFacts}}}"
  **Policy:** "{{{policy}}}"

  Now, perform the classification and generate the response.
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
