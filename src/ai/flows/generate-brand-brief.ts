'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a brand brief from company profile, audience, and tone.
 *
 * - generateBrandBrief - A function that generates a brand brief.
 * - GenerateBrandBriefInput - The input type for the generateBrandBrief function.
 * - GenerateBrandBriefOutput - The return type for the generateBrandBrief function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const GenerateBrandBriefInputSchema = z.object({
  companyProfile: z.string().describe('A description of the company profile.'),
  audience: z.string().describe('The target audience of the company.'),
  tone: z.object({
    friendly: z.number().min(0).max(100),
    playful: z.number().min(0).max(100),
    simple: z.number().min(0).max(100),
  }).describe('The desired tone of the brand, represented by three values.'),
});

export type GenerateBrandBriefInput = z.infer<typeof GenerateBrandBriefInputSchema>;

const GenerateBrandBriefOutputSchema = z.object({
  brandBrief: z
    .string()
    .describe(
      'A concise brand brief (120-200 words) summarizing the company profile, audience, and tone.'
    ),
  toneTokens: z
    .string()
    .describe('Keywords representing the brand tone (e.g., professional, friendly, playful).'),
});

export type GenerateBrandBriefOutput = z.infer<typeof GenerateBrandBriefOutputSchema>;

export async function generateBrandBrief(
  input: GenerateBrandBriefInput
): Promise<GenerateBrandBriefOutput> {
  return generateBrandBriefFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBrandBriefPrompt',
  input: {schema: GenerateBrandBriefInputSchema},
  output: {schema: GenerateBrandBriefOutputSchema},
  model: googleAI.model('gemini-2.0-flash'),
  prompt: `You are a marketing expert tasked with creating a brand brief.

  Based on the following information, generate a concise brand brief (120-200 words) and identify tone tokens.

  Company Profile: {{{companyProfile}}}
  Target Audience: {{{audience}}}
  Tone Sliders (0-100 scale):
  - Friendly: {{{tone.friendly}}}
  - Playful: {{{tone.playful}}}
  - Simple: {{{tone.simple}}}

  Synthesize these inputs to define the brand's voice. For example, high 'Friendly' and 'Simple' but low 'Playful' suggests a clear, approachable, but not jokey tone.

  Output the Brand Brief and then the Tone Tokens.
`,
});

const generateBrandBriefFlow = ai.defineFlow(
  {
    name: 'generateBrandBriefFlow',
    inputSchema: GenerateBrandBriefInputSchema,
    outputSchema: GenerateBrandBriefOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
