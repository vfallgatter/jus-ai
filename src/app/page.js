'use client';
import './globals.css';
import { useState, useRef, useEffect } from 'react';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import QuizMode from '@/components/QuizMode';
import ReportMode from '@/components/ReportMode';

export default function Home() {
  const [activeTab, setActiveTab]     = useState('chat');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lightMode, setLightMode]     = useState(false);
  const [quizHistory, setQuizHistory] = useState([]);
  const [wrongTopics, setWrongTopics] = useState([]);

  // ── CHAT STATE ────────────────────────────────────────────────────
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Olá! Sou o **Jus.ai**, seu assistente de Direito. Li os materiais das aulas!\n\nPergunte sobre qualquer tema e peça para eu referenciar o número da aula e o slide sempre que possível. 😊',
    },
  ]);
  const [input, setInput]         = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { id: Date.now().toString(), role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setTimeout(() => inputRef.current?.focus(), 100);

    try {
      const res  = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: data.text || 'Não consegui gerar uma resposta.' },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: '❌ **Erro de conexão:** Verifique o terminal.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ── NAV ITEMS ─────────────────────────────────────────────────────
  const navItems = [
    { id: 'chat',   label: 'Chat',      Icon: ChatIcon },
    { id: 'quiz',   label: 'Questões',  Icon: QuizIcon },
    { id: 'report', label: 'Relatório', Icon: ReportIcon },
  ];

  const subtitle =
    activeTab === 'chat'   ? 'I.A baseada nos PDFs das aulas disponíveis no AVA' :
    activeTab === 'quiz'   ? 'Questões geradas com base nos materiais de aula'    :
                             'Relatório de desempenho personalizado';

  // ── SIDEBAR CONTENT ───────────────────────────────────────────────
  const SidebarContent = ({ onClose }) => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 20 }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 13, fontSize: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'color-mix(in srgb, var(--neon-emerald) 14%, transparent)',
            border: '1px solid color-mix(in srgb, var(--neon-emerald) 30%, transparent)',
          }}>⚖️</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Jus.ai
            </h1>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
              DIREITO 
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'var(--close-btn-bg)', border: '1px solid var(--close-btn-border)',
              borderRadius: 8, color: 'var(--text-secondary)',
              width: 28, height: 28, display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', fontSize: 13,
            }}
          >✕</button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        <p className="section-label">Navegação</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`nav-item${activeTab === id ? ' active' : ''}`}
              onClick={() => { setActiveTab(id); onClose?.(); }}
            >
              <Icon size={16} />
              <span>{label}</span>
              {activeTab === id && (
                <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                  <span className="neon-dot" />
                </span>
              )}
            </button>
          ))}
        </div>

        <hr className="divider" />

        <p className="section-label">Base de Conhecimento</p>
        <div className="knowledge-pill">
          <span>📚</span>
          <span>Materiais disponíveis · PDF</span>
        </div>
      </nav>

      {/* Status footer */}
      <div style={{ borderTop: '1px solid var(--divider)', paddingTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Status do sistema</span>
        <span className="neon-badge">● ONLINE</span>
      </div>
    </div>
  );

  return (
    /* app-root drives ALL CSS variables — dark or light */
    <div className={`app-root${lightMode ? ' light' : ''}`}>

      {/* ── BACKGROUND CANVAS — changes with theme ─────────────────── */}
      <div className={`bg-canvas ${lightMode ? 'bg-canvas-light' : 'bg-canvas-dark'}`} />

      {/* ── DESKTOP SIDEBAR ───────────────────────────────────────── */}
      <aside
        className="glass-sidebar"
        id="desktop-sidebar"
        style={{ width: 240, flexShrink: 0, display: 'none', flexDirection: 'column', position: 'relative', zIndex: 10 }}
      >
        <style>{`@media (min-width: 768px) { #desktop-sidebar { display: flex !important; } }`}</style>
        <SidebarContent />
      </aside>

      {/* ── MOBILE SIDEBAR OVERLAY ────────────────────────────────── */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'absolute', inset: 0,
              background: lightMode ? 'rgba(10,25,41,0.35)' : 'rgba(5,13,26,0.65)',
              backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
            }}
          />
          <aside className="glass-sidebar" style={{ position: 'relative', width: 260, zIndex: 10 }}>
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* ── MAIN ──────────────────────────────────────────────────── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', minWidth: 0, position: 'relative', zIndex: 1 }}>

        {/* HEADER */}
        <header
          className="glass-header"
          style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', flexShrink: 0, gap: 10 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
            {/* Mobile hamburger */}
            <button
              id="hamburger"
              onClick={() => setSidebarOpen(true)}
              style={{
                background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                borderRadius: 9, padding: '6px 8px', cursor: 'pointer',
                color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', flexShrink: 0,
              }}
            >
              <style>{`@media (min-width: 768px) { #hamburger { display: none !important; } }`}</style>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            {/* Mobile logo */}
            <span id="mobile-logo" style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 15, flexShrink: 0 }}>
              <style>{`@media (min-width: 768px) { #mobile-logo { display: none !important; } }`}</style>
              ⚖️ Jus.ai
            </span>

            {/* Desktop subtitle */}
            <span
              id="header-subtitle"
              style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              <style>{`@media (max-width: 767px) { #header-subtitle { display: none !important; } }`}</style>
              {subtitle}
            </span>
          </div>

          {/* Right: theme toggle + badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button
              onClick={() => setLightMode((v) => !v)}
              className={`theme-toggle${lightMode ? ' light-on' : ''}`}
              title={lightMode ? 'Ativar tema escuro' : 'Ativar tema claro'}
              aria-label="Alternar tema"
            >
              {lightMode ? <BulbOnIcon /> : <BulbOffIcon />}
            </button>
            <span className="blue-badge">Gemini 2.5 Flash</span>
          </div>
        </header>

        {/* ── CHAT ────────────────────────────────────────────────── */}
        {activeTab === 'chat' && (
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 16px' }}>
              <div style={{ maxWidth: 720, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="animate-fade-in-up"
                    style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
                  >
                    {/* Role label */}
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase',
                      color: msg.role === 'user' ? 'var(--neon-blue)' : 'var(--neon-emerald)',
                      marginBottom: 5, opacity: 0.9,
                      paddingLeft: msg.role === 'user' ? 0 : 4,
                      paddingRight: msg.role === 'user' ? 4 : 0,
                    }}>
                      {msg.role === 'user' ? 'Você' : '⚖️ Jus.ai'}
                    </span>

                    <div
                      className={msg.role === 'user' ? 'msg-user' : 'msg-assistant'}
                      style={{ maxWidth: '86%', padding: '12px 16px', fontSize: 14, lineHeight: 1.68 }}
                    >
                      {msg.role === 'user'
                        ? <div style={{ whiteSpace: 'pre-line', color: 'var(--msg-user-text)' }}>{msg.content}</div>
                        : <MarkdownRenderer content={msg.content} />
                      }
                    </div>
                  </div>
                ))}

                
                {isLoading && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', color: 'var(--neon-emerald)', textTransform: 'uppercase', paddingLeft: 4, opacity: 0.9 }}>
                      ⚖️ Jus.ai
                    </span>
                    <div className="msg-assistant" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        Consultando os arquivos…
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            
            <footer style={{
              flexShrink: 0, padding: '14px 16px 16px',
              borderTop: '1px solid var(--footer-border)',
              background: 'var(--footer-bg)',
              backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            }}>
              <div style={{ maxWidth: 720, margin: '0 auto' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Pergunte sobre qualquer matéria dos PDFs…"
                    disabled={isLoading}
                    autoComplete="off"
                    autoCorrect="off"
                    className="glass-input"
                    style={{ flex: 1, borderRadius: 14, padding: '12px 16px', fontSize: 14, fontFamily: 'inherit' }}
                  />
                  <button type="submit" disabled={isLoading || !input.trim()} className="send-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="19" x2="12" y2="5" />
                      <polyline points="5 12 12 5 19 12" />
                    </svg>
                  </button>
                </form>
                <p style={{ margin: '8px 0 0', textAlign: 'center', fontSize: 10.5, color: 'var(--text-muted)' }}>
                  Desenvolvido por Vitor Hugo Ittner Fallgatter · Respostas baseadas no material fornecido em aula
                </p>
              </div>
            </footer>
          </>
        )}

        {/* ── QUIZ ────────────────────────────────────────────────── */}
        {activeTab === 'quiz' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <QuizMode previousWrongTopics={wrongTopics} />
          </div>
        )}

        {/* ── REPORT ──────────────────────────────────────────────── */}
        {activeTab === 'report' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <ReportMode quizHistory={quizHistory} />
          </div>
        )}
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SVG ICONS
═══════════════════════════════════════════════════════════════════ */
function ChatIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function QuizIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function ReportIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6"  y1="20" x2="6"  y2="14" />
    </svg>
  );
}

/* Lâmpada apagada */
function BulbOffIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21h6" />
      <path d="M12 3a6 6 0 0 1 6 6c0 2.22-1.21 4.16-3 5.2V17a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1v-2.8C7.21 13.16 6 11.22 6 9a6 6 0 0 1 6-6z" />
    </svg>
  );
}

/* Lâmpada acesa — preenchida + raios */
function BulbOnIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21h6" fill="none" />
      <path d="M12 3a6 6 0 0 1 6 6c0 2.22-1.21 4.16-3 5.2V17a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1v-2.8C7.21 13.16 6 11.22 6 9a6 6 0 0 1 6-6z" />
      <line x1="12" y1="1"    x2="12" y2="2.5"   strokeWidth="2" fill="none" />
      <line x1="4.22" y1="4.22" x2="5.28" y2="5.28" strokeWidth="2" fill="none" />
      <line x1="19.78" y1="4.22" x2="18.72" y2="5.28" strokeWidth="2" fill="none" />
      <line x1="2"  y1="9"    x2="3.5"  y2="9"    strokeWidth="2" fill="none" />
      <line x1="22" y1="9"    x2="20.5" y2="9"    strokeWidth="2" fill="none" />
    </svg>
  );
}