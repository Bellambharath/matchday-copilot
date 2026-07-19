// rateLimiter.js

const rateLimit = require('express-rate-limit');

const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait a moment before trying again.' }
});

module.exports = { chatLimiter };
