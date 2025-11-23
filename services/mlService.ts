
import { GeneratedContent, ListingStatus } from "../types";
import { api } from "./api";

// GET /products or /listings
// The backend will read X-Tenant-Id and apply RLS to return only this client's products
export const getListings = async (tenantId: string): Promise<ListingStatus[]> => {
  // We don't strictly need to pass tenantId as arg if context sets it, 
  // but we ensure consistency here.
  return api.get<ListingStatus[]>('/listings');
};

// POST /listings/sync
// Sends the AI generated content to the backend to create/update the listing on ML
export const syncWithMercadoLivre = async (title: string, content: GeneratedContent, tenantId: string): Promise<ListingStatus> => {
  
  if (!tenantId) throw new Error("Tenant context missing");

  const payload = {
    title,
    price: 0, // In a real app, this should be prompted or default
    description: content.description,
    attributes: content.description.specs,
    images: content.imagePrompts // In real app, these would be actual image URLs
  };

  return api.post<ListingStatus>('/listings/sync', payload);
};

// GET /ml/status
// Check if the current tenant has a valid token
export const checkConnectionStatus = async (): Promise<boolean> => {
    try {
        const status = await api.get<{ connected: boolean }>('/ml/status');
        return status.connected;
    } catch (e) {
        return false;
    }
}
