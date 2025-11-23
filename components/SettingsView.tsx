
import React, { useState } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { Save, AlertTriangle, Key, Cpu, CheckCircle, X } from 'lucide-react';
import { AIProvider } from '../types';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, currentTenant } = useTenant();
  const [openaiKey, setOpenaiKey] = useState(settings.openaiApiKey || '');
  const [provider, setProvider] = useState<AIProvider>(settings.defaultProvider);
  const [saved, setSaved] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSave = () => {
    updateSettings({
      defaultProvider: provider,
      openaiApiKey: openaiKey
    });
    
    // Trigger Visual Feedback
    setSaved(true);
    setShowToast(true);
    
    // Reset states after delay
    setTimeout(() => {
        setSaved(false);
        setShowToast(false);
    }, 4000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in relative">
        <h2 className="text-3xl font-bold text-slate-800">Configurações</h2>
        
        {/* Toast Notification - Feedback Visual */}
        {showToast && (
             <div className="fixed top-6 right-6 z-50 animate-fade-in">
                <div className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-4 border border-green-500">
                    <div className="bg-white/20 p-2 rounded-full">
                        <CheckCircle size={24} className="text-white" />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg">Configurações Salvas!</h4>
                        <p className="text-green-100 text-sm">Suas preferências de IA foram atualizadas com sucesso.</p>
                    </div>
                    <button onClick={() => setShowToast(false)} className="text-white/60 hover:text-white transition-colors ml-2">
                        <X size={20} />
                    </button>
                </div>
             </div>
        )}

        {/* Connection Status */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <Cpu className="mr-2 text-slate-500" size={20} />
                Status da Conta Atual
             </h3>
             <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                 <div>
                    <p className="font-semibold text-slate-700">{currentTenant?.name || 'Nenhum cliente selecionado'}</p>
                    <p className="text-xs text-slate-500">Tenant ID: {currentTenant?.id}</p>
                 </div>
                 <div>
                     {currentTenant?.isConnected ? (
                         <span className="flex items-center text-green-600 font-bold text-sm bg-green-100 px-3 py-1 rounded-full border border-green-200">
                             <CheckCircle size={14} className="mr-1"/> Conectado ao Mercado Livre
                         </span>
                     ) : (
                         <span className="flex items-center text-red-500 font-bold text-sm bg-red-50 px-3 py-1 rounded-full border border-red-200">
                             <AlertTriangle size={14} className="mr-1"/> Não Conectado
                         </span>
                     )}
                 </div>
             </div>
        </div>

        {/* AI Settings */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <Cpu className="mr-2 text-slate-500" size={20} />
                Inteligência Artificial (IA)
             </h3>
             
             <div className="space-y-6">
                 <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-3">Provedor de IA Padrão</label>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <button 
                            onClick={() => setProvider('gemini')}
                            className={`p-4 rounded-lg border-2 text-left transition-all ${provider === 'gemini' ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-slate-200 hover:border-slate-300'}`}
                         >
                             <div className="flex justify-between items-center mb-1">
                                 <span className="font-bold text-slate-900">Google Gemini 2.5</span>
                                 {provider === 'gemini' && <CheckCircle size={18} className="text-indigo-600" />}
                             </div>
                             <p className="text-xs text-slate-500">Rápido, gratuito (via API key do ambiente) e eficiente para textos longos.</p>
                         </button>

                         <button 
                            onClick={() => setProvider('openai')}
                            className={`p-4 rounded-lg border-2 text-left transition-all ${provider === 'openai' ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-slate-200 hover:border-slate-300'}`}
                         >
                             <div className="flex justify-between items-center mb-1">
                                 <span className="font-bold text-slate-900">OpenAI GPT-4</span>
                                 {provider === 'openai' && <CheckCircle size={18} className="text-indigo-600" />}
                             </div>
                             <p className="text-xs text-slate-500">Qualidade de escrita premium. Requer sua própria chave de API.</p>
                         </button>
                     </div>
                 </div>

                 {provider === 'openai' && (
                     <div className="animate-fade-in bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Sua Chave de API OpenAI (sk-...)</label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="password" 
                                value={openaiKey}
                                onChange={(e) => setOpenaiKey(e.target.value)}
                                placeholder="sk-proj-..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 bg-white"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-2 flex items-center">
                            <AlertTriangle size={12} className="mr-1" />
                            Sua chave é salva apenas no navegador localmente e nunca é compartilhada.
                        </p>
                     </div>
                 )}
             </div>

             <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                 <button 
                    onClick={handleSave}
                    className={`
                        font-semibold py-3 px-8 rounded-lg transition-all flex items-center space-x-2 shadow-md
                        ${saved 
                            ? 'bg-green-600 hover:bg-green-700 text-white transform scale-105' 
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:-translate-y-0.5'
                        }
                    `}
                 >
                     {saved ? <CheckCircle size={20} /> : <Save size={20} />}
                     <span>{saved ? 'Alterações Salvas!' : 'Salvar Alterações'}</span>
                 </button>
             </div>
        </div>
    </div>
  );
};
