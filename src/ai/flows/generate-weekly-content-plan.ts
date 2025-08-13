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
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const GenerateWeeklyContentPlanInputSchema = z.object({
  brandBrief: z.string().describe('A concise brand brief (120-200 words) including tone tokens.'),
  selling_points: z.array(z.string()).describe('An array of product/service names from the catalog (top 10).'),
  audience: z.string().describe('The target audience of the company.'),
  tone: z.object({
    friendly: z.number().min(0).max(100),
    playful: z.number().min(0).max(100),
    simple: z.number().min(0).max(100),
  }),
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
  model: googleAI.model('gemini-2.0-flash'),
  prompt: `You are a senior social media copywriter for Turkish SMEs. Write on-brand, clear Turkish captions. Avoid over-promising and sensitive claims.
Tone sliders (0-100): Friendly={{{tone.friendly}}}, Playful={{{tone.playful}}}, Simple={{{tone.simple}}}.
Audience: {{{audience}}}
Selling points: {{#each selling_points}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

TASK:
1) Propose a 7-post weekly plan: balance education/promo/engagement (e.g., 3/2/2).
2) For each post: Title (5 words), Caption (120-180 words TR), CTA (1 line), 10-15 hashtags (relevant, Turkish + a few English).
3) Suggest visual concept: (photo/flat-lay/product-in-use/behind-the-scenes).
4) Recommend best posting time (local tr-TR, explain rationale briefly).
Format JSON exactly with fields: week, posts[ {day, platforms, idea, caption_tr, caption_en, hashtags[], visual_brief, recommended_time_local, cta} ].
`,
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
