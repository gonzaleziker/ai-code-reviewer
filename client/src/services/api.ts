import axios from 'axios';
import type { ReviewRequest, ReviewResponse, HealthStatus } from '../types';

// For production (Vercel), set VITE_API_URL to your tunnel URL (e.g., ngrok)
// For local development, this defaults to /api which gets proxied by Vite
const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Log the API URL for debugging
console.log('API Base URL:', API_BASE);

export const api = {
  async reviewCode(request: ReviewRequest): Promise<ReviewResponse> {
    const response = await axios.post<ReviewResponse>(`${API_BASE}/review`, request);
    return response.data;
  },

  async getHealth(): Promise<HealthStatus> {
    const response = await axios.get<HealthStatus>(`${API_BASE}/health`);
    return response.data;
  },
};
