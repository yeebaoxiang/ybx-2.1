'use server';
/**
 * @fileOverview ELEOS Spatial Object Detection Flow.
 *
 * - detectAndAnnounceObjects - Returns spatial objects for mobility assistance.
 */

import {ai, googleAI} from '@/ai/genkit';
import {z} from 'genkit';

const ObjectDetectionInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of the scene as a data URI."
    ),
});
export type ObjectDetectionInput = z.infer<typeof ObjectDetectionInputSchema>;

const DetectedObjectSchema = z.object({
  name: z.string().describe('Object name (e.g., Door, Wall, Person).'),
  confidence: z.number(),
  boundingBox: z.object({
    x: z.number().describe('Center X (0-1)'),
    y: z.number().describe('Center Y (0-1)'),
    width: z.number(),
    height: z.number().describe('Vertical span for distance estimation'),
  }),
});

const ObjectDetectionOutputSchema = z.object({
  detectedObjects: z.array(DetectedObjectSchema),
});
export type ObjectDetectionOutput = z.infer<typeof ObjectDetectionOutputSchema>;

export async function detectAndAnnounceObjects(input: ObjectDetectionInput): Promise<ObjectDetectionOutput> {
  return objectDetectionFlow(input);
}

const objectDetectionPrompt = ai.definePrompt({
  name: 'objectDetectionPrompt',
  model: googleAI.model('gemini-2.5-flash'), 
  input: {schema: ObjectDetectionInputSchema},
  output: {schema: ObjectDetectionOutputSchema},
  prompt: `You are ELEOS, an expert mobility assistant for the visually impaired. 
Analyze the image to identify obstacles (walls, furniture, people) and exits (doors, openings).

Divide the horizontal frame into 12 clock-face sectors.
- 12 o'clock is directly in front.
- 9 o'clock is to the left.
- 3 o'clock is to the right.

Instructions:
1. Identify high-confidence obstacles.
2. Specifically identify "Door" as "Exit".
3. Provide bounding boxes for distance estimation.

Image: {{media url=imageDataUri}}`,
});

const objectDetectionFlow = ai.defineFlow(
  {
    name: 'objectDetectionFlow',
    inputSchema: ObjectDetectionInputSchema,
    outputSchema: ObjectDetectionOutputSchema,
  },
  async input => {
    const {output} = await objectDetectionPrompt(input);
    if (!output || !output.detectedObjects) return { detectedObjects: [] };
    
    // Filter for high confidence and meaningful objects
    const filtered = output.detectedObjects.filter(obj => obj.confidence > 0.5);
    return { detectedObjects: filtered };
  }
);
