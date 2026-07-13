// chatbot-widget.js
//
// This file draws the chat bubble and chat window on your website, and talks
// to the "brain" file (functions/api/chatbot.js) you already deployed.
//
// HOW IT WORKS, IN PLAIN ENGLISH:
// 1. When this file loads, it builds the bubble + chat window and adds them
//    to the bottom of every page (like a sticker on top of your site).
// 2. When a visitor picks a language and types a message, it sends the
//    conversation so far to /api/chatbot (your brain file).
// 3. It shows the AI's reply in the chat window.
// 4. If anything fails, it shows your contact info instead of breaking.

(function () {
  "use strict";

  // ---------- 1. STYLES ----------
  // All class names start with "msc-" (ME Shield Chat) so they never clash
  // with any other CSS already on your site.
  const style = document.createElement("style");
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');

    .msc-bubble {
      position: fixed; bottom: 24px; left: 24px; width: 62px; height: 62px;
      border-radius: 50%;
      background: linear-gradient(155deg, #1C3A63 0%, #071426 100%);
      box-shadow: 0 8px 24px rgba(11,31,58,0.45), 0 0 0 3px rgba(201,161,74,0.25);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; border: none; z-index: 999999;
      transition: transform 0.25s cubic-bezier(.34,1.56,.64,1);
    }
    .msc-bubble:hover { transform: scale(1.07) rotate(-2deg); }
    .msc-bubble svg { width: 26px; height: 26px; }
    .msc-ring {
      position: absolute; inset: -3px; border-radius: 50%;
      border: 1.5px solid #C9A14A; animation: msc-ringpulse 2.6s infinite;
    }
    @keyframes msc-ringpulse { 0% { transform: scale(1); opacity: .6; } 100% { transform: scale(1.5); opacity: 0; } }

    .msc-window {
      position: fixed; bottom: 100px; left: 24px; width: 330px;
      max-width: calc(100vw - 48px); height: 500px; max-height: 72vh;
      background: #fff; border-radius: 18px;
      box-shadow: 0 20px 60px rgba(7,20,38,0.35), 0 0 0 1px rgba(201,161,74,0.15);
      display: none; flex-direction: column; overflow: hidden; z-index: 999998;
      opacity: 0; transform: translateY(16px) scale(0.97);
      transition: opacity .28s ease, transform .28s cubic-bezier(.2,.9,.3,1.2);
      font-family: 'Inter', sans-serif;
    }
    .msc-window.msc-open { display: flex; opacity: 1; transform: translateY(0) scale(1); }

    .msc-header {
      background: linear-gradient(135deg, #0B1F3A 0%, #071426 100%);
      color: #fff; padding: 18px 18px 16px; position: relative; overflow: hidden;
    }
    .msc-header::after {
      content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
      background: linear-gradient(90deg, transparent, #C9A14A 30%, #DDBE79 50%, #C9A14A 70%, transparent);
    }
    .msc-header-top { display: flex; align-items: center; gap: 11px; }
    .msc-avatar {
      width: 40px; height: 40px; border-radius: 50%; background: #F3E6C8;
      border: 1.5px solid #C9A14A; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .msc-avatar svg { width: 20px; height: 20px; }
    .msc-title { flex: 1; min-width: 0; }
    .msc-title strong { font-family: 'Playfair Display', serif; font-size: 15.5px; display: block; }
    .msc-subtitle { font-size: 10.5px; color: #DDBE79; letter-spacing: .6px; text-transform: uppercase; font-weight: 600; }
    .msc-status { font-size: 10.5px; color: #B9C4D6; display: flex; align-items: center; gap: 5px; margin-top: 5px; }
    .msc-status-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ADE80; box-shadow: 0 0 0 2px rgba(74,222,128,.25); }
    .msc-close {
      position: absolute; top: 14px; right: 14px; background: rgba(255,255,255,.08);
      border: none; color: #ffffffcc; width: 26px; height: 26px; border-radius: 50%;
      font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center;
    }
    .msc-close:hover { background: rgba(255,255,255,.16); }

    .msc-lang-screen {
      flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 16px; padding: 30px 26px; text-align: center;
      background: linear-gradient(180deg, #FAF8F4 0%, #fff 100%);
    }
    .msc-lang-screen p { font-size: 13px; color: #6B7280; line-height: 1.6; font-weight: 500; }
    .msc-lang-btn {
      width: 100%; padding: 13px 16px; border-radius: 11px; border: 1.5px solid #E4E7EE;
      background: #fff; color: #0B1F3A; font-family: 'Inter', sans-serif; font-weight: 600;
      font-size: 13.5px; cursor: pointer; transition: all .18s ease;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .msc-lang-btn:hover { border-color: #C9A14A; background: #F3E6C8; transform: translateY(-1px); }

    .msc-body { flex: 1; overflow-y: auto; padding: 16px 14px; display: none; flex-direction: column; gap: 3px; background: #FAF8F4; }
    .msc-body.msc-open { display: flex; }
    .msc-row { display: flex; flex-direction: column; margin-bottom: 10px; animation: msc-in .28s ease; }
    @keyframes msc-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    .msc-row.msc-user { align-items: flex-end; }
    .msc-row.msc-bot { align-items: flex-start; }
    .msc-msg { max-width: 82%; padding: 10px 13px; border-radius: 13px; font-size: 13.5px; line-height: 1.5; white-space: pre-wrap; }
    .msc-msg.msc-bot { background: #fff; color: #1A1D24; border-bottom-left-radius: 4px; box-shadow: 0 2px 6px rgba(11,31,58,.07); border: 1px solid #EFEEE8; }
    .msc-msg.msc-user { background: linear-gradient(135deg, #0B1F3A 0%, #1C3A63 100%); color: #fff; border-bottom-right-radius: 4px; }
    .msc-time { font-size: 10px; color: #A6ACB8; margin-top: 3px; padding: 0 3px; }
    .msc-row.msc-user .msc-time { text-align: right; }

    .msc-typing { align-self: flex-start; display: flex; gap: 4px; padding: 12px 14px; background: #fff; border-radius: 13px; border: 1px solid #EFEEE8; box-shadow: 0 2px 6px rgba(11,31,58,.07); }
    .msc-typing span { width: 6px; height: 6px; border-radius: 50%; background: #C9A14A; animation: msc-blink 1.3s infinite; }
    .msc-typing span:nth-child(2) { animation-delay: .2s; }
    .msc-typing span:nth-child(3) { animation-delay: .4s; }
    @keyframes msc-blink { 0%, 80%, 100% { opacity: .25; } 40% { opacity: 1; } }

    .msc-input-row { display: none; border-top: 1px solid #EEECE6; padding: 12px; gap: 9px; background: #fff; }
    .msc-input-row.msc-open { display: flex; }
    .msc-input-row input { flex: 1; border: 1.5px solid #E4E7EE; border-radius: 22px; padding: 10px 16px; font-size: 13.5px; font-family: 'Inter', sans-serif; outline: none; }
    .msc-input-row input:focus { border-color: #C9A14A; }
    .msc-input-row button { background: linear-gradient(135deg, #0B1F3A 0%, #1C3A63 100%); border: none; color: #fff; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .msc-input-row button svg { width: 16px; height: 16px; }

    .msc-footer {
      display: none; padding: 7px 12px 10px; background: #fff; border-top: 1px solid #f4f3ef;
      text-align: center;
    }
    .msc-footer.msc-open { display: block; }
    .msc-footer .msc-disc { font-size: 9.5px; color: #B0B5BE; margin-bottom: 5px; }
    .msc-contact-link { font-size: 11.5px; font-weight: 700; color: #0B1F3A; text-decoration: none; border-bottom: 1.5px solid #C9A14A; padding-bottom: 1px; }
  `;
  document.head.appendChild(style);

  // ---------- 2. HTML ----------
  const shieldIcon = `<svg viewBox="0 0 24 24" fill="none"><path d="M12 2L4 5v6c0 5.2 3.4 9.9 8 11 4.6-1.1 8-5.8 8-11V5l-8-3z" fill="#0B1F3A"/><path d="M9.5 12l1.8 1.8L15 10" stroke="#C9A14A" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const shieldIconGold = `<svg viewBox="0 0 24 24" fill="none"><path d="M12 2L4 5v6c0 5.2 3.4 9.9 8 11 4.6-1.1 8-5.8 8-11V5l-8-3z" fill="#C9A14A" stroke="#E4C77D" stroke-width="0.5"/><path d="M9.5 12l1.8 1.8L15 10" stroke="#0B1F3A" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
    <button class="msc-bubble" id="mscBubble">
      <div class="msc-ring"></div>
      ${shieldIconGold}
    </button>

    <div class="msc-window" id="mscWindow">
      <div class="msc-header">
        <div class="msc-header-top">
          <div class="msc-avatar">${shieldIcon}</div>
          <div class="msc-title">
            <strong>ME Shield Assistant</strong>
            <div class="msc-subtitle">Insurance · Tax · IBC · Immigration</div>
            <div class="msc-status"><span class="msc-status-dot"></span> Online now</div>
          </div>
        </div>
        <button class="msc-close" id="mscClose">&times;</button>
      </div>

      <div class="msc-lang-screen" id="mscLangScreen">
        <p>Which language would you like to chat in?<br>Nan ki lang ou vle chat la?</p>
        <button class="msc-lang-btn" data-lang="en">🇺🇸&nbsp; English</button>
        <button class="msc-lang-btn" data-lang="ht">🇭🇹&nbsp; Kreyòl Ayisyen</button>
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
        <a href="tel:+14072672652" class="msc-contact-link" id="mscContactLink">Contact Miguelson directly</a>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper);

  // ---------- 3. LOGIC ----------
  let lang = "en";
  let history = []; // keeps the conversation so the AI remembers what was said

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
      greeting: "Hi, welcome to ME Shield! I can answer questions about Insurance, Tax Prep, Business Filing, Immigration Forms, or Infinite Banking (IBC). What can I help with?",
      disclaimer: "Educational information only — not personalized advice.",
      contact: "Contact Miguelson directly",
      error: "Sorry, I'm having trouble right now. Please contact Miguelson directly at meshieldservices@gmail.com or (407) 267-2652."
    },
    ht: {
      greeting: "Bonjou, byenveni nan ME Shield! Mwen ka reponn kesyon sou Asirans, Preparasyon Taks, Anrejistreman Biznis, Fòm Imigrasyon, oswa Infinite Banking (IBC). Kijan mwen ka ede w?",
      disclaimer: "Enfòmasyon edikasyonèl sèlman — se pa konsèy pèsonalize.",
      contact: "Kontakte Miguelson dirèkteman",
      error: "Padon, mwen gen yon pwoblèm kounye a. Tanpri kontakte Miguelson dirèkteman nan meshieldservices@gmail.com oswa (407) 267-2652."
    }
  };

  bubble.addEventListener("click", () => win.classList.toggle("msc-open"));
  closeBtn.addEventListener("click", () => win.classList.remove("msc-open"));

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

  function addMessage(text, type) {
    const row = document.createElement("div");
    row.className = "msc-row msc-" + type;
    const msg = document.createElement("div");
    msg.className = "msc-msg msc-" + type;
    msg.textContent = text;
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

  // "Contact Miguelson directly" button:
  // If Brevo live chat is loaded on this page, open it directly.
  // Otherwise, fall back to calling the phone number (the link's default href).
  document.getElementById("mscContactLink").addEventListener("click", function (e) {
    if (typeof window.BrevoConversations === "function") {
      e.preventDefault();
      window.BrevoConversations("openChat", true);
    }
    // else: do nothing special — the tel: link opens the phone dialer as normal
  });
})();
