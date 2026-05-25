# 🤖 Zara Agent — AI Voice Assistant UI
### SAYANJALI NEXUS PRIVATE LIMITED

A React-based AI chat agent that simulates a professional voice assistant interface, powered by Claude (Anthropic API). Designed for demos, websites, and internal tools.

---

## 📄 File

```
zara-agent.jsx
```

Single self-contained React component. No extra files needed.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📞 Call simulation | Start/End call with live timer (MM:SS) |
| 🌊 Live waveform | 20-bar animated waveform reacts to agent state |
| 🎨 4 agent states | `idle` → `listening` → `thinking` → `speaking` |
| 💬 Chat history | Full conversation displayed with timestamps |
| ⌨️ Typing indicator | Animated 3-dot loader while Zara processes |
| 🔁 Full memory | Entire conversation sent to Claude each turn |
| ⚡ Quick chips | Service shortcut tags shown before call starts |
| 🌙 Dark UI | Deep navy/black with cyan, violet, emerald accents |

---

## 🧠 What Zara Does

Zara is pre-programmed with a full business assistant system prompt covering:

- **Lead Qualification** — Hot / Warm / Cold scoring
- **Appointment Booking** — Collects name, email, phone, date, time, requirements
- **Customer Support** — Identifies issue type, escalates if needed
- **Objection Handling** — Responds to "too expensive" and "need to think"
- **10 Intent Types** — Appointment, Inquiry, Support, Billing, Complaint, Technical, Partnership, and more

---

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+
- A React project (Vite, Next.js, or Create React App)
- Anthropic API key → [console.anthropic.com](https://console.anthropic.com)

### 2. Install & Add the Component

```bash
# Copy zara-agent.jsx into your project
cp zara-agent.jsx src/components/ZaraAgent.jsx
```

### 3. Add Your API Key

Open `zara-agent.jsx` and find the `sendMessage` function (~line 168). The fetch call currently sends directly to the Anthropic API. Replace or inject your key:

```js
headers: {
  "Content-Type": "application/json",
  "x-api-key": "YOUR_ANTHROPIC_API_KEY",   // ← add this line
  "anthropic-version": "2023-06-01",        // ← add this line
},
```

> ⚠️ **Never expose your API key in frontend code in production.** Use a backend proxy. See the Security section below.

### 4. Use in Your App

```jsx
import ZaraAgent from "./components/ZaraAgent";

export default function App() {
  return <ZaraAgent />;
}
```

### 5. Run

```bash
npm run dev
```

Open your browser — click **"Start Call with Zara"** to begin.

---

## 🗂️ Component Structure

```
ZaraAgent()
│
├── State
│   ├── messages[]         — Chat history array
│   ├── agentState         — "idle" | "listening" | "thinking" | "speaking"
│   ├── callActive         — Boolean: is call running?
│   ├── callDuration       — Seconds elapsed (live timer)
│   └── waveform[]         — Array(20) of bar heights
│
├── Key Functions
│   ├── startCall()        — Greets user, sets call active
│   ├── endCall()          — Sends goodbye, clears call
│   ├── sendMessage()      — Calls Claude API, appends reply
│   └── handleKey()        — Enter to send, Shift+Enter for newline
│
└── UI Sections
    ├── Header             — Avatar, name, state badge, call timer
    ├── Waveform           — 20-bar animated equalizer
    ├── Messages           — Scrollable chat bubbles
    └── Footer             — Start button or textarea + End call
```

---

## 🎨 Agent State Colors

| State | Color | Trigger |
|---|---|---|
| `idle` | Cyan `#00d4ff` | Default / between messages |
| `listening` | Violet `#7c3aed` | User is typing (textarea focused) |
| `thinking` | Amber `#f59e0b` | Waiting for Claude API response |
| `speaking` | Emerald `#10b981` | After Claude responds |

---

## 🔧 Customization

### Change Zara's Personality / Company Info
Edit the `SYSTEM_PROMPT` constant at the top of the file:
```js
const SYSTEM_PROMPT = `You are Zara, the professional AI Voice Assistant for YOUR COMPANY NAME...`;
```

### Change the AI Model
In `sendMessage()`, update the model string:
```js
model: "claude-opus-4-20250514",   // More powerful
model: "claude-haiku-4-5",         // Faster & cheaper
```

### Change Max Response Length
```js
max_tokens: 500,   // Shorter replies
max_tokens: 2000,  // Longer replies
```

### Change Card Width
Find `maxWidth: "480px"` in the outer container style and update it.

---

## 🔒 Security — API Key Best Practice

**Development:** Passing the key directly from the component is fine for local testing.

**Production:** Never expose your Anthropic API key in frontend code. Instead, create a simple backend proxy:

```
User → React App → Your Backend (Node/Python) → Anthropic API
```

Simple Node.js proxy example:
```js
// proxy.js
app.post("/api/chat", async (req, res) => {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,  // safe — server side
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req.body),
  });
  const data = await response.json();
  res.json(data);
});
```

Then in the component, call `/api/chat` instead of the Anthropic URL directly.

---

## 📦 Dependencies

| Package | Version | Purpose |
|---|---|---|
| `react` | 18+ | Core framework |
| `react-dom` | 18+ | DOM rendering |

No additional npm packages required. All styles are inline. Google Fonts (DM Sans + Syne) are loaded via CSS `@import` inside the component.

---

## 🌐 Deployment Options

| Platform | How |
|---|---|
| **Vercel** | Push to GitHub → import on vercel.com → auto deploy |
| **Netlify** | `npm run build` → drag & drop `dist/` folder |
| **GitHub Pages** | Use with Vite → `npm run build` → deploy `dist/` |
| **Claude.ai Artifact** | Paste JSX directly into Claude artifact runner |

---

## 💡 Usage Scenarios

- **Live demo** on your company website
- **Embedded widget** (see `zara-widget.html` for the embeddable version)
- **Internal CRM tool** for team lead qualification demos
- **Presentation** to showcase AI chatbot capabilities to clients
- **Prototype** to test Zara's responses before building the full backend

---

## 📁 Related Files

| File | Description |
|---|---|
| `zara-agent.jsx` | This file — full-page React UI |
| `zara-widget.html` | Embeddable floating chat bubble for any website |
| `zara-instagram-bot/` | Instagram DM bot (Node.js + Express) |

---

Built for **SAYANJALI NEXUS PRIVATE LIMITED** 🚀
