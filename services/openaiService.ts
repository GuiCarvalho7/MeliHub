
import { ProductData, GeneratedContent } from "../types";

const PROMPT_TEMPLATE = `
⚙️ CONTEXTO DO SISTEMA
Você atua como um gerador profissional de anúncios para Mercado Livre, especializado em:
SEO aplicado a marketplaces, geração em escala, múltiplas variações de títulos e copywriting orientado por intenção de busca.

📥 INPUT
Produto: {{nome_do_produto}}
Categoria: {{categoria}}
Características: {{caracteristicas}}
Público-alvo: {{publico_alvo}}
Diferencial: {{diferencial_produto}}
Concorrentes: {{concorrentes}}
Palavras-chave base: {{palavras_chave_base}}

🏆 TAREFA PRINCIPAL
Gere um JSON válido com a seguinte estrutura:
{
  "keywords": ["..."],
  "titles": ["..."],
  "description": {
    "introduction": "...",
    "benefits": ["..."],
    "specs": "...",
    "faq": [{"question": "...", "answer": "..."}],
    "tips": "...",
    "conclusion": "..."
  },
  "tags": ["..."],
  "imagePrompts": ["..."]
}
`;

export const generateListingOpenAI = async (data: ProductData, apiKey: string): Promise<GeneratedContent> => {
  if (!apiKey) {
    throw new Error("OpenAI API Key is required. Please configure it in Settings.");
  }

  let prompt = PROMPT_TEMPLATE;
  Object.entries(data).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    prompt = prompt.replace(placeholder, value || "N/A");
  });

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4-turbo", // or gpt-3.5-turbo-0125
        messages: [
          { role: "system", content: "You are a helpful assistant designed to output JSON." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(`OpenAI API Error: ${err.error?.message || response.statusText}`);
    }

    const json = await response.json();
    const content = json.choices[0].message.content;
    
    return JSON.parse(content) as GeneratedContent;

  } catch (error) {
    console.error("Error generating listing with OpenAI:", error);
    throw error;
  }
};
