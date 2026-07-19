const { buildSystemPrompt, ROLE_PROMPT, LANGUAGE_MAP } = require('../src/services/context.service');

describe('Context Service', () => {
  describe('buildSystemPrompt', () => {
    it('should include the role prompt', () => {
      const prompt = buildSystemPrompt('en');
      expect(prompt).toContain('MatchDay Copilot');
      expect(prompt).toContain('FIFA World Cup 2026');
      expect(prompt).toContain('Victoria International Stadium');
    });

    it('should include stadium data', () => {
      const prompt = buildSystemPrompt('en');
      expect(prompt).toContain('Gate A');
      expect(prompt).toContain('Gate B');
      expect(prompt).toContain('North Bites');
      expect(prompt).toContain('Medical Station');
      expect(prompt).toContain('Victoria Park Metro Station');
    });

    it('should include schedule data', () => {
      const prompt = buildSystemPrompt('en');
      expect(prompt).toContain('Brazil');
      expect(prompt).toContain('Japan');
      expect(prompt).toContain('Group F');
    });

    it('should include English language instruction for en', () => {
      const prompt = buildSystemPrompt('en');
      expect(prompt).toContain('Respond entirely in English');
    });

    it('should include Hindi language instruction for hi', () => {
      const prompt = buildSystemPrompt('hi');
      expect(prompt).toContain('Respond entirely in Hindi');
    });

    it('should include Spanish language instruction for es', () => {
      const prompt = buildSystemPrompt('es');
      expect(prompt).toContain('Respond entirely in Spanish');
    });

    it('should default to English for unknown language', () => {
      const prompt = buildSystemPrompt('fr');
      expect(prompt).toContain('Respond entirely in English');
    });

    it('should default to English when no language provided', () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toContain('Respond entirely in English');
    });
  });
});
