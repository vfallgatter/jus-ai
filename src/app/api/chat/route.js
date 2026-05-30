import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req) {
  try {
    const body = await req.json();
    const { messages, mode, quizConfig } = body;

    const pdfsDirectory = path.join(process.cwd(), 'aulas_pdf');

    if (!fs.existsSync(pdfsDirectory)) {
      return NextResponse.json(
        { error: 'A pasta "aulas_pdf" não foi encontrada na raiz do projeto.' },
        { status: 500 }
      );
    }

    const filenames = fs.readdirSync(pdfsDirectory);
    const contents = [];

    for (const filename of filenames) {
      if (filename.endsWith('.pdf')) {
        const filePath = path.join(pdfsDirectory, filename);
        const dataBuffer = fs.readFileSync(filePath);
        contents.push({
          inlineData: {
            data: dataBuffer.toString('base64'),
            mimeType: 'application/pdf',
          },
        });
      }
    }

    // ── MODO QUESTÕES ──────────────────────────────────────────────
    if (mode === 'quiz') {
      const { count = 5, difficulty = 'medio', focusWrong = false, wrongTopics = [] } = quizConfig || {};

      const focusInstruction = focusWrong && wrongTopics.length > 0
        ? `FOCO ESPECIAL: O aluno errou questões sobre os seguintes temas e deve ser avaliado principalmente neles: ${wrongTopics.join(', ')}.`
        : 'Gere questões abrangendo os temas dos PDFs de forma geral.';

      const difficultyMap = { facil: 'fácil (conceitual, direta)', medio: 'médio (interpretação e aplicação)', dificil: 'difícil (casos complexos, exceções, comparações)' };

      const quizPrompt = `
        Você é o Jus.ai. Gere exatamente ${count} questões de Direito Civil com base nos PDFs anexados.
        Dificuldade: ${difficultyMap[difficulty] || difficultyMap.medio}.
        ${focusInstruction}

        REGRAS:
        - Misture questões OBJETIVAS (múltipla escolha com 4 alternativas A, B, C, D) e DISSERTATIVAS (resposta aberta).
        - Use proporção aproximada: 70% objetivas, 30% dissertativas.
        - Baseie-se APENAS no conteúdo dos PDFs.
        - Responda APENAS com JSON válido, sem markdown, sem explicações fora do JSON.

        Formato JSON obrigatório:
        {
          "questions": [
            {
              "id": 1,
              "type": "objective",
              "question": "Texto da questão",
              "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
              "correct": "A",
              "explanation": "Explicação de por que A é correta e as outras não",
              "topic": "Nome do tópico/aula"
            },
            {
              "id": 2,
              "type": "essay",
              "question": "Texto da questão dissertativa",
              "sampleAnswer": "Resposta modelo completa",
              "keyPoints": ["ponto 1", "ponto 2", "ponto 3"],
              "topic": "Nome do tópico/aula"
            }
          ]
        }
      `;

      contents.push(quizPrompt);

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: { systemInstruction: 'Você é um gerador de questões jurídicas. Responda APENAS com JSON válido.' },
      });

      const raw = response.text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(raw);
      return NextResponse.json(parsed);
    }

    // ── MODO RELATÓRIO ─────────────────────────────────────────────
    if (mode === 'report') {
      const { history } = body;

      const reportPrompt = `
        Com base no histórico de desempenho do aluno a seguir e nos PDFs das aulas, gere um relatório detalhado.
        Histórico: ${JSON.stringify(history)}

        Responda APENAS com JSON válido:
        {
          "strongTopics": [{"topic": "...", "score": 90, "notes": "..."}],
          "weakTopics": [{"topic": "...", "score": 30, "notes": "..."}],
          "generalAnalysis": "Parágrafo de análise geral do aluno",
          "recommendations": ["recomendação 1", "recomendação 2"],
          "overallScore": 65
        }
      `;

      contents.push(reportPrompt);

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: { systemInstruction: 'Você é um avaliador pedagógico jurídico. Responda APENAS com JSON válido.' },
      });

      const raw = response.text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(raw);
      return NextResponse.json(parsed);
    }

    // ── MODO CHAT (padrão) ─────────────────────────────────────────
    const latestMessage = messages[messages.length - 1].content;
    contents.push(latestMessage);

    const systemInstruction = `
      Você é o Jus.ai, um assistente de inteligência artificial especializado em Direito Civil, treinado especificamente com os materiais de aula fornecidos em anexo.
      Seu público-alvo são estudantes de direito da mesma turma.

      Regras estritas de resposta:
      1. Responda de forma didática, precisa e estritamente jurídica, baseando-se nos PDFs anexados.
      2. REQUISITO OBRIGATÓRIO: Ao responder ou explicar qualquer conceito, você DEVE citar de qual aula ou slide do material você retirou a informação.
      3. Use formatação Markdown (negritos com **, listas com -, títulos com ## ou ###) para organizar a resposta.
      4. NUNCA use #### ou títulos menores que ###.
      5. Se o aluno perguntar sobre algo fora dos PDFs, responda com conhecimento geral de Direito Civil e avise: "(Nota: Este assunto específico não foi detalhado nos arquivos das aulas)".
      6. NUNCA invente leis ou artigos. Cite apenas o que está nos PDFs.
      7. Priorize os dados nativos dos PDFs. Caso impossível, forneça dados oficiais deixando claro que não está referenciando os arquivos.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: { systemInstruction },
    });

    return NextResponse.json({ text: response.text });
  } catch (error) {
    console.error('Erro na API de Chat:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar os PDFs ou chamar a IA.' },
      { status: 500 }
    );
  }
}