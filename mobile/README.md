# CMH Mobile — Setup, navegação e integração HTTP

> A listagem, os filtros, os detalhes e o formulário de cadastro/edição já
> consomem a API. A camada HTTP e os tipos de domínio foram implementados na
> issue #17; foto, multipart e exclusão continuam nas issues #23–#25.
>
> | Fica para | Issue |
> | --- | --- |
> | `ImovelCard`, avatar, badges, botões, inputs e loaders reutilizáveis | #18 (implementado) |
> | Lista real, busca/filtros, detalhes | #19, #20, #21 (implementado) |
> | Formulário de cadastro/edição com pickers, máscaras e erros 422 | #22 (implementado) |
> | Foto, multipart, exclusão e erros globais | #23, #24, #25 |

## Pré-requisitos

- Node 18+ / npm
- App Expo Go no celular (mesma Wi-Fi do PC)
- Backend rodando: `php artisan serve --host=0.0.0.0 --port=8000`

## Configurar IP da API

```bash
cp .env.example .env
# edite .env e troque pelo IP local:
# Linux: hostname -I | awk '{print $1}'
# Windows: ipconfig (IPv4)
# EXPO_PUBLIC_API_URL=http://SEU_IP:8000/api/v1
```

## Rodar

```bash
npm install
npx tsc --noEmit
npx expo start
```

Escaneie o QR com Expo Go (Android) ou Câmera (iOS).

## Teste manual #16

1. `ImovelList` mostra 2 mocks + botão `Novo` no header.
2. `Ver detalhe` → `ImovelDetail` com header = título do anúncio.
3. `Editar` → `ImovelForm` em modo edição (`#id` no título).
4. `Novo` → `ImovelForm` em modo criação.
5. Salvar com título < 5 chars → Alert de validação.

## Estrutura (#15)

`src/{components,hooks,navigation,screens,services,types,utils}` + `src/@types` + `tsconfig` estrito, sem `any`.

Os componentes de base ficam em `src/components/common` e o card/avatar de imóvel em
`src/components/imovel`. A listagem de demonstração já reutiliza `ImovelCard`; o
avatar mostra um ícone de casa quando não há foto ou quando a imagem falha ao carregar.

## Cliente HTTP e service (#17)

`src/services/api.ts` centraliza a URL de `EXPO_PUBLIC_API_URL`, timeout de
15 segundos e `Accept: application/json`. Configure a URL completa até
`/api/v1` no `.env` e reinicie o Expo após alterá-la. Sem essa variável,
a requisição falha com uma mensagem de configuração em português.

`src/types/imovel.ts` contém os tipos do contrato, incluindo os domínios
`TipoImovel` e `FinalidadeImovel` como uniões de strings, DTOs, filtros e paginação.

```typescript
import imovelService from './src/services/imovelService';

const pagina = await imovelService.list({ finalidade: 'aluguel', page: 1, per_page: 15 });
const imovel = await imovelService.getById(1);
await imovelService.update(imovel.id, { disponivel: false });
```

O service expõe `list`, `getById`, `create`, `update`, `delete` e `updateFoto`.
Criação e edição sem foto usam JSON. Com foto, envie `{ uri, name, type }`
do arquivo local: o service monta o multipart e, na edição, usa `POST`
com `_method=PUT`. `update` aceita campos parciais. `updateFoto` retorna
`{ message, foto_url }`, conforme o endpoint exclusivo de foto.

Os erros de conexão, timeout, validação e HTTP recebem mensagens em português.
O erro Axios mantém `response.status` e `response.data.errors`; os formulários
podem consultar esses detalhes após usar `axios.isAxiosError<ApiErrorResponse>(erro)`
(tipo exportado por `src/services/api.ts`).

### Verificar a camada HTTP

```bash
npm run typecheck
npm test
```

Os testes usam um adapter Axios sem acesso à rede e um substituto do FormData
nativo para verificar rotas, JSON, multipart, paginação e tratamento de erros.
O upload real pela câmera/galeria deve ser validado em Android/iOS quando as
telas correspondentes forem integradas.

## Formulário de cadastro e edição (#22)

`ImovelFormScreen` atende criação (`ImovelForm` sem `id`) e edição
(`ImovelForm` com `{ id }`, carregando o anúncio por `getById`).

- **Pickers:** `tipo` e `finalidade` usam `OptionPicker` (chips de seleção
  única em `src/components/common`). Ao escolher `terreno`, quartos e
  banheiros ficam travados em `0`.
- **Máscaras** (`src/utils/masks.ts`): preço em `R$ 2.500,00` (dígitos
  digitados viram centavos), área decimal com vírgula, telefone
  `(XX) XXXXX-XXXX`/`(XX) XXXX-XXXX` e data `DD/MM/AAAA` (enviada como
  `YYYY-MM-DD`).
- **Validação local** (`src/utils/imovelForm.ts`): espelha as regras e as
  mensagens de `StoreImovelRequest`/`UpdateImovelRequest`. Na edição, uma
  data de disponibilidade já passada só é recusada se for alterada.
- **Edição parcial:** o `PUT` envia só os campos alterados.
- **Erros 422:** `errosDaApi` transforma `response.data.errors` em uma
  mensagem por campo; erros de campos fora do formulário aparecem no aviso
  do topo.
- Depois de salvar, a lista recarrega e o detalhe usa o anúncio devolvido
  pela API (`src/services/imovelEvents.ts`). A criação abre o detalhe do
  novo anúncio.

Os testes de máscaras, validação, montagem do payload e erros 422 ficam em
`tests/imovelForm.test.ts` (`npm test`).
