
import React, { useEffect, useState } from 'react';
import { getListings } from '../services/mlService';
import { ListingStatus } from '../types';
import { ExternalLink, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useTenant } from '../contexts/TenantContext';

export const Dashboard: React.FC = () => {
    const { currentTenant } = useTenant();
    const [listings, setListings] = useState<ListingStatus[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Reset state when tenant changes
        setLoading(true);
        
        if (currentTenant) {
            loadListings(currentTenant.id);
        }
    }, [currentTenant]);

    const loadListings = async (tenantId: string) => {
        try {
            const data = await getListings(tenantId);
            setListings(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    if (!currentTenant) return <div className="flex h-64 items-center justify-center text-slate-400">Selecione um cliente...</div>;
    if (loading) return <div className="flex h-64 items-center justify-center text-slate-400">Carregando dados de {currentTenant.name}...</div>;

    if (!currentTenant.isConnected) {
         return (
             <div className="flex flex-col items-center justify-center h-full space-y-4 animate-fade-in">
                 <h2 className="text-2xl font-bold text-slate-800">Conecte a conta do cliente</h2>
                 <p className="text-slate-500 max-w-md text-center">
                    O cliente <strong>{currentTenant.name}</strong> ainda não possui uma integração ativa com o Mercado Livre.
                </p>
                 <button className="bg-yellow-400 text-slate-900 px-6 py-3 rounded-lg font-bold hover:bg-yellow-300 transition-colors shadow-lg">
                     Conectar conta ML de {currentTenant.name}
                 </button>
             </div>
         )
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-slate-500 text-sm font-medium">Anúncios Sincronizados</p>
                    <p className="text-4xl font-bold text-slate-800 mt-2">{listings.filter(l => l.status === 'synced').length}</p>
                </div>
                 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-slate-500 text-sm font-medium">Rascunhos (Drafts)</p>
                    <p className="text-4xl font-bold text-slate-800 mt-2">{listings.filter(l => l.status === 'draft').length}</p>
                </div>
                 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-slate-500 text-sm font-medium">Erros de Sincronização</p>
                    <p className="text-4xl font-bold text-red-500 mt-2">{listings.filter(l => l.status === 'error').length}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700">Atividade Recente - {currentTenant.name}</h3>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-mono">Tenant ID: {currentTenant.id}</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-3 text-left">ID</th>
                                <th className="px-6 py-3 text-left">Título do Anúncio</th>
                                <th className="px-6 py-3 text-left">Status</th>
                                <th className="px-6 py-3 text-left">Atualizado</th>
                                <th className="px-6 py-3 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {listings.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        Nenhum anúncio encontrado para este cliente.
                                    </td>
                                </tr>
                            ) : (
                                listings.map((listing) => (
                                    <tr key={listing.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-mono text-slate-500">{listing.id}</td>
                                        <td className="px-6 py-4 text-sm text-slate-800 font-medium">{listing.title}</td>
                                        <td className="px-6 py-4">
                                            {listing.status === 'synced' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle size={12} className="mr-1"/> Ativo</span>}
                                            {listing.status === 'draft' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><Clock size={12} className="mr-1"/> Rascunho</span>}
                                            {listing.status === 'error' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><AlertCircle size={12} className="mr-1"/> Falha</span>}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{listing.lastUpdated.toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-indigo-600 hover:text-indigo-800">
                                                <ExternalLink size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
