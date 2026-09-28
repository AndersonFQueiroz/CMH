# CMH Mobile — Setup, navegação e integração HTTP

> A navegação ainda usa mocks locais. A camada HTTP e os tipos de domínio
> estão implementados na issue #17 e prontos para integração nas telas.
>
> | Fica para | Issue |
> | --- | --- |
> | `ImovelCard`, avatar, badges, loaders | #18 |
> | Lista real, busca/filtros, detalhes | #19, #20, #21 |
> | Formulário real, foto, multipart, erros | #22, #23, #24, #25 |

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
