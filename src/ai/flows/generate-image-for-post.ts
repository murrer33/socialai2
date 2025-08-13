'use server';
/**
 * @fileOverview An image generation AI agent that generates images for social media posts.
 *
 * - generateImageForPost - A function that handles the image generation process.
 * - GenerateImageForPostInput - The input type for the generateImageForPost function.
 * - GenerateImageForPostOutput - The return type for the generateImageForPost function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageForPostInputSchema = z.object({
  prompt: z.string().describe('The prompt to generate the image from, based on the visual brief.'),
  brandColors: z.object({
    primary: z.string().describe('The primary brand color for the palette.'),
    secondary: z.string().optional().describe('The secondary brand color for the palette.'),
  }),
  logoDataUri: z
    .string()
    .describe(
      "The brand logo as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  productShotDataUri: z
    .string()
    .optional()
    .describe(
      "An optional product shot as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateImageForPostInput = z.infer<typeof GenerateImageForPostInputSchema>;

const GenerateImageForPostOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The generated image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateImageForPostOutput = z.infer<typeof GenerateImageForPostOutputSchema>;

export async function generateImageForPost(
  input: GenerateImageForPostInput
): Promise<GenerateImageForPostOutput> {
  return generateImageForPostFlow(input);
}

const generateImageForPostFlow = ai.defineFlow(
  {
    name: 'generateImageForPostFlow',
    inputSchema: GenerateImageForPostInputSchema,
    outputSchema: GenerateImageForPostOutputSchema,
  },
  async input => {
    // Construct the prompt based on the user's specification.
    const fullPrompt = `Create a minimal studio-style photo suitable for an Instagram feed, based on the following concept: "${input.prompt}".
Palette: ${input.brandColors.primary}${input.brandColors.secondary ? `, ${input.brandColors.secondary}` : ''}.
The image should have a 1:1 aspect ratio.
Avoid using realistic human faces to ensure safety.
Include the provided logo.
{{#if productShotDataUri}}Incorporate the provided product shot.{{/if}}`;
    
    const {media} = await ai.generate({
      // IMPORTANT: ONLY the googleai/gemini-2.0-flash-preview-image-generation model is able to generate images. You MUST use exactly this model to generate images.
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        {
          text: fullPrompt,
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
    
    // In a real implementation, we would check for a "STOCK" response and fetch a stock photo.
    // For now, we directly return the generated image.

    return {imageDataUri: media.url!};
  }
);
