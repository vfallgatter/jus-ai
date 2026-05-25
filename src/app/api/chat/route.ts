import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';


const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const latestMessage = messages[messages.length - 1].content;

    
    const pdfsDirectory = path.join(process.cwd(), 'aulas_pdf');
    
    if (!fs.existsSync(pdfsDirectory)) {
      return NextResponse.json(
        { error: 'A pasta "aulas_pdf" não foi encontrada na raiz do projeto.' },
        { status: 500 }
      );
    }

    const filenames = fs.readdirSync(pdfsDirectory);
    
    
    const contents: any[] = [];

    
    for (const filename of filenames) {
      if (filename.endsWith('.pdf')) {
        const filePath = path.join(pdfsDirectory, filename);
        const dataBuffer = fs.readFileSync(filePath);
        
        
        contents.push({
          inlineData: {
            data: dataBuffer.toString('base64'),
            mimeType: 'application/pdf'
          }
        });
      }
    }

    
    contents.push(latestMessage);

    
    const systemInstruction = `
      Você é o Jus.ai, um assistente de inteligência artificial especializado em Direito Civil, treinado especificamente com os materiais de aula fornecidos em anexo.
      Seu público-alvo são estudantes de direito da mesma turma.
      
      Regras estritas de resposta:
      1. Responda de forma didática, precisa e estritamente jurídica, baseando-se nos PDFs anexados.
      2. REQUISITO OBRIGATÓRIO: Ao responder ou explicar qualquer conceito, você DEVE citar de qual assunto ou slide do material você retirou a informação.
      3. Use formatação Markdown (negritos, listas, títulos) para que a resposta fique bonita e fácil de ler em um chatbox.
      4. Se o aluno fizer uma pergunta sobre algo que NÃO está nos PDFs anexados, responda com o seu conhecimento geral de Direito Civil, mas avise claramente: "(Nota: Este assunto específico não foi detalhado nos arquivos das aulas)".
      5. O chatbox NUNCA irá inventar uma lei, apenas propagar os dados que o slide dará. Apenas caso o aluno peça. Nesses casos, o chat deixará explicito a invenção.
      6. O chat deve priorizar os dados nativos dos PDFs. Caso impossível, dar dados OFICIAIS. Porém deixando explicito que não está referenciando dos arquivos.
    `;

    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents, 
      config: {
        systemInstruction: systemInstruction,
      },
    });

    return NextResponse.json({ text: response.text });

  } catch (error) {
    console.error('Erro na API de Chat:', error);
    return NextResponse.json({ error: 'Erro interno ao processar os PDFs ou chamar a IA.' }, { status: 500 });
  }
}