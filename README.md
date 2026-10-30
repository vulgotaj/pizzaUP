# pizzaUP

Sistema full stack para gerenciamento de pedidos de uma pizzaria. O projeto reúne uma API REST em Node.js e uma interface web administrativa em Next.js para acompanhar pedidos e gerenciar o cardápio.

## Funcionalidades

- Cadastro e autenticação de usuários com token JWT.
- Controle de acesso por perfil, com operações administrativas para categorias e produtos.
- Cadastro e listagem de categorias e produtos, com upload de imagens para o Cloudinary.
- Criação e acompanhamento de pedidos, gerenciamento de itens, envio para preparo, finalização e exclusão.
- Painel web para visualizar pedidos e administrar produtos e categorias.

> O projeto está em desenvolvimento. Consulte [CONTEXTO_PROJETO.md](./CONTEXTO_PROJETO.md) para detalhes do estado atual da API e limitações conhecidas. A referência dos endpoints está em [endpoints.md](./endpoints.md).

## Tecnologias

**Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4 e componentes shadcn/ui.

**Backend:** Node.js, TypeScript, Express 5, Prisma 7, PostgreSQL, Zod, JWT, bcryptjs e Cloudinary.

## Estrutura

```text
pizzaUP/
├── backend/   # API REST, regras de negócio e acesso ao PostgreSQL
├── frontend/  # Aplicação web Next.js
├── CONTEXTO_PROJETO.md
└── endpoints.md
```

## Requisitos

- Node.js e npm
- PostgreSQL
- Conta e credenciais do Cloudinary para upload de imagens

## Como executar

A API e a interface são iniciadas em terminais separados.

### 1. Backend

```bash
cd backend
npm install
```

Crie `backend/.env` a partir do exemplo:

```bash
cp .env.example .env
```

No PowerShell, use `Copy-Item .env.example .env`. Configure as variáveis:

```env
PORT=3333
DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/pizzaUP?schema=public"
JWT_SECRET="uma-chave-secreta"
CLOUDINARY_CLOUD_NAME="seu-cloud-name"
CLOUDINARY_API_KEY="sua-api-key"
CLOUDINARY_API_SECRET="seu-api-secret"
```

Crie o banco `pizzaUP` no PostgreSQL (ou ajuste `DATABASE_URL`) e aplique as migrações:

```bash
npx prisma migrate deploy
```

Inicie a API em modo de desenvolvimento:

```bash
npm run dev
```

Por padrão, a API fica disponível em `http://localhost:3333`.

### 2. Frontend

Em outro terminal:

```bash
cd frontend
npm install
```

Crie `frontend/.env.local` com o endereço da API:

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```

Inicie a aplicação web:

```bash
npm run dev
```

Acesse `http://localhost:3000`. A rota inicial redireciona para a tela de login.

## Scripts disponíveis

| Diretório | Comando | Descrição |
|---|---|---|
| `backend` | `npm run dev` | Executa a API com recarga durante o desenvolvimento. |
| `frontend` | `npm run dev` | Inicia o servidor Next.js de desenvolvimento. |
| `frontend` | `npm run build` | Gera a versão de produção do frontend. |
| `frontend` | `npm run start` | Inicia o frontend já compilado. |

## Documentação da API

A API usa autenticação Bearer JWT nas rotas protegidas. Para conhecer métodos, caminhos, parâmetros e exemplos de payload, consulte [endpoints.md](./endpoints.md). A implementação está organizada em rotas, controllers, services, middlewares e schemas de validação.

## Licença

Distribuído sob a licença MIT. Consulte [LICENSE](./LICENSE).
