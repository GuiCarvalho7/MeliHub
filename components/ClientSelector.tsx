
import React, { useState, useEffect } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { getClients } from '../services/clientService';
import { Client } from '../types';
import { ChevronDown, Check, Building2, AlertTriangle, Loader2 } from 'lucide-react';

export const ClientSelector: React.FC = () => {
  const { currentTenant, switchTenant } = useTenant();
  const [clients, setClients] = useState<Client[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [pendingClient, setPendingClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await getClients();
      setClients(data);
    };
    load();
  }, []);

  const handleSelect = (client: Client) => {
    setIsOpen(false);
    if (client.id !== currentTenant?.id) {
        setPendingClient(client);
    }
  };

  const confirmSwitch = async () => {
    if (pendingClient) {
        setIsLoading(true);
        // Simulate API call to switch session context
        await new Promise(r => setTimeout(r, 600));
        switchTenant(pendingClient);
        setIsLoading(false);
        setPendingClient(null);
    }
  };

  if (!currentTenant) return <div className="h-10 w-full bg-slate-800/50 animate-pulse rounded-lg"></div>;

  return (
    <>
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-slate-800 hover:bg-slate-700 p-3 rounded-lg flex items-center justify-between transition-colors group border border-slate-700/50"
        >
          <div className="flex items-center space-x-3 overflow-hidden">
             <div className="w-8 h-8 rounded bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-slate-900 font-bold text-xs flex-shrink-0">
                {currentTenant.name.substring(0, 2).toUpperCase()}
             </div>
             <div className="text-left overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">{currentTenant.name}</p>
                <p className="text-xs text-slate-400 truncate">Tenant ID: {currentTenant.id}</p>
             </div>
          </div>
          <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 animate-fade-in">
             <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                Trocar Cliente
             </div>
             <div className="max-h-60 overflow-y-auto">
                {clients.map(client => (
                    <button
                        key={client.id}
                        onClick={() => handleSelect(client)}
                        className={`w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center justify-between group transition-colors ${currentTenant.id === client.id ? 'bg-indigo-50' : ''}`}
                    >
                        <div className="flex items-center space-x-3">
                            <Building2 size={16} className={currentTenant.id === client.id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'} />
                            <div>
                                <p className={`text-sm font-medium ${currentTenant.id === client.id ? 'text-indigo-700' : 'text-slate-700'}`}>{client.name}</p>
                                <p className="text-xs text-slate-400">{client.cnpj}</p>
                            </div>
                        </div>
                        {currentTenant.id === client.id && <Check size={16} className="text-indigo-600" />}
                    </button>
                ))}
             </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {pendingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isLoading && setPendingClient(null)}></div>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 p-6 animate-fade-in">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 mb-2">
                        <AlertTriangle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Trocar contexto de acesso?</h3>
                    <p className="text-slate-600">
                        Você está prestes a mudar para o ambiente de <strong>{pendingClient.name}</strong>. 
                        Todos os dados exibidos (produtos, vendas, integrações) serão atualizados.
                    </p>
                    
                    <div className="flex w-full space-x-3 mt-6">
                        <button 
                            onClick={() => setPendingClient(null)}
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={confirmSwitch}
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:opacity-70"
                        >
                            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Confirmar Troca'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </>
  );
};
