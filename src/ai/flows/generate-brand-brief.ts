'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a brand brief from company profile, audience, and tone.
 *
 * - generateBrandBrief - A function that generates a brand brief.
 * - GenerateBrandBriefInput - The input type for the generateBrandBrief function.
 * - GenerateBrandBriefOutput - The return type for the generateBrandBrief function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBrandBriefInputSchema = z.object({
  companyProfile: z
    .string()
    .describe('A description of the company profile.'),
  audience: z.string().describe('The target audience of the company.'),
  tone: z.string().describe('The desired tone of the brand.'),
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
  prompt: `You are a marketing expert tasked with creating a brand brief.

  Based on the following information, generate a concise brand brief (120-200 words) and identify tone tokens.

  Company Profile: {{{companyProfile}}}
  Audience: {{{audience}}}
  Tone: {{{tone}}}

  Brand Brief:
  Tone Tokens:`, // Ensure the LLM outputs the brand brief and tone tokens.
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
