
import React, { useState } from 'react';
import { X, Save, Link as LinkIcon, Loader2, AlertCircle } from 'lucide-react';
import { createClient, integrateClientWithML } from '../services/clientService';
import { useTenant } from '../contexts/TenantContext';

interface NewClientModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const NewClientModal: React.FC<NewClientModalProps> = ({ onClose, onSuccess }) => {
  const { switchTenant } = useTenant();
  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [integrating, setIntegrating] = useState(false);
  const [error, setError] = useState('');

  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 18);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'cnpj') {
      setFormData(prev => ({ ...prev, [name]: formatCNPJ(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (error) setError('');
  };

  const handleSubmit = async (shouldIntegrate: boolean) => {
    if (!formData.name) {
      setError('O nome do cliente é obrigatório.');
      return;
    }

    setLoading(true);
    if (shouldIntegrate) setIntegrating(true);

    try {
      // 1. Create Client in Backend (Real DB Insert)
      const newClient = await createClient(formData);
      
      // 2. Switch context to new client immediately
      switchTenant(newClient);

      if (shouldIntegrate) {
        // 3. Initiate Real OAuth Flow
        // This will redirect the window location to Mercado Livre
        await integrateClientWithML(newClient.id);
      } else {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar cliente. Tente novamente.');
      console.error(err);
      setLoading(false);
      setIntegrating(false);
    }
  };

  const baseInputClass = "w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden animate-fade-in z-10">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-800">Novo Cliente</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center">
              <AlertCircle size={16} className="mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nome do Cliente <span className="text-red-500">*</span></label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Minha Loja Ltda"
                className={`w-full px-4 py-3 rounded-lg bg-slate-50 border text-slate-900 placeholder-slate-400 outline-none transition-all focus:bg-white focus:ring-2 ${error && !formData.name ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-500 focus:border-transparent'}`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">CNPJ</label>
              <input
                name="cnpj"
                value={formData.cnpj}
                onChange={handleChange}
                placeholder="00.000.000/0000-00"
                maxLength={18}
                className={`${baseInputClass} font-mono`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email de Contato</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contato@empresa.com"
                className={baseInputClass}
              />
            </div>
          </div>
        </div>

        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3 justify-end">
           <button
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="flex-1 sm:flex-none px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold rounded-lg shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
             {integrating ? <Loader2 className="animate-spin w-4 h-4" /> : <LinkIcon size={18} />}
             <span>Salvar e Conectar ML</span>
          </button>
          
          <button
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="flex-1 sm:flex-none px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading && !integrating ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={18} />}
            <span>Salvar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
