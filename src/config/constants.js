/**
 * Configuration constants for the MatchDay Copilot application.
 */
module.exports = {
  MAX_OUTPUT_TOKENS: 500,
  TEMPERATURE: 0.4,
  RATE_LIMIT_MAX_REQUESTS: 30,
  RATE_LIMIT_WINDOW_MS: 60 * 1000,
  MAX_MESSAGE_LENGTH: 500,
  MAX_HISTORY_TURNS: 10,
  MAX_HISTORY_TURN_LENGTH: 300,
  BODY_SIZE_LIMIT: '10kb',
};
