# 📱 CMH — Cadastro Móvel Habitacional (Anúncios de Imóveis)

> **Trabalho Prático (TP - Entrega 1)** da disciplina de **Programação para Dispositivos Móveis (PDM 2026.2)** — FATEC PG.
> Backend API REST em **Laravel** integrado com aplicativo móvel em **Expo (React Native) + TypeScript**.

[![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)]()
[![Laravel](https://img.shields.io/badge/Laravel-11%20%2F%2012-FF2D20)]()
[![PHP](https://img.shields.io/badge/PHP-8.2%2B-777BB4)]()
[![Expo](https://img.shields.io/badge/Expo-SDK%2052-black)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)]()
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
| **Backend API** | **Laravel (PHP 8.2+)** | MVC/API, Eloquent ORM e Form Requests. |
| **Banco de Dados** | **SQLite / PostgreSQL** | Migrations versionadas. |
| **Armazenamento de Fotos**| **Laravel Storage (disk: public)** | `storage/app/public/imoveis` via `php artisan storage:link`. |
| **Frontend Mobile** | **Expo SDK (React Native)** | Android & iOS. |
| **Linguagem Frontend** | **TypeScript 5** | Tipagem estrita. |
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

---

## 💻 Como Executar o Projeto

### Pré-requisitos
- PHP 8.2+ e Composer;
- Extensões PHP: `php-mbstring`, `php-xml`, `php-curl`, `php-zip`, `php-sqlite3` ou `php-mysql`;
- Node.js 18+ e npm / yarn;
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

npx expo start
```

Escaneie o QR Code com a câmera (iOS) ou pelo app **Expo Go** (Android).

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
