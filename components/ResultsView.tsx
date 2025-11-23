
import React, { useState } from 'react';
import { GeneratedContent } from '../types';
import { Copy, Check, UploadCloud, Tag, Type, FileText, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { syncWithMercadoLivre } from '../services/mlService';
import { useTenant } from '../contexts/TenantContext';

interface ResultsViewProps {
  content: GeneratedContent;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ content }) => {
  const { currentTenant } = useTenant();
  const [activeTab, setActiveTab] = useState<'titles' | 'description' | 'seo' | 'images'>('titles');
  const [syncedTitles, setSyncedTitles] = useState<Set<number>>(new Set());
  const [isSyncing, setIsSyncing] = useState<number | null>(null);

  const handleSync = async (title: string, index: number) => {
    if (!currentTenant) return;
    
    setIsSyncing(index);
    try {
        await syncWithMercadoLivre(title, content, currentTenant.id);
        setSyncedTitles(prev => new Set(prev).add(index));
    } catch (e) {
        console.error("Sync failed", e);
        alert("Falha na sincronização. Verifique se a conta do cliente está conectada.");
    } finally {
        setIsSyncing(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!currentTenant) return <div>Selecione um cliente.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
                <h2 className="text-3xl font-bold text-slate-800">Estratégia Gerada</h2>
                <p className="text-slate-500 mt-1">
                    Cliente: <strong>{currentTenant.name}</strong> 
                    {!currentTenant.isConnected && <span className="text-red-500 ml-2 text-xs bg-red-50 px-2 py-1 rounded-full"><AlertTriangle size={10} className="inline mr-1"/>Não conectado</span>}
                </p>
            </div>
            <div className="flex space-x-2 bg-white p-1 rounded-lg border border-slate-200 overflow-x-auto w-full md:w-auto">
                <button
                    onClick={() => setActiveTab('titles')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center space-x-2 ${activeTab === 'titles' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                    <Type size={16} /> <span>Títulos ({content.titles.length})</span>
                </button>
                <button
                    onClick={() => setActiveTab('description')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center space-x-2 ${activeTab === 'description' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                    <FileText size={16} /> <span>Descrição</span>
                </button>
                <button
                    onClick={() => setActiveTab('seo')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center space-x-2 ${activeTab === 'seo' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                    <Tag size={16} /> <span>SEO</span>
                </button>
                 <button
                    onClick={() => setActiveTab('images')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center space-x-2 ${activeTab === 'images' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                    <ImageIcon size={16} /> <span>Imagens</span>
                </button>
            </div>
        </header>

        {activeTab === 'titles' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {content.titles.map((title, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group">
                        <div className="flex items-center space-x-3 flex-1">
                            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-mono">{idx + 1}</span>
                            <p className="text-sm font-medium text-slate-800 pr-4">{title}</p>
                        </div>
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <span className="text-xs text-slate-400 font-mono">{title.length} chars</span>
                             <button onClick={() => copyToClipboard(title)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500" title="Copiar">
                                <Copy size={16} />
                             </button>
                             <button
                                onClick={() => handleSync(title, idx)}
                                disabled={syncedTitles.has(idx) || isSyncing === idx || !currentTenant.isConnected}
                                className={`p-2 rounded-full transition-colors ${
                                    syncedTitles.has(idx) 
                                    ? 'bg-green-100 text-green-600' 
                                    : !currentTenant.isConnected 
                                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                }`}
                                title={!currentTenant.isConnected ? "Cliente desconectado" : syncedTitles.has(idx) ? "Sincronizado" : "Sincronizar com ML"}
                            >
                                {syncedTitles.has(idx) ? <Check size={16} /> : <UploadCloud size={16} />}
                             </button>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {activeTab === 'description' && (
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-700">Preview da Descrição</h3>
                    <button onClick={() => copyToClipboard(JSON.stringify(content.description, null, 2))} className="text-indigo-600 hover:underline text-sm font-medium">Copiar JSON</button>
                </div>
                <div className="p-8 space-y-8 text-slate-700 leading-relaxed">
                    <section>
                        <h4 className="text-lg font-bold text-slate-900 mb-2">Introdução</h4>
                        <p>{content.description.introduction}</p>
                    </section>

                    <section>
                        <h4 className="text-lg font-bold text-slate-900 mb-4">Benefícios Principais</h4>
                        <ul className="space-y-2">
                            {content.description.benefits.map((b, i) => (
                                <li key={i} className="flex items-start space-x-2">
                                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>{b}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="bg-slate-50 p-6 rounded-lg border border-slate-100">
                         <h4 className="text-lg font-bold text-slate-900 mb-2">Ficha Técnica & Destaques</h4>
                         <p className="whitespace-pre-line">{content.description.specs}</p>
                    </section>

                    <section>
                        <h4 className="text-lg font-bold text-slate-900 mb-4">Perguntas Frequentes (FAQ)</h4>
                        <div className="space-y-4">
                            {content.description.faq.map((item, i) => (
                                <div key={i} className="border-l-2 border-indigo-200 pl-4">
                                    <p className="font-semibold text-slate-900">{item.question}</p>
                                    <p className="text-slate-600 mt-1">{item.answer}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        )}

        {activeTab === 'seo' && (
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Palavras-chave Estratégicas</h3>
                    <div className="flex flex-wrap gap-2">
                        {content.keywords.map((kw, i) => (
                            <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm border border-indigo-100">
                                {kw}
                            </span>
                        ))}
                    </div>
                </div>

                 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Tags para Mercado Livre</h3>
                    <div className="flex flex-wrap gap-2">
                        {content.tags.map((tag, i) => (
                            <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm font-mono border border-slate-200">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'images' && (
             <div className="grid grid-cols-1 gap-4">
                 <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm mb-2">
                     Use estes prompts em geradores de imagem (Midjourney, DALL-E 3) para criar fotos de alta conversão.
                 </div>
                {content.imagePrompts.map((prompt, idx) => (
                     <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h4 className="font-bold text-slate-800 mb-2">Prompt {idx + 1}</h4>
                        <p className="text-slate-600 text-sm font-mono bg-slate-50 p-3 rounded border border-slate-100">
                            {prompt}
                        </p>
                        <button onClick={() => copyToClipboard(prompt)} className="mt-3 text-indigo-600 text-sm font-medium hover:underline flex items-center">
                            <Copy size={14} className="mr-1"/> Copiar Prompt
                        </button>
                     </div>
                ))}
             </div>
        )}
    </div>
  );
};
