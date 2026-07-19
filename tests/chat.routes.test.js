const request = require('supertest');
const app = require('../src/server');

// Mock the gemini service
jest.mock('../src/services/gemini.service', () => ({
  generateReply: jest.fn(),
  isConfigured: jest.fn()
}));

const { generateReply, isConfigured } = require('../src/services/gemini.service');

describe('API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('should return 200 with status ok', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
    });
  });

  describe('GET /api/stadium-info', () => {
    it('should return 200 with stadium data', async () => {
      const res = await request(app).get('/api/stadium-info');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', 'Victoria International Stadium');
      expect(res.body).toHaveProperty('gates');
    });
  });

  describe('POST /api/chat', () => {
    it('should return 200 with a reply on valid request', async () => {
      isConfigured.mockReturnValue(true);
      generateReply.mockResolvedValue({ reply: 'Gate A is on the north side.' });

      const res = await request(app)
        .post('/api/chat')
        .send({ message: 'Where is gate A?', language: 'en' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('reply');
      expect(typeof res.body.reply).toBe('string');
    });

    it('should return 400 on missing message', async () => {
      const res = await request(app)
        .post('/api/chat')
        .send({ language: 'en' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 400 on empty message', async () => {
      const res = await request(app)
        .post('/api/chat')
        .send({ message: '', language: 'en' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 400 on message exceeding 500 chars', async () => {
      const longMessage = 'a'.repeat(501);
      const res = await request(app)
        .post('/api/chat')
        .send({ message: longMessage, language: 'en' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 400 on invalid language', async () => {
      const res = await request(app)
        .post('/api/chat')
        .send({ message: 'Hello', language: 'fr' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 503 when AI service not configured', async () => {
      isConfigured.mockReturnValue(false);

      const res = await request(app)
        .post('/api/chat')
        .send({ message: 'Hello', language: 'en' });

      expect(res.status).toBe(503);
      expect(res.body).toHaveProperty('error', 'AI service not configured');
    });

    it('should return 502 when Gemini returns an error', async () => {
      isConfigured.mockReturnValue(true);
      generateReply.mockResolvedValue({ error: true, message: 'Something went wrong' });

      const res = await request(app)
        .post('/api/chat')
        .send({ message: 'Hello', language: 'en' });

      expect(res.status).toBe(502);
      expect(res.body).toHaveProperty('error');
    });

    it('should default language to en when not provided', async () => {
      isConfigured.mockReturnValue(true);
      generateReply.mockResolvedValue({ reply: 'Hello!' });

      const res = await request(app)
        .post('/api/chat')
        .send({ message: 'Hello' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('reply');
    });

    it('should accept valid history', async () => {
      isConfigured.mockReturnValue(true);
      generateReply.mockResolvedValue({ reply: 'Noted.' });

      const res = await request(app)
        .post('/api/chat')
        .send({
          message: 'Tell me more',
          language: 'en',
          history: [
            { role: 'user', text: 'Hi' },
            { role: 'assistant', text: 'Hello!' }
          ]
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('reply');
    });
  });
});
