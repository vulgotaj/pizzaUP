# Auditoria e correções de segurança

Atualizado em 11/11/2026, após as correções autorizadas. Escopo: API Express/Prisma, dashboard Next.js, aplicativo Expo, dependências e arquivos publicáveis.

**Estado atual: os problemas identificados foram corrigidos no código e os checks locais passaram.** A publicação ainda depende da configuração de HTTPS, variáveis e dados da hospedagem, descrita em [DEPLOY.md](./DEPLOY.md). Nenhum push, deploy, migração ou alteração de contas no banco real foi realizado.

## Correções dos achados

| ID da auditoria | Correção aplicada | Evidência principal |
|---|---|---|
| S01 — cadastro público com acesso operacional | `POST /users` exige ADMIN e cria somente STAFF; finalizar/excluir pedidos exige ADMIN; JWT de usuário removido é recusado. Cadastro web também exige sessão administrativa. | `backend/src/routes.ts`, `middlewares/isAuthenticated.ts`, `frontend/src/actions/auth.ts` |
| S02 — parser HTTP vulnerável | `body-parser` atualizado de 2.3.0 para versão corrigida; JSON comprimido também é recusado com `inflate: false`. | `backend/package-lock.json`, `backend/src/app.ts` |
| S03 — HTTP no app distribuído | URL vem de `EXPO_PUBLIC_API_URL`; configuração de exportação e runtime de produção recusam HTTP. Desenvolvimento local continua permitido. | `mobile/app.config.ts`, `mobile/config/api.config.ts` |
| S04 — JWT web acessível ao JavaScript | Removido das props; pedidos/detalhes são consultados por Server Actions autenticadas. Cliente da API é `server-only`. Cookie HttpOnly/Strict, Secure em produção, validade 8h. | `frontend/src/actions/orders.ts`, `frontend/src/lib/auth.ts`, `frontend/src/lib/api.ts` |
| S05 — abuso de autenticação e senhas fracas | Rate limits por IP e conta; senha nova de 12 caracteres a 72 bytes; bcrypt custo 12, atualização do hash legado após login; senhas curtas de demonstração recusadas em produção. Bootstrap administrativo e renovação de senha por comando local. | `backend/src/middlewares/rateLimits.ts`, `backend/src/services/user/`, `backend/src/scripts/manage-user.ts` |
| S06 — token mobile sem armazenamento seguro | SecureStore no dispositivo, token somente em memória no web; limpeza das chaves legadas; HTTP 401/logout limpam a sessão; restauração consulta `/me`. Respostas de requisições antigas não invalidam tokens novos. | `mobile/services/session.ts`, `mobile/services/api.ts`, `mobile/contexts/AuthContext.tsx` |
| S07 — erros internos expostos | Middleware distingue erros de domínio e falhas inesperadas; estas retornam mensagem genérica com HTTP 500, sem stack/conexão/query na resposta. Logs não incluem mensagens/objetos de erro completos. | `backend/src/middlewares/errorHandler.ts` |
| S08 — mutações em estados inválidos | Itens só mudam em rascunhos; envio exige itens; finalizar exige enviado e pendente; excluir exige rascunho. Operações usam transações e lock parametrizado no pedido pai, mantido até commit/rollback. | `backend/src/services/order/` |
| F01 — produto consultado no modelo Order | Inclusão consulta Product ativo e mantém o retorno esperado pelo app. | `AddItemOrderService.ts` |
| F02 — categoria ignorada | Rota conectada ao controller específico; consulta usa categoria e produto ativo. | `backend/src/routes.ts`, `ListProductByCategoryService.ts` |
| F03 — typecheck backend | Parâmetros corrigidos; middleware de erro preserva os quatro argumentos do Express. | `backend/src/config/multer.ts`, `middlewares/errorHandler.ts` |
| F04 — erros e avisos do mobile | Efeitos reorganizados, respostas antigas de produtos ignoradas, imports/estados usados corretamente; botões respeitam loading/disabled. | `mobile/app/(authenticated)/order.tsx`, `mobile/components/Button.tsx` |
| F05 — acesso a role de usuário inexistente | Autenticação busca usuário existente e preenche papel verificado; ADMIN depende desse papel e retorna 403 quando necessário. | `isAuthenticated.ts`, `isAdmin.ts` |
| F06 — preparação de produção | Scripts de build/start, geração automática do Prisma, migrações e saúde do processo. Configuração validada sem imprimir valores sensíveis. | `backend/package.json`, `backend/src/config/env.ts`, `DEPLOY.md` |

Também foram aplicados Helmet, CORS por allowlist, headers de segurança e CSP com nonce no dashboard, limites de tamanhos/UUIDs/quantidades, validação do ID de arquivamento e nome aleatório de imagem no Cloudinary. A tela mobile recupera os itens do pedido ao abrir e não imprime objetos Axios contendo senha/token.

## Dependências

| Módulo | Auditoria inicial: pacotes afetados | Após correções |
|---|---:|---:|
| Backend | 1 alto | 0 |
| Frontend | 4 moderados e 2 baixos | 0 |
| Mobile | 10 moderados | 0 |

Os números iniciais incluíam propagação entre dependências, não vulnerabilidades independentes.

- Backend: parser atualizado para corrigir [GHSA-27r3-jxmh-p828](https://github.com/advisories/GHSA-27r3-jxmh-p828).
- Frontend: CLI `shadcn` removido da árvore instalada. O CSS efetivamente usado foi preservado localmente, com licença MIT, em `frontend/src/styles/`; os componentes e o visual foram mantidos.
- Mobile: atualizações compatíveis com SDK 58 via Expo e correções transitivas. Como as ferramentas ainda exigiam minimatch vulnerável, foi aplicado override fixado em minimatch 11.0.8, validado com lint, configuração Expo e exportação Android. Não houve downgrade de Expo.
- Não foi utilizado `npm audit fix --force`.

## Verificações executadas

| Check | Resultado |
|---|---|
| Backend `npm test` | 14 testes passaram, incluindo autorização, cadastro, estados de pedidos, categoria, produto arquivado, limites de quantidade, erro genérico, conteúdo comprimido e rate limit. |
| Backend `npm run build` | Passou; gera Prisma Client e compila TypeScript. |
| Backend compilado com configuração isolada de produção | Iniciou; `/health` respondeu 200. |
| Frontend TypeScript e `npm run build` | Passaram; rotas dinâmicas e Proxy compilados. |
| Chrome headless com frontend de produção e API HTTPS simulada | Passou: login, cadastro restrito, cookie HttpOnly/Strict, hidratação com CSP, consulta de pedidos no servidor e ausência de bearer no HTML/props e nas chamadas do navegador à API. |
| Mobile `npm run lint` | Passou sem erros ou avisos. |
| Mobile `tsc --noEmit --incremental false` | Passou. |
| Mobile `expo install --check` | Dependências compatíveis. |
| Mobile exportação Android | Bundle gerado com URL HTTPS. Não é APK/AAB assinado. |
| Exportação mobile configurada com HTTP | Recusada como esperado. |
| `npm audit --json` nos três módulos | Zero vulnerabilidades reportadas na consulta final. |
| Gitleaks | Sem achados nos arquivos publicáveis após as correções; auditoria inicial também sem achados nos 56 commits do histórico. |

Os testes HTTP do backend substituem Prisma por dados sintéticos e o teste do navegador usa API simulada. Eles não comprovam comportamento de lock entre conexões PostgreSQL reais nem integração com Cloudinary. Não foi executado fluxo ponta a ponta com banco/serviços reais ou em aparelho físico. Semgrep/opengrep e Trivy não estavam disponíveis.

## Segredos e ambiente

O JWT_SECRET local que apareceu no log da auditoria inicial foi substituído por um valor aleatório sem exibir seu conteúdo. O log temporário foi sanitizado. O valor novo permanece em `backend/.env`, ignorado pelo Git; as sessões antigas precisam de novo login. Produção deve receber um segredo próprio pelo provedor.

Nenhuma senha do banco existente foi alterada. Use os comandos administrativos do [guia de deploy](./DEPLOY.md) para renovar credenciais de demonstração e revisar usuários que tenham sido cadastrados enquanto a rota era pública. Alterar uma senha não revoga JWTs já emitidos; substituir JWT_SECRET invalida todas as sessões.

O rate limit atual é por processo; escala horizontal exige controle compartilhado. HTTPS público, configuração de proxy, URLs reais, migrações de release e distribuição nas lojas dependem do ambiente de publicação. As contas e dados de staging/produção precisam ser preparados e verificados antes de publicar.
