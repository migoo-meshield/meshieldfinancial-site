// chatbot-widget.js
//
// This file draws the chat bubble and chat window on your website, and talks
// to the "brain" file (functions/api/chatbot.js).
//
// HOW IT WORKS, IN PLAIN ENGLISH:
// 1. When this file loads, it builds the bubble + chat window and adds them
//    to the bottom of every page.
// 2. When a visitor picks a language and types a message, it sends the
//    conversation so far to /api/chatbot (your brain file).
// 3. It shows the AI's reply in the chat window.
// 4. If anything fails, it shows your contact info instead of breaking.

(function () {
  "use strict";

  // ---------- 1. STYLES ----------
  const style = document.createElement("style");
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');

    .msc-bubble {
      position: fixed; bottom: 24px; right: 20px; width: 66px; height: 66px;
      border-radius: 50%;
      background: linear-gradient(155deg, #D4AF5F 0%, #C9A14A 60%, #B08838 100%);
      box-shadow: 0 8px 26px rgba(201,161,74,0.5), 0 0 0 4px rgba(255,255,255,0.9);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; border: none; z-index: 999999; padding: 0; overflow: hidden;
      transition: transform 0.25s cubic-bezier(.34,1.56,.64,1);
    }
    .msc-bubble:hover { transform: scale(1.07); }
    .msc-bubble img {
      width: 100%; height: 100%; object-fit: cover; border-radius: 50%;
    }
    .msc-bubble .msc-badge {
      position: absolute; bottom: -2px; right: -2px; width: 22px; height: 22px;
      background: #0B1F3A; border: 2.5px solid #fff; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
    }
    .msc-bubble .msc-badge svg { width: 11px; height: 11px; }
    .msc-ring {
      position: absolute; inset: -4px; border-radius: 50%;
      border: 1.5px solid #C9A14A; animation: msc-ringpulse 2.6s infinite;
    }
    @keyframes msc-ringpulse { 0% { transform: scale(1); opacity: .6; } 100% { transform: scale(1.45); opacity: 0; } }

    .msc-window {
      position: fixed; bottom: 100px; right: 20px; width: 336px;
      max-width: calc(100vw - 40px); height: 508px; max-height: 74vh;
      background: #fff; border-radius: 22px;
      box-shadow: 0 24px 64px rgba(11,31,58,0.32), 0 0 0 1px rgba(201,161,74,0.12);
      display: none; flex-direction: column; overflow: hidden; z-index: 999998;
      opacity: 0; transform: translateY(20px) scale(0.96);
      transition: opacity .3s ease, transform .3s cubic-bezier(.2,.9,.3,1.2);
      font-family: 'Inter', sans-serif;
    }
    .msc-window.msc-open { display: flex; opacity: 1; transform: translateY(0) scale(1); }

    .msc-header {
      background: linear-gradient(135deg, #0B1F3A 0%, #16305A 100%);
      color: #fff; padding: 22px 20px 18px; position: relative; overflow: hidden;
    }
    .msc-header::before {
      content: ''; position: absolute; top: -30px; right: -30px; width: 140px; height: 140px;
      background: radial-gradient(circle, rgba(201,161,74,0.18) 0%, transparent 70%);
    }
    .msc-header::after {
      content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
      background: linear-gradient(90deg, transparent, #C9A14A 30%, #DDBE79 50%, #C9A14A 70%, transparent);
    }
    .msc-header-top { display: flex; align-items: center; gap: 13px; position: relative; }
    .msc-avatar {
      width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0;
      border: 2px solid #C9A14A; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.25);
    }
    .msc-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .msc-title { flex: 1; min-width: 0; }
    .msc-title strong { font-family: 'Playfair Display', serif; font-size: 16.5px; display: block; }
    .msc-subtitle { font-size: 11px; color: #DDBE79; margin-top: 1px; }
    .msc-status { font-size: 10.5px; color: #B9C4D6; display: flex; align-items: center; gap: 5px; margin-top: 6px; }
    .msc-status-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ADE80; box-shadow: 0 0 0 2px rgba(74,222,128,.25); }
    .msc-close {
      position: absolute; top: 20px; right: 18px; background: rgba(255,255,255,.1);
      border: none; color: #ffffffcc; width: 28px; height: 28px; border-radius: 50%;
      font-size: 17px; cursor: pointer; display: flex; align-items: center; justify-content: center;
    }
    .msc-close:hover { background: rgba(255,255,255,.18); }

    .msc-lang-screen {
      flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 18px; padding: 32px 28px; text-align: center;
      background: linear-gradient(180deg, #FFFBF2 0%, #fff 100%);
    }
    .msc-lang-avatar {
      width: 72px; height: 72px; border-radius: 50%; border: 3px solid #C9A14A;
      overflow: hidden; box-shadow: 0 8px 22px rgba(201,161,74,0.3);
    }
    .msc-lang-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .msc-lang-screen p { font-size: 13.5px; color: #6B7280; line-height: 1.6; font-weight: 500; }
    .msc-lang-btn {
      width: 100%; padding: 14px 16px; border-radius: 13px; border: 1.5px solid #EDE3CC;
      background: #fff; color: #0B1F3A; font-family: 'Inter', sans-serif; font-weight: 600;
      font-size: 14px; cursor: pointer; transition: all .18s ease;
      display: flex; align-items: center; justify-content: center; gap: 9px;
    }
    .msc-lang-btn:hover { border-color: #C9A14A; background: #FFF8E8; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(201,161,74,0.2); }

    .msc-body { flex: 1; overflow-y: auto; padding: 18px 15px; display: none; flex-direction: column; gap: 3px; background: #FFFBF2; }
    .msc-body.msc-open { display: flex; }
    .msc-row { display: flex; flex-direction: column; margin-bottom: 12px; animation: msc-in .3s ease; }
    @keyframes msc-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .msc-row.msc-user { align-items: flex-end; }
    .msc-row.msc-bot { align-items: flex-start; }
    .msc-msg { max-width: 82%; padding: 11px 14px; border-radius: 15px; font-size: 13.5px; line-height: 1.55; white-space: pre-wrap; }
    .msc-msg.msc-bot { background: #fff; color: #1A1D24; border-bottom-left-radius: 4px; box-shadow: 0 2px 8px rgba(11,31,58,.08); border: 1px solid #F2EBD8; }
    .msc-msg.msc-user { background: linear-gradient(135deg, #C9A14A 0%, #B08838 100%); color: #fff; border-bottom-right-radius: 4px; }
    .msc-time { font-size: 10px; color: #B0A88E; margin-top: 4px; padding: 0 4px; }
    .msc-row.msc-user .msc-time { text-align: right; }

    .msc-typing { align-self: flex-start; display: flex; gap: 4px; padding: 13px 15px; background: #fff; border-radius: 15px; border: 1px solid #F2EBD8; box-shadow: 0 2px 8px rgba(11,31,58,.08); }
    .msc-typing span { width: 6px; height: 6px; border-radius: 50%; background: #C9A14A; animation: msc-blink 1.3s infinite; }
    .msc-typing span:nth-child(2) { animation-delay: .2s; }
    .msc-typing span:nth-child(3) { animation-delay: .4s; }
    @keyframes msc-blink { 0%, 80%, 100% { opacity: .25; } 40% { opacity: 1; } }

    .msc-input-row { display: none; border-top: 1px solid #F2EBD8; padding: 13px; gap: 10px; background: #fff; }
    .msc-input-row.msc-open { display: flex; }
    .msc-input-row input { flex: 1; border: 1.5px solid #EDE3CC; border-radius: 24px; padding: 11px 17px; font-size: 13.5px; font-family: 'Inter', sans-serif; outline: none; }
    .msc-input-row input:focus { border-color: #C9A14A; }
    .msc-input-row button { background: linear-gradient(135deg, #C9A14A 0%, #B08838 100%); border: none; color: #fff; width: 42px; height: 42px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(201,161,74,0.35); }
    .msc-input-row button svg { width: 17px; height: 17px; }

    .msc-footer { display: none; padding: 8px 14px 11px; background: #fff; border-top: 1px solid #f7f2e4; text-align: center; }
    .msc-footer.msc-open { display: block; }
    .msc-footer .msc-disc { font-size: 9.5px; color: #B8B0A0; margin-bottom: 6px; }
    .msc-contact-link { font-size: 12px; font-weight: 700; color: #0B1F3A; text-decoration: none; border-bottom: 1.5px solid #C9A14A; padding-bottom: 1px; }
  `;
  document.head.appendChild(style);

  // ---------- 2. HTML ----------
  const checkBadge = `<svg viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#C9A14A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  // Uses your real headshot — same file already on your site (brand rule: real photos only).
  const HEADSHOT = "/miguelson-headshot.jpeg";

  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
    <button class="msc-bubble" id="mscBubble">
      <div class="msc-ring"></div>
      <img src="${HEADSHOT}" alt="Miguelson Etienne" onerror="this.style.display='none'">
      <div class="msc-badge">${checkBadge}</div>
    </button>

    <div class="msc-window" id="mscWindow">
      <div class="msc-header">
        <div class="msc-header-top">
          <div class="msc-avatar"><img src="${HEADSHOT}" alt="Miguelson Etienne" onerror="this.style.display='none'"></div>
          <div class="msc-title">
            <strong>Ask ME Shield</strong>
            <div class="msc-subtitle">Insurance · Tax · IBC · Immigration</div>
            <div class="msc-status"><span class="msc-status-dot"></span> Here to help, anytime</div>
          </div>
        </div>
        <button class="msc-close" id="mscClose">&times;</button>
      </div>

      <div class="msc-lang-screen" id="mscLangScreen">
        <div class="msc-lang-avatar"><img src="${HEADSHOT}" alt="Miguelson Etienne" onerror="this.style.display='none'"></div>
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
      greeting: "Hi there! 👋 I'm here to help with Insurance, Tax Prep, Business Filing, Immigration Forms, or Infinite Banking (IBC) — whenever you need, day or night. What can I help with?",
      disclaimer: "Educational information only — not personalized advice.",
      contact: "Contact Miguelson directly",
      error: "Sorry, I'm having trouble right now. Please contact Miguelson directly at meshieldservices@gmail.com or (407) 267-2652."
    },
    ht: {
      greeting: "Bonjou! 👋 Mwen la pou ede w ak Asirans, Preparasyon Taks, Anrejistreman Biznis, Fòm Imigrasyon, oswa Infinite Banking (IBC) — nenpòt lè, lajounen kou lannwit. Kijan mwen ka ede w?",
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

  document.getElementById("mscContactLink").addEventListener("click", function (e) {
    if (typeof window.BrevoConversations === "function") {
      e.preventDefault();
      window.BrevoConversations("openChat", true);
    }
  });
})();
