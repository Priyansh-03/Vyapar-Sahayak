
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Initialize plugins array
const plugins = [];
let defaultModel;

// Only add googleAI plugin if the API key is available
// This allows the app to run without the key, but AI features will not work.
if (process.env.GOOGLE_API_KEY) {
  plugins.push(googleAI({ apiKey: process.env.GOOGLE_API_KEY }));
  defaultModel = 'googleai/gemini-2.0-flash'; // Set default model only if plugin is loaded
} else {
  console.warn(
    "GOOGLE_API_KEY is not set. Genkit AI features requiring Google AI models will not be available."
  );
  // No default Google AI model if the plugin isn't loaded
}

export const ai = genkit({
  plugins: plugins,
  ...(defaultModel && { model: defaultModel }), // Conditionally add model property
});
