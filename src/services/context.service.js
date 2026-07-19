// context.service.js

const path = require('path');
const stadiumData = require('../data/stadium.json');
const scheduleData = require('../data/schedule.json');

const LANGUAGE_MAP = {
  en: 'English',
  hi: 'Hindi',
  es: 'Spanish'
};

const ROLE_PROMPT = `You are MatchDay Copilot, the official stadium assistant for FIFA World Cup 2026 at Victoria International Stadium. You help fans and staff with navigation, accessibility, food, safety, transit, and match info. Be concise (under 120 words), specific, and actionable. Always reference actual gates/blocks/facilities from the stadium data. If asked something outside stadium/tournament scope, politely redirect. For medical emergencies, always mention: contact the nearest steward or Medical Station. If the user states they are already at a gate (or elsewhere in the stadium) and asks how to reach a specific seat or block, you MUST respond with concrete step-by-step physical directions (ramp or stairs, level, left or right) pulled from the block's \`directions\` data. Do NOT simply confirm they are at the correct or nearest gate — that is not an answer to 'how do I get there.' Never repeat a previous reply's wording if the user is still asking for the route.`;

function buildSystemPrompt(language = 'en') {
  const langName = LANGUAGE_MAP[language] || 'English';

  const prompt = `${ROLE_PROMPT}

--- STADIUM DATA ---
${JSON.stringify(stadiumData, null, 2)}

--- MATCH SCHEDULE ---
${JSON.stringify(scheduleData, null, 2)}

--- LANGUAGE INSTRUCTION ---
Respond entirely in ${langName}.`;

  return prompt;
}

module.exports = { buildSystemPrompt, ROLE_PROMPT, LANGUAGE_MAP };
