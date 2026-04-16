/**
 * API Client for calling the Cloudflare Worker API backend
 * Used by Cloudflare Pages frontend to communicate with Workers API
 */

const getWorkerUrl = (): string => {
  // In production (Pages), use the Workers URL
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return 'https://pettypet.philip-dewanto.workers.dev';
  }
  // In development, use localhost
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
};

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = getWorkerUrl();
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('pettypet_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('pettypet_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pettypet_token');
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Authentication endpoints
  async signup(email: string, password: string, name: string) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Tasks endpoints
  async getTasks(petId?: string) {
    const endpoint = petId ? `/tasks?pet_id=eq.${petId}` : '/tasks';
    return this.request<any[]>(endpoint);
  }

  async getTask(id: string) {
    return this.request(`/tasks?id=eq.${id}`);
  }

  async createTask(data: any) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(id: string, data: any) {
    return this.request(`/tasks?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: string) {
    return this.request(`/tasks?id=eq.${id}`, {
      method: 'DELETE',
    });
  }

  // Pets endpoints
  async getPets() {
    return this.request<any[]>('/pets');
  }

  async getPet(id: string) {
    return this.request(`/pets?id=eq.${id}`);
  }

  async createPet(data: any) {
    return this.request('/pets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePet(id: string, data: any) {
    return this.request(`/pets?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePet(id: string) {
    return this.request(`/pets?id=eq.${id}`, {
      method: 'DELETE',
    });
  }

  // Users endpoints
  async getProfile() {
    return this.request('/users/profile');
  }

  async updateProfile(data: any) {
    return this.request('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient();
