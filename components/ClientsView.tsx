
import React, { useState, useEffect } from 'react';
import { Client } from '../types';
import { getClients, integrateClientWithML } from '../services/clientService';
import { Search, Plus, Filter, ChevronLeft, ChevronRight, User, Calendar, Mail, Link, Loader2, CheckCircle, ExternalLink } from 'lucide-react';
import { NewClientModal } from './NewClientModal';

export const ClientsView: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [sortField, setSortField] = useState<'name' | 'createdAt'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Track which client is currently being connected to show loading spinner
  const [connectingClientId, setConnectingClientId] = useState<string | null>(null);

  const itemsPerPage = 8;

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    const data = await getClients();
    setClients(data);
    setLoading(false);
  };

  const handleSort = (field: 'name' | 'createdAt') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleConnectML = async (e: React.MouseEvent, client: Client) => {
      e.stopPropagation(); // Prevent row click
      setConnectingClientId(client.id);
      
      try {
          // Simulate OAuth process
          await integrateClientWithML(client.id);
          // Refresh list to show updated status
          await loadClients();
      } catch (error) {
          console.error("Integration failed", error);
      } finally {
          setConnectingClientId(null);
      }
  };

  // Filter & Sort Logic
  const filteredClients = clients
    .filter(client => 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.cnpj.includes(searchTerm)
    )
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else {
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Pagination Logic
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const currentClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Gestão de Clientes</h2>
          <p className="text-slate-500 mt-1">Gerencie sua carteira e integrações.</p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Novo Cliente</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => handleSort('name')}
                className={`px-4 py-2.5 rounded-lg border flex items-center space-x-2 text-sm font-medium transition-colors ${sortField === 'name' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
                <Filter size={16} />
                <span>Nome</span>
            </button>
             <button 
                onClick={() => handleSort('createdAt')}
                className={`px-4 py-2.5 rounded-lg border flex items-center space-x-2 text-sm font-medium transition-colors ${sortField === 'createdAt' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
                <Calendar size={16} />
                <span>Data</span>
            </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        {loading && clients.length === 0 ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
            <p>Carregando clientes...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
             <User size={48} className="mx-auto mb-4 opacity-20" />
             <p className="text-lg font-medium text-slate-600">Nenhum cliente encontrado</p>
             <p className="text-sm">Tente ajustar sua busca ou adicione um novo cliente.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente / Integração</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">CNPJ</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contato</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Criado em</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentClients.map((client) => (
                  <tr 
                    key={client.id} 
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    onClick={() => console.log('Go to details', client.id)}
                  >
                    <td className="px-6 py-4">
                        <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm mr-3 flex-shrink-0">
                                {client.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-slate-800">{client.name}</span>
                                
                                {/* Connection Button Area */}
                                <div className="mt-1">
                                    {client.isConnected ? (
                                        <span className="inline-flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                            <CheckCircle size={10} className="mr-1" />
                                            Loja Conectada
                                        </span>
                                    ) : (
                                        <button
                                            onClick={(e) => handleConnectML(e, client)}
                                            disabled={connectingClientId === client.id}
                                            className="inline-flex items-center text-xs font-semibold text-yellow-800 bg-yellow-100 hover:bg-yellow-200 px-2 py-1 rounded-md border border-yellow-200 transition-colors shadow-sm"
                                        >
                                            {connectingClientId === client.id ? (
                                                <Loader2 size={10} className="animate-spin mr-1" />
                                            ) : (
                                                <Link size={10} className="mr-1" />
                                            )}
                                            {connectingClientId === client.id ? 'Conectando...' : 'Conectar ML'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className="font-mono text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">{client.cnpj || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-slate-500">
                            <Mail size={14} className="mr-2" />
                            {client.email}
                        </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        client.status === 'Ativo' ? 'bg-green-50 text-green-700 border-green-200' : 
                        client.status === 'Inativo' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            client.status === 'Ativo' ? 'bg-green-500' : 
                            client.status === 'Inativo' ? 'bg-red-500' :
                            'bg-yellow-500'
                        }`}></span>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {client.createdAt.toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-indigo-50">
                            <ChevronRight size={18} />
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Footer / Pagination */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm text-slate-500">
                Mostrando <span className="font-medium">{filteredClients.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> até <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredClients.length)}</span> de <span className="font-medium">{filteredClients.length}</span> resultados
            </span>
            
            <div className="flex space-x-2">
                <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-slate-300 rounded-md bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={18} />
                </button>
                <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-2 border border-slate-300 rounded-md bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
      </div>

      {showModal && (
        <NewClientModal 
            onClose={() => setShowModal(false)} 
            onSuccess={() => {
                loadClients();
            }} 
        />
      )}
    </div>
  );
};
