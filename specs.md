# Especificação Técnica — CMH (Cadastro Móvel Habitacional)

Este documento descreve a arquitetura técnica, o modelo de dados relacional, o catálogo completo de rotas da API REST, os schemas JSON de requisição e resposta, o fluxo de armazenamento de mídia e o design do cliente mobile em Expo com TypeScript. Entidade central da Entrega 1: **`imoveis`**.

> Plus futuro (fora da Entrega 1): `visitas` (`id`, `imovel_id` FK, `nome_visitante`, `telefone`, `data_visita`) — agendamento de visitas. Não implementar agora.

---

## 1. Visão Geral da Arquitetura

O sistema **CMH** adota arquitetura desacoplada em duas camadas:

1. **Backend (API REST):** **PHP / Laravel**, persistência relacional, regras de negócio, validação e storage de fotos da fachada.
2. **Frontend (Mobile App):** **React Native com Expo + TypeScript**, CRUD de anúncios de imóveis com foto.

### Diagrama Arquitetural

```
┌─────────────────────────────────────────────────────────────┐
│                 CLIENTE MOBILE (EXPO)                       │
│  React Native + TypeScript + Expo SDK                       │
│  - React Navigation (Stack)                                 │
│  - expo-image-picker (Câmera & Galeria)                     │
│  - Axios Client (Interceptors, FormData & Timeout)          │
└──────────────────────────────┬──────────────────────────────┘
                                │
                                │ HTTPS / HTTP (JSON & Multipart/form-data)
                                │
┌──────────────────────────────▼──────────────────────────────┐
│                  SERVIDOR BACKEND (LARAVEL)                 │
│  - Routes (`routes/api.php` sob prefixo `/api/v1`)          │
│  - Form Requests (StoreImovelRequest, UpdateImovelRequest)  │
│  - Controllers (Api\V1\ImovelController)                    │
│  - Eloquent ORM (App\Models\Imovel)                         │
│  - API Resources (ImovelResource, ImovelCollection)         │
└───────────────────┬─────────────────────┬───────────────────┘
                     │                     │
           SQL / PDO │                     │ Filesystem Disk
                     ▼                     ▼
┌──────────────────────────────┐   ┌──────────────────────────┐
│        BANCO DE DADOS        │   │     LARAVEL STORAGE      │
│     SQLite / PostgreSQL      │   │  storage/app/public/     │
│   Tabela relacional:         │   │  imoveis/                │
│   `imoveis`                  │   │  (Link simbólico public) │
└──────────────────────────────┘   └──────────────────────────┘
```

### Papel de Cada Tecnologia

| Tecnologia | Responsabilidade Principal |
| :--- | :--- |
| **Laravel 11 / 12** | Roteamento RESTful, DI e segurança. |
| **Eloquent ORM** | Mapeamento, casts (`preco`, `area_m2` decimal, `disponivel` boolean, `data_disponibilidade` date). |
| **Form Requests** | Validação isolada (enum tipo/finalidade, preço, datas). |
| **API Resources** | Serialização JSON padronizada + `foto_url`. |
| **Expo SDK** | App multiplataforma (Android e iOS). |
| **TypeScript** | Tipos de domínio (`Imovel`, DTOs). |
| **Axios** | Chamadas HTTP + `multipart/form-data`. |
| **expo-image-picker** | Permissões e captura da foto do imóvel. |

---

## 2. Modelo de Dados

### Diagrama de Entidade-Relacionamento (ERD)

```
┌───────────────────────────────────────────────────────────┐
│                        imoveis                            │
├───────────────────────┬───────────────────┬───────────────┤
│ id                    │ BIGINT UNSIGNED   │ PK, AUTO_INC  │
│ titulo                │ VARCHAR(150)      │ NOT NULL      │
│ descricao             │ TEXT              │ NULLABLE      │
│ tipo                  │ VARCHAR(20)       │ NOT NULL      │
│ finalidade            │ VARCHAR(10)       │ NOT NULL      │
│ endereco              │ VARCHAR(200)      │ NOT NULL      │
│ cidade                │ VARCHAR(100)      │ NOT NULL      │
│ preco                 │ DECIMAL(12,2)     │ NOT NULL      │
│ area_m2               │ DECIMAL(8,2)      │ NOT NULL      │
│ quartos               │ INTEGER           │ NOT NULL      │
│ banheiros             │ INTEGER           │ NOT NULL      │
│ vagas                 │ INTEGER           │ DEFAULT 0     │
│ data_disponibilidade  │ DATE              │ NOT NULL      │
│ foto                  │ VARCHAR(255)      │ NULLABLE      │
│ disponivel            │ BOOLEAN           │ DEFAULT TRUE  │
│ contato_telefone      │ VARCHAR(20)       │ NOT NULL      │
│ created_at            │ TIMESTAMP         │ NULLABLE      │
│ updated_at            │ TIMESTAMP         │ NULLABLE      │
└───────────────────────┴───────────────────┴───────────────┘

(Plus futuro, NÃO criar na Entrega 1)
visitas.id → visitas.imovel_id FK → imoveis.id
```

### Dicionário de Dados (`imoveis`)

| Coluna | Tipo SQL | Nulo? | Padrão | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` PK | Não | auto_increment | Identificador do anúncio. |
| `titulo` | `VARCHAR(150)` | Não | - | Título do anúncio. |
| `descricao` | `TEXT` | Sim | `null` | Detalhes, diferenciais. |
| `tipo` | `VARCHAR(20)` | Não | - | `casa\|apartamento\|kitnet\|comercial\|terreno`. |
| `finalidade` | `VARCHAR(10)` | Não | - | `venda\|aluguel`. |
| `endereco` | `VARCHAR(200)` | Não | - | Rua, número, bairro. |
| `cidade` | `VARCHAR(100)` | Não | - | Cidade/UF. |
| `preco` | `DECIMAL(12,2)` | Não | - | Preço venda ou aluguel mensal. |
| `area_m2` | `DECIMAL(8,2)` | Não | - | Área em m². |
| `quartos` | `INTEGER` | Não | - | Dormitórios. |
| `banheiros` | `INTEGER` | Não | - | Banheiros. |
| `vagas` | `INTEGER` | Não | `0` | Vagas de garagem. |
| `data_disponibilidade` | `DATE` | Não | - | Data a partir da qual está disponível (`YYYY-MM-DD`). |
| `foto` | `VARCHAR(255)` | Sim | `null` | Caminho relativo no storage. |
| `disponivel` | `BOOLEAN` | Não | `true` | Anúncio ativo ou pausado. |
| `contato_telefone` | `VARCHAR(20)` | Não | - | Telefone do anunciante. |
| `created_at` | `TIMESTAMP` | Sim | now | Criação. |
| `updated_at` | `TIMESTAMP` | Sim | now | Atualização. |

---

## 3. Rotas da API REST

Prefixo `/api/v1`, `Content-Type: application/json`.

### 3.1. `GET /api/v1/imoveis`
Listagem paginada com filtros (atende RF-02).

- **Query Parameters:**
  - `page` (int): padrão `1`.
  - `per_page` (int): padrão `15`, máx `100`.
  - `busca` (string): busca em `titulo` e `endereco`.
  - `tipo` (string): `casa|apartamento|kitnet|comercial|terreno`.
  - `finalidade` (string): `venda|aluguel`.
  - `cidade` (string): busca parcial.
  - `disponivel` (boolean): `true|false`.
  - `preco_min`, `preco_max` (numeric).

- **Resposta `200 OK`:**
```json
{
  "data": [
    {
      "id": 1,
      "titulo": "Casa 3 quartos c/ quintal",
      "descricao": "Casa ampla perto da praia, quintal e churrasqueira.",
      "tipo": "casa",
      "finalidade": "aluguel",
      "endereco": "Rua das Palmeiras, 123 - Centro",
      "cidade": "Praia Grande/SP",
      "preco": 2500.00,
      "area_m2": 120.50,
      "quartos": 3,
      "banheiros": 2,
      "vagas": 1,
      "data_disponibilidade": "2026-10-01",
      "foto_url": "http://192.168.1.100:8000/storage/imoveis/casa_198273.jpg",
      "disponivel": true,
      "contato_telefone": "(13) 99999-1234",
      "created_at": "2026-09-02T15:30:00.000000Z",
      "updated_at": "2026-09-02T15:30:00.000000Z"
    }
  ],
  "links": {
    "first": "http://192.168.1.100:8000/api/v1/imoveis?page=1",
    "last": "http://192.168.1.100:8000/api/v1/imoveis?page=1",
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 1,
    "per_page": 15,
    "to": 1,
    "total": 1
  }
}
```

---

### 3.2. `POST /api/v1/imoveis`
Cria anúncio. Usar `multipart/form-data` se houver foto.

- **Body:**
  - `titulo` (string, obrigatório, 5-150)
  - `descricao` (string, opcional)
  - `tipo` (obrigatório, in:casa,apartamento,kitnet,comercial,terreno)
  - `finalidade` (obrigatório, in:venda,aluguel)
  - `endereco` (obrigatório, max 200)
  - `cidade` (obrigatório, max 100)
  - `preco` (numeric, obrigatório, min:0)
  - `area_m2` (numeric, obrigatório, min:0.01)
  - `quartos` (int, obrigatório, 0-50)
  - `banheiros` (int, obrigatório, 0-20)
  - `vagas` (int, opcional, 0-20)
  - `data_disponibilidade` (date `YYYY-MM-DD`, obrigatório, after_or_equal:today)
  - `foto` (file, opcional, jpeg,png,jpg,webp, max 2048)
  - `disponivel` (boolean, opcional)
  - `contato_telefone` (obrigatório)

- **Resposta `201 Created`:**
```json
{
  "message": "Imóvel cadastrado com sucesso!",
  "data": {
    "id": 2,
    "titulo": "Apartamento 2 quartos mobiliado",
    "tipo": "apartamento",
    "finalidade": "aluguel",
    "endereco": "Av. Central, 500 - Ap 12",
    "cidade": "São Vicente/SP",
    "preco": 1800.00,
    "area_m2": 65.00,
    "quartos": 2,
    "banheiros": 1,
    "vagas": 1,
    "data_disponibilidade": "2026-10-15",
    "foto_url": "http://192.168.1.100:8000/storage/imoveis/apto_876543.png",
    "disponivel": true,
    "contato_telefone": "(13) 98888-6655",
    "created_at": "2026-09-02T16:00:00.000000Z",
    "updated_at": "2026-09-02T16:00:00.000000Z"
  }
}
```

- **Erro `422`:**
```json
{
  "message": "Os dados fornecidos são inválidos.",
  "errors": {
    "tipo": ["O tipo selecionado é inválido."],
    "preco": ["O preço deve ser maior ou igual a 0."],
    "data_disponibilidade": ["A data de disponibilidade deve ser hoje ou futura."],
    "foto": ["O arquivo enviado deve ser uma imagem válida (jpeg, png, webp) de até 2MB."]
  }
}
```

---

### 3.3. `GET /api/v1/imoveis/{id}`
Detalhe do anúncio. `404` se inexistente:
```json
{ "message": "Imóvel não encontrado." }
```

---

### 3.4. `PUT` ou `POST /api/v1/imoveis/{id}`
Atualiza anúncio.
> ⚠️ PHP/Laravel não popula `$_FILES` em `PUT` multipart. Enviar como `POST` com `_method=PUT` no FormData quando houver foto.

- **Resposta `200 OK`:**
```json
{
  "message": "Imóvel atualizado com sucesso!",
  "data": {
    "id": 1,
    "titulo": "Casa 3 quartos c/ quintal e piscina",
    "preco": 2700.00,
    "disponivel": true,
    "updated_at": "2026-09-02T16:45:00.000000Z"
  }
}
```

---

### 3.5. `DELETE /api/v1/imoveis/{id}`
Remove anúncio + apaga foto do storage. Resposta `204 No Content`, corpo vazio.

---

### 3.6. `POST /api/v1/imoveis/{id}/foto`
Troca só a foto de capa.

- **Body (`multipart/form-data`):** `foto`: imagem.
- **Resposta `200 OK`:**
```json
{
  "message": "Foto do imóvel atualizada com sucesso!",
  "foto_url": "http://192.168.1.100:8000/storage/imoveis/novo_hash_123.jpg"
}
```

---

## 4. Gestão e Armazenamento de Fotos

1. **Validação nos Form Requests:**
   ```php
   'foto' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
   'tipo' => ['required', 'in:casa,apartamento,kitnet,comercial,terreno'],
   'finalidade' => ['required', 'in:venda,aluguel'],
   'preco' => ['required', 'numeric', 'min:0'],
   'area_m2' => ['required', 'numeric', 'min:0.01'],
   'data_disponibilidade' => ['required', 'date', 'after_or_equal:today'],
   ```
2. **Armazenamento:**
   ```php
   $caminho = $request->file('foto')->store('imoveis', 'public');
   ```
3. **Remoção de arquivos antigos:**
   ```php
   if ($imovel->foto && Storage::disk('public')->exists($imovel->foto)) {
       Storage::disk('public')->delete($imovel->foto);
   }
   ```
4. **Symlink:** `php artisan storage:link` expõe `public/storage` → `storage/app/public`.

---

## 5. Arquitetura do Frontend Mobile (Expo + TypeScript)

### 5.1. Tipos (`src/types/imovel.ts`)

```typescript
export type TipoImovel = 'casa' | 'apartamento' | 'kitnet' | 'comercial' | 'terreno';
export type FinalidadeImovel = 'venda' | 'aluguel';

export interface Imovel {
  id: number;
  titulo: string;
  descricao: string | null;
  tipo: TipoImovel;
  finalidade: FinalidadeImovel;
  endereco: string;
  cidade: string;
  preco: number;
  area_m2: number;
  quartos: number;
  banheiros: number;
  vagas: number;
  data_disponibilidade: string;
  foto_url: string | null;
  disponivel: boolean;
  contato_telefone: string;
  created_at: string;
  updated_at: string;
}

export interface CreateImovelDTO {
  titulo: string;
  descricao?: string;
  tipo: TipoImovel;
  finalidade: FinalidadeImovel;
  endereco: string;
  cidade: string;
  preco: number;
  area_m2: number;
  quartos: number;
  banheiros: number;
  vagas?: number;
  data_disponibilidade: string;
  foto?: {
    uri: string;
    name: string;
    type: string;
  };
  disponivel?: boolean;
  contato_telefone: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ImovelFiltros {
  busca?: string;
  tipo?: TipoImovel;
  finalidade?: FinalidadeImovel;
  cidade?: string;
  disponivel?: boolean;
  preco_min?: number;
  preco_max?: number;
}
```

### 5.2. Envio de FormData com Foto

```typescript
export async function cadastrarImovel(dados: CreateImovelDTO): Promise<Imovel> {
  const formData = new FormData();
  formData.append('titulo', dados.titulo);
  formData.append('tipo', dados.tipo);
  formData.append('finalidade', dados.finalidade);
  formData.append('endereco', dados.endereco);
  formData.append('cidade', dados.cidade);
  formData.append('preco', String(dados.preco));
  formData.append('area_m2', String(dados.area_m2));
  formData.append('quartos', String(dados.quartos));
  formData.append('banheiros', String(dados.banheiros));
  formData.append('data_disponibilidade', dados.data_disponibilidade);
  formData.append('contato_telefone', dados.contato_telefone);

  if (dados.descricao) formData.append('descricao', dados.descricao);
  if (dados.vagas !== undefined) formData.append('vagas', String(dados.vagas));
  if (dados.disponivel !== undefined) formData.append('disponivel', dados.disponivel ? '1' : '0');
  if (dados.foto) {
    formData.append('foto', {
      uri: dados.foto.uri,
      name: dados.foto.name || 'fachada.jpg',
      type: dados.foto.type || 'image/jpeg',
    } as any);
  }

  const response = await api.post('/imoveis', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data.data;
}
```

---

## 6. Configuração de Rede e Testes Locais

1. Máquina do Laravel e smartphone na **mesma rede Wi-Fi**.
2. Servidor com binding total:
   ```bash
   php artisan serve --host=0.0.0.0 --port=8000
   ```
3. `EXPO_PUBLIC_API_URL=http://192.168.1.100:8000/api/v1` no `.env` do Expo.
