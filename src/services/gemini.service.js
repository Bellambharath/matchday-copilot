// gemini.service.js

const { GoogleGenAI } = require('@google/genai');
const {
  MAX_OUTPUT_TOKENS,
  TEMPERATURE,
  MAX_HISTORY_TURN_LENGTH
} = require('../config/constants');

let ai = null;

const apiKey = process.env.GEMINI_API_KEY;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
} else {
  console.warn('WARNING: GEMINI_API_KEY is not set. AI chat will return 503.');
}

/**
 * Checks whether the Gemini API client is configured with an API key.
 * 
 * @returns {boolean} True if the API client is initialized.
 */
function isConfigured() {
  return ai !== null;
}

/**
 * Sends a message along with system prompt and history to the Gemini API
 * and returns the generated reply text.
 * 
 * @param {string} userMessage - The current user prompt message.
 * @param {string} systemPrompt - The system prompt containing role and grounding context.
 * @param {Array<Object>} history - Array of previous chat turns.
 * @returns {Promise<Object>} An object containing either the reply string or an error indicator.
 */
async function generateReply(userMessage, systemPrompt, history) {
  if (!ai) {
    return { configured: false };
  }

  try {
    // Convert history to Gemini format
    const contents = [];
    if (history && Array.isArray(history)) {
      for (const turn of history) {
        // Truncate history turns to prevent token bloat from large payloads
        const cleanText = turn.text && turn.text.length > MAX_HISTORY_TURN_LENGTH
          ? turn.text.substring(0, MAX_HISTORY_TURN_LENGTH)
          : turn.text;

        contents.push({
          role: turn.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: cleanText }]
        });
      }
    }

    // Add the current user message
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents,
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        temperature: TEMPERATURE,
        thinkingConfig: {
          thinkingBudget: 0
        }
      }
    });

    const text = response.text;
    return { reply: text };
  } catch (err) {
    console.error('Gemini API error:', err.message);
    return { error: true, message: 'I\'m having trouble processing your request right now. Please try again in a moment.' };
  }
}

module.exports = { generateReply, isConfigured };
