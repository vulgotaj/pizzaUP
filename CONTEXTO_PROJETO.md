# Contexto do projeto pizzaUP

## Visão geral

O **pizzaUP** é um sistema para gerenciamento de pedidos de uma pizzaria. A visão do produto inclui um aplicativo mobile para garçons, uma tela de acompanhamento da cozinha, uma área administrativa e uma API central. No repositório atual, somente o backend está presente; as aplicações mobile e web ainda não foram implementadas, e os fluxos de pedidos estão parcialmente implementados na API.

Este documento descreve o estado atual do código, distinguindo funcionalidades implementadas da modelagem prevista no banco.

## Arquitetura

O backend usa uma API REST com **Node.js, TypeScript e Express**. O fluxo adotado é:

```text
Rota → middleware(s) → controller → service → Prisma Client → PostgreSQL
                                      ↑
Resposta HTTP ← controller ← resultado/erro
```

- **Rotas** associam método e caminho aos middlewares e controllers.
- **Middlewares** aplicam validação, autenticação e autorização antes do controller.
- **Controllers** extraem os dados da requisição, chamam o service e formatam a resposta HTTP.
- **Services** concentram as operações de negócio e acesso a dados via Prisma.
- **Prisma Client** é gerado a partir do schema e usa o adaptador PostgreSQL `@prisma/adapter-pg`.

O servidor carrega variáveis de ambiente, habilita JSON e CORS e monta as rotas diretamente na aplicação, sem prefixo global de API.

## Endpoints implementados

| Método | Caminho | Acesso e validação | Comportamento e resposta |
|---|---|---|---|
| `POST` | `/users` | Público; valida o corpo com `createUserSchema` | Cria usuário, armazena a senha com hash bcrypt e responde com `id`, `name`, `email`, `role` e `createdAt` (HTTP 200). |
| `POST` | `/session` | Público; valida o corpo com `authUserSchema` | Confere e-mail e senha e retorna `id`, `name`, `email`, `role` e token JWT com validade de 30 dias (HTTP 200). |
| `GET` | `/me` | Exige JWT válido | Retorna `id`, `name`, `email`, `role` e `createdAt` do usuário autenticado (HTTP 200). |
| `GET` | `/category` | Exige JWT válido; qualquer usuário autenticado | Lista todas as categorias, retornando `id`, `name` e `createdAt` (HTTP 200). |
| `POST` | `/category` | Exige JWT e papel `ADMIN`; valida o corpo com `createCategorySchema` | Cria uma categoria e retorna `id`, `name` e `createdAt` (HTTP 201). |
| `GET` | `/products` | Exige JWT válido; valida o query param opcional `disabled` para aceitar somente `true` ou `false` | Lista produtos pelo valor de `disabled` (padrão `false`), retornando `id`, `name`, `price`, `description`, `banner`, `disabled`, `category_id` e `createdAt` em ordem decrescente de criação (HTTP 200). |
| `POST` | `/product` | Exige JWT e papel `ADMIN`; recebe `multipart/form-data` com o arquivo `file` e valida os campos com `createProductSchema` | Faz upload da imagem do produto e cria o produto, retornando `id`, `name`, `price`, `description`, `banner`, `category_id` e `createdAt` (HTTP 200). |
| `POST` | `/order` | Exige JWT válido; qualquer usuário autenticado; valida `table` como inteiro positivo e `name` como texto não vazio | Cria um pedido em rascunho e retorna `id`, `table`, `status`, `draft`, `name` e `createdAt` (HTTP 201). |
| `GET` | `/orders` | Exige JWT válido; aceita o query param opcional `draft` | Lista pedidos filtrando `draft` (quando omitido, lista pedidos não rascunho), incluindo seus itens e dados dos produtos (HTTP 200). |
| `GET` | `/order/detail` | Exige JWT válido; valida o query param obrigatório `order_id` com `detailOrderSchema` | Busca um pedido pelo ID e retorna todos os campos do pedido, seus itens e os dados completos dos produtos relacionados (HTTP 200); retorna HTTP 404 quando o pedido não existe. |
| `POST` | `/order/add` | Exige JWT válido; valida `order_id`, `product_id` e `amount` no corpo | Adiciona um item ao pedido e retorna seus dados e os dados do produto (HTTP 201). |
| `DELETE` | `/order/remove` | Exige JWT válido; valida `item_id` na query | Verifica se o item existe e, se existir, remove o registro da tabela `Item`. |

As rotas estão declaradas em [`backend/src/routes.ts`](./backend/src/routes.ts). O endpoint de pedidos usa o modelo existente, sem exigir o papel `ADMIN`.

## Validação de entrada

A validação usa **Zod**. O middleware `validateSchema` valida um objeto contendo `body`, `query` e `params`; os schemas definem regras para os dados recebidos no corpo e na query string. Os dados validados não são copiados ou transformados na requisição: os controllers continuam lendo os valores de `req.body` e `req.query`.

Regras atuais:

- **Cadastro (`createUserSchema`)**: `name` é texto com pelo menos 3 caracteres; `email` deve ser válido; `password` é texto com pelo menos 6 caracteres.
- **Autenticação (`authUserSchema`)**: `email` deve ser válido; `password` é texto não vazio.
- **Criação de categoria (`createCategorySchema`)**: `name` é texto com pelo menos 2 caracteres.
- **Listagem de produtos (`listProductsSchema`)**: `disabled`, quando informado na query, deve ser exatamente `true` ou `false`; quando omitido, o controller usa `false`.
- **Criação de produto (`createProductSchema`)**: `name`, `description` e `category_id` são textos não vazios; `price` é texto não vazio contendo somente dígitos. O controller converte `price` para inteiro. A imagem é obrigatória e enviada separadamente no campo `file` do formulário `multipart/form-data`.
- **Criação de pedido (`createOrderSchema`)**: `table` deve ser um inteiro positivo e `name` deve ser um texto não vazio.
- **Adição de item (`addItemSchema`)**: `order_id` e `product_id` devem ser textos não vazios; `amount` deve ser um inteiro positivo.
- **Remoção de item (`removeItemSchema`)**: `item_id` é obrigatório como texto não vazio no query param.
- **Detalhe do pedido (`detailOrderSchema`)**: `order_id` é obrigatório como texto não vazio no query param.

Erros de validação retornam HTTP 400, com `error` e uma lista `details` contendo as mensagens dos problemas encontrados. Os schemas ficam em [`backend/src/schemas/`](./backend/src/schemas/).

## Middlewares e tratamento de erros

- **`validateSchema(schema)`** (`backend/src/middlewares/validateSchema.ts`): executa o schema de forma assíncrona; responde HTTP 400 para erros Zod e HTTP 500 para outros erros durante a validação.
- **`isAuthenticated`** (`backend/src/middlewares/isAuthenticated.ts`): lê o token do cabeçalho `Authorization`, verifica a assinatura usando `JWT_SECRET` e define `req.userId` a partir do `sub` do JWT. Responde HTTP 401 se o token estiver ausente ou inválido.
- **`isAdmin`** (`backend/src/middlewares/isAdmin.ts`): consulta o usuário autenticado no banco e permite continuar somente se seu papel for `ADMIN`. Responde HTTP 401 quando não há usuário associado ou o papel não é administrativo. É usado nas rotas de criação de categoria e produto.
- **Tratamento global** (`backend/src/server.ts`): o middleware final responde HTTP 400 com a mensagem para erros que são instâncias de `Error`; para os demais, responde HTTP 500 com `"Internal server error"`.
- **Services**: usar `try/catch` em todos os Services para tratar falhas das operações de negócio e do acesso a dados.

O papel padrão criado para usuários é `STAFF`. O JWT usa a variável de ambiente `JWT_SECRET`; ela deve ser configurada para autenticação funcionar.

## Modelagem do banco de dados

O banco é **PostgreSQL** e a modelagem está em [`backend/prisma/schema.prisma`](./backend/prisma/schema.prisma). A migração existente está em [`backend/prisma/migrations/20261021171347_create_tables/migration.sql`](./backend/prisma/migrations/20261021171347_create_tables/migration.sql).

| Modelo/tabela | Campos principais | Relacionamentos e regras |
|---|---|---|
| `User` / `User` | `id` UUID; `name`; `email` único; `password`; `role` (`STAFF` ou `ADMIN`, padrão `STAFF`); `createdAt`; `updatedAt` | Cadastro de contas de acesso. A senha persistida pelo service é um hash bcrypt. |
| `Category` / `categories` | `id` UUID; `name`; `createdAt`; `updatedAt` | Uma categoria possui vários produtos. |
| `Product` / `products` | `id` UUID; `name`; `price` inteiro; `description`; `banner`; `disabled` (padrão `false`); `category_id`; datas | Pertence a uma categoria; exclusão da categoria propaga-se aos produtos. Pode estar associado a vários itens de pedido. |
| `Order` / `orders` | `id` UUID; `table` inteiro; `status` booleano (padrão `false`); `draft` booleano (padrão `true`); `name` opcional; datas | Um pedido possui vários itens. |
| `Item` / `Item` | `id` UUID; `amount` inteiro; `order_id`; `product_id`; datas | Cada item pertence a um pedido e a um produto. Exclusões do pedido ou do produto propagam-se aos itens. |

Todos os modelos têm identificador UUID e campos de criação/atualização. `createdAt` usa o horário atual como padrão; `updatedAt` é atualizado pelo Prisma. Os nomes de tabela seguem os mapeamentos explícitos do schema; `User` e `Item` não têm `@@map`.

## Organização de pastas

```text
pizzaUP/
├── backend/
│   ├── prisma/
│   │   ├── migrations/       # Migrações SQL versionadas
│   │   └── schema.prisma     # Modelos, relações e enumerações
│   ├── src/
│   │   ├── @types/           # Extensões de tipos, incluindo req.userId
│   │   ├── controllers/      # Adaptação HTTP por recurso
│   │   ├── generated/prisma/ # Prisma Client gerado; não editar manualmente
│   │   ├── middlewares/      # Validação, autenticação e autorização
│   │   ├── prisma/           # Inicialização do client e adaptador PostgreSQL
│   │   ├── schemas/          # Schemas de validação Zod
│   │   ├── services/         # Regras de negócio e operações de dados
│   │   ├── routes.ts         # Registro dos endpoints
│   │   └── server.ts         # Configuração e inicialização do Express
│   ├── package.json          # Dependências e scripts
│   ├── package-lock.json     # Versões resolvidas das dependências
│   ├── prisma7.config.ts     # Configuração Prisma e URL do banco
│   └── tsconfig.json         # Configuração TypeScript
├── CONTEXTO_PROJETO.md
└── README.md
```

Controllers e services são organizados por recurso (`user`, `category`, `product` e `order`). A pasta `src/generated/prisma` contém código gerado pelo Prisma.

## Tecnologias e versões

Versões resolvidas no `backend/package-lock.json`:

| Biblioteca/ferramenta | Versão |
|---|---:|
| Node.js | Não fixada no repositório |
| TypeScript | 6.0.3 |
| Express | 5.3.0 |
| Prisma CLI (`prisma`) | 7.10.1 |
| Prisma Client (`@prisma/client`) | 7.10.1 |
| Adaptador PostgreSQL (`@prisma/adapter-pg`) | 7.10.1 |
| PostgreSQL driver (`pg`) | 8.23.1 |
| Zod | 4.6.7 |
| bcryptjs | 3.0.3 |
| jsonwebtoken | 9.0.3 |
| cors | 2.8.6 |
| dotenv | 18.0.8 |
| tsx | 4.23.15 |
| `@types/cors` | 2.8.19 |
| `@types/express` | 5.0.6 |
| `@types/jsonwebtoken` | 9.0.10 |
| `@types/node` | 26.6.5 |
| `@types/pg` | 8.23.1 |

O `package.json` declara faixas semver com `^`; o lockfile registra as versões exatas acima. O script de desenvolvimento é `npm run dev`, que executa `tsx watch src/server.ts`.

## Configuração e execução

Configure `PORT` (padrão `3333`), `DATABASE_URL` e `JWT_SECRET` no ambiente local. O arquivo `backend/.env.example` serve como referência para `PORT` e `DATABASE_URL`; não inclua credenciais reais em arquivos versionados.

Na pasta `backend`, instale as dependências com `npm install` e inicie o modo de desenvolvimento com `npm run dev`. A configuração do Prisma está em `backend/prisma7.config.ts` e lê a URL do banco de `DATABASE_URL`.

## Estado e limites conhecidos

- O backend já implementa cadastro e autenticação de usuários, consulta do usuário autenticado, listagem e criação de categorias, listagem filtrada de produtos, criação e exclusão lógica de produtos, além da criação/listagem/detalhamento de pedidos e adição/remoção de itens.
- A criação de usuário, categoria e produto e a autenticação consultam ou gravam no banco via Prisma.
- A remoção de item apaga o registro correspondente na tabela `Item`; a exclusão de pedidos e o fluxo completo de atualização de pedidos ainda não estão implementados.
- As aplicações mobile, cozinha e administração não estão presentes no repositório atual.
