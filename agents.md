# Instruções para Agentes de IA — CMH

Este documento é destinado a **agentes de IA** (Antigravity, Claude Code, GitHub Copilot, Cursor, etc.) que forem auxiliar no desenvolvimento deste repositório. Leia-o integralmente antes de planejar ou executar qualquer tarefa.

---

## Contexto do Projeto

O **CMH** é uma aplicação completa composta por uma **API REST em Laravel (PHP)** e um **aplicativo móvel em Expo (React Native + TypeScript)**. O projeto foi estruturado para a disciplina de **Programação para Dispositivos Móveis (PDM 2026.2)** — *TP Entrega 1*, focando prioritariamente no desenvolvimento e documentação do **CRUD completo de Usuários com suporte a múltiplos tipos de dados (números, strings, datas e foto com upload de arquivo)**.

### Stack Técnica Principal

| Camada | Tecnologia | Detalhes |
| :--- | :--- | :--- |
| **Backend** | Laravel 11 / 12 (PHP 8.2+) | API RESTful, Eloquent ORM, Form Requests, API Resources, Storage local público |
| **Banco de Dados** | SQLite (dev) / PostgreSQL (prod) | Migrations versionadas com integridade referencial e índices |
| **Frontend Mobile**| Expo SDK 52+ / React Native | Telas de listagem, visualização, cadastro e edição com upload de foto |
| **Linguagem Mobile**| TypeScript 5.x | Tipagem estrita, interfaces de domínio e DTOs |
| **HTTP Client** | Axios / Fetch API | Configuração centralizada com timeout, interceptors e suporte a `multipart/form-data` |
| **Mídia Mobile** | `expo-image-picker` | Captura de imagens da câmera e seleção da galeria |

---

## Fontes de Verdade

Antes de propor alterações ou gerar código, **consulte obrigatoriamente**:

1. **`requirements.md`** — Contém todos os Requisitos Funcionais (RF) e Não Funcionais (RNF), regras de negócio e validações de campos.
2. **`specs.md`** — Contém a arquitetura detalhada, diagrama entidade-relacionamento (ERD), schemas JSON exatos de requisição/resposta e regras de upload.

> ⚠️ **Regra Fundamental:** Nunca invente rotas, campos no banco ou contratos de resposta que divirjam de `specs.md` e `requirements.md`. Se uma alteração for necessária, atualize primeiro a documentação.

---

## Convenções de Código do Backend (Laravel)

### Estrutura de Pastas Esperada

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       └── V1/
│   │   │           └── UsuarioController.php     # Controller REST da API
│   │   ├── Requests/
│   │   │   ├── StoreUsuarioRequest.php           # Validação para criação
│   │   │   └── UpdateUsuarioRequest.php          # Validação para edição
│   │   └── Resources/
│   │       ├── UsuarioResource.php               # Serialização JSON individual
│   │       └── UsuarioCollection.php             # Serialização de listas paginadas
│   └── Models/
│       └── Usuario.php                           # Model Eloquent com casts e acessores
├── database/
│   ├── migrations/                               # Migration de criação da tabela usuarios
│   ├── factories/
│   │   └── UsuarioFactory.php                    # Factory com Faker para testes
│   └── seeders/
│       └── UsuarioSeeder.php                     # Seeder com registros fictícios
├── routes/
│   └── api.php                                   # Rotas versionadas sob /api/v1/...
├── storage/
│   └── app/
│       └── public/
│           └── usuarios/                         # Fotos salvas no disco público
└── tests/
    └── Feature/
        └── UsuarioApiTest.php                    # Testes de integração de todos os endpoints
```

### Regras Mandatórias para Laravel

1. **Sem lógica de validação no Controller:** Toda validação de entrada de dados deve residir em Form Requests (`StoreUsuarioRequest`, `UpdateUsuarioRequest`).
2. **Respostas padronizadas com Resources:** Nunca retorne instâncias puras de Eloquent no Controller. Sempre use `new UsuarioResource($usuario)` ou `UsuarioResource::collection($usuarios)`.
3. **Upload e Tratamento de Fotos:**
   - As fotos devem ser validadas como arquivos de imagem válidos (`image|mimes:jpeg,png,jpg,webp|max:2048`).
   - Salve os arquivos utilizando `Storage::disk('public')->putFile('usuarios', $request->file('foto'))`.
   - Ao atualizar ou excluir um usuário, verifique se existia foto anterior e remova o arquivo do disco com `Storage::disk('public')->delete(...)`.
   - O model deve expor um acessor `getFotoUrlAttribute()` que utiliza `asset(Storage::url($this->foto))` para fornecer a URL pública completa para o app mobile.
4. **Tratamento de Exceções e Códigos HTTP:**
   - `200 OK`: Requisições GET e atualizações bem-sucedidas.
   - `201 Created`: Criação bem-sucedida de usuário.
   - `204 No Content`: Exclusão bem-sucedida.
   - `404 Not Found`: ID de usuário inexistente no banco.
   - `422 Unprocessable Entity`: Falha na validação dos campos com array detalhado de mensagens.
   - `500 Internal Server Error`: Erro inesperado com mensagem genérica em produção.

---

## Convenções de Código do Mobile (Expo / TypeScript)

### Estrutura de Pastas Esperada

```
mobile/
├── src/
│   ├── @types/                     # Declarações globais de tipos e assets
│   ├── assets/                     # Imagens estáticas, logos e ícones
│   ├── components/                 # Componentes reutilizáveis
│   │   ├── common/                 # Botões, inputs, loaders, badges
│   │   └── usuario/                # Card de usuário, avatar com fallback, etc.
│   ├── hooks/                      # Custom hooks (useUsuarios, useImagePicker)
│   ├── navigation/                 # Navegação em pilha (Stack Navigator)
│   ├── screens/                    # Telas da aplicação
│   │   ├── UsuarioListScreen.tsx   # Listagem com busca, refresh e scroll infinito
│   │   ├── UsuarioDetailScreen.tsx # Visualização completa de todos os 7+ atributos
│   │   └── UsuarioFormScreen.tsx   # Formulário unificado (Criação e Edição) com foto
│   ├── services/                   # Integração com a API REST
│   │   ├── api.ts                  # Instância configurada do Axios
│   │   └── usuarioService.ts       # Funções de CRUD (list, getById, create, update, delete)
│   ├── types/                      # Interfaces TypeScript (Usuario, CreateUsuarioDTO, etc.)
│   └── utils/                      # Formatadores de CPF, telefone, data e moeda
├── App.tsx                         # Ponto de entrada do aplicativo
├── app.json                        # Configuração do Expo
└── tsconfig.json                   # Configuração estrita do TypeScript
```

### Regras Mandatórias para Expo / TypeScript

1. **Tipagem Estrita:** Não utilize `any`. Crie interfaces em `types/usuario.ts` para dados do usuário, erros da API e parâmetros de navegação.
2. **Envio de Fotos via Multipart:** Ao criar ou editar usuário com imagem, envie a requisição com `Content-Type: multipart/form-data`, montando um objeto `FormData` com `{ uri, name, type }` da imagem selecionada pelo `expo-image-picker`.
3. **Feedback Visual:** Implemente estados de loading (`ActivityIndicator`), tratamento de mensagens de erro amigáveis e diálogos de confirmação antes de ações destrutivas (excluir cadastro).
4. **Formatadores Auxiliares:** Crie funções utilitárias para formatar CPF (`000.000.000-00`), telefone `(XX) XXXXX-XXXX`, data (`DD/MM/YYYY`) e salário (`R$ 0.000,00`).

---

## Checklist de Conclusão de Tarefas

Antes de finalizar qualquer tarefa, certifique-se de que:
- [ ] O código segue estritamente PSR-12 (PHP) e as regras do TypeScript.
- [ ] Os campos obrigatórios do edital (números, strings, datas e foto) foram respeitados.
- [ ] As rotas e payloads batem exatamente com o especificado em `specs.md`.
- [ ] A documentação foi atualizada caso novos comportamentos ou variáveis de ambiente tenham sido adicionados.
