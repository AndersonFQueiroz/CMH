# 📱 CMH — Cadastro Móvel Habitacional (Anúncios de Imóveis)

> **Trabalho Prático (TP - Entrega 1)** da disciplina de **Programação para Dispositivos Móveis (PDM 2026.2)** — FATEC PG.
> Backend API REST em **Laravel** integrado com aplicativo móvel em **Expo (React Native) + TypeScript**.

[![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)]()
[![Laravel](https://img.shields.io/badge/Laravel-13-FF2D20)]()
[![PHP](https://img.shields.io/badge/PHP-8.3%2B-777BB4)]()
[![Expo](https://img.shields.io/badge/Expo-SDK%2057-black)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

---

## 👥 Membros da Equipe

| Nome Completo | Matrícula / Função | GitHub |
| ------------- | ------------------ | ------ |
| Anderson Ferreira Queiroz | Desenvolvedor Full-Stack | [@AndersonFQueiroz](https://github.com/AndersonFQueiroz) |
| Igor Marcoli | Desenvolvedor Full-Stack | [@IgorMarcoli](https://github.com/IgorMarcoli) |
| Pedro Muginski| Desenvolvedor Full-Stack | [@Muginski](https://github.com/Muginski) |
| João Martins | Desenvolvedor Full-Stack | [@JoaoPMA23](https://github.com/JoaoPMA23) |

> 📌 *Este arquivo e a documentação na raiz atendem à exigência de encaminhamento descrevendo o tema do trabalho e os nomes dos membros da equipe.*

---

## 📋 Sobre o Projeto e Requisitos do Edital

O **CMH (Cadastro Móvel Habitacional)** é uma aplicação cliente-servidor para **anúncio de imóveis para venda e aluguel**. O projeto cumpre todos os requisitos da **Entrega 1 do TP de PDM (2026.2)**:

- ✅ **Backend API-REST em Laravel:** Migrations, models Eloquent, controllers de API, form requests e resources.
- ✅ **Frontend Mobile em Expo + TypeScript:** Listagem de anúncios, filtros, detalhes e upload de foto da fachada via câmera/galeria.
- ✅ **CRUD Completo:** Listar, criar, detalhar, editar e remover anúncios.
- ✅ **Atributos Obrigatórios do Edital (mínimo de 7 atributos):**

| Atributo | Tipo no Banco | Categoria Edital | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` | **Número** | Identificador único autoincrementado |
| `titulo` | `VARCHAR(150)` | **String** | Título do anúncio |
| `descricao` | `TEXT` | **String** | Descrição e diferenciais |
| `tipo` | `VARCHAR(20)` | **String** | casa, apartamento, kitnet, comercial, terreno |
| `finalidade` | `VARCHAR(10)` | **String** | venda ou aluguel |
| `endereco` | `VARCHAR(200)` | **String** | Rua, número, bairro |
| `cidade` | `VARCHAR(100)` | **String** | Cidade/UF |
| `preco` | `DECIMAL(12,2)` | **Número** | Preço de venda ou aluguel mensal |
| `area_m2` | `DECIMAL(8,2)` | **Número** | Área em m² |
| `quartos` | `INTEGER` | **Número** | Dormitórios |
| `banheiros` | `INTEGER` | **Número** | Banheiros |
| `vagas` | `INTEGER` | **Número** | Vagas de garagem |
| `data_disponibilidade` | `DATE` | **Data** | Data a partir da qual está disponível |
| `foto` / `foto_url` | `VARCHAR(255)` | **Foto** | Foto da fachada no storage + URL pública |
| `disponivel` | `BOOLEAN` | *Controle* | Anúncio ativo ou pausado |
| `contato_telefone` | `VARCHAR(20)` | **String** | Telefone do anunciante |
| `created_at` | `TIMESTAMP` | **Data** | Criação do registro |
| `updated_at` | `TIMESTAMP` | **Data** | Última atualização |

> Plus futuro (fora da Entrega 1): agendamento de `visitas` ao imóvel.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Descrição |
| :--- | :--- | :--- |
| **Backend API** | **Laravel 13 (PHP 8.3+)** | MVC/API, Eloquent ORM e Form Requests. |
| **Banco de Dados** | **SQLite / PostgreSQL** | Migrations versionadas. |
| **Armazenamento de Fotos**| **Laravel Storage (disk: public)** | `storage/app/public/imoveis` via `php artisan storage:link`. |
| **Frontend Mobile** | **Expo SDK 57 (React Native 0.86)** | Android & iOS. |
| **Linguagem Frontend** | **TypeScript 6** | Tipagem estrita. |
| **Comunicação HTTP** | **Axios / Fetch API** | Base URL dinâmica para IP local. |
| **Seleção de Mídia** | **expo-image-picker** | Foto da fachada via câmera ou galeria. |

---

## 🚀 Endpoints da API REST

Prefixo `/api/v1`, JSON padronizado:

| Método | Endpoint | Descrição | Status de Sucesso |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/imoveis` | Lista anúncios (paginação + filtros: busca, tipo, finalidade, cidade, preco_min/max, disponivel) | `200 OK` |
| `POST` | `/api/v1/imoveis` | Cria anúncio (suporta `multipart/form-data` com foto) | `201 Created` |
| `GET` | `/api/v1/imoveis/{id}` | Detalhe de um anúncio | `200 OK` |
| `PUT` / `POST` | `/api/v1/imoveis/{id}` | Atualiza anúncio (`_method=PUT` para multipart) | `200 OK` |
| `DELETE` | `/api/v1/imoveis/{id}` | Remove anúncio + foto do storage | `204 No Content` |
| `POST` | `/api/v1/imoveis/{id}/foto` | Troca só a foto de capa | `200 OK` |

Para schemas e payloads completos, consulte [`specs.md`](./specs.md).

A [documentação de testes e demonstração](docs/api/README.md) inclui a collection Postman, a especificação OpenAPI para Swagger/Insomnia e instruções para executar os testes de validação.

---

## 💻 Como Executar o Projeto

### Pré-requisitos
- PHP 8.3+ e Composer;
- Extensões PHP: `php-mbstring`, `php-xml`, `php-curl`, `php-zip`, `php-sqlite3` ou `php-mysql`;
- Node.js 20+ e npm / yarn;
- App **Expo Go** no smartphone (ou emulador).

---

### 1. Inicializando o Backend (Laravel)

```bash
# Entre no diretório do backend
cd backend

# Instale as dependências
composer install

# Configure o ambiente
cp .env.example .env
php artisan key:generate

# Link público para as fotos dos imóveis
php artisan storage:link

# Migrações (e seeds opcionais)
php artisan migrate --seed

# Servidor acessível na rede local
php artisan serve --host=0.0.0.0 --port=8000
```

> 💡 **Dica Mobile:** com Expo em dispositivo físico na mesma Wi-Fi, troque `localhost` pelo IP local (ex: `http://192.168.1.100:8000/api/v1`).

---

### 2. Inicializando o Frontend Mobile (Expo)

```bash
cd mobile
npm install

# Configure a URL da API em .env ou src/services/api.ts
# EXPO_PUBLIC_API_URL=http://<SEU_IP_LOCAL>:8000/api/v1

npm run typecheck
npm test

npx expo start
```

Escaneie o QR Code com a câmera (iOS) ou pelo app **Expo Go** (Android).

---

## 🎓 Roteiro de Demonstração (Entrega 1)

Pré-requisitos: backend com `php artisan serve --host=0.0.0.0 --port=8000` e
`EXPO_PUBLIC_API_URL` apontando para o IP local. Use **Expo Go** no aparelho:
na versão web o `FormData` não envia o arquivo da foto.

1. **Listar** — abra o app e confirme os anúncios do seeder com foto, preço formatado e pull-to-refresh.
2. **Filtrar** — busque por texto e combine tipo, finalidade, cidade e faixa de preço.
3. **Detalhar** — abra um anúncio e confira todos os atributos, inclusive data e telefone formatados.
4. **Criar com foto** — toque em **Novo**, preencha os campos (números, strings e data) e escolha a fachada pela câmera ou galeria.
5. **Editar** — altere preço/área e salve; confirme o reflexo na lista e no detalhe.
6. **Trocar foto** — escolha outra imagem no formulário e salve; a foto antiga deve sumir do storage.
7. **Excluir** — use o botão destrutivo, confirme o `Alert` e verifique a remoção da lista e do banco.

Cobertura das categorias do edital na demo:

| Categoria | Atributos demonstrados |
| :--- | :--- |
| **Números** | `id`, `preco`, `area_m2`, `quartos`, `banheiros`, `vagas` |
| **Strings** | `titulo`, `descricao`, `tipo`, `finalidade`, `endereco`, `cidade`, `contato_telefone` |
| **Datas** | `data_disponibilidade`, `created_at`, `updated_at` |
| **Foto** | upload/URL em `foto`/`foto_url`, troca via câmera ou galeria |

Validação automatizada antes da demo: `cd backend && php artisan test` e
`cd mobile && npm run typecheck && npm test`.

---

## 📂 Estrutura de Arquivos

```
CMH/
├── .gitignore              # Regras de ignore para Laravel, Expo, Node e IDEs
├── CONTRIBUTING.md         # Guia de contribuição, Git flow e padrões de código
├── README.md               # Visão geral, equipe, requisitos e instruções de execução
├── agents.md               # Instruções detalhadas para agentes de IA e automação
├── requirements.md         # Requisitos funcionais (RF) e não funcionais (RNF)
├── specs.md                # Especificações técnicas, rotas, ERD e payloads JSON
├── backend/                # Projeto Laravel (API REST)
└── mobile/                 # Projeto Expo React Native (Frontend Mobile)
```

---

## 📄 Licença

Este projeto é desenvolvido para fins acadêmicos sob a licença MIT.
