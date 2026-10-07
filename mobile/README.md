# CMH Mobile — Setup, navegação e integração HTTP

> A listagem consome a API real (#19), com fotos, badges, paginação e atualização
> ao puxar. Detalhes e formulário ainda usam os rascunhos locais de navegação.
>
> | Fica para | Issue |
> | --- | --- |
> | `ImovelCard`, avatar, badges, botões, inputs e loaders reutilizáveis | #18 (implementado) |
> | Busca/filtros e detalhes reais | #20, #21 |
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

Para visualizar a listagem no navegador, use `npm run web`. O gesto nativo de
pull-to-refresh deve ser validado em Android/iOS.

## Teste manual #16

1. `ImovelList` mostra anúncios da API + botão `Novo` no header (integração #19).
2. `Ver detalhes` → `ImovelDetail` recebe o ID real, mas ainda exibe dados de rascunho (#21).
3. `Editar` → `ImovelForm` em modo edição (`#id` no título).
4. `Novo` → `ImovelForm` em modo criação.
5. Salvar com título < 5 chars → Alert de validação.

## Estrutura (#15)

`src/{components,hooks,navigation,screens,services,types,utils}` + `src/@types` + `tsconfig` estrito, sem `any`.

Os componentes de base ficam em `src/components/common` e o card/avatar de imóvel em
`src/components/imovel`. A listagem reutiliza `ImovelCard`; o avatar mostra um
ícone de casa quando não há foto ou quando a imagem falha ao carregar.

## Validar a listagem (#19)

Com a API iniciada e `EXPO_PUBLIC_API_URL` configurada:

1. Abra a lista: confira os anúncios reais, foto/placeholder, título, preço, cidade e badges.
2. Com mais de 15 anúncios, toque em **Carregar mais imóveis** e confira a próxima página.
3. No Android/iOS, puxe a lista para baixo: o indicador deve aparecer e a primeira página substituir a listagem.
4. Em um banco de testes sem anúncios, confira **Nenhum imóvel cadastrado** e a possibilidade de puxar para atualizar.
5. Interrompa a API e atualize: confira a mensagem de erro, os anúncios anteriores preservados e **Tentar novamente** após religar a API.
6. Confira o placeholder para foto ausente ou URL inválida e a navegação pelo ID ao tocar no card.

O gesto de atualização deve ser verificado no dispositivo/emulador. Detalhes e formulário ainda são rascunhos; busca/filtros ficam para #20.

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
Os testes de `useImoveis` simulam o service e verificam refresh, estado vazio,
paginação, falhas e respostas atrasadas usando `react-test-renderer`.
O upload real pela câmera/galeria deve ser validado em Android/iOS quando as
telas correspondentes forem integradas.
