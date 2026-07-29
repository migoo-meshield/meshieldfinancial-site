// chatbot-widget.js
//
// Draws the chat bubble + window on your site and talks to /api/chatbot.
//
// HOW IT WORKS:
// 1. Builds the bubble + chat window, adds them to every page.
// 2. Visitor picks a language, types a message.
// 3. Sends the conversation to /api/chatbot, shows the reply.
// 4. If anything fails, shows your contact info instead of breaking.

// ============================================================
// SETTINGS — edit these anytime, nothing else needs to change
// ============================================================
const AVATAR_URL = "/miguelson-headshot.jpeg"; // change this path to swap the photo/icon
const BOT_NAME = "Ask ME Shield";
const BOT_SUBTITLE = "Insurance · Tax · IBC · Immigration";
const CONTACT_PHONE_LINK = "tel:+14072672652";
// ============================================================

(function () {
  "use strict";

  // ---------- 1. STYLES (simple, clean — Brevo-style) ----------
  const style = document.createElement("style");
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    .msc-bubble {
      position: fixed; bottom: 22px; right: 20px; width: 58px; height: 58px;
      border-radius: 50%;
      background: #0B1F3A;
      box-shadow: 0 4px 16px rgba(11,31,58,0.3);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; border: none; z-index: 999999; padding: 0; overflow: hidden;
      transition: transform 0.2s ease;
    }
    .msc-bubble:hover { transform: scale(1.05); }
    .msc-bubble img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
    .msc-bubble .msc-badge {
      position: absolute; bottom: -1px; right: -1px; width: 18px; height: 18px;
      background: #C9A14A; border: 2px solid #fff; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
    }
    .msc-bubble .msc-badge svg { width: 9px; height: 9px; }

    .msc-tooltip {
      position: fixed; bottom: 90px; right: 20px; max-width: 200px;
      background: #fff; color: #0B1F3A; padding: 10px 14px; border-radius: 12px;
      font-size: 12.5px; font-weight: 600; line-height: 1.4;
      box-shadow: 0 6px 20px rgba(11,31,58,0.18); z-index: 999997;
      opacity: 0; transform: translateY(8px); pointer-events: none;
      transition: opacity .4s ease, transform .4s ease;
    }
    .msc-tooltip.msc-show { opacity: 1; transform: translateY(0); pointer-events: auto; cursor: pointer; }
    .msc-tooltip::after {
      content: ''; position: absolute; bottom: -6px; right: 24px;
      width: 12px; height: 12px; background: #fff; transform: rotate(45deg);
      box-shadow: 3px 3px 6px rgba(11,31,58,0.06);
    }

    .msc-window {
      position: fixed; bottom: 90px; right: 20px; width: 320px;
      max-width: calc(100vw - 40px); height: 460px; max-height: 70vh;
      background: #fff; border-radius: 14px;
      box-shadow: 0 12px 40px rgba(11,31,58,0.22);
      display: none; flex-direction: column; overflow: hidden; z-index: 999998;
      opacity: 0; transform: translateY(14px);
      transition: opacity .22s ease, transform .22s ease;
      font-family: 'Inter', sans-serif;
    }
    .msc-window.msc-open { display: flex; opacity: 1; transform: translateY(0); }

    .msc-header {
      background: #0B1F3A; color: #fff; padding: 16px 16px 14px;
      display: flex; align-items: center; gap: 11px;
    }
    .msc-avatar { width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0; overflow: hidden; }
    .msc-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .msc-title { flex: 1; min-width: 0; }
    .msc-title strong { font-size: 14.5px; font-weight: 700; display: block; }
    .msc-subtitle { font-size: 10.5px; color: #A8B4C8; margin-top: 1px; }
    .msc-close {
      background: none; border: none; color: #ffffffaa; width: 24px; height: 24px;
      border-radius: 50%; font-size: 16px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
    }
    .msc-close:hover { background: rgba(255,255,255,.1); }

    .msc-lang-screen {
      flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 14px; padding: 28px 24px; text-align: center;
    }
    .msc-lang-screen p { font-size: 13px; color: #666; line-height: 1.5; }
    .msc-lang-btn {
      width: 100%; padding: 11px 14px; border-radius: 8px; border: 1px solid #E0E0E0;
      background: #fff; color: #0B1F3A; font-family: 'Inter', sans-serif; font-weight: 600;
      font-size: 13.5px; cursor: pointer; transition: all .15s ease;
    }
    .msc-lang-btn:hover { border-color: #C9A14A; background: #FAF7F0; }

    .msc-body { flex: 1; overflow-y: auto; padding: 14px; display: none; flex-direction: column; gap: 2px; background: #F7F8FA; }
    .msc-body.msc-open { display: flex; }
    .msc-row { display: flex; flex-direction: column; margin-bottom: 10px; }
    .msc-row.msc-user { align-items: flex-end; }
    .msc-row.msc-bot { align-items: flex-start; }
    .msc-msg { max-width: 82%; padding: 9px 12px; border-radius: 12px; font-size: 13.5px; line-height: 1.5; white-space: pre-wrap; }
    .msc-msg.msc-bot { background: #fff; color: #222; border-bottom-left-radius: 3px; box-shadow: 0 1px 3px rgba(0,0,0,.06); }
    .msc-msg.msc-user { background: #0B1F3A; color: #fff; border-bottom-right-radius: 3px; }
    .msc-link {
      display: inline-block; margin-top: 6px; padding: 5px 12px; border-radius: 14px;
      background: #C9A14A; color: #fff !important; font-size: 12px; font-weight: 700;
      text-decoration: none;
    }
    .msc-link:hover { background: #B08838; }
    .msc-time { font-size: 9.5px; color: #ADB5BD; margin-top: 3px; padding: 0 3px; }
    .msc-row.msc-user .msc-time { text-align: right; }

    .msc-typing { align-self: flex-start; display: flex; gap: 4px; padding: 10px 12px; background: #fff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.06); }
    .msc-typing span { width: 5px; height: 5px; border-radius: 50%; background: #C9A14A; animation: msc-blink 1.3s infinite; }
    .msc-typing span:nth-child(2) { animation-delay: .2s; }
    .msc-typing span:nth-child(3) { animation-delay: .4s; }
    @keyframes msc-blink { 0%, 80%, 100% { opacity: .25; } 40% { opacity: 1; } }

    .msc-input-row { display: none; border-top: 1px solid #EEE; padding: 10px; gap: 8px; background: #fff; }
    .msc-input-row.msc-open { display: flex; }
    .msc-input-row input { flex: 1; border: 1px solid #E0E0E0; border-radius: 20px; padding: 9px 14px; font-size: 13.5px; font-family: 'Inter', sans-serif; outline: none; }
    .msc-input-row input:focus { border-color: #C9A14A; }
    .msc-input-row button { background: #0B1F3A; border: none; color: #fff; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .msc-input-row button svg { width: 15px; height: 15px; }

    .msc-footer { display: none; padding: 6px 12px 9px; background: #fff; border-top: 1px solid #f2f2f2; text-align: center; }
    .msc-footer.msc-open { display: block; }
    .msc-footer .msc-disc { font-size: 9px; color: #BBB; margin-bottom: 4px; }
    .msc-contact-link { font-size: 11px; font-weight: 600; color: #0B1F3A; text-decoration: underline; }
  `;
  document.head.appendChild(style);

  // ---------- 2. HTML ----------
  const checkBadge = `<svg viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#0B1F3A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
    <div class="msc-tooltip" id="mscTooltip">Need help? Chat with us 💬</div>
    <button class="msc-bubble" id="mscBubble">
      <img src="${AVATAR_URL}" alt="Chat" onerror="this.style.display='none'">
      <div class="msc-badge">${checkBadge}</div>
    </button>

    <div class="msc-window" id="mscWindow">
      <div class="msc-header">
        <div class="msc-avatar"><img src="${AVATAR_URL}" alt="" onerror="this.style.display='none'"></div>
        <div class="msc-title">
          <strong>${BOT_NAME}</strong>
          <div class="msc-subtitle">${BOT_SUBTITLE}</div>
        </div>
        <button class="msc-close" id="mscClose">&times;</button>
      </div>

      <div class="msc-lang-screen" id="mscLangScreen">
        <p>Which language would you like to chat in?<br>Nan ki lang ou vle chat la?</p>
        <button class="msc-lang-btn" data-lang="en">🇺🇸 English</button>
        <button class="msc-lang-btn" data-lang="ht">🇭🇹 Kreyòl Ayisyen</button>
      </div>

      <div class="msc-body" id="mscBody"></div>
      <div class="msc-input-row" id="mscInputRow">
        <input type="text" id="mscInput" placeholder="Type your message...">
        <button id="mscSend">
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
      <div class="msc-footer" id="mscFooter">
        <div class="msc-disc" id="mscDisc"></div>
        <a href="${CONTACT_PHONE_LINK}" class="msc-contact-link" id="mscContactLink">Contact Miguelson directly</a>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper);

  // ---------- 3. LOGIC ----------
  let lang = "en";
  let history = [];

  const bubble = document.getElementById("mscBubble");
  const win = document.getElementById("mscWindow");
  const closeBtn = document.getElementById("mscClose");
  const langScreen = document.getElementById("mscLangScreen");
  const body = document.getElementById("mscBody");
  const inputRow = document.getElementById("mscInputRow");
  const input = document.getElementById("mscInput");
  const sendBtn = document.getElementById("mscSend");
  const footer = document.getElementById("mscFooter");
  const disc = document.getElementById("mscDisc");

  const TEXT = {
    en: {
      greeting: "Hi there! I'm here to help with Insurance, Tax Prep, Business Filing, Immigration Forms, or Infinite Banking (IBC) — anytime, day or night. What can I help with?",
      disclaimer: "Educational information only — not personalized advice.",
      contact: "Contact Miguelson directly",
      error: "Sorry, I'm having trouble right now. Please contact Miguelson directly at info@meshieldfinancial.com or (407) 267-2652."
    },
    ht: {
      greeting: "Bonjou! Mwen la pou ede w ak Asirans, Preparasyon Taks, Anrejistreman Biznis, Fòm Imigrasyon, oswa Infinite Banking (IBC) — nenpòt lè. Kijan mwen ka ede w?",
      disclaimer: "Enfòmasyon edikasyonèl sèlman — se pa konsèy pèsonalize.",
      contact: "Kontakte Miguelson dirèkteman",
      error: "Padon, mwen gen yon pwoblèm kounye a. Tanpri kontakte Miguelson dirèkteman nan info@meshieldfinancial.com oswa (407) 267-2652."
    }
  };

  bubble.addEventListener("click", () => {
    win.classList.toggle("msc-open");
    if (win.classList.contains("msc-open")) {
      // Count this open — fire and forget, never blocks or breaks the chat.
      fetch("/api/track-chat-open", { method: "POST" }).catch(() => {});
    }
  });
  closeBtn.addEventListener("click", () => win.classList.remove("msc-open"));

  // ---------- Gentle one-time tooltip ----------
  // Shows once, a few seconds after the page loads, so new visitors notice
  // the chat exists — then fades away and never shows again for that visitor.
  const tooltip = document.getElementById("mscTooltip");
  if (tooltip && !sessionStorage.getItem("msc-tooltip-shown")) {
    setTimeout(() => {
      tooltip.classList.add("msc-show");
      sessionStorage.setItem("msc-tooltip-shown", "1");
    }, 3000);
    setTimeout(() => tooltip.classList.remove("msc-show"), 9000); // fades on its own
  }
  if (tooltip) {
    tooltip.addEventListener("click", () => {
      tooltip.classList.remove("msc-show");
      win.classList.add("msc-open");
    });
  }

  document.querySelectorAll(".msc-lang-btn").forEach(btn => {
    btn.addEventListener("click", () => pickLang(btn.dataset.lang));
  });

  function pickLang(l) {
    lang = l;
    langScreen.style.display = "none";
    body.classList.add("msc-open");
    inputRow.classList.add("msc-open");
    footer.classList.add("msc-open");
    disc.textContent = TEXT[lang].disclaimer;
    document.getElementById("mscContactLink").textContent = TEXT[lang].contact;
    addMessage(TEXT[lang].greeting, "bot");
    history.push({ role: "assistant", content: TEXT[lang].greeting });
  }

  function timeNow() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // Turns any "https://..." link in the AI's reply into a clickable,
  // readable button instead of showing the raw URL as plain text.
  function linkify(text) {
    const escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return escaped.replace(
      /(https?:\/\/[^\s]+)/g,
      (url) => {
        const clean = url.replace(/[.,)]+$/, ""); // trim trailing punctuation
        const label = "Learn more →";
        return `<a href="${clean}" target="_blank" rel="noopener" class="msc-link">${label}</a>`;
      }
    );
  }

  function addMessage(text, type) {
    const row = document.createElement("div");
    row.className = "msc-row msc-" + type;
    const msg = document.createElement("div");
    msg.className = "msc-msg msc-" + type;
    if (type === "bot") {
      msg.innerHTML = linkify(text); // bot replies may contain links
    } else {
      msg.textContent = text; // visitor's own message, shown as-is
    }
    const time = document.createElement("div");
    time.className = "msc-time";
    time.textContent = timeNow();
    row.appendChild(msg);
    row.appendChild(time);
    body.appendChild(row);
    body.scrollTop = body.scrollHeight;
  }

  function showTyping() {
    const el = document.createElement("div");
    el.className = "msc-typing";
    el.id = "mscTyping";
    el.innerHTML = "<span></span><span></span><span></span>";
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  }
  function hideTyping() {
    const el = document.getElementById("mscTyping");
    if (el) el.remove();
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    addMessage(text, "user");
    history.push({ role: "user", content: text });
    showTyping();

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, language: lang })
      });
      const data = await res.json();
      hideTyping();
      addMessage(data.reply, "bot");
      history.push({ role: "assistant", content: data.reply });
    } catch (err) {
      hideTyping();
      addMessage(TEXT[lang].error, "bot");
    }
  }

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keypress", e => { if (e.key === "Enter") sendMessage(); });

  document.getElementById("mscContactLink").addEventListener("click", function (e) {
    if (typeof window.BrevoConversations === "function") {
      e.preventDefault();
      window.BrevoConversations("openChat", true);
    }
  });
})();
