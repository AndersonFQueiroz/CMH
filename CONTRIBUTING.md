# Guia de Contribuição — CMH

Obrigado por contribuir com o **CMH**! Este documento descreve as convenções, fluxos de trabalho e padrões que seguimos para manter o repositório organizado e o desenvolvimento eficiente entre a equipe.

---

## Estrutura do Repositório

O projeto é estruturado de forma desacoplada em duas pastas principais:

- **`backend/`** — API REST desenvolvida em **PHP / Laravel** com suporte a upload de arquivos e banco relacional.
- **`mobile/`** — Aplicativo mobile desenvolvido com **Expo (React Native) + TypeScript**.
- **Docs na raiz** — Arquivos de especificação técnica, requisitos e diretrizes para o time e agentes de IA.

---

## Fluxo de Trabalho com Git

### 1. Crie uma branch a partir da `main`

Nunca faça commits diretamente na branch `main`. Crie sempre uma branch descritiva a partir da versão mais recente da `main`:

```bash
# Atualize a branch main
git checkout main
git pull origin main

# Para novas funcionalidades
git checkout -b feature/nome-da-funcionalidade

# Para correções de bugs
git checkout -b fix/nome-do-bug

# Para alterações de documentação
git checkout -b docs/descricao-da-alteracao

# Para refatorações
git checkout -b refactor/descricao-da-refatoracao

# Para ajustes de infraestrutura ou build
git checkout -b chore/descricao-da-tarefa
```

### 2. Faça commits seguindo o padrão Conventional Commits

Todos os commits devem seguir a especificação [Conventional Commits](https://www.conventionalcommits.org/pt-br/).

**Formato:**

```
<tipo>(<escopo>): <descrição no imperativo e em minúsculas>

[corpo opcional explicando o porquê da mudança]
```

**Tipos permitidos:**

| Tipo       | Quando usar                                                                   |
| ---------- | ----------------------------------------------------------------------------- |
| `feat`     | Nova funcionalidade no sistema (ex: novo endpoint ou tela)                   |
| `fix`      | Correção de bug ou falha de validação                                         |
| `docs`     | Alterações ou inclusões de documentação (`README.md`, `specs.md`, etc.)       |
| `style`    | Formatação, ponto e vírgula, espaçamento (sem alteração de lógica)           |
| `refactor` | Refatoração de código sem alteração no comportamento externo                  |
| `test`     | Adição ou ajuste de testes automatizados (Feature ou Unit)                    |
| `chore`    | Atualização de dependências, scripts de build ou configurações do projeto    |

**Exemplos de commits válidos:**
- `feat(api): implementar endpoint de upload de foto do usuario`
- `feat(mobile): adicionar tela de formulario de cadastro com validacao`
- `fix(api): corrigir formato da data de nascimento no UsuarioResource`
- `docs(specs): adicionar schema JSON do endpoint de update de usuario`

### 3. Abra um Pull Request (PR)

1. Faça push da sua branch: `git push origin feature/nome-da-funcionalidade`
2. Abra um Pull Request direcionado à branch `main`.
3. Preencha a descrição do PR detalhando:
   - O que foi feito;
   - Como testar manualmente;
   - Screenshots ou vídeos (para alterações na interface do app mobile);
   - Referência aos requisitos atendidos (ex: `Atende RF-02 e RF-06`).
4. Aguarde a revisão de ao menos um membro da equipe antes de realizar o merge.

---

## Padrões de Código

### Backend (Laravel / PHP)

1. **Padrão de Código:** Siga rigorosamente a **PSR-12**.
2. **Nomenclatura:**
   - **Models:** PascalCase no singular (`Usuario`).
   - **Controllers:** PascalCase com sufixo (`UsuarioController`).
   - **Migrations:** snake_case descritivo (`create_usuarios_table`, `add_cpf_to_usuarios_table`).
   - **Form Requests:** PascalCase com sufixo (`StoreUsuarioRequest`, `UpdateUsuarioRequest`).
   - **API Resources:** PascalCase com sufixo (`UsuarioResource`).
   - **Tabelas do Banco:** snake_case no plural (`usuarios`).
   - **Colunas:** snake_case (`data_nascimento`, `foto_url`, `created_at`).
3. **Validação:** Nunca valide dados diretamente dentro do Controller. Utilize sempre classes dedicadas de **Form Request** (`php artisan make:request StoreUsuarioRequest`).
4. **Respostas da API:** Utilize sempre **API Resources** (`php artisan make:resource UsuarioResource`) para garantir padronização e segurança na serialização dos dados JSON.

### Frontend Mobile (Expo / React Native / TypeScript)

1. **Padrão de Código:** Utilize TypeScript estrito (`strict: true`) sem o uso de `any`.
2. **Nomenclatura:**
   - **Componentes:** PascalCase (`UsuarioCard.tsx`, `Header.tsx`).
   - **Telas / Rotas:** PascalCase (`UsuarioListScreen.tsx`, `UsuarioFormScreen.tsx`).
   - **Hooks:** camelCase com prefixo `use` (`useUsuarios.ts`, `useImagePicker.ts`).
   - **Services:** camelCase (`usuarioService.ts`, `apiClient.ts`).
   - **Tipos / Interfaces:** PascalCase (`Usuario`, `CreateUsuarioInput`).
3. **Formulários e Validação:** Prefira formulários controlados com validação declarativa de tipos (ex: Zod ou Yup).
4. **Manipulação de Fotos:** Utilize o `expo-image-picker` para selecionar fotos da galeria ou câmera e prepare o payload como `FormData` com `multipart/form-data`.

---

## Reportando Bugs e Sugerindo Funcionalidades

### Bugs
Abra uma **Issue** no GitHub contendo:
- Passos detalhados para reproduzir o erro;
- Comportamento esperado vs. comportamento observado;
- Payload enviado e resposta retornada pela API (se aplicável);
- Logs de erro do Laravel (`storage/logs/laravel.log`) ou do Metro Bundler.

### Sugestões
Abra uma **Issue** com a tag `enhancement` descrevendo:
- A motivação da melhoria;
- O caso de uso no contexto do projeto acadêmico;
- Possíveis impactos na arquitetura existente.

---

## Código de Conduta

Trabalhamos em um ambiente acadêmico e colaborativo. Mantenha a comunicação respeitosa, objetiva e construtiva em todas as interações no repositório, issues e pull requests.
