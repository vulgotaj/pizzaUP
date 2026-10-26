# Backend pizzaUP — endpoints e referência da API

Este documento resume as rotas atualmente registradas em `backend/src/routes.ts` e informações práticas para consumir e executar a API. O backend é uma API REST em Express, TypeScript e Prisma com PostgreSQL.

## Base URL e execução

- Localmente, a API usa `http://localhost:3333` por padrão; a porta pode ser alterada pela variável `PORT`.
- As rotas não têm prefixo global, como `/api`.
- Para iniciar em desenvolvimento, execute `npm run dev` dentro de `backend/`.
- Configure `DATABASE_URL` e `JWT_SECRET` no ambiente. Para upload de imagens, configure também `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` e `CLOUDINARY_API_SECRET`.
- O banco usa PostgreSQL; o schema e as migrações estão em `backend/prisma/`.

## Autenticação e formatos

As rotas marcadas como autenticadas exigem um token JWT obtido em `POST /session`:

Envie o cabeçalho `Authorization` no formato `Bearer` seguido do token recebido.

O token expira em 30 dias. As rotas administrativas também verificam se o usuário autenticado tem papel `ADMIN`. Usuários novos recebem papel `STAFF` por padrão.

Rotas JSON usam `Content-Type: application/json`. A criação de produto é uma exceção: usa `multipart/form-data`, com os campos descritos abaixo e o arquivo no campo `file`.

## Endpoints

### Usuários e sessão

| Método e caminho | Acesso | Entrada | Resultado |
|---|---|---|---|
| `POST /users` | Público | JSON: `name` (mínimo 3 caracteres), `email` válido, `password` (mínimo 6 caracteres) | Cria usuário; retorna `id`, `name`, `email`, `role` e `createdAt`. A senha é armazenada como hash. |
| `POST /session` | Público | JSON: `email` válido e `password` não vazio | Autentica e retorna `id`, `name`, `email`, `role` e `token`. |
| `GET /me` | JWT | Sem entrada | Retorna os dados do usuário autenticado: `id`, `name`, `email`, `role` e `createdAt`. |

Exemplo de cadastro:

```json
{
  "name": "Ana Silva",
  "email": "ana@example.com",
  "password": "senha123"
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
| `GET /products` | JWT | Query opcional `disabled` | Lista produtos e dados resumidos da categoria, ordenados por criação decrescente. Somente `disabled=true` inclui produtos arquivados; omitido ou outro valor lista `disabled=false`. |
| `POST /product` | JWT + `ADMIN` | `multipart/form-data`: `name`, `price`, `description`, `category_id` e imagem `file` | Envia imagem para Cloudinary e cria o produto; retorna `id`, `name`, `price`, `description`, `banner`, `category_id` e `createdAt`. |
| `DELETE /product` | JWT + `ADMIN` | Query `product_id` | Arquiva o produto (`disabled=true`); não remove o registro. Retorna mensagem de confirmação. |
| `GET /category/product` | JWT | Query `category_id` | A rota atualmente aponta para o controller de listagem geral de produtos e **não filtra pela categoria**, apesar de validar `category_id`. |

`price` deve ser enviado como texto composto somente por dígitos, por exemplo `"4500"`, e é convertido para número inteiro no servidor. A imagem deve ser JPG, JPEG ou PNG e ter no máximo 5 MB.

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
| `PUT /order/finish` | JWT | JSON: `order_id` como texto | Marca o pedido como finalizado (`status=true`). |
| `DELETE /order` | JWT | Query `order_id` como texto | Exclui o pedido; os itens relacionados são excluídos por cascata no banco. |

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

Todos os endpoints de pedidos exigem JWT, mas não restringem acesso ao papel `ADMIN` nem associam o pedido ao usuário autenticado.

## Respostas e erros

- A validação feita por Zod responde HTTP 400 com `error` e `details` (lista de mensagens).
- O middleware de autenticação responde HTTP 401 se o token estiver ausente ou for inválido.
- O middleware global atual responde HTTP 400 para exceções que sejam instâncias de `Error`; portanto, recursos não encontrados e outros erros de regra não são diferenciados por status HTTP. Não presuma que esses casos retornam HTTP 404.
- A forma exata do objeto de sucesso depende do endpoint: alguns retornam entidades e outros retornam listas ou mensagens.

## Limitações conhecidas da API

- `GET /category/product` valida `category_id`, mas usa o controller de listagem geral; não aplica o filtro esperado.
- A verificação de produto em `POST /order/add` está implementada consultando o modelo de pedido, não o de produto. A inclusão de itens pode falhar mesmo com um produto válido.
- `disabled` e `draft` não validam os valores `true`/`false`: somente o texto exato `true` seleciona o valor verdadeiro; qualquer outro valor resulta em `false`.
- `product_id` em `DELETE /product` não tem schema de validação próprio.
- O schema do pedido permite omitir `name`; ao criar, o service grava uma string vazia se o nome não for fornecido.

## Modelo de dados

O Prisma define os modelos `User`, `Category`, `Product`, `Order` e `Item`. Categorias possuem produtos; pedidos possuem itens; cada item referencia um produto. Excluir categoria, pedido ou produto remove registros relacionados conforme as regras de cascata do schema. Produtos têm exclusão lógica via campo `disabled`; pedidos têm `draft` e `status` para representar o fluxo de envio e finalização.
