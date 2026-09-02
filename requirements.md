# Requisitos do Projeto — CMH

Este documento descreve detalhadamente os **requisitos funcionais (RF)**, **requisitos não funcionais (RNF)** e as **regras de negócio (RN)** do projeto **CMH**, desenvolvido para a disciplina de **Programação para Dispositivos Móveis (PDM 2026.2)** — *TP Entrega 1*.

---

## 🎯 Contexto da Atividade Acadêmica (TP - Entrega 1)

Conforme as instruções da entrega avaliativa:
- **Objetivo:** Desenvolver uma API-REST em Laravel como backend do projeto para dispositivos móveis em Expo.
- **Exigência Central:** CRUD completo de uma entidade de cadastro contendo, no mínimo, **7 atributos**, cobrindo obrigatoriamente:
  - 🔢 **Números** (`id`, `idade`, `salario`)
  - 🔤 **Strings** (`nome`, `email`, `telefone`, `cpf`, `bio`)
  - 📅 **Datas** (`data_nascimento`, `data_admissao`, `created_at`, `updated_at`)
  - 📷 **Foto** (`foto`, `foto_url` com upload de arquivo via multipart)
- **Tema:** Livre — Escolhido: **Gestão de Usuários e Colaboradores (CMH)**.
- **Equipe:** Anderson Ferreira Queiroz e demais integrantes do grupo.

---

## 📊 Matriz de Atributos da Entidade Usuário

Para garantir conformidade acima do mínimo solicitado, o cadastro de Usuário possui **13 atributos**:

| Atributo | Tipo de Dado | Categoria do Edital | Obrigatoriedade | Restrições e Validações |
| :--- | :--- | :--- | :--- | :--- |
| `id` | Inteiro (BigInt) | **Número** | Automático | Chave primária autoincrementada. |
| `nome` | Texto (Varchar 150)| **String** | Obrigatório | Mínimo 3 caracteres, máximo 150 caracteres. |
| `email` | Texto (Varchar 150)| **String** | Obrigatório | Formato de e-mail válido e valor único no sistema. |
| `telefone` | Texto (Varchar 20) | **String** | Obrigatório | Máscara `(XX) XXXXX-XXXX` ou `(XX) XXXX-XXXX`. |
| `cpf` | Texto (Varchar 14) | **String** | Obrigatório | Máscara `XXX.XXX.XXX-XX`, 11 dígitos numéricos, único. |
| `idade` | Inteiro (Integer) | **Número** | Obrigatório | Valor entre 0 e 120 anos, coerente com a data de nascimento. |
| `salario` | Decimal (10, 2) | **Número** | Opcional | Valor decimal monetário maior ou igual a 0.00. |
| `data_nascimento` | Data (Date) | **Data** | Obrigatório | Formato `YYYY-MM-DD`, data anterior ao dia atual. |
| `data_admissao` | Data (Date) | **Data** | Opcional | Formato `YYYY-MM-DD`, data de entrada no sistema. |
| `foto` | Texto (Varchar 255)| **Foto** | Opcional | Caminho do arquivo gravado no storage (`usuarios/...`). |
| `foto_url` | Texto (URL virtual) | **Foto** | Virtual | URL completa acessível via HTTP para carregamento no app. |
| `ativo` | Booleano (Boolean)| *Controle* | Opcional (Default: true) | Indica status do registro (`true` para ativo, `false` para inativo). |
| `bio` | Texto Longo (Text) | **String** | Opcional | Observações, perfil profissional ou biografia resumida. |

---

## ⚙️ Requisitos Funcionais (RF)

### 1. Operações CRUD do Backend (Laravel)

| ID | Requisito | Prioridade | Descrição |
| :--- | :--- | :--- | :--- |
| **RF-01** | Listar Usuários | Alta | A API deve permitir a listagem de usuários com suporte a paginação e contagem total de registros. |
| **RF-02** | Filtrar Usuários | Média | A listagem da API deve permitir filtros opcionais por `nome` (busca parcial), `email` e status `ativo`. |
| **RF-03** | Visualizar Usuário | Alta | A API deve retornar todos os dados cadastrais de um usuário específico a partir de seu ID numérico. |
| **RF-04** | Cadastrar Usuário | Alta | A API deve permitir a criação de um novo usuário recebendo os dados via requisição HTTP POST. |
| **RF-05** | Upload de Foto | Alta | A criação e atualização de usuário devem aceitar arquivo de imagem (`multipart/form-data`) e armazená-lo no storage público do Laravel. |
| **RF-06** | Atualizar Usuário | Alta | A API deve permitir a edição de todos os atributos cadastrais de um usuário através de seu ID. |
| **RF-07** | Atualização Exclusiva de Foto | Média | A API deve prover um endpoint específico (`POST /api/v1/usuarios/{id}/foto`) para alterar apenas a imagem de perfil sem reenviar todos os dados. |
| **RF-08** | Excluir Usuário | Alta | A API deve permitir a exclusão permanente de um usuário e remover o arquivo de foto correspondente do storage para evitar acúmulo de lixo. |
| **RF-09** | Validação de Unicidade | Alta | O sistema deve rejeitar o cadastro ou atualização com e-mail ou CPF já utilizados por outro usuário, retornando código HTTP 422. |

### 2. Interface e Consumo no Frontend (Expo Mobile)

| ID | Requisito | Prioridade | Descrição |
| :--- | :--- | :--- | :--- |
| **RF-10** | Tela de Listagem no App | Alta | O aplicativo deve exibir uma lista rolável (`FlatList`) de usuários cadastrados com foto de perfil, nome, e-mail e cargo/idade. |
| **RF-11** | Pull-to-Refresh e Busca | Média | O usuário do aplicativo deve poder puxar a tela para atualizar a lista e digitar no campo de busca para filtrar por nome. |
| **RF-12** | Tela de Detalhes | Alta | Ao tocar em um usuário da lista, o app deve abrir a tela com a foto ampliada e todos os 13 atributos formatados. |
| **RF-13** | Formulário de Cadastro e Edição | Alta | O aplicativo deve fornecer formulário com campos devidamente tipados e máscaras para CPF, telefone, data de nascimento e salário. |
| **RF-14** | Seleção de Foto (Câmera e Galeria) | Alta | O app deve integrar com o `expo-image-picker` solicitando permissões para tirar foto com a câmera ou escolher da galeria. |
| **RF-15** | Confirmação de Exclusão | Média | O app deve exibir um diálogo de alerta (`Alert.alert`) solicitando confirmação antes de disparar a deleção do registro na API. |

---

## 🔒 Requisitos Não Funcionais (RNF)

| ID | Requisito | Categoria | Descrição |
| :--- | :--- | :--- | :--- |
| **RNF-01** | Padrão Arquitetural RESTful | Arquitetura | A API deve seguir rigorosamente as convenções REST, utilizando verbos HTTP corretos (`GET`, `POST`, `PUT`, `DELETE`) e respostas em JSON. |
| **RNF-02** | Desempenho e Tempo de Resposta | Performance | Os endpoints de leitura e escrita devem responder em menos de 300ms em condições normais de rede local. |
| **RNF-03** | Armazenamento de Arquivos | Armazenamento | As fotos devem ser salvas no disco público do Laravel (`storage/app/public/usuarios`), expostas via link simbólico `storage/`. |
| **RNF-04** | Tipagem Estrita e Segurança | Confiabilidade | O código mobile deve ser 100% tipado com TypeScript, e o backend deve utilizar Form Requests tipados sem injeção de SQL. |
| **RNF-05** | Responsividade e Usabilidade | UI / UX | O app deve se adaptar fluidamente a diferentes tamanhos de tela (smartphones comuns e tablets) em Android e iOS. |
| **RNF-06** | Tratamento de Erros Padronizado | Usabilidade | Erros de validação (HTTP 422) e falhas de conexão devem ser tratados com mensagens claras e legíveis em português. |
| **RNF-07** | Configuração de CORS | Segurança / Rede | A API Laravel deve permitir requisições de origens cruzadas (CORS) para permitir testes locais no emulador e no smartphone via Wi-Fi. |

---

## 📜 Regras de Negócio (RN)

- **RN-01 (Unicidade Cadastral):** O `email` e o `cpf` devem ser estritamente únicos na tabela de usuários.
- **RN-02 (Validação de Foto):** Arquivos de foto devem ser do tipo imagem (`jpg`, `jpeg`, `png`, `webp`) com tamanho máximo de 2 MB (2048 KB).
- **RN-03 (Consistência Etária):** A `data_nascimento` deve ser uma data no passado. A `idade` informada deve ser compatível com o ano de nascimento (diferença máxima de 1 ano em relação à data atual).
- **RN-04 (Higienização de Formatação):** A API deve aceitar CPFs e telefones com ou sem pontuação, persistindo de forma padronizada ou normalizando strings.
- **RN-05 (Limpeza de Mídia Órfã):** Ao atualizar a foto de um usuário ou ao deletar seu registro, o arquivo físico antigo presente no servidor deve ser removido do disco.
- **RN-06 (Fallback de Foto no Mobile):** Caso o usuário não possua foto cadastrada (`foto = null`), o aplicativo deve exibir um avatar padrão com as iniciais do nome.

---

## 🚫 Fora de Escopo da Entrega 1

As seguintes funcionalidades não fazem parte dos requisitos obrigatórios da Entrega 1 e poderão ser implementadas em entregas futuras do TP:
- Autenticação e autorização por tokens JWT / Laravel Sanctum;
- Recuperação de senha por e-mail com servidor SMTP externo;
- Multi-tenancy e controle refinado de permissões por papéis (RBAC);
- Sincronização offline-first com banco local (WatermelonDB / SQLite local no mobile).
