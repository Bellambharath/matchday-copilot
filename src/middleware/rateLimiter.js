// rateLimiter.js

const rateLimit = require('express-rate-limit');
const {
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW_MS
} = require('../config/constants');

/**
 * Express rate-limiting middleware to throttle client requests
 * to prevent API abuse and control token consumption.
 */
const chatLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait a moment before trying again.' }
});

module.exports = { chatLimiter };
