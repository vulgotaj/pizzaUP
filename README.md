# pizzaUP

O **pizzaUP** é um projeto fullstack para gerenciamento de pedidos de uma pizzaria. A proposta é conectar o atendimento, a cozinha e a administração em um único sistema.

## Visão do produto

- **Aplicativo mobile para garçons:** permite consultar o cardápio e registrar os pedidos dos clientes durante o atendimento.
- **Tela da cozinha:** recebe os pedidos enviados pelos garçons para que a equipe acompanhe e prepare cada pedido.
- **Área administrativa:** permite gerenciar os produtos disponíveis no cardápio e outras informações da operação.
- **Backend:** centraliza as regras de negócio e a comunicação entre as aplicações.

O fluxo esperado é: o garçom registra um pedido no aplicativo, o pedido chega à cozinha para preparo e a administração mantém o cardápio atualizado.

## Estrutura do projeto

```text
pizzaUP/
└── backend/   # API em desenvolvimento
```

As aplicações web e mobile fazem parte da visão do produto, mas ainda não estão presentes na estrutura atual do repositório.

## Tecnologias do backend

- Node.js
- TypeScript
- Express
- Zod para validação de dados
- Prisma ORM
- PostgreSQL

Consulte [Contexto do projeto](./CONTEXTO_PROJETO.md) para a arquitetura atual, validações, middlewares, modelagem do banco e versões das dependências. A referência de rotas, parâmetros e exemplos de requisição está em [endpoints.md](./endpoints.md).

## Começando

### Pré-requisitos

- Node.js e npm
- PostgreSQL, para validar o schema e executar migrações do banco

### Configurar o ambiente

No terminal, acesse a pasta `backend` e instale as dependências:

```bash
cd backend
npm install
```

Crie o arquivo local `.env` a partir do exemplo. No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

No macOS ou Linux:

```bash
cp .env.example .env
```

Edite `backend/.env` e informe os dados da sua instância PostgreSQL em `DATABASE_URL`. Por exemplo:

```env
PORT=3333
DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/pizzaUP?schema=public"
```

Crie previamente o banco `pizzaUP` no PostgreSQL ou ajuste a URL para apontar para um banco existente. O arquivo `.env` contém configuração local e não deve ser enviado ao Git; use `.env.example` como referência, sem colocar credenciais reais nele.

### Validar e preparar o banco

Com `DATABASE_URL` configurada e o banco criado, valide o schema Prisma:

```bash
npx prisma validate
```

O schema atual define os modelos `User`, `Category`, `Product`, `Order` e `Item`, incluindo suas relações. Para criar a migração inicial e aplicá-la ao banco de desenvolvimento:

```bash
npx prisma migrate dev --name init
```

### Executar o backend

Ainda na pasta `backend`, inicie o servidor em modo de desenvolvimento:

```bash
npm run dev
```

O servidor usa a porta `3333` por padrão. Para escolher outra porta, altere `PORT` no arquivo `.env`.

## Estado atual

O backend implementa cadastro e autenticação de usuários, categorias, produtos e operações de pedidos (criação, envio, finalização, exclusão e gerenciamento de itens). A busca de produtos por categoria ainda não está corretamente conectada à rota. As aplicações web, mobile e da cozinha também não estão presentes no repositório. Consulte [Contexto do projeto](./CONTEXTO_PROJETO.md) para os detalhes da implementação e limitações atuais.

## Licença

Este projeto está licenciado sob os termos da licença MIT. Consulte o arquivo [LICENSE](./LICENSE).
