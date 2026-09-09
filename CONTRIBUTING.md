# Guia de Contribuição — CMH (Cadastro Móvel Habitacional)

Obrigado por contribuir com o **CMH**! Este documento descreve convenções, fluxos e padrões para manter o repositório organizado. Entidade central da Entrega 1: **`imoveis`** (anúncios de venda/aluguel). Plus futuro: `visitas`.

---

## Estrutura do Repositório

- **`backend/`** — API REST em **PHP / Laravel** (CRUD de `imoveis` + upload de foto da fachada).
- **`mobile/`** — App mobile em **Expo (React Native) + TypeScript**.
- **Docs na raiz** — `requirements.md`, `specs.md`, `agents.md`, `README.md`.

---

## Fluxo de Trabalho com Git

### 1. Crie uma branch a partir da `main`

```bash
git checkout main
git pull origin main

# Novas funcionalidades
git checkout -b feature/nome-da-funcionalidade

# Correções
git checkout -b fix/nome-do-bug

# Documentação
git checkout -b docs/descricao-da-alteracao

# Refatoração
git checkout -b refactor/descricao-da-refatoracao

# Infra/build
git checkout -b chore/descricao-da-tarefa
```

### 2. Commits (Conventional Commits)

Formato: `<tipo>(<escopo>): <descrição no imperativo e em minúsculas>`

| Tipo | Quando usar |
| ---- | ----------- |
| `feat` | Nova funcionalidade (ex: novo endpoint ou tela) |
| `fix` | Correção de bug ou validação |
| `docs` | Documentação (`README.md`, `specs.md`, etc.) |
| `style` | Formatação sem alteração de lógica |
| `refactor` | Refatoração sem mudança externa |
| `test` | Testes automatizados |
| `chore` | Dependências, build, configs |

**Exemplos válidos (padrão Imóveis):**
- `feat(api): implementar endpoint de cadastro de imovel`
- `feat(mobile): adicionar tela de formulario de imovel com foto`
- `fix(api): corrigir validacao de data_disponibilidade no ImovelResource`
- `docs(specs): adicionar schema JSON do endpoint de update de imovel`

### 3. Pull Request

1. `git push origin feature/nome-da-funcionalidade`
2. Abra PR para `main` detalhando:
   - O que foi feito;
   - Como testar manualmente;
   - Screenshots/vídeos (mobile);
   - Requisitos atendidos (ex: `Atende RF-02 e RF-06`).

---

## Padrões de Código

### Backend (Laravel / PHP)

1. **PSR-12** obrigatório.
2. **Nomenclatura:**
   - **Models:** PascalCase singular (`Imovel`).
   - **Controllers:** PascalCase + sufixo (`ImovelController`).
   - **Migrations:** snake_case (`create_imoveis_table`).
   - **Form Requests:** PascalCase + sufixo (`StoreImovelRequest`, `UpdateImovelRequest`).
   - **API Resources:** PascalCase + sufixo (`ImovelResource`).
   - **Tabelas:** snake_case plural (`imoveis`).
   - **Colunas:** snake_case (`data_disponibilidade`, `area_m2`, `foto_url`).
3. **Validação:** Sempre em Form Request, nunca no Controller.
4. **Respostas:** Sempre via API Resources.

### Frontend Mobile (Expo / React Native / TypeScript)

1. TypeScript `strict: true`, sem `any`.
2. **Nomenclatura:**
   - **Componentes:** PascalCase (`ImovelCard.tsx`, `Header.tsx`).
   - **Telas:** PascalCase (`ImovelListScreen.tsx`, `ImovelFormScreen.tsx`).
   - **Hooks:** camelCase com `use` (`useImoveis.ts`, `useImagePicker.ts`).
   - **Services:** camelCase (`imovelService.ts`, `apiClient.ts`).
   - **Tipos:** PascalCase (`Imovel`, `CreateImovelInput`).
3. **Formulários:** Controlados, com pickers para `tipo`/`finalidade`.
4. **Fotos:** `expo-image-picker` + `FormData` `multipart/form-data`.

---

## Bugs e Sugestões

Inclua passos para reproduzir, comportamento esperado vs. observado, payload/resposta da API e logs (`storage/logs/laravel.log` ou Metro).

---

## Código de Conduta

Ambiente acadêmico e colaborativo. Comunicação respeitosa e objetiva.
