# Instruções para Agentes de IA — CMH (Cadastro Móvel Habitacional)

Este documento é destinado a **agentes de IA** (Antigravity, Claude Code, GitHub Copilot, Cursor, etc.) que forem auxiliar no desenvolvimento deste repositório. Leia-o integralmente antes de planejar ou executar qualquer tarefa.

---

## Contexto do Projeto

O **CMH** é uma aplicação completa composta por uma **API REST em Laravel (PHP)** e um **aplicativo móvel em Expo (React Native + TypeScript)**. Projeto da disciplina de **Programação para Dispositivos Móveis (PDM 2026.2)** — *TP Entrega 1*, focando no **CRUD completo de Imóveis (anúncios de venda e aluguel) com múltiplos tipos de dados (números, strings, datas e foto com upload)**.

> Entidade central: `imoveis`. Plus futuro (NÃO fazer na Entrega 1): `visitas` (agendamento de visitas).

### Stack Técnica Principal

| Camada | Tecnologia | Detalhes |
| :--- | :--- | :--- |
| **Backend** | Laravel 11 / 12 (PHP 8.2+) | API RESTful, Eloquent ORM, Form Requests, API Resources, Storage local público |
| **Banco de Dados** | SQLite (dev) / PostgreSQL (prod) | Migrations versionadas com integridade referencial e índices |
| **Frontend Mobile**| Expo SDK 52+ / React Native | Telas de listagem, visualização, cadastro e edição de imóveis com foto |
| **Linguagem Mobile**| TypeScript 5.x | Tipagem estrita, interfaces de domínio e DTOs |
| **HTTP Client** | Axios / Fetch API | Configuração centralizada com timeout, interceptors e suporte a `multipart/form-data` |
| **Mídia Mobile** | `expo-image-picker` | Captura da foto da fachada via câmera ou galeria |

---

## Fontes de Verdade

Antes de propor alterações ou gerar código, **consulte obrigatoriamente**:

1. **`requirements.md`** — RF, RNF, regras de negócio e validações dos campos do imóvel.
2. **`specs.md`** — Arquitetura, ERD da tabela `imoveis`, schemas JSON e regras de upload.

> ⚠️ **Regra Fundamental:** Nunca invente rotas, campos ou contratos que divirjam de `specs.md` e `requirements.md`. Se uma alteração for necessária, atualize primeiro a documentação.

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
│   │   │           └── ImovelController.php      # Controller REST da API
│   │   ├── Requests/
│   │   │   ├── StoreImovelRequest.php            # Validação para criação
│   │   │   └── UpdateImovelRequest.php           # Validação para edição
│   │   └── Resources/
│   │       ├── ImovelResource.php                # Serialização JSON individual
│   │       └── ImovelCollection.php              # Serialização de listas paginadas
│   └── Models/
│       └── Imovel.php                            # Model Eloquent com casts e acessores
├── database/
│   ├── migrations/                               # Migration create_imoveis_table
│   ├── factories/
│   │   └── ImovelFactory.php                     # Factory com Faker para testes
│   └── seeders/
│       └── ImovelSeeder.php                      # Seeder com anúncios fictícios
├── routes/
│   └── api.php                                   # Rotas versionadas sob /api/v1/imoveis
├── storage/
│   └── app/
│       └── public/
│           └── imoveis/                          # Fotos salvas no disco público
└── tests/
    └── Feature/
        └── ImovelApiTest.php                     # Testes de integração de todos os endpoints
```

### Regras Mandatórias para Laravel

1. **Sem validação no Controller:** Toda validação em Form Requests (`StoreImovelRequest`, `UpdateImovelRequest`). Incluir `in:casa,apartamento,kitnet,comercial,terreno`, `in:venda,aluguel`, `preco|min:0`, `data_disponibilidade|after_or_equal:today`.
2. **Respostas com Resources:** Sempre `new ImovelResource($imovel)` ou `ImovelResource::collection($imoveis)`. Nunca retornar Eloquent puro.
3. **Upload e Tratamento de Fotos:**
   - Validar com `image|mimes:jpeg,png,jpg,webp|max:2048`.
   - Salvar com `Storage::disk('public')->putFile('imoveis', $request->file('foto'))`.
   - Ao atualizar/excluir, remover foto antiga com `Storage::disk('public')->delete(...)`.
   - Model expõe `getFotoUrlAttribute()` com `asset(Storage::url($this->foto))`.
4. **Códigos HTTP:**
   - `200 OK`: GET e updates.
   - `201 Created`: criação.
   - `204 No Content`: exclusão.
   - `404 Not Found`: ID inexistente.
   - `422 Unprocessable Entity`: falha de validação.
   - `500 Internal Server Error`: erro inesperado.

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
│   │   └── imovel/                 # ImovelCard, ImovelAvatar com fallback, etc.
│   ├── hooks/                      # Custom hooks (useImoveis, useImagePicker)
│   ├── navigation/                 # Navegação em pilha (Stack Navigator)
│   ├── screens/                    # Telas da aplicação
│   │   ├── ImovelListScreen.tsx    # Listagem com busca, filtros e refresh
│   │   ├── ImovelDetailScreen.tsx  # Visualização completa do anúncio
│   │   └── ImovelFormScreen.tsx    # Formulário unificado (criação/edição) com foto
│   ├── services/                   # Integração com a API REST
│   │   ├── api.ts                  # Instância Axios configurada
│   │   └── imovelService.ts        # CRUD (list, getById, create, update, delete)
│   ├── types/                      # Interfaces (Imovel, CreateImovelDTO, Filtros)
│   └── utils/                      # Formatadores de moeda, data, telefone, área
├── App.tsx                         # Ponto de entrada
├── app.json                        # Configuração do Expo
└── tsconfig.json                   # TypeScript estrito
```

### Regras Mandatórias para Expo / TypeScript

1. **Tipagem Estrita:** Não utilize `any`. Interfaces em `types/imovel.ts` (`Imovel`, `CreateImovelDTO`, `ImovelFiltros`).
2. **Multipart:** Enviar foto como `FormData` com `{ uri, name, type }` e header `multipart/form-data`. Em update com foto, incluir `_method=PUT`.
3. **Feedback Visual:** `ActivityIndicator` para loading, mensagens de erro em português, `Alert.alert` antes de excluir.
4. **Formatadores:** Preço (`R$ 2.500,00/mês` ou `R$ 350.000,00`), área (`120,5 m²`), data (`DD/MM/YYYY`), telefone `(XX) XXXXX-XXXX`. Badges para `tipo`/`finalidade`.

---

## Checklist de Conclusão de Tarefas

Antes de finalizar qualquer tarefa, certifique-se de que:
- [ ] O código segue PSR-12 (PHP) e TypeScript estrito.
- [ ] Os campos obrigatórios do edital (números, strings, datas e foto) foram respeitados.
- [ ] As rotas e payloads batem exatamente com `specs.md`.
- [ ] A documentação foi atualizada caso novos comportamentos tenham sido adicionados.
- [ ] Nenhum resquício da antiga entidade `usuarios` permanece (buscar por `Usuario`, `usuario`, `cpf`, `salario`).
