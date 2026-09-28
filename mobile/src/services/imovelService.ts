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

function appendFoto(formData: FormData, foto: FotoImovel): void {
  // React Native aceita arquivos por URI; a assinatura DOM só conhece Blob.
  formData.append('foto', foto as unknown as Blob);
}

function toFormData(dados: UpdateImovelDTO): FormData {
  const formData = new FormData();
  const { foto, ...campos } = dados;

  for (const [campo, valor] of Object.entries(campos)) {
    if (valor !== undefined) {
      formData.append(campo, typeof valor === 'boolean' ? (valor ? '1' : '0') : String(valor));
    }
  }

  if (foto) appendFoto(formData, foto);
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
      ? await api.post<ImovelResponse>('/imoveis', toFormData(dados), multipartConfig)
      : await api.post<ImovelResponse>('/imoveis', dados);
    return response.data.data;
  },

  async update(id: number, dados: UpdateImovelDTO): Promise<Imovel> {
    if (dados.foto) {
      const formData = toFormData(dados);
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
    appendFoto(formData, foto);
    const response = await api.post<UpdateFotoResponse>(`/imoveis/${id}/foto`, formData, multipartConfig);
    return response.data;
  },
};

export default imovelService;
