'use client';

import { useState } from 'react';

const DIFFICULTY_LABELS = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' };

function ConfigScreen({ onStart, previousWrongTopics }) {
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState('medio');
  const [focusWrong, setFocusWrong] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    await onStart({ count, difficulty, focusWrong });
    setLoading(false);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 w-full max-w-md space-y-6">
        <div className="text-center">
          <span className="text-4xl">📝</span>
          <h2 className="text-xl font-bold text-[#0B2545] mt-2">Configurar Questões</h2>
          <p className="text-sm text-slate-500 mt-1">Personalize sua sessão de estudos</p>
        </div>

        {/* Quantidade */}
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-2 block">Quantidade de questões</label>
          <div className="flex gap-2">
            {[5, 10, 15].map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                  count === n
                    ? 'bg-[#0B2545] text-white border-[#0B2545]'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-[#0B2545]'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Dificuldade */}
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-2 block">Dificuldade</label>
          <div className="flex gap-2">
            {['facil', 'medio', 'dificil'].map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                  difficulty === d
                    ? 'bg-[#0B2545] text-white border-[#0B2545]'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-[#0B2545]'
                }`}
              >
                {DIFFICULTY_LABELS[d]}
              </button>
            ))}
          </div>
        </div>

        {/* Foco nos erros */}
        {previousWrongTopics.length > 0 && (
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">Tipo de questões</label>
            <div className="flex gap-2">
              <button
                onClick={() => setFocusWrong(false)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                  !focusWrong
                    ? 'bg-[#0B2545] text-white border-[#0B2545]'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-[#0B2545]'
                }`}
              >
                Gerais
              </button>
              <button
                onClick={() => setFocusWrong(true)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                  focusWrong
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-amber-400'
                }`}
              >
                🎯 Meus erros
              </button>
            </div>
            {focusWrong && (
              <p className="text-xs text-amber-600 mt-1">
                Focando em: {previousWrongTopics.slice(0, 3).join(', ')}
                {previousWrongTopics.length > 3 ? '...' : ''}
              </p>
            )}
          </div>
        )}

        <button
          onClick={handleStart}
          disabled={loading}
          className="w-full py-3 bg-[#0B2545] text-white rounded-xl font-semibold hover:bg-opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span> Gerando questões com base nos PDFs...
            </span>
          ) : (
            'Iniciar Quiz'
          )}
        </button>
      </div>
    </div>
  );
}

function ObjectiveQuestion({ question, onAnswer, answered }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (opt) => {
    if (answered) return;
    const letter = opt[0]; // "A", "B", etc.
    setSelected(letter);
    onAnswer(letter);
  };

  const getOptionStyle = (opt) => {
    const letter = opt[0];
    if (!answered || selected !== letter) {
      if (selected === letter) return 'border-[#0B2545] bg-slate-50';
      return 'border-slate-200 hover:border-slate-300 cursor-pointer';
    }
    if (letter === question.correct) return 'border-emerald-500 bg-emerald-50';
    if (letter === selected) return 'border-red-400 bg-red-50';
    return 'border-slate-200';
  };

  return (
    <div className="space-y-3">
      {question.options.map((opt) => (
        <button
          key={opt}
          onClick={() => handleSelect(opt)}
          disabled={answered}
          className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${getOptionStyle(opt)}`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function EssayQuestion({ question, onAnswer, answered }) {
  const [text, setText] = useState('');
  const [selfEval, setSelfEval] = useState(null);

  if (answered) {
    return (
      <div className="space-y-3">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <p className="text-xs font-semibold text-slate-500 mb-1">Sua resposta:</p>
          <p className="text-sm text-slate-700">{text || '(não respondeu)'}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
          <p className="text-xs font-semibold text-emerald-700 mb-1">Resposta modelo:</p>
          <p className="text-sm text-slate-700">{question.sampleAnswer}</p>
        </div>
        {question.keyPoints && (
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
            <p className="text-xs font-semibold text-blue-700 mb-1">Pontos-chave esperados:</p>
            <ul className="list-disc pl-4 space-y-0.5">
              {question.keyPoints.map((p, i) => (
                <li key={i} className="text-xs text-slate-700">{p}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Digite sua resposta aqui..."
        rows={4}
        className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545] resize-none"
        style={{ color: 'inherit', WebkitTextFillColor: 'inherit' }}
      />
      {!selfEval ? (
        <div>
          <p className="text-xs text-slate-500 mb-2">Como você avalia sua resposta?</p>
          <div className="flex gap-2">
            {['Acertei', 'Parcial', 'Errei'].map((label) => (
              <button
                key={label}
                onClick={() => {
                  setSelfEval(label);
                  onAnswer(label === 'Acertei' ? 'correct' : label === 'Parcial' ? 'partial' : 'wrong', text);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                  label === 'Acertei'
                    ? 'border-emerald-400 text-emerald-700 hover:bg-emerald-50'
                    : label === 'Parcial'
                    ? 'border-amber-400 text-amber-700 hover:bg-amber-50'
                    : 'border-red-400 text-red-700 hover:bg-red-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function QuizQuestion({ question, index, total, onNext, isLast }) {
  const [answered, setAnswered] = useState(false);
  const [result, setResult] = useState(null); // 'correct' | 'wrong' | 'partial'
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const handleObjectiveAnswer = (letter) => {
    const isCorrect = letter === question.correct;
    setResult(isCorrect ? 'correct' : 'wrong');
    setSelectedAnswer(letter);
    setAnswered(true);
  };

  const handleEssayAnswer = (evalResult) => {
    setResult(evalResult);
    setAnswered(true);
  };

  const resultLabel = { correct: '✅ Correto!', wrong: '❌ Incorreto', partial: '⚠️ Parcialmente correto' };
  const resultColor = { correct: 'text-emerald-600', wrong: 'text-red-600', partial: 'text-amber-600' };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-2xl w-full mx-auto space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Questão {index + 1} de {total}</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          question.type === 'objective' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
        }`}>
          {question.type === 'objective' ? 'Objetiva' : 'Dissertativa'}
        </span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-1.5">
        <div
          className="bg-[#0B2545] h-1.5 rounded-full transition-all"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      {/* Topic tag */}
      {question.topic && (
        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
          📚 {question.topic}
        </span>
      )}

      {/* Question */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <p className="text-sm font-medium text-slate-800 mb-4 leading-relaxed">{question.question}</p>

        {question.type === 'objective' ? (
          <ObjectiveQuestion question={question} onAnswer={handleObjectiveAnswer} answered={answered} />
        ) : (
          <EssayQuestion question={question} onAnswer={handleEssayAnswer} answered={answered} />
        )}
      </div>

      {/* Feedback */}
      {answered && (
        <div className={`rounded-xl p-4 border text-sm space-y-2 ${
          result === 'correct' ? 'bg-emerald-50 border-emerald-200' :
          result === 'partial' ? 'bg-amber-50 border-amber-200' :
          'bg-red-50 border-red-200'
        }`}>
          <p className={`font-bold ${resultColor[result]}`}>{resultLabel[result]}</p>
          {question.type === 'objective' && question.explanation && (
            <p className="text-slate-700 leading-relaxed">{question.explanation}</p>
          )}
        </div>
      )}

      {answered && (
        <button
          onClick={() => onNext(result)}
          className="w-full py-3 bg-[#0B2545] text-white rounded-xl font-semibold hover:bg-opacity-90 transition-all"
        >
          {isLast ? 'Ver Resultado Final' : 'Próxima Questão →'}
        </button>
      )}
    </div>
  );
}

function ResultsScreen({ questions, results, onRetry, onNewQuiz }) {
  const correct = results.filter((r) => r === 'correct').length;
  const partial = results.filter((r) => r === 'partial').length;
  const wrong = results.filter((r) => r === 'wrong').length;
  const total = results.length;
  const score = Math.round(((correct + partial * 0.5) / total) * 100);

  const wrongTopics = questions
    .filter((_, i) => results[i] === 'wrong')
    .map((q) => q.topic)
    .filter(Boolean);

  const [moreCount, setMoreCount] = useState(5);
  const [moreDiff, setMoreDiff] = useState('medio');
  const [moreMode, setMoreMode] = useState('geral');

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-2xl w-full mx-auto space-y-5">
      {/* Score */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm">
        <div className="text-5xl font-black text-[#0B2545] mb-1">{score}%</div>
        <p className="text-sm text-slate-500">Pontuação final</p>
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div className="text-center"><div className="text-2xl font-bold text-emerald-600">{correct}</div><div className="text-slate-400">Corretos</div></div>
          {partial > 0 && <div className="text-center"><div className="text-2xl font-bold text-amber-500">{partial}</div><div className="text-slate-400">Parciais</div></div>}
          <div className="text-center"><div className="text-2xl font-bold text-red-500">{wrong}</div><div className="text-slate-400">Errados</div></div>
        </div>
      </div>

      {/* Análise */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="font-bold text-[#0B2545] mb-3">📊 Análise de Desempenho</h3>
        {score >= 80 && <p className="text-sm text-slate-700">Excelente! Você demonstra domínio sólido sobre os tópicos avaliados.</p>}
        {score >= 50 && score < 80 && <p className="text-sm text-slate-700">Bom desempenho! Há alguns pontos a revisar para solidificar o conhecimento.</p>}
        {score < 50 && <p className="text-sm text-slate-700">Recomenda-se revisão do material. Identifique os tópicos abaixo e retome o estudo.</p>}

        {wrongTopics.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs font-semibold text-red-600 mb-1">Tópicos para revisar:</p>
            <div className="flex flex-wrap gap-1">
              {[...new Set(wrongTopics)].map((t, i) => (
                <span key={i} className="bg-red-50 text-red-700 text-xs px-2 py-0.5 rounded-full border border-red-200">{t}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Continuar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-[#0B2545]">Continuar estudando</h3>

        <div>
          <p className="text-xs text-slate-500 mb-2">Mais questões:</p>
          <div className="flex gap-2">
            {[5, 10, 15].map((n) => (
              <button key={n} onClick={() => setMoreCount(n)} className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${moreCount === n ? 'bg-[#0B2545] text-white border-[#0B2545]' : 'border-slate-200 text-slate-600 hover:border-[#0B2545]'}`}>{n}</button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-slate-500 mb-2">Dificuldade:</p>
          <div className="flex gap-2">
            {['facil', 'medio', 'dificil'].map((d) => (
              <button key={d} onClick={() => setMoreDiff(d)} className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${moreDiff === d ? 'bg-[#0B2545] text-white border-[#0B2545]' : 'border-slate-200 text-slate-600 hover:border-[#0B2545]'}`}>{DIFFICULTY_LABELS[d]}</button>
            ))}
          </div>
        </div>

        {wrongTopics.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 mb-2">Tipo:</p>
            <div className="flex gap-2">
              <button onClick={() => setMoreMode('geral')} className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${moreMode === 'geral' ? 'bg-[#0B2545] text-white border-[#0B2545]' : 'border-slate-200 text-slate-600'}`}>Gerais</button>
              <button onClick={() => setMoreMode('erros')} className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${moreMode === 'erros' ? 'bg-amber-500 text-white border-amber-500' : 'border-slate-200 text-slate-600'}`}>🎯 Meus erros</button>
            </div>
          </div>
        )}

        <button
          onClick={() => onRetry({ count: moreCount, difficulty: moreDiff, focusWrong: moreMode === 'erros', wrongTopics })}
          className="w-full py-3 bg-[#0B2545] text-white rounded-xl font-semibold hover:bg-opacity-90 transition-all"
        >
          Iniciar nova rodada
        </button>
      </div>

      <button onClick={onNewQuiz} className="w-full py-2 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition-all">
        Voltar ao início
      </button>
    </div>
  );
}

export default function QuizMode({ previousWrongTopics = [] }) {
  const [phase, setPhase] = useState('config'); // 'config' | 'loading' | 'quiz' | 'results'
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState([]);

  const startQuiz = async (config) => {
    setPhase('loading');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'quiz', quizConfig: config }),
      });
      const data = await res.json();
      if (data.questions) {
        setQuestions(data.questions);
        setCurrentIndex(0);
        setResults([]);
        setPhase('quiz');
      } else {
        alert('Erro ao gerar questões. Tente novamente.');
        setPhase('config');
      }
    } catch {
      alert('Erro de conexão. Tente novamente.');
      setPhase('config');
    }
  };

  const handleNext = (result) => {
    const newResults = [...results, result];
    setResults(newResults);
    if (currentIndex + 1 >= questions.length) {
      setPhase('results');
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (phase === 'config' || phase === 'loading') {
    return <ConfigScreen onStart={startQuiz} previousWrongTopics={previousWrongTopics} />;
  }

  if (phase === 'quiz') {
    return (
      <QuizQuestion
        key={currentIndex}
        question={questions[currentIndex]}
        index={currentIndex}
        total={questions.length}
        onNext={handleNext}
        isLast={currentIndex + 1 >= questions.length}
      />
    );
  }

  if (phase === 'results') {
    return (
      <ResultsScreen
        questions={questions}
        results={results}
        onRetry={(config) => startQuiz(config)}
        onNewQuiz={() => setPhase('config')}
      />
    );
  }
}