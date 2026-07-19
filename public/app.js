// MatchDay Copilot — Frontend App

(function () {
  'use strict';

  const chatLog = document.getElementById('chat-log');
  const chatForm = document.getElementById('chat-form');
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');
  const languageSelect = document.getElementById('language-select');
  const chips = document.querySelectorAll('.chip');

  let history = [];
  let isLoading = false;

  const WELCOME_MESSAGES = {
    en: "👋 Welcome to MatchDay Copilot! I'm your AI stadium assistant for FIFA World Cup 2026 at Victoria International Stadium. I can help you with:\n\n🧭 Finding your gate and seat\n♿ Accessible routes and facilities\n🍽 Food courts and dining options\n🚇 Transit and parking info\n📅 Today's match schedule\n🚨 Emergency assistance\n\nHow can I help you today?",
    hi: "👋 मैचडे कोपायलट में आपका स्वागत है! मैं विक्टोरिया इंटरनेशनल स्टेडियम में FIFA विश्व कप 2026 के लिए आपका AI स्टेडियम सहायक हूँ। मैं आपकी मदद कर सकता हूँ:\n\n🧭 अपना गेट और सीट खोजें\n♿ सुलभ मार्ग और सुविधाएं\n🍽 फूड कोर्ट और भोजन विकल्प\n🚇 ट्रांजिट और पार्किंग जानकारी\n📅 आज का मैच शेड्यूल\n🚨 आपातकालीन सहायता\n\nआज मैं आपकी कैसे मदद कर सकता हूँ?",
    es: "👋 ¡Bienvenido a MatchDay Copilot! Soy tu asistente de estadio con IA para la Copa Mundial FIFA 2026 en el Victoria International Stadium. Puedo ayudarte con:\n\n🧭 Encontrar tu puerta y asiento\n♿ Rutas accesibles e instalaciones\n🍽 Patios de comida y opciones gastronómicas\n🚇 Información de transporte y estacionamiento\n📅 Horario de partidos de hoy\n🚨 Asistencia de emergencia\n\n¿Cómo puedo ayudarte hoy?"
  };

  const LANG_ATTR_MAP = {
    en: 'en',
    hi: 'hi',
    es: 'es'
  };

  const CHIP_TEXTS = {
    en: [
      "🧭 Find my gate",
      "♿ Accessible routes",
      "🍽 Food nearby",
      "🚨 Emergency help",
      "🚇 Transit after match",
      "📅 Today's matches"
    ],
    hi: [
      "🧭 मेरा गेट खोजें",
      "♿ सुलभ मार्ग",
      "🍽 आस-पास का भोजन",
      "🚨 आपातकालीन सहायता",
      "🚇 मैच के बाद परिवहन",
      "📅 आज के मैच"
    ],
    es: [
      "🧭 Buscar mi puerta",
      "♿ Rutas accesibles",
      "🍽 Comida cercana",
      "🚨 Ayuda de emergencia",
      "🚇 Tránsito después del partido",
      "📅 Partidos de hoy"
    ]
  };

  const INPUT_PLACEHOLDERS = {
    en: "Ask me anything about the stadium...",
    hi: "स्टेडियम के बारे में कुछ भी पूछें...",
    es: "Pregúntame cualquier cosa sobre el estadio..."
  };

  const SEND_BUTTON_TEXTS = {
    en: "Send",
    hi: "भेजें",
    es: "Enviar"
  };

  // Initialize
  function init() {
    const lang = languageSelect.value;
    updateUILanguage(lang);
    showWelcomeMessage();
    setupEventListeners();
  }

  function showWelcomeMessage() {
    const lang = languageSelect.value;
    appendMessage('assistant', WELCOME_MESSAGES[lang] || WELCOME_MESSAGES.en);
  }

  function updateUILanguage(lang) {
    // Update HTML lang attribute
    document.documentElement.lang = LANG_ATTR_MAP[lang] || 'en';

    // Update chips text and data-message
    const localizedChips = CHIP_TEXTS[lang] || CHIP_TEXTS.en;
    chips.forEach(function (chip, index) {
      if (localizedChips[index]) {
        chip.textContent = localizedChips[index];
        chip.setAttribute('data-message', localizedChips[index]);
      }
    });

    // Update input placeholder and send button text
    messageInput.placeholder = INPUT_PLACEHOLDERS[lang] || INPUT_PLACEHOLDERS.en;
    sendButton.textContent = SEND_BUTTON_TEXTS[lang] || SEND_BUTTON_TEXTS.en;
  }

  function setupEventListeners() {
    // Form submission
    chatForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const msg = messageInput.value.trim();
      if (msg && !isLoading) {
        sendMessage(msg);
      }
    });

    // Quick-action chips
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        if (!isLoading) {
          const msg = chip.getAttribute('data-message');
          sendMessage(msg);
        }
      });
    });

    // Language change
    languageSelect.addEventListener('change', function () {
      const lang = languageSelect.value;
      updateUILanguage(lang);
      
      // Show a language change notification
      appendMessage('assistant', lang === 'en'
        ? '🌐 Language changed to English. I\'ll respond in English from now on.'
        : lang === 'hi'
          ? '🌐 भाषा हिन्दी में बदली गई। अब मैं हिन्दी में जवाब दूँगा।'
          : '🌐 Idioma cambiado a Español. Responderé en español a partir de ahora.'
      );
    });
  }

  async function sendMessage(text) {
    if (isLoading) return;

    // Show user message
    appendMessage('user', text);
    messageInput.value = '';

    // Add to history
    history.push({ role: 'user', text: text });

    // Disable input
    setLoading(true);
    showTypingIndicator();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          language: languageSelect.value,
          history: history.slice(-10)
        })
      });

      removeTypingIndicator();

      if (!response.ok) {
        const data = await response.json().catch(function () {
          return { error: 'Something went wrong' };
        });

        if (response.status === 429) {
          appendMessage('error', '⏳ You\'re sending messages too quickly. Please wait a moment and try again.');
        } else if (response.status === 503) {
          appendMessage('error', '🔧 The AI service is currently unavailable. Please try again later.');
        } else {
          appendMessage('error', '❌ ' + (data.error || 'Something went wrong. Please try again.'));
        }
        return;
      }

      const data = await response.json();
      const reply = data.reply || 'I received your message but had trouble generating a response. Please try again.';

      // Add assistant reply to history
      history.push({ role: 'assistant', text: reply });

      appendMessage('assistant', reply);
    } catch (err) {
      removeTypingIndicator();
      appendMessage('error', '🌐 Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  function appendMessage(type, text) {
    const div = document.createElement('div');

    if (type === 'user') {
      div.className = 'message message-user';
    } else if (type === 'error') {
      div.className = 'message message-error';
    } else {
      div.className = 'message message-assistant';
    }

    // Use textContent to prevent XSS
    div.textContent = text;

    // Preserve whitespace/newlines
    div.style.whiteSpace = 'pre-wrap';

    chatLog.appendChild(div);
    scrollToBottom();
  }

  function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'typing-indicator';
    indicator.setAttribute('aria-label', 'Assistant is typing');
    indicator.innerHTML = '<span></span><span></span><span></span>';
    chatLog.appendChild(indicator);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  function setLoading(loading) {
    isLoading = loading;
    messageInput.disabled = loading;
    sendButton.disabled = loading;
    chips.forEach(function (chip) {
      chip.disabled = loading;
    });
    if (!loading) {
      messageInput.focus();
    }
  }

  function scrollToBottom() {
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  // Start the app
  init();
})();
