/* ME Shield — Floating Chat Widget
   Add to any page with: <script src="chat-widget.js"></script>
   Place just before </body> */

(function(){
  // ── Styles ──────────────────────────────────────────────────────────────
  const css = `
#me-chat-wrap{position:fixed;bottom:24px;right:20px;z-index:9999;display:flex;flex-direction:column;align-items:flex-end;gap:10px;font-family:'Inter',system-ui,sans-serif;}

/* Action buttons */
.me-chat-actions{display:flex;flex-direction:column;gap:8px;align-items:flex-end;opacity:0;transform:translateY(12px) scale(.96);pointer-events:none;transition:all .28s cubic-bezier(.4,0,.2,1);}
.me-chat-actions.open{opacity:1;transform:none;pointer-events:all;}

.me-chat-btn{display:flex;align-items:center;gap:10px;padding:11px 18px 11px 14px;border-radius:50px;text-decoration:none;font-size:.82rem;font-weight:700;letter-spacing:.02em;box-shadow:0 4px 20px rgba(0,0,0,.18);transition:transform .18s,box-shadow .18s;white-space:nowrap;}
.me-chat-btn:hover{transform:translateX(-3px);box-shadow:0 6px 28px rgba(0,0,0,.24);}
.me-chat-btn svg{width:18px;height:18px;flex-shrink:0;}

.me-chat-btn-call{background:#0B1D3A;color:#C9A84C;}
.me-chat-btn-wa{background:#25D366;color:#fff;}
.me-chat-btn-email{background:#fff;color:#0B1D3A;border:2px solid rgba(11,29,58,.12);}

/* Main toggle button */
.me-chat-toggle{display:flex;align-items:center;gap:9px;background:#C9A84C;color:#0B1D3A;border:none;cursor:pointer;padding:13px 20px 13px 16px;border-radius:50px;font-size:.82rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase;box-shadow:0 6px 28px rgba(201,168,76,.45);transition:all .22s;font-family:inherit;}
.me-chat-toggle:hover{background:#e0be6a;transform:translateY(-2px);box-shadow:0 8px 36px rgba(201,168,76,.5);}
.me-chat-toggle svg{width:18px;height:18px;flex-shrink:0;transition:transform .28s;}
.me-chat-toggle.open svg.icon-chat{display:none;}
.me-chat-toggle.open svg.icon-close{display:block!important;}
.me-chat-toggle.open{background:#0B1D3A;color:#C9A84C;box-shadow:0 6px 28px rgba(11,29,58,.35);}

/* Pulse ring */
.me-chat-pulse{position:absolute;width:100%;height:100%;border-radius:50px;background:#C9A84C;opacity:.35;animation:chatPulse 2.5s infinite;pointer-events:none;}
@keyframes chatPulse{0%{transform:scale(1);opacity:.35;}70%{transform:scale(1.18);opacity:0;}100%{transform:scale(1.18);opacity:0;}}
`;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ── HTML ────────────────────────────────────────────────────────────────
  const wrap = document.createElement('div');
  wrap.id = 'me-chat-wrap';
  wrap.innerHTML = `
    <div class="me-chat-actions" id="me-chat-actions">
      <a href="tel:+14072672652" class="me-chat-btn me-chat-btn-call">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>
        Call Us
      </a>
      <a href="https://wa.me/message/JUQP57VLU3T2B1" target="_blank" rel="noopener" class="me-chat-btn me-chat-btn-wa">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.113.554 4.099 1.523 5.824L.057 23.05c-.073.31.213.596.522.522l5.228-1.466A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.374l-.36-.214-3.7 1.037 1.037-3.697-.234-.372A9.818 9.818 0 1112 21.818z"/></svg>
        WhatsApp
      </a>
      <a href="mailto:info@meshieldfinancial.com" class="me-chat-btn me-chat-btn-email">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
        Email Us
      </a>
    </div>

    <div style="position:relative;display:inline-flex;">
      <div class="me-chat-pulse"></div>
      <button class="me-chat-toggle" id="me-chat-toggle" aria-label="Chat with us">
        <svg class="icon-chat" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
        <svg class="icon-close" viewBox="0 0 24 24" fill="currentColor" style="display:none;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        Chat with us
      </button>
    </div>`;

  document.body.appendChild(wrap);

  // ── Toggle logic ─────────────────────────────────────────────────────────
  const toggle = document.getElementById('me-chat-toggle');
  const actions = document.getElementById('me-chat-actions');
  const pulse = wrap.querySelector('.me-chat-pulse');

  toggle.addEventListener('click', function(){
    const isOpen = actions.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    pulse.style.animationPlayState = isOpen ? 'paused' : 'running';
    toggle.querySelector('.me-chat-toggle').textContent = isOpen ? '' : '';
  });

  // Close when clicking outside
  document.addEventListener('click', function(e){
    if(!wrap.contains(e.target)){
      actions.classList.remove('open');
      toggle.classList.remove('open');
      pulse.style.animationPlayState = 'running';
    }
  });
})();
