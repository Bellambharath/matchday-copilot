// validate.js

const { MAX_MESSAGE_LENGTH, MAX_HISTORY_TURNS } = require('../config/constants');
const VALID_LANGUAGES = ['en', 'hi', 'es'];

/**
 * Strips control characters (non-printable/non-format control codes) from a string.
 * Preserves typical space/format controls like newlines, carriage returns, and tabs.
 * 
 * @param {string} str - The raw string to clean.
 * @returns {string} The cleaned string.
 */
function stripControlChars(str) {
  // Remove control characters except newline (\n), carriage return (\r), and tab (\t)
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Express middleware to validate structural and content properties of chat API requests.
 * Sanitizes input messages by stripping control characters.
 * 
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function in the stack.
 */
function validateChatRequest(req, res, next) {
  const { message, language, history } = req.body;

  // Validate message
  if (message === undefined || message === null) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  if (typeof message !== 'string') {
    return res.status(400).json({ error: 'Message must be a string.' });
  }

  // Strip control characters
  const cleanMessage = stripControlChars(message);

  if (cleanMessage.length === 0) {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  if (cleanMessage.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.` });
  }

  req.body.message = cleanMessage;

  // Validate language
  if (language !== undefined) {
    if (!VALID_LANGUAGES.includes(language)) {
      return res.status(400).json({ error: `Invalid language. Must be one of: ${VALID_LANGUAGES.join(', ')}.` });
    }
  } else {
    req.body.language = 'en';
  }

  // Validate history
  if (history !== undefined) {
    if (!Array.isArray(history)) {
      return res.status(400).json({ error: 'History must be an array.' });
    }

    if (history.length > MAX_HISTORY_TURNS) {
      return res.status(400).json({ error: `History must contain ${MAX_HISTORY_TURNS} or fewer items.` });
    }

    for (let i = 0; i < history.length; i++) {
      const item = history[i];

      if (!item || typeof item !== 'object') {
        return res.status(400).json({ error: `History item at index ${i} must be an object.` });
      }

      if (!item.role || typeof item.role !== 'string') {
        return res.status(400).json({ error: `History item at index ${i} must have a string 'role'.` });
      }

      if (!['user', 'assistant'].includes(item.role)) {
        return res.status(400).json({ error: `History item at index ${i} role must be 'user' or 'assistant'.` });
      }

      if (!item.text || typeof item.text !== 'string') {
        return res.status(400).json({ error: `History item at index ${i} must have a string 'text'.` });
      }
    }
  }

  next();
}

module.exports = { validateChatRequest, stripControlChars, VALID_LANGUAGES };
