import axios from 'axios';

export interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

export function resolveApiBaseUrl(): string | undefined {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '');

  // No navegador dentro do GitHub Codespaces, requisições para 'localhost:8000'
  // falham porque tentam acessar a máquina do usuário ou são bloqueadas por Mixed Content (HTTPS -> HTTP).
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    const isCodespace =
      hostname.endsWith('.app.github.dev') || hostname.endsWith('.preview.app.github.dev');

    if (isCodespace && (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
      const backendHostname = hostname.replace(/-\d+(\.(?:preview\.)?app\.github\.dev)$/, '-8000$1');
      return `${window.location.protocol}//${backendHostname}/api/v1`;
    }
  }

  return envUrl;
}

export const api = axios.create({
  baseURL: resolveApiBaseUrl(),
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
      } else if (error.response.status === 413) {
        // O servidor/proxy barra a foto antes da validação do Laravel (sem 422).
        error.message = 'A foto é grande demais. Escolha uma imagem de até 2 MB.';
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
