'use server';
/**
 * @fileOverview An image generation AI agent that generates images from visual briefs.
 *
 * - generateImageFromVisualBrief - A function that handles the image generation process.
 * - GenerateImageFromVisualBriefInput - The input type for the generateImageFromVisualBrief function.
 * - GenerateImageFromVisualBriefOutput - The return type for the generateImageFromVisualBrief function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageFromVisualBriefInputSchema = z.object({
  visualBrief: z.string().describe('The visual brief to generate the image from.'),
  brandColor: z.string().describe('The brand color to use for the image.'),
  logoDataUri: z
    .string()
    .describe(
      'The brand logo as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Corrected format
    ),
  productShotDataUri: z
    .string()
    .optional()
    .describe(
      'An optional product shot as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Corrected format
    ),
});
export type GenerateImageFromVisualBriefInput = z.infer<typeof GenerateImageFromVisualBriefInputSchema>;

const GenerateImageFromVisualBriefOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      'The generated image as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type GenerateImageFromVisualBriefOutput = z.infer<typeof GenerateImageFromVisualBriefOutputSchema>;

export async function generateImageFromVisualBrief(
  input: GenerateImageFromVisualBriefInput
): Promise<GenerateImageFromVisualBriefOutput> {
  return generateImageFromVisualBriefFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateImageFromVisualBriefPrompt',
  input: {schema: GenerateImageFromVisualBriefInputSchema},
  output: {schema: GenerateImageFromVisualBriefOutputSchema},
  prompt: `You are an expert visual designer specializing in generating images for social media posts.

You will use the visual brief, brand color, logo, and optional product shot to generate an image that is suitable for social media.

Visual Brief: {{{visualBrief}}}
Brand Color: {{{brandColor}}}
Logo: {{media url=logoDataUri}}
{{#if productShotDataUri}}Product Shot: {{media url=productShotDataUri}}{{/if}}

Output the generated image as a data URI.
`,
});

const generateImageFromVisualBriefFlow = ai.defineFlow(
  {
    name: 'generateImageFromVisualBriefFlow',
    inputSchema: GenerateImageFromVisualBriefInputSchema,
    outputSchema: GenerateImageFromVisualBriefOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      // IMPORTANT: ONLY the googleai/gemini-2.0-flash-preview-image-generation model is able to generate images. You MUST use exactly this model to generate images.
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        {
          text: `Generate an image based on the following visual brief: ${input.visualBrief}. Use brand color ${input.brandColor}. Include the provided logo.{{#if productShotDataUri}} Incorporate the provided product shot.{{/if}}`,
        },
        {
          media: {url: input.logoDataUri},
        },
        ...(input.productShotDataUri ? [{media: {url: input.productShotDataUri}}] : []),
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
      },
    });

    return {imageDataUri: media.url!};
  }
);
