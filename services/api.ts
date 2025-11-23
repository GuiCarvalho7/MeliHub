
import { Client, ListingStatus, ProductData, GeneratedContent, AIProvider } from '../types';
import { generateListingGemini } from './geminiService';
import { generateListingOpenAI } from './openaiService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
const USE_MOCK_BACKEND = true; // Set to false when you have a real server running

interface RequestOptions extends RequestInit {
  skipTenant?: boolean;
}

// --- MOCK DATABASE & BACKEND SIMULATION ---
class MockBackend {
  private getStorage<T>(key: string, defaultVal: T): T {
    const stored = localStorage.getItem(`db_${key}`);
    if (!stored && key === 'clients') {
        const seed = [
            { id: 'cli_demo_1', name: 'Loja Exemplo Ltda', cnpj: '12.345.678/0001-99', email: 'contato@lojaexemplo.com.br', status: 'Ativo', isConnected: false, createdAt: new Date().toISOString() },
            { id: 'cli_demo_2', name: 'Mega Varejo SA', cnpj: '98.765.432/0001-88', email: 'sac@megavarejo.com', status: 'Ativo', isConnected: true, createdAt: new Date(Date.now() - 86400000).toISOString() }
        ];
        this.setStorage('clients', seed);
        return seed as any;
    }
    return stored ? JSON.parse(stored) : defaultVal;
  }

  private setStorage(key: string, val: any) {
    localStorage.setItem(`db_${key}`, JSON.stringify(val));
  }

  private checkRLS(headers: HeadersInit | undefined) {
    const h = headers as Record<string, string>;
    const tenantId = h?.['X-Tenant-Id'];
    if (!tenantId) throw new Error("Security Violation: Missing Tenant Context (RLS)");
    return tenantId;
  }

  // --- LOG REQUESTS ---
  private async logAudit(tenantId: string, action: string, details: any) {
      const logs = this.getStorage<any[]>('audit_logs', []);
      logs.push({
          id: crypto.randomUUID(),
          tenantId,
          action,
          details,
          timestamp: new Date().toISOString()
      });
      this.setStorage('audit_logs', logs);
  }

  async handleRequest(endpoint: string, method: string, body: any, headers: HeadersInit | undefined): Promise<any> {
    console.log(`[MockAPI] ${method} ${endpoint}`, { body, headers });
    
    // Simulate latency (longer for generation)
    const delay = endpoint === '/listings/generate' ? 2000 : 600;
    await new Promise(r => setTimeout(r, delay));

    // --- ENDPOINTS ---

    if (endpoint === '/clients' && method === 'GET') {
      return this.getStorage<Client[]>('clients', []);
    }

    if (endpoint.startsWith('/clients/') && method === 'GET') {
        const id = endpoint.split('/')[2];
        const clients = this.getStorage<Client[]>('clients', []);
        const client = clients.find(c => c.id === id);
        if (!client) throw new Error("Client not found");
        return client;
    }

    if (endpoint === '/clients' && method === 'POST') {
      const clients = this.getStorage<Client[]>('clients', []);
      const newClient: Client = {
        id: crypto.randomUUID(),
        ...body,
        status: 'Ativo',
        isConnected: false,
        createdAt: new Date().toISOString(),
      };
      clients.push(newClient);
      this.setStorage('clients', clients);
      return newClient;
    }

    if (endpoint === '/session/switch-tenant' && method === 'POST') {
      return { success: true };
    }

    if (endpoint === '/ml/connect' && method === 'POST') {
      const fakeAuthUrl = `?mock_oauth_callback=true&client_id=${body.clientId}`;
      return { authUrl: fakeAuthUrl };
    }

    if (endpoint === '/ml/status' && method === 'GET') {
        const tenantId = this.checkRLS(headers);
        const clients = this.getStorage<Client[]>('clients', []);
        const client = clients.find(c => c.id === tenantId);
        return { connected: !!client?.isConnected };
    }

    if (endpoint === '/listings' && method === 'GET') {
      const tenantId = this.checkRLS(headers);
      const allListings = this.getStorage<ListingStatus[]>('listings', []);
      return allListings
        .filter(l => l.tenantId === tenantId)
        .map(l => ({ ...l, lastUpdated: new Date(l.lastUpdated) }));
    }

    // GENERATE LISTING (AI)
    if (endpoint === '/listings/generate' && method === 'POST') {
        const tenantId = this.checkRLS(headers);
        const { provider, openaiApiKey, ...productData } = body;

        await this.logAudit(tenantId, 'GENERATE_LISTING', { product: productData.nome_do_produto, provider });

        // Route to Provider
        if (provider === 'openai') {
            return await generateListingOpenAI(productData as ProductData, openaiApiKey);
        } else {
            // Default to Gemini
            return await generateListingGemini(productData as ProductData);
        }
    }

    if (endpoint === '/listings/sync' && method === 'POST') {
      const tenantId = this.checkRLS(headers);
      const allListings = this.getStorage<ListingStatus[]>('listings', []);
      
      const newListing: ListingStatus = {
        id: `MLB${Math.floor(Math.random() * 1000000000)}`,
        title: body.title,
        price: body.price || 0,
        status: 'synced',
        lastUpdated: new Date().toISOString() as any,
        tenantId: tenantId
      };

      allListings.push(newListing);
      this.setStorage('listings', allListings);
      return { ...newListing, lastUpdated: new Date(newListing.lastUpdated) };
    }

    throw new Error(`Mock Endpoint not found: ${method} ${endpoint}`);
  }

  async simulateOAuthCallback(clientId: string) {
      const clients = this.getStorage<Client[]>('clients', []);
      const idx = clients.findIndex(c => c.id === clientId);
      if (idx !== -1) {
          clients[idx].isConnected = true;
          this.setStorage('clients', clients);
      }
  }
}

const mockBackend = new MockBackend();

// --- MAIN API SERVICE ---
class ApiService {
  private getHeaders(skipTenant: boolean = false): HeadersInit {
    const headers: any = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    const token = localStorage.getItem('auth_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!skipTenant) {
      const tenantId = localStorage.getItem('tenant_id');
      if (tenantId) headers['X-Tenant-Id'] = tenantId;
    }
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { skipTenant, ...fetchOptions } = options;
    const headers = { ...this.getHeaders(skipTenant), ...fetchOptions.headers };

    if (USE_MOCK_BACKEND) {
        try {
            let body = undefined;
            if (fetchOptions.body) {
                 body = typeof fetchOptions.body === 'string' ? JSON.parse(fetchOptions.body) : fetchOptions.body;
            }
            const response = await mockBackend.handleRequest(endpoint, fetchOptions.method || 'GET', body, headers);
            
            if (Array.isArray(response)) {
                return response.map(item => this.parseDates(item)) as T;
            } else {
                return this.parseDates(response) as T;
            }
        } catch (e: any) {
            console.error("Mock Request Error", e);
            throw e;
        }
    }

    const url = `${API_BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url, { ...fetchOptions, headers: headers });
      if (response.status === 401) { window.location.href = '/login'; throw new Error('Auth Error'); }
      if (!response.ok) throw new Error(`API Error ${response.status}`);
      if (response.status === 204) return {} as T;
      
      const data = await response.json();
      return (Array.isArray(data) ? data.map(i => this.parseDates(i)) : this.parseDates(data)) as T;
    } catch (error) {
      throw error;
    }
  }

  private parseDates(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return obj;
    for (const key in obj) {
        const value = obj[key];
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) obj[key] = new Date(value);
        else if (typeof value === 'object') this.parseDates(value);
    }
    return obj;
  }

  public get<T>(endpoint: string, skipTenant?: boolean) { return this.request<T>(endpoint, { method: 'GET', skipTenant }); }
  public post<T>(endpoint: string, body: any, skipTenant?: boolean) { return this.request<T>(endpoint, { method: 'POST', body: JSON.stringify(body), skipTenant }); }
  public async _mockOAuthCallback(clientId: string) { if (USE_MOCK_BACKEND) await mockBackend.simulateOAuthCallback(clientId); }
}

export const api = new ApiService();
