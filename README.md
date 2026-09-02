# 📱 CMH — Sistema de Gestão e Cadastro de Usuários

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
| Anderson Ferreira Queiroz | Desenvolvedor Full-Stack / Líder | [@AndersonFQueiroz](https://github.com/AndersonFQueiroz) |
| Igor Marcoli | Desenvolvedor Mobile / Backend | [@IgorMarcoli](https://github.com/IgorMarcoli) |
| Pedro | Desenvolvedor Mobile / Frontend | [@Pedro]() |
| João | Desenvolvedor Mobile / Documentação | [@Joao]() |

> 📌 *Este arquivo e a documentação na raiz atendem à exigência de encaminhamento descrevendo o tema do trabalho e os nomes dos membros da equipe.*

---

## 📋 Sobre o Projeto e Requisitos do Edital

O **CMH** é uma aplicação completa com arquitetura cliente-servidor voltada para a gestão de cadastros de usuários e colaboradores. O projeto foi concebido para cumprir integralmente todos os requisitos da **Entrega 1 do Trabalho Prático de PDM (2026.2)**:

- ✅ **Backend API-REST em Laravel:** Estrutura robusta utilizando migrations, models Eloquent, controllers de API, form requests para validação e resources para formatação JSON padronizada.
- ✅ **Frontend Mobile em Expo + TypeScript:** Interface móvel moderna para consumo da API REST, visualização dos cadastros e captura/upload de fotos via câmera e galeria.
- ✅ **CRUD Completo:** Suporte a listagem, criação, leitura detalhada, edição e remoção de registros.
- ✅ **Atributos Obrigatórios do Edital (mínimo de 7 atributos):**

| Atributo | Tipo no Banco | Categoria Edital | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED` | **Número** | Identificador único autoincrementado |
| `nome` | `VARCHAR(150)` | **String** | Nome completo do usuário |
| `email` | `VARCHAR(150)` | **String** | Endereço de e-mail único |
| `telefone` | `VARCHAR(20)` | **String** | Telefone de contato no formato `(XX) XXXXX-XXXX` |
| `cpf` | `VARCHAR(14)` | **String** | Cadastro de Pessoa Física formatado e único |
| `idade` | `INTEGER` | **Número** | Idade calculada/informada (inteiro positivo) |
| `salario` | `DECIMAL(10,2)` | **Número** | Remuneração ou renda mensal |
| `data_nascimento` | `DATE` | **Data** | Data de nascimento no formato `YYYY-MM-DD` |
| `data_admissao` | `DATE` | **Data** | Data de ingresso/admissão no sistema |
| `foto` / `foto_url` | `VARCHAR(255)` | **Foto** | Caminho no storage e URL pública acessível |
| `ativo` | `BOOLEAN` | *Controle* | Flag indicando se o cadastro está ativo |
| `bio` | `TEXT` | **String** | Biografia ou observações adicionais |
| `created_at` | `TIMESTAMP` | **Data** | Data e hora de criação do registro |
| `updated_at` | `TIMESTAMP` | **Data** | Data e hora da última atualização |

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Descrição |
| :--- | :--- | :--- |
| **Backend API** | **Laravel (PHP 8.2+)** | Framework PHP moderno com arquitetura MVC/API, Eloquent ORM e Form Requests. |
| **Banco de Dados** | **SQLite / PostgreSQL** | Banco relacional leve para desenvolvimento e produção com migrations versionadas. |
| **Armazenamento de Fotos**| **Laravel Storage (disk: public)** | Storage local exposto publicamente via symlink `php artisan storage:link`. |
| **Frontend Mobile** | **Expo SDK (React Native)** | Plataforma multiplataforma (Android & iOS) de desenvolvimento mobile rápido. |
| **Linguagem Frontend** | **TypeScript 5** | Tipagem estática estrita para interfaces, serviços de API e componentes. |
| **Comunicação HTTP** | **Axios / Fetch API** | Cliente HTTP configurado com base URL dinâmica para acesso ao IP local do backend. |
| **Seleção de Mídia** | **expo-image-picker** | Permissões e captura de fotos diretamente da galeria ou da câmera do dispositivo. |

---

## 🚀 Endpoints da API REST

Todas as rotas estão sob o prefixo `/api/v1` e retornam respostas estruturadas no padrão JSON:

| Método | Endpoint | Descrição | Status de Sucesso |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/usuarios` | Lista todos os usuários (com paginação e filtros opcionais) | `200 OK` |
| `POST` | `/api/v1/usuarios` | Cria um novo usuário (suporta upload de foto `multipart/form-data`) | `201 Created` |
| `GET` | `/api/v1/usuarios/{id}` | Retorna os detalhes de um usuário específico | `200 OK` |
| `PUT` / `POST` | `/api/v1/usuarios/{id}` | Atualiza os dados de um usuário (com `_method=PUT` para multipart) | `200 OK` |
| `DELETE` | `/api/v1/usuarios/{id}` | Remove um usuário e sua foto associada do storage | `204 No Content` |
| `POST` | `/api/v1/usuarios/{id}/foto` | Atualiza especificamente a foto de perfil do usuário | `200 OK` |

Para documentação completa de schemas de payload e respostas de erro, consulte o arquivo [`specs.md`](./specs.md).

---

## 💻 Como Executar o Projeto

### Pré-requisitos
- PHP 8.2 ou superior e Composer instalados;
- Extensões PHP: `php-mbstring`, `php-xml`, `php-curl`, `php-zip`, `php-sqlite3` ou `php-mysql`;
- Node.js 18+ e npm / yarn;
- Aplicativo **Expo Go** instalado no seu smartphone (ou emulador Android/iOS configurado).

---

### 1. Inicializando o Backend (Laravel)

```bash
# Entre no diretório do backend
cd backend

# Instale as dependências do Composer
composer install

# Copie o arquivo de variáveis de ambiente e gere a chave da aplicação
cp .env.example .env
php artisan key:generate

# Crie o link simbólico para permitir acesso público às fotos salvas
php artisan storage:link

# Execute as migrações (e seeds opcionais para teste)
php artisan migrate --seed

# Inicie o servidor embutido acessível pela rede local (substitua pelo IP da sua máquina se necessário)
php artisan serve --host=0.0.0.0 --port=8000
```

> 💡 **Dica para testes no Mobile:** Ao rodar no Expo com dispositivo físico na mesma rede Wi-Fi, substitua `localhost` pelo IP local do seu computador (ex: `http://192.168.1.100:8000/api/v1`).

---

### 2. Inicializando o Frontend Mobile (Expo)

```bash
# Em outro terminal, acesse o diretório mobile
cd mobile

# Instale as dependências do Node.js
npm install

# Configure a URL da API no arquivo .env ou em src/services/api.ts
# EXPO_PUBLIC_API_URL=http://<SEU_IP_LOCAL>:8000/api/v1

# Inicie o bundler do Expo
npx expo start
```

Escaneie o QR Code exibido no terminal com a câmera do seu celular (iOS) ou pelo app **Expo Go** (Android).

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

Este projeto é desenvolvido para fins acadêmicos sob a licença [MIT](./LICENSE).
>>>>>>> 8190892 (docs: adicionar documentação completa do projeto CMH)
>>>>>>> 22c5cbc (docs: adicionar documentação completa do projeto CMH)
