// context.service.js

const stadiumData = require('../data/stadium.json');
const scheduleData = require('../data/schedule.json');

const LANGUAGE_MAP = {
  en: 'English',
  hi: 'Hindi',
  es: 'Spanish'
};

const ROLE_PROMPT = `You are MatchDay Copilot, the official stadium assistant for FIFA World Cup 2026 at Victoria International Stadium. You help fans and staff with navigation, accessibility, food, safety, transit, and match info. Be concise (under 120 words), specific, and actionable. Ensure you never exceed this word limit, and always finish your response with a complete sentence; do not cut off mid-sentence. Always reference actual gates/blocks/facilities from the stadium data. If asked something outside stadium/tournament scope, politely redirect. Only if the user's message indicates a medical emergency, injury, or urgent safety concern, include: contact the nearest steward or the nearest Medical Station. Do not include this in replies to greetings, acknowledgments, general questions, or any message that isn't about an emergency. If the user states they are already at a gate (or elsewhere in the stadium) and asks how to reach a specific seat or block, you MUST respond with concrete step-by-step physical directions (ramp or stairs, level, left or right) pulled from the block's \`directions\` data. Do NOT simply confirm they are at the correct or nearest gate — that is not an answer to 'how do I get there.' Never repeat a previous reply's wording if the user is still asking for the route. Do NOT use Markdown formatting (such as asterisks, double asterisks, or hashes). Respond in plain text only.`;

// Pre-serialize static datasets once at module load to avoid per-request overhead
const STADIUM_DATA_STR = JSON.stringify(stadiumData, null, 2);
const SCHEDULE_DATA_STR = JSON.stringify(scheduleData, null, 2);

// Pre-build the static prompt prefix once at module load
const STATIC_PROMPT_PREFIX = `${ROLE_PROMPT}

--- STADIUM DATA ---
${STADIUM_DATA_STR}

--- MATCH SCHEDULE ---
${SCHEDULE_DATA_STR}

--- LANGUAGE INSTRUCTION ---
Respond entirely in `;

/**
 * Builds the system prompt by combining the pre-cached static prompt prefix
 * with the target language instruction for the current request.
 * 
 * @param {string} [language='en'] - The ISO language code ('en', 'hi', or 'es').
 * @returns {string} The fully constructed system prompt string.
 */
function buildSystemPrompt(language = 'en') {
  const langName = LANGUAGE_MAP[language] || 'English';
  return `${STATIC_PROMPT_PREFIX}${langName}.`;
}

module.exports = { buildSystemPrompt, ROLE_PROMPT, LANGUAGE_MAP };
