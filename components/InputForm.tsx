
import React, { useState } from 'react';
import { ProductData } from '../types';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';

interface InputFormProps {
  onGenerate: (data: ProductData) => void;
  isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onGenerate, isLoading }) => {
  const [formData, setFormData] = useState<ProductData>({
    nome_do_produto: '',
    categoria: '',
    caracteristicas: '',
    publico_alvo: '',
    diferencial_produto: '',
    concorrentes: '',
    palavras_chave_base: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(formData);
  };

  const inputClassName = "w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent outline-none transition-all";

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-800">Criar Novos Anúncios</h2>
        <p className="text-slate-500">Preencha os dados abaixo para nossa IA gerar múltiplos anúncios otimizados para o Mercado Livre.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-slate-100 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Produto</label>
                <input
                    name="nome_do_produto"
                    value={formData.nome_do_produto}
                    onChange={handleChange}
                    placeholder="Ex: Fone de Ouvido Bluetooth Sport Pro"
                    className={inputClassName}
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                <input
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    placeholder="Ex: Eletrônicos > Áudio"
                    className={inputClassName}
                    required
                />
            </div>

             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Público-alvo</label>
                <input
                    name="publico_alvo"
                    value={formData.publico_alvo}
                    onChange={handleChange}
                    placeholder="Ex: Corredores, praticantes de academia"
                    className={inputClassName}
                    required
                />
            </div>

            <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Características Técnicas</label>
                <textarea
                    name="caracteristicas"
                    value={formData.caracteristicas}
                    onChange={handleChange}
                    placeholder="Ex: Bateria 20h, Resistente à água IPX7, Bluetooth 5.2..."
                    className={`${inputClassName} h-24`}
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Diferencial do Produto (USP)</label>
                <input
                    name="diferencial_produto"
                    value={formData.diferencial_produto}
                    onChange={handleChange}
                    placeholder="Ex: Cancelamento de ruído superior a concorrentes"
                    className={inputClassName}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Palavras-chave Base</label>
                <input
                    name="palavras_chave_base"
                    value={formData.palavras_chave_base}
                    onChange={handleChange}
                    placeholder="Ex: fone bluetooth, fone sem fio"
                    className={inputClassName}
                    required
                />
            </div>

             <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Principais Concorrentes</label>
                 <input
                    name="concorrentes"
                    value={formData.concorrentes}
                    onChange={handleChange}
                    placeholder="Ex: JBL, Sony, Xiaomi"
                    className={inputClassName}
                />
            </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
            <button
                type="submit"
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-1"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="animate-spin" />
                        <span>Gerando Estratégia...</span>
                    </>
                ) : (
                    <>
                        <Sparkles className="w-5 h-5" />
                        <span>Gerar Anúncios em Massa</span>
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                )}
            </button>
        </div>
      </form>
    </div>
  );
};
