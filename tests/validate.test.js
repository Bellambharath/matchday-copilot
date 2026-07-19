const { validateChatRequest, stripControlChars, VALID_LANGUAGES } = require('../src/middleware/validate');

describe('Validation Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  describe('stripControlChars', () => {
    it('should remove control characters', () => {
      expect(stripControlChars('hello\x00world')).toBe('helloworld');
      expect(stripControlChars('test\x07data')).toBe('testdata');
    });

    it('should preserve newlines, tabs, and normal text', () => {
      expect(stripControlChars('hello\nworld')).toBe('hello\nworld');
      expect(stripControlChars('hello\tworld')).toBe('hello\tworld');
    });

    it('should handle clean strings without changes', () => {
      expect(stripControlChars('Hello World!')).toBe('Hello World!');
    });
  });

  describe('message validation', () => {
    it('should reject missing message', () => {
      req.body = { language: 'en' };
      validateChatRequest(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject non-string message', () => {
      req.body = { message: 123 };
      validateChatRequest(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject empty message', () => {
      req.body = { message: '' };
      validateChatRequest(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject message over 500 characters', () => {
      req.body = { message: 'a'.repeat(501) };
      validateChatRequest(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it('should accept valid message at 500 chars', () => {
      req.body = { message: 'a'.repeat(500) };
      validateChatRequest(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should strip control chars and set cleaned message', () => {
      req.body = { message: 'hello\x00world' };
      validateChatRequest(req, res, next);
      expect(req.body.message).toBe('helloworld');
      expect(next).toHaveBeenCalled();
    });

    it('should reject message that becomes empty after stripping control chars', () => {
      req.body = { message: '\x00\x01\x02' };
      validateChatRequest(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('language validation', () => {
    it('should accept valid languages', () => {
      for (const lang of ['en', 'hi', 'es']) {
        req.body = { message: 'Hi', language: lang };
        next.mockClear();
        validateChatRequest(req, res, next);
        expect(next).toHaveBeenCalled();
      }
    });

    it('should reject invalid language', () => {
      req.body = { message: 'Hi', language: 'fr' };
      validateChatRequest(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should default to en when language not provided', () => {
      req.body = { message: 'Hi' };
      validateChatRequest(req, res, next);
      expect(req.body.language).toBe('en');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('history validation', () => {
    it('should accept valid history', () => {
      req.body = {
        message: 'Hi',
        history: [
          { role: 'user', text: 'Hello' },
          { role: 'assistant', text: 'Hi there' }
        ]
      };
      validateChatRequest(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should reject non-array history', () => {
      req.body = { message: 'Hi', history: 'invalid' };
      validateChatRequest(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should reject history with more than 10 items', () => {
      const history = Array.from({ length: 11 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        text: `Message ${i}`
      }));
      req.body = { message: 'Hi', history };
      validateChatRequest(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should reject history item without role', () => {
      req.body = { message: 'Hi', history: [{ text: 'Hello' }] };
      validateChatRequest(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should reject history item with invalid role', () => {
      req.body = { message: 'Hi', history: [{ role: 'system', text: 'Hello' }] };
      validateChatRequest(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should reject history item without text', () => {
      req.body = { message: 'Hi', history: [{ role: 'user' }] };
      validateChatRequest(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should accept request without history', () => {
      req.body = { message: 'Hi' };
      validateChatRequest(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});
