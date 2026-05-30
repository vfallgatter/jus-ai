'use client';
import './globals.css';
import { useState, useRef, useEffect } from 'react';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import QuizMode from '@/components/QuizMode';
import ReportMode from '@/components/ReportMode';

export default function Home() {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'quiz' | 'report'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quizHistory, setQuizHistory] = useState([]);
  const [wrongTopics, setWrongTopics] = useState([]);

  // ── CHAT STATE ────────────────────────────────────────────────────
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Olá! Sou o **Jus.ai**, seu assistente de Direito Civil. Li os materiais das aulas (1–12)!\n\nPergunte sobre qualquer tema e peça para eu referenciar o número da aula e o slide sempre que possível. 😊',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Keep input visible on mobile after submit
    setTimeout(() => inputRef.current?.focus(), 100);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.text || 'Não consegui gerar uma resposta.',
        },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '❌ **Erro de conexão:** Ocorreu um problema ao processar a requisição. Verifique o terminal.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ── NAV ITEMS ─────────────────────────────────────────────────────
  const navItems = [
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'quiz', label: 'Questões', icon: '📝' },
    { id: 'report', label: 'Relatório', icon: '📊' },
  ];

  const Sidebar = ({ mobile = false }) => (
    <aside
      className={`${
        mobile
          ? 'fixed inset-0 z-50 flex'
          : 'hidden md:flex w-64 flex-col'
      } bg-[#0B2545] text-slate-100`}
    >
      {/* Overlay for mobile */}
      {mobile && (
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`${
          mobile ? 'relative z-10 w-64' : 'w-full'
        } flex flex-col h-full p-5`}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">⚖️</span>
            <h1 className="text-xl font-bold tracking-wider text-white">Jus.ai</h1>
          </div>
          {mobile && (
            <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white">
              ✕
            </button>
          )}
        </div>

        <nav className="space-y-1 flex-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 mb-3">
            Navegação
          </div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (mobile) setSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-white/15 text-white'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {item.id === activeTab && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
          ))}

          <div className="pt-4 mt-4 border-t border-slate-700">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 mb-3">
              Base de Conhecimento
            </div>
            <div className="flex items-center space-x-2 text-xs bg-slate-800/50 p-2 rounded-lg border border-slate-700/50 text-slate-300">
              <span>📚</span>
              <span>Materiais de Direito Civil</span>
            </div>
          </div>
        </nav>

        <div className="text-xs text-slate-400 border-t border-slate-700 pt-4">
          Status: <span className="text-emerald-400 font-semibold">MVP teste</span>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar overlay */}
      {sidebarOpen && <Sidebar mobile />}

      {/* Main content */}
      <main className="flex-1 flex flex-col h-full bg-white md:bg-slate-50 min-w-0">
        {/* Header */}
        <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <span className="md:hidden font-bold text-[#0B2545]">⚖️ Jus.ai</span>
            <span className="hidden md:inline text-sm text-slate-500 font-medium">
              {activeTab === 'chat' && 'I.A Baseada nos PDFs das aulas disponíveis no AVA'}
              {activeTab === 'quiz' && 'Questões geradas com base nos materiais de aula'}
              {activeTab === 'report' && 'Relatório de desempenho personalizado'}
            </span>
          </div>
          <div className="text-xs bg-slate-100 px-2.5 py-1 rounded-full font-medium text-slate-600">
            Gemini 2.5 Flash
          </div>
        </header>

        {/* ── CHAT MODE ─────────────────────────────────────────────── */}
        {activeTab === 'chat' && (
          <>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-3xl w-full mx-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-[#0B2545] text-white rounded-br-none'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <div className="whitespace-pre-line leading-relaxed">{msg.content}</div>
                    ) : (
                      <MarkdownRenderer content={msg.content} />
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center space-x-2 text-slate-400 text-sm pl-2">
                  <div className="animate-bounce">●</div>
                  <div className="animate-bounce" style={{ animationDelay: '0.1s' }}>●</div>
                  <div className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</div>
                  <span className="text-xs italic ml-1">Consultando os arquivos da matéria...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <footer className="shrink-0 p-4 bg-white border-t border-slate-200 md:bg-transparent md:border-t-0 max-w-3xl w-full mx-auto">
              <form onSubmit={handleSubmit} className="relative flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Pergunte sobre qualquer matéria dos PDFs..."
                  disabled={isLoading}
                  autoComplete="off"
                  autoCorrect="off"
                  className="w-full pl-4 pr-12 py-3 bg-white border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545] focus:border-transparent text-sm disabled:bg-slate-50 disabled:text-slate-400"
                  style={{
                    color: '#1e293b',
                    WebkitTextFillColor: '#1e293b',
                    opacity: 1,
                    fontSize: '16px', // prevents iOS zoom
                  }}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 p-2 bg-[#0B2545] text-white rounded-lg hover:bg-opacity-90 transition-all disabled:bg-slate-200 disabled:text-slate-400"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5l7.5-7.5 7.5 7.5M12 3v18" />
                  </svg>
                </button>
              </form>
              <p className="text-[10px] text-center text-slate-400 mt-2">
                Desenvolvido por Vitor Hugo Ittner Fallgatter. Respostas baseadas no material fornecido em aula.
              </p>
            </footer>
          </>
        )}

        {/* ── QUIZ MODE ─────────────────────────────────────────────── */}
        {activeTab === 'quiz' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <QuizMode previousWrongTopics={wrongTopics} />
          </div>
        )}

        {/* ── REPORT MODE ───────────────────────────────────────────── */}
        {activeTab === 'report' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <ReportMode quizHistory={quizHistory} />
          </div>
        )}
      </main>
    </div>
  );
}