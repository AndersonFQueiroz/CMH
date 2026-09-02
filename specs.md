# Especificação Técnica — CMH

Este documento descreve a arquitetura técnica, o modelo de dados relacional, o catálogo completo de rotas da API REST, os schemas JSON de requisição e resposta, o fluxo de armazenamento de mídia e o design do cliente mobile em Expo com TypeScript.

---

## 1. Visão Geral da Arquitetura

O sistema **CMH** adota uma arquitetura clássica desacoplada em duas camadas principais:

1. **Backend (API REST):** Desenvolvido em **PHP / Laravel**, responsável pela persistência em banco relacional, regras de negócio, validação de integridade dos dados e gestão do armazenamento de arquivos de foto.
2. **Frontend (Mobile App):** Desenvolvido em **React Native com Expo e TypeScript**, consumindo a API REST de forma assíncrona para operações de CRUD e manipulação de mídia através do dispositivo físico ou emulador.

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
│  - Form Requests (StoreUsuarioRequest, UpdateUsuarioRequest)│
│  - Controllers (Api\V1\UsuarioController)                   │
│  - Eloquent ORM (App\Models\Usuario)                        │
│  - API Resources (UsuarioResource, UsuarioCollection)       │
└───────────────────┬─────────────────────┬───────────────────┘
                    │                     │
          SQL / PDO │                     │ Filesystem Disk
                    ▼                     ▼
┌──────────────────────────────┐   ┌──────────────────────────┐
│        BANCO DE DADOS        │   │     LARAVEL STORAGE      │
│     SQLite / PostgreSQL      │   │  storage/app/public/     │
│   Tabela relacional:         │   │  usuarios/               │
│   `usuarios`                 │   │  (Link simbólico public) │
└──────────────────────────────┘   └──────────────────────────┘
```

### Papel de Cada Tecnologia

| Tecnologia | Responsabilidade Principal |
| :--- | :--- |
| **Laravel 11 / 12** | Núcleo do backend, roteamento RESTful, injeção de dependências e segurança. |
| **Eloquent ORM** | Mapeamento objeto-relacional, tratamento de mutators, casts e relacionamento de dados. |
| **Form Requests** | Centralização isolada das regras de validação e autorização de requisições. |
| **API Resources** | Transformação, filtragem e padronização dos dados serializados em JSON. |
| **Expo SDK** | Framework de desenvolvimento mobile multiplataforma (Android e iOS). |
| **TypeScript** | Segurança de tipos em tempo de compilação, autocompletação e redução de bugs em tempo de execução. |
| **Axios** | Execução de chamadas HTTP, envio de headers e montagem de payloads `multipart/form-data`. |
| **expo-image-picker** | Gerenciamento de permissões do sistema operacional e captura de fotos locais. |

---

## 2. Modelo de Dados

### Diagrama de Entidade-Relacionamento (ERD)

```
┌───────────────────────────────────────────────────────────┐
│                        usuarios                           │
├───────────────────────┬───────────────────┬───────────────┤
│ id                    │ BIGINT UNSIGNED   │ PK, AUTO_INC  │
│ nome                  │ VARCHAR(150)      │ NOT NULL      │
│ email                 │ VARCHAR(150)      │ NOT NULL, UNIQ│
│ telefone              │ VARCHAR(20)       │ NOT NULL      │
│ cpf                   │ VARCHAR(14)       │ NOT NULL, UNIQ│
│ idade                 │ INTEGER           │ NOT NULL      │
│ salario               │ DECIMAL(10,2)     │ NULLABLE      │
│ data_nascimento       │ DATE              │ NOT NULL      │
│ data_admissao         │ DATE              │ NULLABLE      │
│ foto                  │ VARCHAR(255)      │ NULLABLE      │
│ ativo                 │ BOOLEAN           │ DEFAULT TRUE  │
│ bio                   │ TEXT              │ NULLABLE      │
│ created_at            │ TIMESTAMP         │ NULLABLE      │
│ updated_at            │ TIMESTAMP         │ NULLABLE      │
└───────────────────────┴───────────────────┴───────────────┘
```

### Dicionário de Dados (`usuarios`)

| Coluna | Tipo SQL | Chave | Nulo? | Padrão | Descrição |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` | PK | Não | *auto_increment* | Identificador primário numérico do registro. |
| `nome` | `VARCHAR(150)` | - | Não | - | Nome completo do usuário/colaborador. |
| `email` | `VARCHAR(150)` | UK | Não | - | E-mail corporativo ou pessoal exclusivo. |
| `telefone` | `VARCHAR(20)` | - | Não | - | Telefone de contato (fixo ou celular). |
| `cpf` | `VARCHAR(14)` | UK | Não | - | CPF no formato `000.000.000-00`. |
| `idade` | `INTEGER` | - | Não | - | Idade em anos (número inteiro positivo). |
| `salario` | `DECIMAL(10,2)` | - | Sim | `null` | Remuneração mensal contratual. |
| `data_nascimento` | `DATE` | - | Não | - | Data de nascimento no padrão ISO (`YYYY-MM-DD`). |
| `data_admissao` | `DATE` | - | Sim | `null` | Data de admissão ou entrada no sistema. |
| `foto` | `VARCHAR(255)` | - | Sim | `null` | Caminho relativo do arquivo no storage local. |
| `ativo` | `BOOLEAN` | - | Não | `true` | Status ativo (`true`) ou inativo (`false`). |
| `bio` | `TEXT` | - | Sim | `null` | Descrição biográfica ou observações gerais. |
| `created_at` | `TIMESTAMP` | - | Sim | `CURRENT_TIMESTAMP` | Data e hora de inclusão do registro. |
| `updated_at` | `TIMESTAMP` | - | Sim | `CURRENT_TIMESTAMP` | Data e hora da última modificação. |

---

## 3. Rotas da API REST

Todas as rotas são prefixadas por `/api/v1` e produzem respostas com `Content-Type: application/json`.

### 3.1. `GET /api/v1/usuarios`
Retorna a listagem paginada de usuários cadastrados.

- **Query Parameters:**
  - `page` (int, opcional): Número da página (padrão: `1`).
  - `per_page` (int, opcional): Quantidade de itens por página (padrão: `15`, máx: `100`).
  - `busca` (string, opcional): Termo de busca por `nome` ou `email`.
  - `ativo` (boolean, opcional): Filtrar apenas ativos (`true`) ou inativos (`false`).

- **Resposta de Sucesso (`200 OK`):**
```json
{
  "data": [
    {
      "id": 1,
      "nome": "Carlos Silva",
      "email": "carlos.silva@exemplo.com",
      "telefone": "(11) 98765-4321",
      "cpf": "123.456.789-00",
      "idade": 28,
      "salario": 4500.00,
      "data_nascimento": "1998-05-14",
      "data_admissao": "2024-02-01",
      "foto_url": "http://192.168.1.100:8000/storage/usuarios/carlos_198273.jpg",
      "ativo": true,
      "bio": "Desenvolvedor de software focado em sistemas mobile e web.",
      "created_at": "2026-09-02T15:30:00.000000Z",
      "updated_at": "2026-09-02T15:30:00.000000Z"
    }
  ],
  "links": {
    "first": "http://192.168.1.100:8000/api/v1/usuarios?page=1",
    "last": "http://192.168.1.100:8000/api/v1/usuarios?page=1",
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

### 3.2. `POST /api/v1/usuarios`
Cria um novo usuário no sistema. Recomenda-se enviar com `Content-Type: multipart/form-data` caso haja upload de foto.

- **Request Body (Campos `multipart/form-data` ou `application/json`):**
  - `nome` (string, obrigatório): `"Mariana Souza"`
  - `email` (string, obrigatório, email): `"mariana.souza@exemplo.com"`
  - `telefone` (string, obrigatório): `"(21) 99887-6655"`
  - `cpf` (string, obrigatório): `"987.654.321-99"`
  - `idade` (int, obrigatório): `24`
  - `salario` (numeric, opcional): `5200.50`
  - `data_nascimento` (date, obrigatório, formato `YYYY-MM-DD`): `"2002-08-20"`
  - `data_admissao` (date, opcional, formato `YYYY-MM-DD`): `"2025-01-15"`
  - `foto` (file, opcional): Arquivo binário de imagem (JPEG, PNG, WEBP até 2048 KB)
  - `ativo` (boolean, opcional): `true`
  - `bio` (string, opcional): `"Especialista em qualidade de software e testes."`

- **Resposta de Sucesso (`201 Created`):**
```json
{
  "message": "Usuário cadastrado com sucesso!",
  "data": {
    "id": 2,
    "nome": "Mariana Souza",
    "email": "mariana.souza@exemplo.com",
    "telefone": "(21) 99887-6655",
    "cpf": "987.654.321-99",
    "idade": 24,
    "salario": 5200.50,
    "data_nascimento": "2002-08-20",
    "data_admissao": "2025-01-15",
    "foto_url": "http://192.168.1.100:8000/storage/usuarios/mariana_876543.png",
    "ativo": true,
    "bio": "Especialista em qualidade de software e testes.",
    "created_at": "2026-09-02T16:00:00.000000Z",
    "updated_at": "2026-09-02T16:00:00.000000Z"
  }
}
```

- **Resposta de Erro de Validação (`422 Unprocessable Entity`):**
```json
{
  "message": "Os dados fornecidos são inválidos.",
  "errors": {
    "email": ["O e-mail informado já está em uso."],
    "cpf": ["O CPF já está cadastrado no sistema."],
    "foto": ["O arquivo enviado deve ser uma imagem válida (jpeg, png, webp) de até 2MB."]
  }
}
```

---

### 3.3. `GET /api/v1/usuarios/{id}`
Obtém todos os detalhes cadastrais de um usuário específico.

- **Resposta de Sucesso (`200 OK`):**
```json
{
  "data": {
    "id": 1,
    "nome": "Carlos Silva",
    "email": "carlos.silva@exemplo.com",
    "telefone": "(11) 98765-4321",
    "cpf": "123.456.789-00",
    "idade": 28,
    "salario": 4500.00,
    "data_nascimento": "1998-05-14",
    "data_admissao": "2024-02-01",
    "foto_url": "http://192.168.1.100:8000/storage/usuarios/carlos_198273.jpg",
    "ativo": true,
    "bio": "Desenvolvedor de software focado em sistemas mobile e web.",
    "created_at": "2026-09-02T15:30:00.000000Z",
    "updated_at": "2026-09-02T15:30:00.000000Z"
  }
}
```

- **Resposta de Registro Não Encontrado (`404 Not Found`):**
```json
{
  "message": "Usuário não encontrado."
}
```

---

### 3.4. `PUT` ou `POST /api/v1/usuarios/{id}`
Atualiza dados cadastrais.  
> ⚠️ **Nota Técnica sobre PHP/Laravel:** O PHP não popula a superglobal `$_FILES` nativamente em requisições HTTP `PUT` com multipart. Por isso, ao enviar nova foto na atualização, envie a requisição como `POST /api/v1/usuarios/{id}` incluindo o campo `_method=PUT` no FormData.

- **Resposta de Sucesso (`200 OK`):**
```json
{
  "message": "Usuário atualizado com sucesso!",
  "data": {
    "id": 1,
    "nome": "Carlos Silva Santos",
    "email": "carlos.santos@exemplo.com",
    "telefone": "(11) 98765-4321",
    "cpf": "123.456.789-00",
    "idade": 28,
    "salario": 5000.00,
    "data_nascimento": "1998-05-14",
    "data_admissao": "2024-02-01",
    "foto_url": "http://192.168.1.100:8000/storage/usuarios/novo_carlos_991823.jpg",
    "ativo": true,
    "bio": "Desenvolvedor Tech Lead.",
    "created_at": "2026-09-02T15:30:00.000000Z",
    "updated_at": "2026-09-02T16:45:00.000000Z"
  }
}
```

---

### 3.5. `DELETE /api/v1/usuarios/{id}`
Remove permanentemente o usuário e apaga o arquivo físico de sua foto no storage.

- **Resposta de Sucesso (`204 No Content`):**
Corpo vazio.

---

### 3.6. `POST /api/v1/usuarios/{id}/foto`
Endpoint rápido dedicado para envio exclusivo da imagem de perfil.

- **Request Body (`multipart/form-data`):**
  - `foto`: Arquivo binário de imagem.
- **Resposta de Sucesso (`200 OK`):**
```json
{
  "message": "Foto de perfil atualizada com sucesso!",
  "foto_url": "http://192.168.1.100:8000/storage/usuarios/novo_hash_123.jpg"
}
```

---

## 4. Gestão e Armazenamento de Fotos

1. **Validação de Arquivo:**
   A validação nos Form Requests deve garantir que o arquivo seja estritamente de imagem:
   ```php
   'foto' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
   ```
2. **Armazenamento:**
   O arquivo é salvo de maneira assíncrona/direta no disco público:
   ```php
   $caminho = $request->file('foto')->store('usuarios', 'public');
   ```
3. **Remoção de Arquivos Antigos:**
   Antes de sobrescrever uma foto ou ao deletar um usuário:
   ```php
   if ($usuario->foto && Storage::disk('public')->exists($usuario->foto)) {
       Storage::disk('public')->delete($usuario->foto);
   }
   ```
4. **Symlink Público:**
   O comando `php artisan storage:link` cria o link de `public/storage` apontando para `storage/app/public`, tornando o acesso via HTTP direto e performático.

---

## 5. Arquitetura do Frontend Mobile (Expo + TypeScript)

### 5.1. Definições de Tipos TypeScript (`src/types/usuario.ts`)

```typescript
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  idade: number;
  salario: number | null;
  data_nascimento: string;
  data_admissao: string | null;
  foto_url: string | null;
  ativo: boolean;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUsuarioDTO {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  idade: number;
  salario?: number;
  data_nascimento: string;
  data_admissao?: string;
  foto?: {
    uri: string;
    name: string;
    type: string;
  };
  ativo?: boolean;
  bio?: string;
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
```

### 5.2. Envio de FormData com Foto no React Native

```typescript
export async function cadastrarUsuario(dados: CreateUsuarioDTO): Promise<Usuario> {
  const formData = new FormData();
  formData.append('nome', dados.nome);
  formData.append('email', dados.email);
  formData.append('telefone', dados.telefone);
  formData.append('cpf', dados.cpf);
  formData.append('idade', String(dados.idade));
  formData.append('data_nascimento', dados.data_nascimento);

  if (dados.salario !== undefined) {
    formData.append('salario', String(dados.salario));
  }
  if (dados.data_admissao) {
    formData.append('data_admissao', dados.data_admissao);
  }
  if (dados.bio) {
    formData.append('bio', dados.bio);
  }
  if (dados.ativo !== undefined) {
    formData.append('ativo', dados.ativo ? '1' : '0');
  }
  if (dados.foto) {
    formData.append('foto', {
      uri: dados.foto.uri,
      name: dados.foto.name || 'foto.jpg',
      type: dados.foto.type || 'image/jpeg',
    } as any);
  }

  const response = await api.post('/usuarios', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
}
```

---

## 6. Configuração de Rede e Testes Locais

Para que o aplicativo Expo rodando em um dispositivo físico acesse a API local do Laravel:

1. A máquina que executa o Laravel e o smartphone devem estar conectados na **mesma rede Wi-Fi**.
2. O servidor Laravel deve ser iniciado com binding em todas as interfaces:
   ```bash
   php artisan serve --host=0.0.0.0 --port=8000
   ```
3. A variável `EXPO_PUBLIC_API_URL` no `.env` do Expo deve apontar para o endereço IPv4 local do computador (ex: `http://192.168.1.100:8000/api/v1`).
