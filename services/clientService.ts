
import { Client } from "../types";
import { api } from "./api";

// GET /clients
export const getClients = async (): Promise<Client[]> => {
  return api.get<Client[]>('/clients', true);
};

// GET /clients/:id
export const getClientById = async (id: string): Promise<Client> => {
  return api.get<Client>(`/clients/${id}`);
};

// POST /clients
export const createClient = async (data: Omit<Client, 'id' | 'createdAt' | 'status' | 'isConnected'>): Promise<Client> => {
  return api.post<Client>('/clients', data, true);
};

// POST /ml/auth/start (PKCE Flow)
export const integrateClientWithML = async (clientId: string): Promise<void> => {
  try {
      // Sends the ID of the client we want to connect in the body.
      // The backend reads this to generate the correct state/nonce for that tenant.
      const response = await api.post<{ authUrl: string }>('/ml/auth/start', { targetTenantId: clientId });

      if (response.authUrl) {
        // Redirect to Mercado Livre Authorization Page
        window.location.href = response.authUrl;
      } else {
        throw new Error("URL de autenticação não gerada pelo backend.");
      }
  } catch (error: any) {
      // Re-throw so the UI can handle/display the specific error message
      throw error;
  }
};
