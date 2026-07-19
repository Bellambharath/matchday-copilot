# MatchDay Copilot ⚽

**AI-powered stadium assistant for FIFA World Cup 2026 — helping fans navigate, access services, and enjoy the match in their language.**

## Chosen Vertical

**Fan Experience** — navigation, accessibility, and multilingual assistance, with operational awareness (queue/crowd guidance).

## Problem & Approach

Navigating a 72,000-capacity stadium during a FIFA World Cup match is overwhelming: finding your gate, locating accessible routes, discovering food options, and planning your exit — all while potentially not speaking the local language.

**MatchDay Copilot** solves this with a GenAI-powered conversational assistant that provides instant, context-grounded answers. Instead of generic chatbot responses, it uses structured stadium data (gates, seating tiers, facilities, transit) as grounding context for Gemini, producing specific and actionable guidance. Language-aware prompting ensures fans receive help in English, Hindi, or Spanish.

## Architecture

```
┌─────────────────┐         ┌───────────────────────────────────────────┐
│   Browser SPA   │ ──────► │  Express Server                           │
│   (HTML/CSS/JS) │ ◄────── │  ┌─────────────┐  ┌──────────────────┐   │
│                 │         │  │  Validation  ├──► Rate Limiter     │   │
│  • Chat UI      │         │  └──────┬──────┘  └────────┬─────────┘   │
│  • Language      │         │         ▼                   ▼             │
│    Selector     │         │  ┌──────────────────────────────────┐     │
│  • Quick Chips  │         │  │  Context Builder                │     │
│                 │         │  │  (stadium.json + schedule.json   │     │
│                 │         │  │   + role prompt + language)      │     │
│                 │         │  └──────────────┬───────────────────┘     │
└─────────────────┘         │                 ▼                         │
                            │  ┌──────────────────────────────────┐     │
                            │  │Gemini API (gemini-3.1-flash-lite)│     │
                            │  │  System prompt with grounding   │     │
                            │  │  data → factual, specific reply │     │
                            │  └──────────────────────────────────┘     │
                            └───────────────────────────────────────────┘
```

**Grounding data** (JSON files) provides:
- Stadium layout: 6 gates, 4 seating tiers, blocks 101–140
- Facilities: food courts, medical stations, prayer rooms, restrooms, water refill
- Transit: metro, bus routes, taxi/rideshare, parking lots
- Schedule: 6 group-stage matches with teams, times, and attendance

## Features

- 🧭 **Gate & Seat Navigation** — Directs fans to the correct gate based on their seat/block number
- ♿ **Accessibility Assistance** — Identifies wheelchair-accessible gates (B, E), accessible restrooms, and elevator routes
- 🍽 **Food & Services** — Recommends nearby food courts with dietary options (vegetarian, halal, gluten-free)
- 🌐 **Multilingual Support** — Full conversation in English, Hindi, or Spanish with mid-conversation switching
- 🚇 **Transit Guidance** — Metro, bus, taxi/rideshare, and parking information for arrival and departure
- 📅 **Match Schedule** — Today's matches with kickoff times, teams, and expected attendance
- 🚨 **Emergency Support** — Always directs to nearest steward or medical station
- 👥 **Crowd Guidance** — Recommends fastest gates and optimal arrival times

## How the Solution Works

**Request Lifecycle (5 Steps):**

1. **User sends a message** — The frontend collects the message, selected language, and conversation history (last 10 turns), then sends a POST request to `/api/chat`.

2. **Validation & Rate Limiting** — Express middleware validates the input (message length, language code, history shape), strips control characters for prompt-injection hygiene, and enforces a 30 req/min rate limit per IP.

3. **Context Building** — The context service constructs a system prompt by combining: the assistant's role definition, the full stadium layout and match schedule data (serialized JSON), and a language instruction for the target language.

4. **Gemini Generation** — The system prompt, conversation history, and user message are sent to Gemini 3.1 Flash-Lite (temperature 0.4, max 500 tokens). The structured grounding data ensures responses reference real gates, blocks, and facilities.

5. **Response Delivery** — The AI reply is returned as JSON. The frontend renders it as text (using `textContent` to prevent XSS) in a chat bubble, maintaining the conversational flow.

## Assumptions

- **Fictional Stadium**: Victoria International Stadium is a realistic but fictional venue in Dallas, Texas. Data is representative of a real World Cup stadium.
- **No Live Sensor Feeds**: Crowd density, queue lengths, and wait times are based on historical patterns encoded in the stadium data, not real-time sensors.
- **Single Stadium Scope**: The assistant covers one venue. Multi-venue support would require extending the data layer.
- **No User Accounts**: No authentication or session management. Each page load is a fresh conversation.
- **Static Schedule**: Match schedule is pre-loaded JSON, not fetched from a live API.

## Security Measures

- **Helmet.js** — Sets secure HTTP headers (CSP, X-Frame-Options, HSTS, etc.)
- **Rate Limiting** — 30 requests/minute per IP on `/api/chat` with JSON error responses
- **Input Validation** — Message length (1–500 chars), language whitelist, history shape-checking, control character stripping
- **Prompt Injection Prevention** — User input is always sent as user role content, never concatenated into the system prompt
- **Body Size Limit** — `express.json({ limit: '10kb' })` prevents payload attacks
- **Same-Origin Only** — No CORS configuration needed; frontend served by the same Express app
- **No Secrets in Code** — API key read from environment variable only; `.env` in `.gitignore`
- **XSS Prevention** — Frontend renders AI output using `textContent`, not `innerHTML`
- **Error Handling** — Stack traces and API keys never leaked in error responses

## Accessibility Measures

- **Semantic HTML** — `<header>`, `<main>`, `<form>` landmarks; chat log with `role="log"` and `aria-live="polite"`
- **Keyboard Navigation** — All interactive elements (language selector, chips, input, send) fully keyboard-operable with visible focus outlines
- **Screen Reader Support** — Visually hidden `<label>` elements for inputs; `aria-label` on send button; `aria-label` on chip group
- **Color Contrast** — All text meets WCAG AA (≥ 4.5:1 contrast ratio)
- **Reduced Motion** — `prefers-reduced-motion` media query disables animations
- **Dynamic Language** — `lang` attribute on `<html>` updates when language is changed
- **No Color-Only Meaning** — Status and message types distinguished by position, icons, and text, not color alone

## Setup & Run

### Prerequisites
- Node.js 20+
- A Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/matchday-copilot.git
cd matchday-copilot

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your Gemini API key

# Start the server
npm start
# Server runs on http://localhost:8080

# Run tests
npm test
```

## Deployment

### Docker

```bash
# Build the image
docker build -t matchday-copilot .

# Run the container
docker run -p 8080:8080 -e GEMINI_API_KEY=your_key_here matchday-copilot
```

### Cloud Run

```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/matchday-copilot

# Deploy to Cloud Run
gcloud run deploy matchday-copilot \
  --image gcr.io/YOUR_PROJECT_ID/matchday-copilot \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_key_here
```

## Built with Gen AI

This project was built using **Google Antigravity + Gemini**, as part of the PromptWars Challenge 4: Smart Stadiums & Tournament Operations.
