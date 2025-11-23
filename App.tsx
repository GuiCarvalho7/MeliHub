
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { InputForm } from './components/InputForm';
import { ResultsView } from './components/ResultsView';
import { Dashboard } from './components/Dashboard';
import { ClientsView } from './components/ClientsView';
import { SettingsView } from './components/SettingsView'; // Import Settings
import { ProductData, GeneratedContent, AppView } from './types';
import { Menu } from 'lucide-react';
import { TenantProvider, useTenant } from './contexts/TenantContext';
import { api } from './services/api'; // Import API service directly

const MainContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { settings } = useTenant(); // Access global settings

  const handleGenerate = async (data: ProductData) => {
    setIsGenerating(true);
    try {
      // Calls the Backend API instead of service directly
      const content = await api.post<GeneratedContent>('/listings/generate', { 
          ...data,
          // Inject provider choice and key from Context Settings
          provider: settings.defaultProvider,
          openaiApiKey: settings.openaiApiKey 
      });

      setGeneratedContent(content);
      setCurrentView(AppView.RESULTS);
    } catch (error: any) {
      alert(`Falha ao gerar conteúdo: ${error.message}`);
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.CLIENTS:
        return <ClientsView />;
      case AppView.INPUT:
        return <InputForm onGenerate={handleGenerate} isLoading={isGenerating} />;
      case AppView.RESULTS:
        return generatedContent ? (
          <ResultsView content={generatedContent} />
        ) : (
          <div className="text-center mt-20 text-slate-400">
            <p>Nenhum resultado gerado ainda.</p>
            <button onClick={() => setCurrentView(AppView.INPUT)} className="text-indigo-600 font-medium hover:underline mt-2">Criar novo anúncio</button>
          </div>
        );
      case AppView.DASHBOARD:
        return <Dashboard />;
      case AppView.SETTINGS:
        return <SettingsView />; // Render the new Settings Component
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900 text-white z-30 px-4 py-3 flex items-center justify-between shadow-md">
         <span className="font-bold text-lg">MeliMass</span>
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu />
         </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900 z-40 pt-16 px-6 space-y-4 md:hidden">
             <button onClick={() => { setCurrentView(AppView.DASHBOARD); setIsMobileMenuOpen(false); }} className="block text-white text-lg py-2">Dashboard</button>
             <button onClick={() => { setCurrentView(AppView.CLIENTS); setIsMobileMenuOpen(false); }} className="block text-white text-lg py-2">Clientes</button>
             <button onClick={() => { setCurrentView(AppView.INPUT); setIsMobileMenuOpen(false); }} className="block text-white text-lg py-2">Novo Anúncio</button>
             <button onClick={() => { setCurrentView(AppView.RESULTS); setIsMobileMenuOpen(false); }} className="block text-white text-lg py-2">Resultados</button>
             <button onClick={() => { setCurrentView(AppView.SETTINGS); setIsMobileMenuOpen(false); }} className="block text-white text-lg py-2">Configurações</button>
        </div>
      )}

      <main className="flex-1 md:ml-64 p-6 md:p-12 mt-12 md:mt-0 transition-all">
        {renderContent()}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <TenantProvider>
      <MainContent />
    </TenantProvider>
  );
};

export default App;
