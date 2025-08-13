'use server';
/**
 * @fileOverview This file defines the generateWeeklyContentPlan flow, which generates a weekly social media content plan.
 *
 * @fileOverview
 * - generateWeeklyContentPlan - A function that generates a weekly social media content plan.
 * - GenerateWeeklyContentPlanInput - The input type for the generateWeeklyContentPlan function.
 * - GenerateWeeklyContentPlanOutput - The return type for the generateWeeklyContentPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWeeklyContentPlanInputSchema = z.object({
  brandBrief: z.string().describe('A concise brand brief (120-200 words) including tone tokens.'),
  catalogItems: z.array(z.string()).describe('An array of product/service names from the catalog (top 10).'),
  holidaysEvents: z.string().describe('A string containing upcoming holidays and events within the next 14 days.'),
  preferredCadence: z.string().describe('The preferred posting cadence (e.g., 7 posts per week).'),
  platforms: z.array(z.enum(['instagram', 'facebook', 'linkedin'])).describe('The social media platforms to generate content for.'),
});
export type GenerateWeeklyContentPlanInput = z.infer<typeof GenerateWeeklyContentPlanInputSchema>;

const GenerateWeeklyContentPlanOutputSchema = z.object({
  week: z.string().describe('The week in YYYY-WW format.'),
  posts: z.array(
    z.object({
      day: z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']),
      platforms: z.array(z.enum(['instagram', 'facebook', 'linkedin'])),
      idea: z.string(),
      caption_tr: z.string(),
      caption_en: z.string(),
      hashtags: z.array(z.string()),
      visual_brief: z.string(),
      recommended_time_local: z.string().regex(/^\d{2}:\d{2}$/), // HH:mm format
      cta: z.string(),
    })
  ),
});
export type GenerateWeeklyContentPlanOutput = z.infer<typeof GenerateWeeklyContentPlanOutputSchema>;

export async function generateWeeklyContentPlan(input: GenerateWeeklyContentPlanInput): Promise<GenerateWeeklyContentPlanOutput> {
  return generateWeeklyContentPlanFlow(input);
}

const weeklyPlanPrompt = ai.definePrompt({
  name: 'weeklyPlanPrompt',
  input: {schema: GenerateWeeklyContentPlanInputSchema},
  output: {schema: GenerateWeeklyContentPlanOutputSchema},
  prompt: `You are a senior social media strategist for SMEs in Turkey.

  Generate a weekly social media content plan based on the following information:

  Brand Brief: {{{brandBrief}}}
  Catalog Items: {{#each catalogItems}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Holidays/Events: {{{holidaysEvents}}}
  Preferred Cadence: {{{preferredCadence}}}
  Platforms: {{#each platforms}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

  Output the content plan in the following JSON schema:
  {
    "week": "YYYY-WW",
    "posts": [
      {
        "day": "Mon|Tue|...",
        "platforms": ["instagram","facebook","linkedin"],
        "idea": "string",
        "caption_tr": "string",
        "caption_en": "string",
        "hashtags": ["#..."],
        "visual_brief": "string",
        "recommended_time_local": "HH:mm",
        "cta": "string"
      }
    ]
  }`,
});

const generateWeeklyContentPlanFlow = ai.defineFlow(
  {
    name: 'generateWeeklyContentPlanFlow',
    inputSchema: GenerateWeeklyContentPlanInputSchema,
    outputSchema: GenerateWeeklyContentPlanOutputSchema,
  },
  async input => {
    const {output} = await weeklyPlanPrompt(input);
    return output!;
  }
);
