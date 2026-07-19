// gemini.service.js

const { GoogleGenAI } = require('@google/genai');

let ai = null;

const apiKey = process.env.GEMINI_API_KEY;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
} else {
  console.warn('WARNING: GEMINI_API_KEY is not set. AI chat will return 503.');
}

function isConfigured() {
  return ai !== null;
}

async function generateReply(userMessage, systemPrompt, history) {
  if (!ai) {
    return { configured: false };
  }

  try {
    // Convert history to Gemini format
    const contents = [];
    if (history && Array.isArray(history)) {
      for (const turn of history) {
        contents.push({
          role: turn.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: turn.text }]
        });
      }
    }

    // Add the current user message
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: 500,
        temperature: 0.4
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
