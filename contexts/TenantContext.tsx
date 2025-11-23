
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client, TenantContextType, AppSettings } from '../types';
import { getClients } from '../services/clientService';
import { api } from '../services/api';

const TenantContext = createContext<TenantContextType | undefined>(undefined);

const DEFAULT_SETTINGS: AppSettings = {
  defaultProvider: 'gemini',
  openaiApiKey: ''
};

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTenant, setCurrentTenant] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const initSession = async () => {
      try {
        // 1. Load Settings
        const storedSettings = localStorage.getItem('app_settings');
        if (storedSettings) {
          setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) });
        }

        // 2. Fetch clients permitted for this user
        const clients = await getClients();
        
        // 3. Check if there is a stored tenant preference
        const storedTenantId = localStorage.getItem('tenant_id');
        
        let activeClient = null;

        if (storedTenantId) {
          activeClient = clients.find(c => c.id === storedTenantId);
        }

        // 4. Fallback to first available client
        if (!activeClient && clients.length > 0) {
          activeClient = clients[0];
        }

        if (activeClient) {
            await switchTenant(activeClient);
        }

      } catch (error) {
        console.error("Failed to initialize tenant session", error);
      } finally {
        setIsLoading(false);
      }
    };
    initSession();
  }, []);

  const switchTenant = async (client: Client) => {
    // 1. Persist local state for API Header injection
    localStorage.setItem('tenant_id', client.id);
    
    // 2. Notify Backend of Session Switch (Audit Log & Token Refresh if needed)
    try {
        await api.post('/session/switch-tenant', { tenantId: client.id }, true);
    } catch (e) {
        console.warn("Backend switch-tenant notification failed", e);
    }

    // 3. Update React State
    setCurrentTenant(client);
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('app_settings', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <TenantContext.Provider value={{ currentTenant, switchTenant, isLoading, settings, updateSettings }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
