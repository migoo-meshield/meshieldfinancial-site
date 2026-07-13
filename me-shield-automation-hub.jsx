import { useState } from "react";

const BRAND = {
  navy: "#0a1628",
  accent: "#2e6fd9",
  gold: "#c8a84b",
  card: "#111e35",
  muted: "#8a9bb5",
  border: "rgba(46,111,217,0.2)",
};

const s = {
  root: { background: BRAND.navy, minHeight: "100vh", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#fff", overflowX: "hidden" },
  mesh: { position: "fixed", inset: 0, background: "radial-gradient(ellipse 60% 40% at 80% 10%, rgba(46,111,217,0.13) 0%, transparent 70%), radial-gradient(ellipse 50% 60% at 10% 80%, rgba(200,168,75,0.07) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 },
  header: { position: "relative", zIndex: 10, padding: "22px 32px", display: "flex", alignItems: "center", gap: 14, borderBottom: `1px solid ${BRAND.border}` },
  shield: { width: 40, height: 40, background: `linear-gradient(135deg, ${BRAND.accent}, ${BRAND.gold})`, clipPath: "polygon(50% 0%, 100% 20%, 100% 70%, 50% 100%, 0% 70%, 0% 20%)", flexShrink: 0 },
  brandName: { fontSize: 18, fontWeight: 700, letterSpacing: "0.02em", lineHeight: 1.1 },
  brandSub: { fontSize: 10, color: BRAND.gold, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500 },
  hubLabel: { marginLeft: "auto", fontSize: 10, color: BRAND.muted, letterSpacing: "0.1em", textTransform: "uppercase" },
  main: { position: "relative", zIndex: 5, maxWidth: 860, margin: "0 auto", padding: "32px 20px 60px" },
  h1: { fontSize: 28, fontWeight: 800, lineHeight: 1.2, marginBottom: 6 },
  gold: { color: BRAND.gold },
  subtitle: { color: BRAND.muted, fontSize: 13, marginBottom: 28 },
  tabs: { display: "flex", gap: 4, marginBottom: 24, borderBottom: `1px solid ${BRAND.border}`, overflowX: "auto" },
  tabBtn: (active) => ({ background: "none", border: "none", borderBottom: active ? `2px solid ${BRAND.gold}` : "2px solid transparent", color: active ? BRAND.gold : BRAND.muted, fontFamily: "inherit", fontSize: 12, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", padding: "10px 16px", cursor: "pointer", whiteSpace: "nowrap", position: "relative", bottom: -1 }),
  card: { background: BRAND.card, border: `1px solid ${BRAND.border}`, borderRadius: 12, padding: 22, marginBottom: 16 },
  label: { fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: BRAND.gold, fontWeight: 500, marginBottom: 10, display: "block" },
  row: { display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" },
  select: { background: "rgba(255,255,255,0.05)", border: `1px solid ${BRAND.border}`, borderRadius: 8, color: "#fff", fontFamily: "inherit", fontSize: 13, padding: "9px 12px", outline: "none", flex: 1, minWidth: 140 },
  input: { background: "rgba(255,255,255,0.05)", border: `1px solid ${BRAND.border}`, borderRadius: 8, color: "#fff", fontFamily: "inherit", fontSize: 13, padding: "9px 12px", outline: "none", flex: 1, minWidth: 140, width: "100%" },
  textarea: { background: "rgba(255,255,255,0.05)", border: `1px solid ${BRAND.border}`, borderRadius: 8, color: "#fff", fontFamily: "inherit", fontSize: 13, padding: "9px 12px", outline: "none", width: "100%", minHeight: 72, resize: "vertical" },
  genBtn: (disabled) => ({ background: disabled ? "rgba(46,111,217,0.3)" : `linear-gradient(135deg, ${BRAND.accent}, #1a5cb8)`, color: "#fff", border: "none", borderRadius: 8, fontFamily: "inherit", fontSize: 13, fontWeight: 500, padding: "11px 26px", cursor: disabled ? "not-allowed" : "pointer", marginTop: 4, opacity: disabled ? 0.6 : 1 }),
  outputCard: { background: BRAND.card, border: `1px solid ${BRAND.border}`, borderRadius: 12, padding: 22, minHeight: 110 },
  outputHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  outputLabel: { fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: BRAND.muted },
  copyBtn: { background: "none", border: `1px solid ${BRAND.border}`, borderRadius: 6, color: BRAND.muted, fontSize: 10, fontFamily: "inherit", padding: "4px 12px", cursor: "pointer", letterSpacing: "0.05em", textTransform: "uppercase" },
  outputText: { color: "#d0ddf5", fontSize: 13, lineHeight: 1.75, whiteSpace: "pre-wrap", wordBreak: "break-word" },
  placeholder: { color: BRAND.muted, fontSize: 13, textAlign: "center", padding: "28px 0", fontStyle: "italic" },
  error: { color: "#ff6b6b", fontSize: 13, padding: 12, background: "rgba(255,107,107,0.08)", borderRadius: 8, border: "1px solid rgba(255,107,107,0.2)" },
  quickGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 10, marginBottom: 16 },
  quickCard: (sel) => ({ background: sel ? "rgba(200,168,75,0.09)" : BRAND.card, border: `1px solid ${sel ? BRAND.gold : BRAND.border}`, borderRadius: 10, padding: "16px 14px", cursor: "pointer", textAlign: "left" }),
  quickIcon: { fontSize: 22, marginBottom: 7 },
  quickTitle: { fontSize: 13, fontWeight: 500, marginBottom: 4 },
  quickDesc: { fontSize: 11, color: BRAND.muted, lineHeight: 1.45 },
};

async function callClaude(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": "",
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.content.map((b) => b.text || "").join("");
}

function OutputBox({ text, loading, error, onCopy, copied }) {
  return (
    <div style={s.outputCard}>
      <div style={s.outputHeader}>
        <span style={s.outputLabel}>Generated Output</span>
        {text && <button style={s.copyBtn} onClick={onCopy}>{copied ? "Copied!" : "Copy"}</button>}
      </div>
      {loading ? <div style={s.placeholder}>⏳ Generating…</div>
        : error ? <div style={s.error}>⚠️ {error}</div>
        : text ? <div style={s.outputText}>{text}</div>
        : <div style={s.placeholder}>Your output will appear here…</div>}
    </div>
  );
}

function useGenerator() {
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = async (prompt) => {
    setLoading(true); setOutput(""); setError("");
    try {
      const result = await callClaude(prompt);
      setOutput(result);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return { output, loading, error, copied, generate, copy };
}

function SocialTab() {
  const [platform, setPlatform] = useState("Facebook");
  const [topic, setTopic] = useState("Whole Life Insurance & IBC");
  const [tone, setTone] = useState("educational and trustworthy");
  const [extra, setExtra] = useState("");
  const { output, loading, error, copied, generate, copy } = useGenerator();

  const run = () => generate(
    `You are a social media expert for ME Shield Financial Services, a solo insurance, tax, and paralegal agency in Florida run by Miguelson Etienne. Write a ${platform} post about: ${topic}. Tone: ${tone}. Audience: Florida residents and small business owners, bilingual community. Include a clear call-to-action to contact ME Shield. Use relevant emojis naturally.${extra ? " Extra notes: " + extra : ""} Output only the post text, no commentary.`
  );

  return (
    <div>
      <div style={s.card}>
        <span style={s.label}>Post Settings</span>
        <div style={s.row}>
          <select style={s.select} value={platform} onChange={e => setPlatform(e.target.value)}>
            {["Facebook","Instagram","LinkedIn","Twitter/X"].map(p => <option key={p}>{p}</option>)}
          </select>
          <select style={s.select} value={topic} onChange={e => setTopic(e.target.value)}>
            <option>Whole Life Insurance & IBC</option>
            <option>Term vs Whole Life Insurance</option>
            <option>Tax preparation tips</option>
            <option>Immigration & paralegal services</option>
            <option>Life insurance as retirement strategy</option>
            <option>Health insurance open enrollment</option>
            <option>General financial protection tips</option>
          </select>
          <select style={s.select} value={tone} onChange={e => setTone(e.target.value)}>
            <option value="educational and trustworthy">Educational</option>
            <option value="urgent and action-driving">Urgent / CTA</option>
            <option value="warm and community-focused">Community Warmth</option>
            <option value="professional and authoritative">Professional</option>
          </select>
        </div>
        <div style={{ marginBottom: 12 }}>
          <input style={s.input} placeholder="Any extra angle or detail? (optional)" value={extra} onChange={e => setExtra(e.target.value)} />
        </div>
        <button style={s.genBtn(loading)} onClick={run} disabled={loading}>
          {loading ? "⏳ Generating…" : "📱 Generate Post"}
        </button>
      </div>
      <OutputBox text={output} loading={loading} error={error} onCopy={copy} copied={copied} />
    </div>
  );
}

function EmailTab() {
  const [client, setClient] = useState("");
  const [type, setType] = useState("after a quote was sent");
  const [service, setService] = useState("life insurance");
  const [notes, setNotes] = useState("");
  const { output, loading, error, copied, generate, copy } = useGenerator();

  const run = () => generate(
    `You are writing on behalf of Miguelson Etienne at ME Shield Financial Services (ME Shield Group LLC), a licensed insurance agent and solo financial services agency in Florida. Write a professional yet warm email follow-up. Scenario: ${type}. Service: ${service}. Client first name: ${client || "there"}. Sign off as Miguelson Etienne, ME Shield Financial Services, with a note that they can call or message any time.${notes ? " Additional context: " + notes : ""} Format: Subject line on first line, blank line, then email body. No commentary, just the email.`
  );

  return (
    <div>
      <div style={s.card}>
        <span style={s.label}>Follow-Up Details</span>
        <div style={s.row}>
          <input style={s.input} placeholder="Client first name" value={client} onChange={e => setClient(e.target.value)} />
          <select style={s.select} value={type} onChange={e => setType(e.target.value)}>
            <option value="after a quote was sent">After Quote Sent</option>
            <option value="after an initial consultation">After Consultation</option>
            <option value="a no-response follow-up (2nd attempt)">No Response – 2nd Attempt</option>
            <option value="after a policy was issued">Policy Issued – Welcome</option>
            <option value="tax season reminder">Tax Season Reminder</option>
            <option value="immigration document status check">Immigration Status Check</option>
          </select>
          <select style={s.select} value={service} onChange={e => setService(e.target.value)}>
            <option value="life insurance">Life Insurance</option>
            <option value="health insurance">Health Insurance</option>
            <option value="property & casualty insurance">P&C Insurance</option>
            <option value="tax preparation">Tax Preparation</option>
            <option value="immigration paralegal services">Immigration/Paralegal</option>
          </select>
        </div>
        <div style={{ marginBottom: 12 }}>
          <textarea style={s.textarea} placeholder="Any specific details? (quote amount, next steps, deadline…)" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        <button style={s.genBtn(loading)} onClick={run} disabled={loading}>
          {loading ? "⏳ Generating…" : "✉️ Generate Email"}
        </button>
      </div>
      <OutputBox text={output} loading={loading} error={error} onCopy={copy} copied={copied} />
    </div>
  );
}

const adminTasks = [
  { id: "weekly-summary", icon: "📊", title: "Weekly Summary", desc: "Summarize your week & next steps" },
  { id: "client-checklist", icon: "✅", title: "Onboarding Checklist", desc: "New client setup checklist" },
  { id: "social-calendar", icon: "📅", title: "Weekly Content Plan", desc: "7-day social media schedule" },
  { id: "referral-script", icon: "🤝", title: "Referral Ask Script", desc: "Ask happy clients for referrals" },
];

const adminPrompts = {
  "weekly-summary": (ctx) => `Create a professional weekly business summary template for ME Shield Financial Services. Sections: Clients contacted, Policies/services sold, Follow-ups pending, Tasks completed, Goals for next week. Clean fill-in format with blank lines.${ctx ? " Context: " + ctx : ""} Output only the template.`,
  "client-checklist": (ctx) => `Create a practical client onboarding checklist for ME Shield Financial Services solo agent. Steps for: gathering info, explaining services, collecting documents, setting expectations, scheduling follow-ups.${ctx ? " Context: " + ctx : ""} Output a numbered checklist only.`,
  "social-calendar": (ctx) => `Create a 7-day social media content plan for ME Shield Financial Services. Each day: Day, Platform, Topic, one-line post idea. Mix: life insurance, IBC/Whole Life, tax prep, immigration, motivation, testimonial prompt.${ctx ? " Context: " + ctx : ""} Output plain text calendar only.`,
  "referral-script": (ctx) => `Write a friendly script for Miguelson Etienne of ME Shield Financial Services to ask a happy client for a referral. Conversational, not salesy. Include a short SMS version and a verbal version.${ctx ? " Context: " + ctx : ""} Output only the scripts.`,
};

function AdminTab() {
  const [selected, setSelected] = useState(null);
  const [context, setContext] = useState("");
  const { output, loading, error, copied, generate, copy } = useGenerator();

  const run = () => {
    if (!selected) return;
    generate(adminPrompts[selected](context));
  };

  return (
    <div>
      <div style={s.card}>
        <span style={s.label}>Select Task</span>
        <div style={s.quickGrid}>
          {adminTasks.map(t => (
            <div key={t.id} style={s.quickCard(selected === t.id)} onClick={() => setSelected(t.id)}>
              <div style={s.quickIcon}>{t.icon}</div>
              <div style={s.quickTitle}>{t.title}</div>
              <div style={s.quickDesc}>{t.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 12 }}>
          <textarea style={{ ...s.textarea, minHeight: 56 }} placeholder="Add context or specifics (optional)…" value={context} onChange={e => setContext(e.target.value)} />
        </div>
        <button style={s.genBtn(loading || !selected)} onClick={run} disabled={loading || !selected}>
          {loading ? "⏳ Generating…" : "🗂️ Generate"}
        </button>
        {!selected && <div style={{ color: BRAND.muted, fontSize: 11, marginTop: 8 }}>Select a task card above first</div>}
      </div>
      <OutputBox text={output} loading={loading} error={error} onCopy={copy} copied={copied} />
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("social");
  const tabs = [
    { id: "social", label: "📱 Social Media" },
    { id: "email", label: "✉️ Email Follow-Up" },
    { id: "admin", label: "🗂️ Admin Tasks" },
  ];

  return (
    <div style={s.root}>
      <div style={s.mesh} />
      <header style={s.header}>
        <div style={s.shield} />
        <div>
          <div style={s.brandName}>ME Shield</div>
          <div style={s.brandSub}>Financial Services</div>
        </div>
        <div style={s.hubLabel}>Automation Hub</div>
      </header>
      <div style={s.main}>
        <h1 style={s.h1}>Business <span style={s.gold}>Automation</span> Hub</h1>
        <p style={s.subtitle}>AI-powered tools for social media, email follow-ups, and admin tasks</p>
        <div style={s.tabs}>
          {tabs.map(t => (
            <button key={t.id} style={s.tabBtn(tab === t.id)} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>
        {tab === "social" && <SocialTab />}
        {tab === "email" && <EmailTab />}
        {tab === "admin" && <AdminTab />}
      </div>
    </div>
  );
}
