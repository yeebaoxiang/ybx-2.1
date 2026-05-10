import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Genkit initialization with Google AI plugin.
 * To change the global model, update the 'model' property below.
 */
export const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })],
  model: googleAI.model('gemini-2.5-flash'), // Default model for the app
});

export { googleAI };
