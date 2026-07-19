// chat.routes.js

const express = require('express');
const router = express.Router();
const { validateChatRequest } = require('../middleware/validate');
const { chatLimiter } = require('../middleware/rateLimiter');
const { generateReply, isConfigured } = require('../services/gemini.service');
const { buildSystemPrompt } = require('../services/context.service');
const { MAX_HISTORY_TURNS } = require('../config/constants');
const stadiumData = require('../data/stadium.json');

// GET /api/health
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// GET /api/stadium-info
router.get('/stadium-info', (req, res) => {
  res.json(stadiumData);
});

// POST /api/chat
router.post('/chat', chatLimiter, validateChatRequest, async (req, res) => {
  const { message, language, history } = req.body;

  // Check if Gemini is configured
  if (!isConfigured()) {
    return res.status(503).json({ error: 'AI service not configured' });
  }

  // Cap history to last configured number of turns
  const cappedHistory = Array.isArray(history) ? history.slice(-MAX_HISTORY_TURNS) : [];

  // Build system prompt with stadium data and language
  const systemPrompt = buildSystemPrompt(language);

  // Call Gemini
  const result = await generateReply(message, systemPrompt, cappedHistory);

  if (result.configured === false) {
    return res.status(503).json({ error: 'AI service not configured' });
  }

  if (result.error) {
    return res.status(502).json({ error: result.message });
  }

  res.json({ reply: result.reply });
});

module.exports = router;
