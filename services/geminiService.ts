
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ProductData, GeneratedContent } from "../types";

// The core prompt template provided by the user
const PROMPT_TEMPLATE = `
⚙️ CONTEXTO DO SISTEMA

Você atua como um gerador profissional de anúncios para Mercado Livre, especializado em:
SEO aplicado a marketplaces
geração em escala
múltiplas variações de títulos
expansão semântica de palavras-chave
copywriting orientado por intenção de busca
Objetivo: transformar um único produto em dezenas de anúncios otimizados, limpos e prontos para publicação.

📥 INPUT
Produto: {{nome_do_produto}}
Categoria: {{categoria}}
Características: {{caracteristicas}}
Público-alvo: {{publico_alvo}}
Diferencial: {{diferencial_produto}}
Concorrentes: {{concorrentes}}
Palavras-chave base: {{palavras_chave_base}}

🏆 TAREFA PRINCIPAL
Processar os dados acima e gerar a saída completa.
`;

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    keywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "25 palavras-chave relevantes para SEO e expansão semântica.",
    },
    titles: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "40 títulos otimizados (máx 60 chars), variando intenção de busca.",
    },
    description: {
      type: Type.OBJECT,
      properties: {
        introduction: { type: Type.STRING, description: "Apresentar o produto como solução." },
        benefits: { type: Type.ARRAY, items: { type: Type.STRING }, description: "6 itens persuasivos." },
        specs: { type: Type.STRING, description: "Atributos técnicos convertidos em vantagens." },
        faq: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              answer: { type: Type.STRING },
            },
          },
          description: "5 perguntas reais e respostas.",
        },
        tips: { type: Type.STRING, description: "Dicas de uso práticas." },
        conclusion: { type: Type.STRING, description: "Conclusão com CTA." },
      },
    },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "20 tags curtas para SEO (1-3 palavras).",
    },
    imagePrompts: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "3 prompts detalhados para gerar imagens do produto usando AI."
    }
  },
  required: ["keywords", "titles", "description", "tags", "imagePrompts"],
};

export const generateListingGemini = async (data: ProductData): Promise<GeneratedContent> => {
  // Uses configured process.env.API_KEY
  if (!process.env.API_KEY) {
    throw new Error("Gemini API Key not found. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // 1. Data Injection Logic
  let prompt = PROMPT_TEMPLATE;
  Object.entries(data).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    prompt = prompt.replace(placeholder, value || "N/A");
  });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        systemInstruction: "Você é um especialista em E-commerce e SEO para Mercado Livre (Brasil). Gere todo o conteúdo em Português do Brasil.",
        temperature: 0.7, // Creativity balance
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as GeneratedContent;
    } else {
      throw new Error("Empty response from AI");
    }
  } catch (error) {
    console.error("Error generating listing:", error);
    throw error;
  }
};
