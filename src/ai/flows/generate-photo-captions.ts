
'use server';

/**
 * @fileOverview Generates photo caption suggestions using AI.
 *
 * - generatePhotoCaptions - A function that generates caption suggestions for a given photo.
 * - GeneratePhotoCaptionsInput - The input type for the generatePhotoCaptions function.
 * - GeneratePhotoCaptionsOutput - The return type for the generatePhotoCaptions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePhotoCaptionsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo to generate captions for, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
  style: z.string().describe('The desired style for the captions (e.g., witty, poetic, casual).').optional().default('default'),
});
export type GeneratePhotoCaptionsInput = z.infer<typeof GeneratePhotoCaptionsInputSchema>;

const GeneratePhotoCaptionsOutputSchema = z.object({
  captions: z.array(z.string()).describe('An array of suggested captions for the photo.'),
});
export type GeneratePhotoCaptionsOutput = z.infer<typeof GeneratePhotoCaptionsOutputSchema>;

export async function generatePhotoCaptions(input: GeneratePhotoCaptionsInput): Promise<GeneratePhotoCaptionsOutput> {
  return generatePhotoCaptionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePhotoCaptionsPrompt',
  input: {schema: GeneratePhotoCaptionsInputSchema},
  output: {schema: GeneratePhotoCaptionsOutputSchema},
  prompt: `You are a creative social media manager who is exceptional at generating captions for photos.

  Generate 5 captions for the following photo. 
  {{#if style}}
  The style of the captions should be {{style}}.
  {{/if}}

  Analyze the photo and generate captions based on its content.

  Photo: {{media url=photoDataUri}}
  `,
});

const generatePhotoCaptionsFlow = ai.defineFlow(
  {
    name: 'generatePhotoCaptionsFlow',
    inputSchema: GeneratePhotoCaptionsInputSchema,
    outputSchema: GeneratePhotoCaptionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
