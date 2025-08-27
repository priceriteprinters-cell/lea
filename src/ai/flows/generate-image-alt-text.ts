'use server';

/**
 * @fileOverview Generates alternative text for images based on the title.
 *
 * - generateImageAltText - A function that generates alt text for images.
 * - GenerateImageAltTextInput - The input type for the generateImageAltText function.
 * - GenerateImageAltTextOutput - The return type for the generateImageAltText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageAltTextInputSchema = z.object({
  title: z.string().describe('The title of the image.'),
});
export type GenerateImageAltTextInput = z.infer<
  typeof GenerateImageAltTextInputSchema
>;

const GenerateImageAltTextOutputSchema = z.object({
  altText: z.string().describe('The generated alternative text for the image.'),
});
export type GenerateImageAltTextOutput = z.infer<
  typeof GenerateImageAltTextOutputSchema
>;

export async function generateImageAltText(
  input: GenerateImageAltTextInput
): Promise<GenerateImageAltTextOutput> {
  return generateImageAltTextFlow(input);
}

const generateImageAltTextPrompt = ai.definePrompt({
  name: 'generateImageAltTextPrompt',
  input: {schema: GenerateImageAltTextInputSchema},
  output: {schema: GenerateImageAltTextOutputSchema},
  prompt: `You are an expert at writing concise and descriptive alternative text for images.

  Based on the title, generate alternative text for the image.
  Title: {{{title}}}
  `,
});

const generateImageAltTextFlow = ai.defineFlow(
  {
    name: 'generateImageAltTextFlow',
    inputSchema: GenerateImageAltTextInputSchema,
    outputSchema: GenerateImageAltTextOutputSchema,
  },
  async input => {
    const {output} = await generateImageAltTextPrompt(input);
    return output!;
  }
);
