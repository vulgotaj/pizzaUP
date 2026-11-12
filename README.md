# pizzaUP 🍕

Sistema full stack para gerenciar o atendimento de uma pizzaria, da abertura da mesa ao preparo do pedido. Integra uma API REST, um dashboard web para administração e cozinha e um aplicativo mobile para atendentes.

**Estado em 11/11/2026:** a aplicação está praticamente pronta em termos de implementação, com os três módulos presentes e conectados à API. A etapa de produto pendente é a troca para o design final. As correções de segurança e os limites de validação estão no [relatório](./AUDITORIA_SEGURANCA.md). Para publicação, siga o [guia de deploy](./DEPLOY.md).

## Acessos para demonstração

| Aplicação | E-mail | Senha |
|---|---|---|
| Dashboard web | `felipe@teste.com` | `teste123` |
| Aplicativo mobile | `beatriz@teste.com` | `teste123` |

Localmente, acesse o dashboard em [http://localhost:3000/login](http://localhost:3000/login). No app, utilize a tela de login após iniciar o Expo.

Essas contas são exclusivas para demonstração local em desenvolvimento; senhas curtas são recusadas em produção. Elas precisam existir no banco ao qual a API está conectada: o repositório não possui seed que as crie automaticamente. O dashboard exige perfil `ADMIN`; o app exige autenticação e não restringe o login a esse perfil. Somente administradores autenticados podem cadastrar atendentes; novos acessos recebem `STAFF`. Para uma base nova, utilize `npm run admin:create` conforme o [guia de deploy](./DEPLOY.md).

## Progresso e funcionalidades

| Módulo | O que já foi implementado |
|---|---|
| API | Cadastro, login JWT, consulta do usuário, autorização por perfil, categorias, produtos com imagem e arquivamento e operações de pedidos e itens. |
| Dashboard | Login, cadastro, logout, proteção administrativa, categorias, produtos, upload com prévia da imagem, pedidos enviados à cozinha, detalhes, totais e finalização. |
| App | Login, sessão persistida, logout, abertura de mesa, seleção de categoria e produto, quantidade, adição e remoção de itens e envio do pedido à cozinha. |
| Integração | Web e mobile consomem a mesma API e compartilham os dados no PostgreSQL; as imagens ficam no Cloudinary. |
| Design final | Pendente: substituir o visual atual das interfaces pela versão final. |

O fluxo construído é: **atendente abre mesa no app → monta o pedido → envia à cozinha → equipe acompanha e finaliza no dashboard**. No app, o botão “Finalizar pedido” envia o pedido para preparo; a conclusão do preparo é feita no dashboard.

A lista do dashboard é carregada ao abrir a tela, pelo botão de atualização e ao fechar os detalhes. Não há atualização em tempo real por WebSocket. O filtro por categoria e a inclusão de itens foram corrigidos; alterações de itens são permitidas apenas em rascunhos e o envio exige ao menos um item.

## Tecnologias

| Camada | Tecnologias declaradas no projeto |
|---|---|
| Backend | Node.js, TypeScript 6, Express 5, Prisma 7, PostgreSQL, Zod, JWT, bcryptjs, Multer e Cloudinary. |
| Web | Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Base UI e Lucide. |
| Mobile | Expo SDK 58, React Native 0.88, React 19, TypeScript, Expo Router, Axios e AsyncStorage. |

As versões e dependências de cada módulo estão em seus arquivos `package.json` e `package-lock.json`.

## Estrutura

```text
pizzaUP/
├── backend/               # API REST, Prisma e regras de negócio
├── frontend/              # Dashboard administrativo e cozinha em Next.js
├── mobile/                # Aplicativo de atendimento em Expo/React Native
├── README.md              # Visão geral, progresso, acessos e execução
├── CONTEXTO_PROJETO.md     # Arquitetura, decisões e limites conhecidos
└── endpoints.md           # Contrato HTTP da API
```

## Requisitos

- Node.js e npm compatíveis com as versões dos módulos; o repositório não fixa uma versão de Node.js.
- PostgreSQL e um banco criado para a aplicação.
- Credenciais do Cloudinary para cadastrar produtos com imagem.
- Para o mobile, um dispositivo com cliente Expo compatível ou um emulador configurado.

## Como executar

Execute os módulos em terminais separados, a partir da raiz do repositório.

### 1. API

```bash
cd backend
npm install
```

Copie `.env.example` para `.env` (`Copy-Item .env.example .env` no PowerShell ou `cp .env.example .env` em shells Unix) e configure:

```env
PORT=3333
DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/pizzaUP?schema=public"
JWT_SECRET="<gere um segredo aleatório com pelo menos 32 caracteres>"
CLOUDINARY_CLOUD_NAME="seu-cloud-name"
CLOUDINARY_API_KEY="sua-api-key"
CLOUDINARY_API_SECRET="seu-api-secret"
```

Com o banco criado, gere o Prisma Client e aplique as migrações. O arquivo de configuração tem nome próprio e deve ser passado à CLI:

```bash
npx prisma generate --config prisma7.config.ts
npx prisma migrate deploy --config prisma7.config.ts
npm run dev
```

API local: [http://localhost:3333](http://localhost:3333). Os endpoints não possuem prefixo `/api`; há um endpoint de saúde em `/health` e não há página inicial em `/`.

### 2. Dashboard web

```bash
cd frontend
npm install
```

Crie `frontend/.env.local`:

```env
API_URL=http://localhost:3333
```

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000), que redireciona para `/login`, e entre com a conta do dashboard. Ao usar outra conta Cloudinary, ajuste também `images.remotePatterns` em `frontend/next.config.ts`, pois o caminho permitido atualmente está vinculado ao cloud name utilizado no projeto.

### 3. Aplicativo mobile

```bash
cd mobile
npm install
```

Crie `mobile/.env` com `EXPO_PUBLIC_API_URL=http://192.168.1.100:3333`, usando o IP do seu computador. HTTP é permitido apenas em desenvolvimento; builds de produção exigem uma URL HTTPS. O app usa SecureStore para persistir o token nos dispositivos.

```bash
npm run start
```

Abra pelo QR code em um cliente Expo compatível ou use um emulador. Em um celular físico, use o IP do computador na mesma rede e permita acesso à porta da API. `localhost` no celular aponta para o próprio aparelho. Entre com a conta do app informada acima.

## Roteiro para explorar a aplicação

1. Entre no dashboard com `felipe@teste.com` e senha `teste123`.
2. Consulte ou cadastre uma categoria em `/dashboard/categories`.
3. Cadastre um produto em `/dashboard/products`, escolhendo categoria, preço e imagem JPG/PNG de até 5 MB. O formulário exibe o preço em reais; a API armazena centavos inteiros.
4. Entre no app com `beatriz@teste.com` e senha `teste123` e abra uma mesa com número inteiro positivo.
5. Selecione categoria, produto e quantidade para adicionar itens; remova um item para explorar essa ação. A API valida se o produto está ativo e se o pedido ainda é rascunho.
6. Com itens adicionados, avance, informe o nome do cliente e use “Finalizar pedido” para enviar à cozinha.
7. No dashboard, atualize a lista, abra os detalhes, confira itens e total e finalize o preparo. O pedido sai da lista de pendentes.

Este roteiro descreve as funcionalidades implementadas e os resultados esperados; não representa uma execução de testes ponta a ponta nesta atualização de documentação.

## Comandos disponíveis

| Diretório | Comando | Finalidade |
|---|---|---|
| `backend` | `npm run dev` | API com recarga durante o desenvolvimento. |
| `frontend` | `npm run dev` | Dashboard em desenvolvimento. |
| `frontend` | `npm run build` | Build de produção do dashboard. |
| `frontend` | `npm run start` | Serve o build do dashboard. |
| `mobile` | `npm run start` | Servidor de desenvolvimento Expo. |
| `mobile` | `npm run android` | Expo com abertura no Android. |
| `mobile` | `npm run ios` | Expo com abertura no iOS; o simulador local exige macOS. |
| `mobile` | `npm run web` | Execução pelo navegador. |
| `mobile` | `npm run lint` | Análise estática do app. |

O backend possui `npm test` (regressões de segurança), `npm run typecheck`, `npm run build`, `npm start` e `npm run db:migrate`. A publicação e a configuração dos ambientes estão descritas em [DEPLOY.md](./DEPLOY.md).

## Documentação

- [Contexto e progresso técnico](./CONTEXTO_PROJETO.md)
- [Referência dos endpoints](./endpoints.md)
- [Guia do backend](./backend/README.md)
- [Guia do dashboard](./frontend/README.md)
- [Guia do aplicativo](./mobile/README.md)

## Licença

Distribuído sob a licença [MIT](./LICENSE).
