# Requisitos do Projeto — CMH (Cadastro Móvel Habitacional)

Este documento descreve detalhadamente os **requisitos funcionais (RF)**, **requisitos não funcionais (RNF)** e as **regras de negócio (RN)** do projeto **CMH**, desenvolvido para a disciplina de **Programação para Dispositivos Móveis (PDM 2026.2)** — *TP Entrega 1*.

---

## 🎯 Contexto da Atividade Acadêmica (TP - Entrega 1)

Conforme as instruções da entrega avaliativa:
- **Objetivo:** Desenvolver uma API-REST em Laravel como backend do projeto para dispositivos móveis em Expo.
- **Exigência Central:** CRUD completo de uma entidade de cadastro contendo, no mínimo, **7 atributos**, cobrindo obrigatoriamente:
  - 🔢 **Números** (`id`, `preco`, `area_m2`, `quartos`, `banheiros`, `vagas`)
  - 🔤 **Strings** (`titulo`, `descricao`, `tipo`, `finalidade`, `endereco`, `cidade`, `contato_telefone`)
  - 📅 **Datas** (`data_disponibilidade`, `created_at`, `updated_at`)
  - 📷 **Foto** (`foto`, `foto_url` com upload de arquivo via multipart)
- **Tema:** Livre — Escolhido: **Anúncios de Imóveis para Venda e Aluguel (CMH — Cadastro Móvel Habitacional)**.
- **Equipe:** Anderson Ferreira Queiroz e demais integrantes do grupo.

> Decisão de escopo: a entidade `visitas` (agendamento de visitas ao imóvel) fica como **plus futuro (Entrega 2+)**, fora do MVP da Entrega 1.

---

## 📊 Matriz de Atributos da Entidade Imóvel

Para garantir conformidade acima do mínimo solicitado, o cadastro de Imóvel possui **17 atributos**:

| Atributo | Tipo de Dado | Categoria do Edital | Obrigatoriedade | Restrições e Validações |
| :--- | :--- | :--- | :--- | :--- |
| `id` | Inteiro (BigInt) | **Número** | Automático | Chave primária autoincrementada. |
| `titulo` | Texto (Varchar 150) | **String** | Obrigatório | Mínimo 5, máximo 150 caracteres. Ex: "Casa 3 quartos c/ quintal". |
| `descricao` | Texto Longo (Text) | **String** | Opcional | Descrição do imóvel, diferenciais, regras. |
| `tipo` | Enum string (Varchar 20) | **String** | Obrigatório | Um de: `casa`, `apartamento`, `kitnet`, `comercial`, `terreno`. |
| `finalidade` | Enum string (Varchar 10) | **String** | Obrigatório | Um de: `venda`, `aluguel`. |
| `endereco` | Texto (Varchar 200) | **String** | Obrigatório | Rua, número, bairro. Ex: "Rua X, 123 - Centro". |
| `cidade` | Texto (Varchar 100) | **String** | Obrigatório | Cidade/UF. Ex: "Praia Grande/SP". |
| `preco` | Decimal (12, 2) | **Número** | Obrigatório | Valor de venda ou aluguel mensal. `>= 0`. |
| `area_m2` | Decimal (8, 2) | **Número** | Obrigatório | Área em m². `> 0`. |
| `quartos` | Inteiro | **Número** | Obrigatório | `0` a `50`. Terreno = `0`. |
| `banheiros` | Inteiro | **Número** | Obrigatório | `0` a `20`. |
| `vagas` | Inteiro | **Número** | Opcional (Default: 0) | Vagas de garagem. `0` a `20`. |
| `data_disponibilidade` | Data (Date) | **Data** | Obrigatório | Formato `YYYY-MM-DD`, `>= hoje`. |
| `foto` | Texto (Varchar 255) | **Foto** | Opcional | Caminho do arquivo no storage (`imoveis/...`). |
| `foto_url` | Texto (URL virtual) | **Foto** | Virtual | URL completa acessível via HTTP para o app. |
| `disponivel` | Booleano | *Controle* | Opcional (Default: true) | `true` = anunciado, `false` = pausado/alugado/vendido. |
| `contato_telefone` | Texto (Varchar 20) | **String** | Obrigatório | Máscara `(XX) XXXXX-XXXX` ou `(XX) XXXX-XXXX`. |
| `created_at` | Timestamp | **Data** | Automático | Data/hora de criação. |
| `updated_at` | Timestamp | **Data** | Automático | Data/hora da última atualização. |

---

## ⚙️ Requisitos Funcionais (RF)

### 1. Operações CRUD do Backend (Laravel)

| ID | Requisito | Prioridade | Descrição |
| :--- | :--- | :--- | :--- |
| **RF-01** | Listar Imóveis | Alta | A API deve permitir a listagem de imóveis com paginação e contagem total. |
| **RF-02** | Filtrar Imóveis | Alta | A listagem deve permitir filtros por `busca` (título/endereço), `tipo`, `finalidade`, `cidade`, `disponivel`, `preco_min`, `preco_max`. |
| **RF-03** | Visualizar Imóvel | Alta | A API deve retornar todos os dados de um imóvel a partir do ID numérico. |
| **RF-04** | Cadastrar Imóvel | Alta | A API deve permitir a criação de um novo imóvel via POST. |
| **RF-05** | Upload de Foto | Alta | A criação e atualização devem aceitar imagem (`multipart/form-data`) e armazená-la no storage público. |
| **RF-06** | Atualizar Imóvel | Alta | A API deve permitir a edição de todos os atributos via ID. |
| **RF-07** | Atualização Exclusiva de Foto | Média | Endpoint `POST /api/v1/imoveis/{id}/foto` para trocar só a foto da fachada. |
| **RF-08** | Excluir Imóvel | Alta | Exclusão permanente + remoção do arquivo de foto do storage. |
| **RF-09** | Validação de Domínio | Alta | Rejeitar `tipo`/`finalidade` inválidos, `preco` negativo, `data_disponibilidade` no passado. Retornar HTTP 422. |

### 2. Interface e Consumo no Frontend (Expo Mobile)

| ID | Requisito | Prioridade | Descrição |
| :--- | :--- | :--- | :--- |
| **RF-10** | Tela de Listagem no App | Alta | Lista rolável (`FlatList`) com foto, título, preço, cidade, badges de tipo/finalidade. |
| **RF-11** | Pull-to-Refresh, Busca e Filtros | Alta | Puxar para atualizar, buscar por texto, filtrar por tipo/finalidade/cidade e faixa de preço. |
| **RF-12** | Tela de Detalhes | Alta | Foto ampliada + todos os atributos formatados (preço em R$, área em m², datas em DD/MM/YYYY). |
| **RF-13** | Formulário de Cadastro e Edição | Alta | Formulário com pickers para `tipo`/`finalidade`, campos numéricos e máscaras de preço/telefone/data. |
| **RF-14** | Seleção de Foto (Câmera e Galeria) | Alta | Integração com `expo-image-picker` para foto da fachada. |
| **RF-15** | Confirmação de Exclusão | Média | `Alert.alert` antes de deletar o anúncio. |

---

## 🔒 Requisitos Não Funcionais (RNF)

| ID | Requisito | Categoria | Descrição |
| :--- | :--- | :--- | :--- |
| **RNF-01** | Padrão Arquitetural RESTful | Arquitetura | Verbos HTTP corretos (`GET`, `POST`, `PUT`, `DELETE`) e JSON. |
| **RNF-02** | Desempenho | Performance | Resposta < 300ms em rede local. |
| **RNF-03** | Armazenamento de Arquivos | Armazenamento | Fotos em `storage/app/public/imoveis`, expostas via `storage/`. |
| **RNF-04** | Tipagem e Segurança | Confiabilidade | Mobile 100% TypeScript, backend com Form Requests, sem SQL injection. |
| **RNF-05** | Responsividade | UI/UX | Adaptação a smartphones e tablets Android/iOS. |
| **RNF-06** | Tratamento de Erros | Usabilidade | Erros 422 e falhas de conexão com mensagens claras em português. |
| **RNF-07** | CORS | Segurança/Rede | Permitir requisições do emulador e smartphone via Wi-Fi. |

---

## 📜 Regras de Negócio (RN)

- **RN-01 (Valores):** `preco >= 0`, `area_m2 > 0`, `quartos/banheiros/vagas >= 0`.
- **RN-02 (Disponibilidade):** `data_disponibilidade` deve ser `>= hoje`. Não faz sentido anunciar imóvel com data passada.
- **RN-03 (Coerência do tipo):** Se `tipo = terreno`, `quartos` e `banheiros` devem ser `0`.
- **RN-04 (Domínio fechado):** `tipo` e `finalidade` só aceitam os valores do enum. Qualquer outro valor → 422.
- **RN-05 (Limpeza de Mídia Órfã):** Ao atualizar a foto ou deletar o imóvel, remover o arquivo físico antigo do disco.
- **RN-06 (Fallback de Foto no Mobile):** Se `foto = null`, exibir placeholder com ícone de casa.
- **RN-07 (Formatação):** `preco` exibido como `R$ 2.500,00/mês` (aluguel) ou `R$ 350.000,00` (venda). Telefone no padrão BR. Data em `DD/MM/YYYY`.
- **RN-08 (Validação de Foto):** Apenas `jpg`, `jpeg`, `png`, `webp` até 2 MB (2048 KB).

---

## 🚫 Fora de Escopo da Entrega 1

- Agendamento de visitas (`visitas`: `imovel_id`, `nome_visitante`, `data_visita`) — **plus para Entrega 2+**;
- Autenticação JWT / Sanctum e perfis de corretor;
- Galeria multi-foto por imóvel (na Entrega 1, 1 foto de capa por imóvel);
- Mapa/geolocalização, chat, favoritos e sincronização offline-first.
