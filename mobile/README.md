# CMH Mobile — Setup (#15) + Navegação (#16) — RASCUNHO

> **Escopo intencionalmente mínimo:** apenas scaffold + navegação com mocks
> locais. Pastas `services/`, `types/` e `components/common/` existem
> (exigência da #15) mas estão vazias de propósito — o conteúdo real chega
> nas issues donas de cada parte. Não expandir este rascunho.
>
> | Fica para | Issue |
> | --- | --- |
> | Cliente Axios, tipos `Imovel`, `imovelService` | #17 |
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
