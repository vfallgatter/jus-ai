'use client';

import { useState } from 'react';

export default function ReportMode({ quizHistory = [] }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'report', history: quizHistory }),
      });
      const data = await res.json();
      setReport(data);
    } catch {
      alert('Erro ao gerar relatório.');
    } finally {
      setLoading(false);
    }
  };

  if (!report && !loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 w-full max-w-md text-center space-y-4">
          <span className="text-5xl">📊</span>
          <h2 className="text-xl font-bold text-[#0B2545]">Relatório de Desempenho</h2>
          <p className="text-sm text-slate-500">
            {quizHistory.length === 0
              ? 'Faça ao menos uma rodada de questões para gerar seu relatório personalizado.'
              : `Baseado em ${quizHistory.length} sessão(ões) de questões realizadas.`}
          </p>
          <button
            onClick={generateReport}
            disabled={quizHistory.length === 0}
            className="w-full py-3 bg-[#0B2545] text-white rounded-xl font-semibold hover:bg-opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Gerar Relatório com IA
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-4xl animate-pulse">📊</div>
          <p className="text-sm text-slate-500 italic">Analisando seu desempenho...</p>
        </div>
      </div>
    );
  }

  const { strongTopics = [], weakTopics = [], generalAnalysis, recommendations = [], overallScore } = report;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-2xl w-full mx-auto space-y-5">
      {/* Score geral */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm">
        <div className="text-5xl font-black text-[#0B2545]">{overallScore}%</div>
        <p className="text-slate-500 text-sm mt-1">Desempenho geral estimado</p>
      </div>

      {/* Análise */}
      {generalAnalysis && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-bold text-[#0B2545] mb-2">🧠 Análise Geral</h3>
          <p className="text-sm text-slate-700 leading-relaxed">{generalAnalysis}</p>
        </div>
      )}

      {/* Pontos fortes */}
      {strongTopics.length > 0 && (
        <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5">
          <h3 className="font-bold text-emerald-700 mb-3">✅ Você está bem em:</h3>
          <div className="space-y-2">
            {strongTopics.map((t, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-slate-700">{t.topic}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-emerald-100 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${t.score}%` }} />
                  </div>
                  <span className="text-xs text-emerald-700 font-medium w-8">{t.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pontos fracos */}
      {weakTopics.length > 0 && (
        <div className="bg-red-50 rounded-2xl border border-red-200 p-5">
          <h3 className="font-bold text-red-700 mb-3">⚠️ Precisa reforçar:</h3>
          <div className="space-y-2">
            {weakTopics.map((t, i) => (
              <div key={i} className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">{t.topic}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-red-100 rounded-full h-1.5">
                      <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${t.score}%` }} />
                    </div>
                    <span className="text-xs text-red-700 font-medium w-8">{t.score}%</span>
                  </div>
                </div>
                {t.notes && <p className="text-xs text-slate-500">{t.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recomendações */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-bold text-[#0B2545] mb-3">💡 Recomendações</h3>
          <ul className="space-y-2">
            {recommendations.map((r, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700">
                <span className="text-[#0B2545] font-bold mt-0.5">→</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={() => setReport(null)}
        className="w-full py-2 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition-all"
      >
        Atualizar relatório
      </button>
    </div>
  );
}