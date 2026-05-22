'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Olá! Sou o Jus.ai, seu assistente de Direito Civil. Li os materiais das aulas (1-12)! Peço que em todo o chat SEMPRE referencie o número da aula e caso queira, o slide :)',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

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
          content: '❌ **Erro de conexão:** Ocorreu um problema ao processar a requisição no servidor. Verifique o terminal.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 antialiased font-sans">
      {/* Barra Lateral - Oculta no Mobile */}
      <aside className="w-64 bg-[#0B2545] text-slate-100 flex flex-col justify-between p-5 hidden md:flex">
        <div>
          <div className="flex items-center space-x-2 mb-8">
            <span className="text-2xl">⚖️</span>
            <h1 className="text-xl font-bold tracking-wider text-white">Jus.ai</h1>
          </div>
          <nav className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 mb-2">
              Base de Conhecimento
            </div>
            <div className="flex items-center space-x-2 text-sm bg-slate-800/50 p-2 rounded-lg border border-slate-700/50 text-slate-200">
              
              <span>Materiais de Direito Civil</span>
            </div>
          </nav>
        </div>
        <div className="text-xs text-slate-400 border-t border-slate-700 pt-4">
          Status: <span className="text-emerald-400 font-semibold">MVP teste</span>
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 flex flex-col h-full bg-white md:bg-slate-50">
        <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6">
          <div className="flex items-center space-x-2">
            <span className="md:hidden text-xl">⚖️ <b>Jus.ai</b></span>
            <span className="hidden md:inline-block text-sm text-slate-500 font-medium">
              I.A Baseada nos PDFs das aulas disponíveis no AVA
            </span>
          </div>
          <div className="text-xs bg-slate-100 px-2.5 py-1 rounded-full font-medium text-slate-600">
            Modelo: Gemini 2.5 Flash
          </div>
        </header>

        {/* Lista de Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-3xl w-full mx-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#0B2545] text-white rounded-br-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                }`}
              >
                {msg.role === 'user' ? (
                  <div className="whitespace-pre-line">{msg.content}</div>
                ) : (
                  /* Formatação Dinâmica de Linhas, Negritos e Listas sem dependências externas */
                  <div className="space-y-3 text-slate-800 whitespace-pre-line">
                    {msg.content.split('\n').map((paragraph, index) => {
                      // Identifica se a linha é uma lista
                      const isListItem = paragraph.trim().startsWith('-') || paragraph.trim().startsWith('*');
                      const cleanParagraph = isListItem ? paragraph.replace(/^[-*]\s*/, '') : paragraph;

                      // Destrincha os asteriscos (**) para aplicar negrito
                      const parts = cleanParagraph.split('**');
                      const formattedText = parts.map((part, i) => 
                        i % 2 === 1 ? <strong key={i} className="font-bold text-[#0B2545]">{part}</strong> : part
                      );

                      if (isListItem) {
                        return (
                          <ul key={index} className="list-disc pl-5 my-1">
                            <li className="leading-relaxed">{formattedText}</li>
                          </ul>
                        );
                      }

                      // Identifica separadores como hífens contínuos
                      if (paragraph.trim().startsWith('---')) {
                        return <hr key={index} className="my-3 border-slate-200" />;
                      }

                      return paragraph.trim() ? (
                        <p key={index} className="leading-relaxed text-justify">{formattedText}</p>
                      ) : <div key={index} className="h-1" />;
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center space-x-2 text-slate-400 text-sm pl-2">
              <div className="animate-bounce">●</div>
              <div className="animate-bounce delay-100">●</div>
              <div className="animate-bounce delay-200">●</div>
              <span className="text-xs italic ml-1">Consultando os arquivos da matéria...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <footer className="p-4 bg-white border-t border-slate-200 md:bg-transparent md:border-t-0 max-w-3xl w-full mx-auto">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte sobre qualquer matéria dos PDFs..."
              disabled={isLoading}
              className="w-full pl-4 pr-12 py-3 bg-white border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545] focus:border-transparent text-sm disabled:bg-slate-50 disabled:text-slate-400"
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
            Desenvolvido por Vitor Hugo. Respostas baseadas no material fornecido em aula.
          </p>
        </footer>
      </main>
    </div>
  );
}