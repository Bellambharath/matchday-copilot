// validate.js

const VALID_LANGUAGES = ['en', 'hi', 'es'];

function stripControlChars(str) {
  // Remove control characters except newline (\n), carriage return (\r), and tab (\t)
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

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

  if (cleanMessage.length > 500) {
    return res.status(400).json({ error: 'Message must be 500 characters or fewer.' });
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

    if (history.length > 10) {
      return res.status(400).json({ error: 'History must contain 10 or fewer items.' });
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
