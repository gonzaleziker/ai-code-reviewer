import axios from 'axios';
import type { ReviewRequest, ReviewResponse, HealthStatus } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

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
