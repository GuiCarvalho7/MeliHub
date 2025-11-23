import { Client } from "../types";
import { api } from "./api";

// GET /clients
// Backend must filter by user's access rights
export const getClients = async (): Promise<Client[]> => {
  return api.get<Client[]>('/clients', true); // Skip tenant header to list all available clients for the user
};

// GET /clients/:id
export const getClientById = async (id: string): Promise<Client> => {
  return api.get<Client>(`/clients/${id}`);
};

// POST /clients
export const createClient = async (data: Omit<Client, 'id' | 'createdAt' | 'status' | 'isConnected'>): Promise<Client> => {
  return api.post<Client>('/clients', data, true);
};

// POST /ml/connect
// This initiates the Real OAuth flow
export const integrateClientWithML = async (clientId: string): Promise<void> => {
  // 1. Request the backend to generate the specific OAuth URL for this tenant
  const response = await api.post<{ authUrl: string }>('/ml/connect', { clientId });

  if (response.authUrl) {
    // CHECK IF THIS IS A MOCK URL (Simulating the redirect loop locally)
    if (response.authUrl.includes('mock_oauth_callback=true')) {
        console.log("Simulating External Redirect to: ", response.authUrl);
        // In a real scenario, this would leave the app.
        // For the demo to work without a server, we manually trigger the 'connected' state
        // and reload the page to simulate returning from ML.
        await api._mockOAuthCallback(clientId);
        return; 
    }

    // 2. Real Redirect
    window.location.href = response.authUrl;
  } else {
    throw new Error('Backend não retornou URL de autenticação.');
  }
};