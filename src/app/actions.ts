
"use server";

import {
  generatePhotoCaptions,
  type GeneratePhotoCaptionsInput,
} from "@/ai/flows/generate-photo-captions";

export async function getCaptions(
  input: GeneratePhotoCaptionsInput
): Promise<{ captions: string[] } | { error: string }> {
  try {
    const result = await generatePhotoCaptions(input);
    if (!result || !result.captions || result.captions.length === 0) {
      return { error: "The AI couldn't generate captions for this image. Please try another one." };
    }
    return { captions: result.captions };
  } catch (e) {
    console.error("Error generating captions:", e);
    return { error: "An unexpected error occurred. Please try again later." };
  }
}
