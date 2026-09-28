import axios from 'axios';

export interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, ''),
  timeout: 15000,
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  if (!config.baseURL) {
    throw new Error('Configure EXPO_PUBLIC_API_URL no arquivo .env para acessar a API.');
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError<ApiErrorResponse>(error) && !axios.isCancel(error)) {
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        error.message = 'A conexão demorou demais. Tente novamente.';
      } else if (!error.response) {
        error.message = 'Não foi possível conectar à API. Verifique sua conexão e tente novamente.';
      } else if (error.response.status === 422) {
        error.message = 'Confira os dados informados e tente novamente.';
      } else if (error.response.status === 404) {
        error.message = 'Imóvel não encontrado.';
      } else {
        error.message = 'Não foi possível concluir a solicitação. Tente novamente.';
      }
    }

    // Preserva status e response.data.errors para os formulários exibirem cada erro.
    return Promise.reject(error);
  },
);

export default api;
