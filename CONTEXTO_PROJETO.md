# Contexto do projeto pizzaUP

Atualizado em **11/11/2026**, a partir do código presente no repositório.

## Visão geral e progresso

O pizzaUP gerencia o atendimento de uma pizzaria por meio de três aplicações: API central, dashboard web administrativo/cozinha e aplicativo mobile para atendentes. A implementação está em estágio avançado, praticamente pronta para receber o design final. A troca do visual é a etapa de produto pendente informada pelo responsável pelo projeto.

O backend, o frontend e o mobile já estão presentes. Esta revisão substitui o contexto antigo que descrevia apenas a API e tratava as interfaces como trabalho futuro. A existência dos fluxos no código não equivale a validação ponta a ponta: as inconsistências observadas estão em [Estado e limites conhecidos](#estado-e-limites-conhecidos).

| Área | Progresso registrado |
|---|---|
| Identidade e acesso | Cadastro, senha com bcrypt, login JWT, consulta `/me`, perfis `STAFF` e `ADMIN`. |
| Cardápio | Criação/listagem de categorias, criação/listagem de produtos, upload para Cloudinary e arquivamento lógico. |
| Pedidos na API | Criação de rascunho, listagem, detalhes, inclusão/remoção de itens, envio, finalização e exclusão. |
| Web | Login/cadastro, sessão por cookie, proteção administrativa, navegação responsiva, categorias, produtos e acompanhamento da cozinha. |
| Mobile | Login com persistência, navegação protegida, abertura de mesa, montagem de itens e tela de envio para cozinha. |
| Integração | Clientes web e mobile conectados aos endpoints da mesma API. |
| Visual | Interfaces atuais implementadas; aplicação do design final pendente. |

## Acessos de demonstração

| Destino | E-mail | Senha | Condição de acesso |
|---|---|---|---|
| Dashboard | `felipe@teste.com` | `teste123` | O usuário precisa ter perfil `ADMIN` no banco. |
| App | `beatriz@teste.com` | `teste123` | Usuário autenticado; não há restrição por perfil no app. |

As contas foram fornecidas pelo responsável pelo projeto. Não há seed automático no repositório; uma base nova não inclui essas contas. O cadastro exige administrador autenticado e cria somente `STAFF`. O primeiro administrador é provisionado por `npm run admin:create` com as variáveis `ACCOUNT_*`, conforme [DEPLOY.md](./DEPLOY.md). As contas de demonstração com senha curta são recusadas em produção.

## Arquitetura

```text
Dashboard Next.js ───┐
                    ├── HTTP + JWT → API Express → Prisma → PostgreSQL
App Expo/React Native┘                    │
                                         └── upload de imagens → Cloudinary
```

### Backend

O fluxo de uma requisição é `rota → middlewares → controller → service → Prisma Client → PostgreSQL`. Os controllers extraem os dados HTTP, os services executam as regras de negócio e os middlewares validam entrada e acesso.

- Express 5 com JSON e CORS habilitados e rotas sem prefixo global.
- Zod valida objetos com `body`, `query` e `params`; o resultado do parse substitui `req.body`, aplicando normalização; queries são validadas antes do controller.
- Prisma 7 gera o client em `backend/src/generated/prisma`, diretório ignorado pelo Git, e utiliza `@prisma/adapter-pg`.
- A CLI usa a configuração `backend/prisma7.config.ts`, passada explicitamente por `--config`.
- Multer recebe a imagem em memória; o service envia o buffer para a pasta `products` no Cloudinary e salva a URL no banco.

### Dashboard web

- Next.js 16 com App Router, React 19, Tailwind CSS 4 e componentes shadcn/ui/Base UI.
- Formulários de autenticação e mutações usam Server Actions; páginas também consultam a API no servidor.
- Pedidos e detalhes são consultados por Server Actions autenticadas; somente os dados são retornados ao cliente, sem token nas props.
- `src/lib/auth.ts` mantém o cookie `token_pizzaUP` por 8 horas, com HttpOnly, SameSite Strict e Secure em produção. HTML dinâmico usa CSP com nonce.
- O layout de `/dashboard` exige usuário `ADMIN`; sessões ausentes levam a `/login` e usuários sem perfil administrativo a `/access-denied`.
- As telas de produtos e categorias revalidam os respectivos caminhos após mutações.
- A cozinha exibe pedidos enviados e não finalizados, calcula totais por quantidade e preço e permite finalizar pelo modal de detalhes.
- A lista atualiza na abertura, no botão de atualização e ao fechar o modal; não há polling ou WebSocket.

### Aplicativo mobile

- Expo SDK 58, React Native 0.88, React 19 e Expo Router, com rotas em `mobile/app/`.
- `AuthContext` mantém o usuário em memória e persiste o JWT em SecureStore no dispositivo. Chaves legadas de AsyncStorage são removidas; na versão web a sessão fica só em memória.
- Axios adiciona o Bearer pelo interceptor. HTTP 401 e logout limpam token e estado do contexto; a restauração valida `/me`.
- A URL vem de `EXPO_PUBLIC_API_URL` e é validada em `mobile/config/api.config.ts`; o timeout é de 12 segundos e produção exige HTTPS.
- O grupo `(authenticated)` protege as telas de abertura de mesa, montagem e envio do pedido.
- A tela de montagem carrega os itens de `/order/detail`; ainda não há uma tela dedicada a listar e retomar rascunhos.
- Componentes compartilhados incluem botão, input, seletor, controle de quantidade e item do pedido; o tema está em `constants/theme.ts`.

## Fluxo operacional e estados

1. O administrador cadastra categorias e produtos pelo dashboard.
2. O atendente autentica no app e abre uma mesa, criando um pedido em rascunho.
3. Seleciona categoria, produto e quantidade, adiciona itens e pode removê-los.
4. Avança para `finish`, informa o cliente e envia o pedido à cozinha por `PUT /order/send`.
5. A cozinha atualiza o dashboard, consulta detalhes e finaliza o preparo por `PUT /order/finish`.

| Momento | `draft` | `status` | Visibilidade no dashboard |
|---|---|---|---|
| Mesa aberta/rascunho | `true` | `false` | Fora da lista da cozinha. |
| Enviado para preparo | `false` | `false` | Aparece entre os pendentes. |
| Preparo finalizado | `false` | `true` | Sai da lista de pendentes. |

O botão “Finalizar pedido” no app corresponde ao envio para preparo, não à conclusão da cozinha. A API impõe essa sequência: enviar exige rascunho com itens; finalizar exige ADMIN e pedido enviado ainda pendente. Itens só podem mudar em rascunhos. Mutações usam transações e lock da linha do pedido pai.

`GET /orders` filtra apenas por `draft`. Portanto, a API pode devolver pedidos finalizados; a Server Action do dashboard os remove da exibição com o filtro `!order.status`. Valores monetários são inteiros em centavos e os totais são calculados pelos clientes.

## Modelo de dados

| Modelo / tabela | Campos principais | Relações e regras |
|---|---|---|
| `User` / `User` | UUID, nome, e-mail único, senha com hash, papel, datas | Papel padrão `STAFF`; pedidos não são vinculados a usuários. |
| `Category` / `categories` | UUID, nome, datas | Possui produtos. |
| `Product` / `products` | UUID, nome, preço inteiro, descrição, banner, `disabled`, categoria, datas | Pertence a categoria e é referenciado por itens; arquivamento usa `disabled=true`. |
| `Order` / `orders` | UUID, mesa inteira, nome opcional, `draft`, `status`, datas | Possui itens; valores iniciais `draft=true`, `status=false`. |
| `Item` / `Item` | UUID, quantidade, pedido, produto, datas | Referencia pedido e produto; não armazena cópia do preço. |

O schema usa exclusão em cascata nas relações categoria→produto, pedido→item e produto→item. A rota de exclusão de produto apenas arquiva o registro; a exclusão de pedido é física e remove seus itens.

Fontes: [schema Prisma](./backend/prisma/schema.prisma) e [migração inicial](./backend/prisma/migrations/20261021171347_create_tables/migration.sql).

## Validação, autenticação e erros

- Cadastro restrito a ADMIN; novos acessos STAFF. Nome com 3–100 caracteres, e-mail normalizado e senha de 12 caracteres a 72 bytes; bcrypt custo 12.
- Mesa entre 1 e 10000; quantidade entre 1 e 999; IDs UUID; preço positivo em centavos até o limite de Int do PostgreSQL; tamanhos de texto limitados.
- JWT HS256 com emissor/audiência, validade de 8 horas e usuário existente conferido no banco. Finalizar/excluir pedidos exige ADMIN.
- Rascunhos podem ter itens alterados; envio exige itens; finalização exige enviado/pendente; exclusão exige rascunho. Mutações travam o pedido pai dentro da transação.
- HTTP: validação 400, autenticação 401, perfil 403, recurso ausente 404, conflito 409, rate limit 429 e falha inesperada 500 com mensagem genérica.
- API usa Helmet, CORS por allowlist, limites de tentativas e recusa JSON comprimido. Escala horizontal requer limites compartilhados externos.
- A referência completa está em [endpoints.md](./endpoints.md); configuração de produção em [DEPLOY.md](./DEPLOY.md).

## Configuração e execução

O [README principal](./README.md#como-executar) descreve a inicialização dos três módulos. Os guias [backend](./backend/README.md), [web](./frontend/README.md) e [mobile](./mobile/README.md) detalham a organização e a configuração de cada aplicação.

| Módulo | Configuração |
|---|---|
| Backend | `.env`: `PORT`, `DATABASE_URL`, `JWT_SECRET` e credenciais Cloudinary; referência em `.env.example`. |
| Frontend | `.env.local`: `API_URL`, somente no servidor e HTTPS em produção; permissão de imagens em `next.config.ts`. |
| Mobile | `.env`: `EXPO_PUBLIC_API_URL`; deve ser acessível pelo dispositivo e usar HTTPS em produção. |

Não há versão de Node.js fixada no repositório. As dependências declaradas e resolvidas são registradas por módulo em `package.json` e `package-lock.json`.

## Estado e limites conhecidos

As falhas de filtro por categoria, inclusão de itens, cadastro público e exposição do JWT web foram corrigidas. As contas de demonstração com senha curta funcionam apenas em desenvolvimento.

- Os pedidos são compartilhados pela equipe; não há propriedade individual de pedidos.
- A montagem carrega itens por `/order/detail`, mas ainda não existe tela dedicada a listar e retomar rascunhos. O botão de voltar não cancela pedidos.
- Não há WebSocket; a cozinha atualiza a lista manualmente e após ações.
- O caminho Cloudinary do frontend continua específico da conta do projeto.
- O deploy exige URLs HTTPS, segredos da hospedagem, banco e contas preparados. APK/AAB, assinatura e publicação nas lojas não foram executados.
- Testes automatizados usam Prisma simulado; concorrência real do PostgreSQL e integração com serviços reais precisam de validação em staging.

## Verificações desta atualização

Os 14 testes de regressão do backend passaram. O backend compilou e iniciou em configuração de produção isolada, com `/health` respondendo 200. O build Next.js passou; um teste com Chrome headless e API HTTPS simulada confirmou login, cadastro administrativo, hidratação sob CSP, cookie HttpOnly/SameSite e ausência do bearer no HTML/props e nas chamadas do navegador à API.

Mobile: lint sem erros/avisos, TypeScript e compatibilidade Expo passaram; o bundle Android foi exportado. Exportação configurada com URL HTTP foi recusada. Esses testes não substituem execução em aparelho e backend real. Consulte o [relatório](./AUDITORIA_SEGURANCA.md).
