import api from './api';
import type {
  CreateImovelDTO,
  FotoImovel,
  Imovel,
  ImovelFiltros,
  ImovelResponse,
  PaginatedResponse,
  UpdateFotoResponse,
  UpdateImovelDTO,
} from '../types/imovel';

const multipartConfig = { headers: { 'Content-Type': 'multipart/form-data' } };

async function uriParaBlob(uri: string): Promise<Blob> {
  if (uri.startsWith('data:')) {
    const partes = uri.split(',');
    const cabecalho = partes[0] ?? '';
    const mime = cabecalho.match(/:(.*?);/)?.[1] || 'image/jpeg';
    const base64 = partes[1] ?? '';
    const bytes = atob(base64);
    const u8arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      u8arr[i] = bytes.charCodeAt(i);
    }
    return new Blob([u8arr], { type: mime });
  }

  const fetchFn =
    typeof window !== 'undefined' && typeof window.fetch === 'function'
      ? window.fetch.bind(window)
      : fetch;
  const response = await fetchFn(uri);
  return await response.blob();
}

async function appendFoto(formData: FormData, foto: FotoImovel): Promise<void> {
  // No navegador (Web), a API FormData padrão do DOM exige um Blob/File real.
  // Passar um objeto { uri, name, type } faz o navegador serializá-lo como "[object Object]",
  // fazendo a validação 'image' do Laravel falhar com "O arquivo enviado deve ser uma imagem válida.".
  if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
    try {
      const blob = await uriParaBlob(foto.uri);
      formData.append('foto', blob, foto.name);
      return;
    } catch {
      // Se falhar a conversão para blob, faz fallback para o append padrão do React Native
    }
  }

  // React Native aceita arquivos por URI; a assinatura DOM só conhece Blob.
  formData.append('foto', foto as unknown as Blob);
}

async function toFormData(dados: UpdateImovelDTO): Promise<FormData> {
  const formData = new FormData();
  const { foto, ...campos } = dados;

  for (const [campo, valor] of Object.entries(campos)) {
    if (valor !== undefined) {
      formData.append(campo, typeof valor === 'boolean' ? (valor ? '1' : '0') : String(valor));
    }
  }

  if (foto) await appendFoto(formData, foto);
  return formData;
}

export const imovelService = {
  async list(filtros: ImovelFiltros = {}): Promise<PaginatedResponse<Imovel>> {
    const response = await api.get<PaginatedResponse<Imovel>>('/imoveis', { params: filtros });
    return response.data;
  },

  async getById(id: number): Promise<Imovel> {
    const response = await api.get<ImovelResponse>(`/imoveis/${id}`);
    return response.data.data;
  },

  async create(dados: CreateImovelDTO): Promise<Imovel> {
    const response = dados.foto
      ? await api.post<ImovelResponse>('/imoveis', await toFormData(dados), multipartConfig)
      : await api.post<ImovelResponse>('/imoveis', dados);
    return response.data.data;
  },

  async update(id: number, dados: UpdateImovelDTO): Promise<Imovel> {
    if (dados.foto) {
      const formData = await toFormData(dados);
      formData.append('_method', 'PUT');
      const response = await api.post<ImovelResponse>(`/imoveis/${id}`, formData, multipartConfig);
      return response.data.data;
    }

    const response = await api.put<ImovelResponse>(`/imoveis/${id}`, dados);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/imoveis/${id}`);
  },

  async updateFoto(id: number, foto: FotoImovel): Promise<UpdateFotoResponse> {
    const formData = new FormData();
    await appendFoto(formData, foto);
    const response = await api.post<UpdateFotoResponse>(`/imoveis/${id}/foto`, formData, multipartConfig);
    return response.data;
  },
};

export default imovelService;
