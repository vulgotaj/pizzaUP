# Backend pizzaUP — endpoints e referência da API

Atualizado em **11/11/2026**. Este documento descreve as 17 rotas de negócio registradas em [`backend/src/routes.ts`](./backend/src/routes.ts) e a rota de saúde `GET /health` em `backend/src/app.ts`, consumidas pelo dashboard web e pelo aplicativo mobile. O backend é uma API REST em Express, TypeScript e Prisma com PostgreSQL. A troca para o design final das interfaces está pendente; os limites técnicos abaixo refletem a implementação atual.

## Base URL e execução

- Localmente, a API usa `http://localhost:3333` por padrão; a porta pode ser alterada pela variável `PORT`.
- As rotas não têm prefixo global, como `/api`.
- Para iniciar em desenvolvimento, execute `npm run dev` dentro de `backend/`.
- Configure `DATABASE_URL` e `JWT_SECRET` no ambiente. Para upload de imagens, configure também `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` e `CLOUDINARY_API_SECRET`.
- O banco usa PostgreSQL; o schema e as migrações estão em `backend/prisma/`.
- Antes da primeira execução, gere o client e aplique as migrações com `npx prisma generate --config prisma7.config.ts` e `npx prisma migrate deploy --config prisma7.config.ts`, dentro de `backend/`.
- O passo a passo está no [guia do backend](./backend/README.md). `GET /health` responde `{ "status": "ok" }` para a saúde do processo; não testa a conexão com o banco.

## Autenticação e formatos

As rotas marcadas como autenticadas exigem um token JWT obtido em `POST /session`:

Envie o cabeçalho `Authorization` no formato `Bearer` seguido do token recebido.

O token expira em 8 horas, usa HS256 e valida emissor e audiência. O middleware também confere se o usuário ainda existe no banco. As rotas administrativas também verificam se o usuário autenticado tem papel `ADMIN`. Usuários novos recebem papel `STAFF` por padrão.

As contas de demonstração são `felipe@teste.com` / `teste123` para o dashboard e `beatriz@teste.com` / `teste123` para o app. Elas precisam existir na base utilizada; não há seed automático. O acesso ao dashboard requer `ADMIN`. Essas credenciais curtas são exclusivas de desenvolvimento; produção recusa senhas que não atendam à política mínima.

Exemplo de login do dashboard em `POST /session`:

```json
{
  "email": "felipe@teste.com",
  "password": "teste123"
}
```

Para testar o app, substitua apenas o e-mail por `beatriz@teste.com`. A resposta de login possui o formato:

```json
{
  "id": "<id-do-usuario>",
  "name": "<nome-do-usuario>",
  "email": "felipe@teste.com",
  "role": "ADMIN",
  "token": "<jwt>"
}
```

O papel acima ilustra o acesso administrativo esperado; o valor real vem do banco. Nas chamadas protegidas, envie `Authorization: Bearer <jwt>`.

Rotas JSON usam `Content-Type: application/json`. A criação de produto é uma exceção: usa `multipart/form-data`, com os campos descritos abaixo e o arquivo no campo `file`.

## Endpoints

### Usuários e sessão

| Método e caminho | Acesso | Entrada | Resultado |
|---|---|---|---|
| `POST /users` | JWT + `ADMIN` | JSON: `name` (3–100 caracteres), `email` válido, `password` (mínimo 12 caracteres e máximo 72 bytes) | Cria usuário; retorna `id`, `name`, `email`, `role` e `createdAt`. A senha é armazenada como hash. |
| `POST /session` | Público | JSON: `email` válido e `password` não vazio | Autentica e retorna `id`, `name`, `email`, `role` e `token`. |
| `GET /me` | JWT | Sem entrada | Retorna os dados do usuário autenticado: `id`, `name`, `email`, `role` e `createdAt`. |

Exemplo de cadastro:

```json
{
  "name": "Ana Silva",
  "email": "ana@example.com",
  "password": "<senha com pelo menos 12 caracteres>"
}
```

### Categorias

| Método e caminho | Acesso | Entrada | Resultado |
|---|---|---|---|
| `GET /category` | JWT | Sem entrada | Lista categorias com `id`, `name` e `createdAt`, da mais recente para a mais antiga. |
| `POST /category` | JWT + `ADMIN` | JSON: `name` com pelo menos 2 caracteres | Cria categoria; retorna `id`, `name` e `createdAt` (HTTP 201). |

### Produtos

| Método e caminho | Acesso | Entrada | Resultado |
|---|---|---|---|
| `GET /products` | JWT | Query opcional `disabled` | Lista produtos e dados resumidos da categoria, ordenados por criação decrescente. `disabled=true` lista somente arquivados; omitido ou `false` lista ativos. Outros valores são recusados. |
| `POST /product` | JWT + `ADMIN` | `multipart/form-data`: `name`, `price`, `description`, `category_id` e imagem `file` | Envia imagem para Cloudinary e cria o produto; retorna `id`, `name`, `price`, `description`, `banner`, `category_id` e `createdAt`. |
| `DELETE /product` | JWT + `ADMIN` | Query `product_id` | Arquiva o produto (`disabled=true`); não remove o registro. Retorna mensagem de confirmação. |
| `GET /category/product` | JWT | Query `category_id` | Lista somente produtos ativos da categoria informada; o ID deve ser UUID válido. |

`price` representa **centavos** e deve ser enviado como texto composto somente por dígitos, por exemplo `"4500"` para R$ 45,00. É convertido para número inteiro no servidor. A imagem é obrigatória, deve ser JPG, JPEG ou PNG e ter no máximo 5 MB. O campo `banner` retornado contém a URL do Cloudinary. Ao usar FormData, permita que o cliente HTTP defina o boundary de `multipart/form-data`.

Exemplo de campos para `POST /product`:

```text
name=Pizza Margherita
price=4500
description=Molho, queijo e manjericão
category_id=<id-da-categoria>
file=<arquivo de imagem>
```

### Pedidos e itens

| Método e caminho | Acesso | Entrada | Resultado |
|---|---|---|---|
| `POST /order` | JWT | JSON: `table` inteiro positivo; `name` opcional | Cria pedido em rascunho; retorna os campos principais do pedido (HTTP 201). |
| `GET /orders` | JWT | Query opcional `draft` | Lista pedidos com seus itens e dados resumidos dos produtos. `draft=true` lista rascunhos; omitido ou outro valor lista pedidos enviados. |
| `GET /order/detail` | JWT | Query obrigatória `order_id` | Retorna dados do pedido, itens e respectivos produtos. |
| `POST /order/add` | JWT | JSON: `order_id`, `product_id` não vazios e `amount` inteiro positivo | Adiciona item e retorna os dados do item e do produto (HTTP 201). |
| `DELETE /order/remove` | JWT | Query `item_id` não vazio | Remove o item e retorna uma mensagem de confirmação. |
| `PUT /order/send` | JWT | JSON: `order_id` e `name` como textos | Marca o pedido como enviado (`draft=false`) e grava o nome. |
| `PUT /order/finish` | JWT + `ADMIN` | JSON: `order_id` como texto | Marca o pedido como finalizado (`status=true`). |
| `DELETE /order` | JWT + `ADMIN` | Query `order_id` como texto | Exclui o pedido; os itens relacionados são excluídos por cascata no banco. |

Exemplos de entrada:

```json
{
  "table": 4,
  "name": "Mesa 4"
}
```

```json
{
  "order_id": "<id-do-pedido>",
  "product_id": "<id-do-produto>",
  "amount": 2
}
```

Para enviar um pedido:

```json
{
  "order_id": "<id-do-pedido>",
  "name": "Pedido da mesa 4"
}
```

Pedidos são compartilhados pela equipe autenticada. Finalizar e excluir exigem ADMIN; criar conta também exige ADMIN, impedindo cadastro público com acesso operacional.

### Estados e comportamento nos clientes

| Etapa | `draft` | `status` | Ação |
|---|---|---|---|
| Rascunho | `true` | `false` | `POST /order` ao abrir uma mesa no app. |
| Enviado à cozinha | `false` | `false` | `PUT /order/send`; a tela mobile chama essa etapa de “Finalizar pedido”. |
| Preparo finalizado | `false` | `true` | `PUT /order/finish` pelo dashboard. |

Os services impõem as transições em transações com lock do pedido pai. Itens só mudam em rascunhos; envio exige pelo menos um item; finalização exige pedido enviado e pendente; exclusão exige rascunho. `GET /orders?draft=false` retorna também pedidos já finalizados; a Server Action do dashboard filtra `status=false` no servidor. Não há filtro por `status` implementado nessa rota. A listagem de pedidos não define ordenação explícita.

O retorno de `/orders` é um array de pedidos com `id`, `table`, `name`, `draft`, `status`, `createdAt` e `items`. Cada item inclui `id`, `amount` e `product` (`id`, `name`, `price`, `description`, `banner`). `/order/detail` retorna um objeto de pedido, incluindo também `updatedAt` e a data de criação de cada item. Os totais são calculados nos clientes por `soma(product.price * amount)`; não há campo de total persistido no pedido.

## Respostas e erros

- Criação de usuário e produto responde HTTP 200; criação de categoria, pedido e item responde HTTP 201. As demais operações de sucesso respondem HTTP 200.
- A validação feita por Zod responde HTTP 400 com `error` e `details` (lista de objetos com `message`).
- O middleware de autenticação responde HTTP 401 se o token estiver ausente ou for inválido.
- O middleware administrativo responde HTTP 403 quando recusa o perfil.
- Erros de domínio usam 400/404/409, conforme a regra. Limites de tentativa usam 429. Falhas inesperadas retornam 500 com mensagem genérica; detalhes internos não são enviados ao cliente.
- A forma exata do objeto de sucesso depende do endpoint: alguns retornam entidades e outros retornam listas ou mensagens.

Exemplo de estrutura de erro de validação:

```json
{
  "error": "Erro validação",
  "details": [
    { "message": "<mensagem-do-campo>" }
  ]
}
```

Erros comuns dos services retornam `{ "error": "<mensagem>" }`. A validação substitui `req.body` pelo resultado normalizado. Queries são validadas antes do controller.

## Validações e limites

- IDs de pedidos, produtos, itens e categorias devem ser UUIDs válidos.
- Quantidade de item: 1–999. Mesa: 1–10000. Preços positivos em centavos, até 2147483647.
- Nomes têm limites de tamanho; descrição do produto tem até 2000 caracteres.
- `disabled` e `draft` só aceitam `true` ou `false` quando presentes.
- JSON tem limite de 100 KB e conteúdo comprimido é recusado; imagem multipart tem limite de 5 MB.
- Pedidos são compartilhados pela equipe. Não existe associação a proprietário.
- Limites de requisição são por processo/IP e também por conta no login. A configuração de proxy precisa refletir a infraestrutura; veja [DEPLOY.md](./DEPLOY.md).

## Modelo de dados

O Prisma define os modelos `User`, `Category`, `Product`, `Order` e `Item`. Categorias possuem produtos; pedidos possuem itens; cada item referencia um produto. Excluir categoria, pedido ou produto remove registros relacionados conforme as regras de cascata do schema. Produtos têm exclusão lógica via campo `disabled`; pedidos têm `draft` e `status` para representar o fluxo de envio e finalização.
