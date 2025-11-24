
export interface ProductData {
  nome_do_produto: string;
  categoria: string;
  caracteristicas: string;
  publico_alvo: string;
  diferencial_produto: string;
  concorrentes: string;
  palavras_chave_base: string;
}

export interface GeneratedFAQ {
  question: string;
  answer: string;
}

export interface GeneratedDescription {
  introduction: string;
  benefits: string[];
  specs: string;
  faq: GeneratedFAQ[];
  tips: string;
  conclusion: string;
}

export interface GeneratedContent {
  keywords: string[];
  titles: string[];
  description: GeneratedDescription;
  tags: string[];
  imagePrompts: string[];
}

export interface ListingStatus {
  id: string;
  title: string;
  price: number;
  status: 'draft' | 'synced' | 'error';
  lastUpdated: Date;
  tenantId: string; // Added for RLS
  meliItemId?: string;
}

export interface Client {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  status: 'Ativo' | 'Inativo' | 'Pendente';
  isConnected: boolean;
  createdAt: Date;
}

export enum AppView {
  INPUT = 'input',
  RESULTS = 'results',
  DASHBOARD = 'dashboard',
  CLIENTS = 'clients',
  SETTINGS = 'settings'
}

export type AIProvider = 'gemini' | 'openai';

export interface AppSettings {
  defaultProvider: AIProvider;
  openaiApiKey?: string;
  // Mercado Livre Config
  mlAppId?: string;
  mlRedirectUri?: string;
}

export interface TenantContextType {
  currentTenant: Client | null;
  switchTenant: (client: Client) => void;
  isLoading: boolean;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
}

// --- DATABASE SCHEMA INTERFACES ---

export interface MeliCredential {
  tenant_id: string;
  access_token: string;
  refresh_token: string;
  user_id_meli: number;
  token_expires_at: number; // Timestamp
  updated_at: string;
}

export interface MeliPkceStorage {
  tenant_id: string;
  nonce: string; // Used as 'state'
  code_verifier: string;
  expires_at: number;
}
