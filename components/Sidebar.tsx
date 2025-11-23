
import React from 'react';
import { LayoutDashboard, PlusCircle, Settings, ShoppingBag, Package, Users } from 'lucide-react';
import { AppView } from '../types';
import { ClientSelector } from './ClientSelector';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const navItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppView.CLIENTS, label: 'Clientes', icon: Users },
    { id: AppView.INPUT, label: 'Novo Anúncio', icon: PlusCircle },
    { id: AppView.RESULTS, label: 'Resultados', icon: Package },
    { id: AppView.SETTINGS, label: 'Configurações', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col border-r border-slate-800 shadow-xl z-20 hidden md:flex">
      {/* Brand Header */}
      <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
        <div className="w-8 h-8 bg-yellow-400 rounded-md flex items-center justify-center text-slate-900 font-bold">
            <ShoppingBag size={20} />
        </div>
        <span className="text-xl font-bold tracking-tight">MeliMass</span>
      </div>

      {/* Tenant Selector Area */}
      <div className="p-4 border-b border-slate-800">
        <p className="text-xs font-semibold text-slate-500 uppercase mb-2 px-1">Cliente Atual</p>
        <ClientSelector />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-yellow-400 text-slate-900 font-semibold shadow-md shadow-yellow-400/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-white'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center space-x-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                ADM
            </div>
            <div>
                <p className="text-sm font-medium text-slate-200">Administrador</p>
                <p className="text-xs text-slate-500">SaaS Manager</p>
            </div>
        </div>
      </div>
    </aside>
  );
};
