# Testes e demonstração da API

## Preparação

Use PHP 8.3+ (conforme `backend/composer.json`) com SQLite, Fileinfo, Mbstring e as extensões exigidas pelo Composer. Na pasta `backend`, execute:

```sh
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan storage:link
php artisan serve --host=127.0.0.1 --port=8000
```

Se o `.env` já existir, preserve sua configuração. Use um banco de desenvolvimento. Os testes PHPUnit usam SQLite em memória e storage temporário.

## Postman

Importe [CMH.postman_collection.json](CMH.postman_collection.json). A variável de collection `base_url` aponta para `http://localhost:8000/api/v1`; ajuste-a para outro host/porta se necessário. Não é exigido token.

Configure o **Working directory** do Postman para a raiz do repositório CMH. Os três uploads usam [fixtures/fachada.png](fixtures/fachada.png), um PNG mínimo de teste. Se o Postman não resolver o arquivo relativo, selecione-o no campo `foto` das requisições 01, 05 e 06. Pode substituir por JPG/JPEG, PNG ou WEBP de até 2 MB. Use o aplicativo desktop ou Desktop Agent para acessar o servidor local.

Execute a collection inteira na ordem indicada:

1. Cria um anúncio com foto e salva automaticamente seu `imovel_id`.
2. Lista com filtros de tipo, finalidade, preço mínimo/máximo, cidade, busca e disponibilidade.
3. Consulta o detalhe.
4. Atualiza preço por JSON.
5. Atualiza título e foto por POST multipart com `_method=PUT`.
6. Troca somente a foto.
7. Envia dados inválidos e verifica HTTP 422 e mensagens em português.
8. Exclui o anúncio criado na primeira requisição e limpa `imovel_id`.

O script de pré-requisição calcula uma data futura em cada execução. O Postman gera o boundary multipart; não adicione `Content-Type` manualmente nos uploads. As respostas salvas são exemplos ilustrativos; as asserções são executadas contra as respostas reais.

Para executar via Newman, na **raiz do repositório**:

```sh
npx --yes newman run docs/api/CMH.postman_collection.json --working-dir .
```

Para outra porta, acrescente `--env-var base_url=http://localhost:8765/api/v1`. A collection cria e remove um anúncio de demonstração. Se interromper a execução, remova esse anúncio pela requisição 08 usando o ID retornado no cadastro.

## OpenAPI / Swagger / Insomnia

Importe [openapi.json](openapi.json) no Swagger Editor ou no Insomnia. O arquivo usa OpenAPI 3.0.3 e descreve todos os endpoints de `specs.md`, schemas, filtros, uploads, respostas paginadas e exemplos 422. As datas estáticas de exemplo devem ser ajustadas para hoje ou futuro. O Swagger hospedado em outra origem depende da configuração de CORS apropriada no servidor; a collection desktop funciona diretamente contra o serve local.

## Testes automatizados

Na pasta `backend`:

```sh
php artisan test --compact tests/Feature/ImovelValidationTest.php
php artisan test --compact
```

A nova suíte fixa o relógio e cobre RN-01, RN-02, RN-03, RN-04 e RN-08 com mensagens em português. Exercita cadastro, edição parcial e os três fluxos de upload, verifica ausência de alterações após rejeições 422 e aceita os limites válidos (hoje, preço zero, área 0,01 e foto de 2048 KB). Uma edição que converte casa em terreno também precisa zerar quartos e banheiros existentes.

As falhas de validação retornam `message: "Os dados fornecidos são inválidos."` e `errors` por campo, conforme `specs.md`.
