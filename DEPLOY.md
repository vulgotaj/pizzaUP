# Publicação do pizzaUP

As correções de segurança estão aplicadas no código. Este guia configura os ambientes; nenhum push, deploy ou comando no banco real foi executado durante as correções.

## API

Use Node.js 24 LTS e instale com `npm ci` dentro de `backend`. O postinstall gera o Prisma Client e não conecta ao banco. Configure as variáveis no provedor:

| Variável | Valor |
|---|---|
| `NODE_ENV` | `production` (`npm start` também define esse valor). |
| `DATABASE_URL` | Conexão PostgreSQL de produção com TLS conforme o provedor. |
| `JWT_SECRET` | Segredo aleatório próprio do ambiente, com pelo menos 32 caracteres; não reutilize o segredo de desenvolvimento. |
| `CORS_ORIGINS` | Origem HTTPS do dashboard, sem barra final; múltiplas origens separadas por vírgulas. |
| `TRUST_PROXY_HOPS` | `0` sem proxy; configure o número real de proxies confiáveis à frente da API, evitando acesso direto que contorne essa cadeia. |
| `PORT` | Porta fornecida pela hospedagem; padrão 3333. |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Credenciais próprias do ambiente. |

Gere o JWT_SECRET no gerenciador de segredos do provedor ou com `node -e "process.stdout.write(require('node:crypto').randomBytes(48).toString('base64url'))"`. Não publique a saída nem a adicione ao Git. O segredo local exposto na auditoria já foi substituído; sessões antigas precisam de novo login.

Configure:

```text
Build: npm run build
Release/migração: npm run db:migrate
Start: npm start
Health: GET /health
```

`/health` confirma a saúde do processo; não consulta PostgreSQL. Execute migrações como etapa controlada de release e configure terminação TLS/HTTPS no proxy da hospedagem. A API escuta HTTP internamente para ser usada atrás desse proxy.

Os rate limits em memória valem por processo e reiniciam com ele. Se houver várias réplicas, aplique limites compartilhados no proxy/WAF ou conecte um store compartilhado antes de escalar. Limites atuais: 300 requisições/minuto por IP; login com 30 falhas por IP e 10 por e-mail em 15 minutos; criação de contas limitada a 20 em 15 minutos por IP, após autenticação administrativa.

## Primeiro administrador e senhas

Não há cadastro público. Configure `ACCOUNT_EMAIL`, `ACCOUNT_PASSWORD` e, opcionalmente, `ACCOUNT_NAME` em uma sessão administrativa com acesso ao banco correto e execute, dentro de `backend`:

```text
npm run admin:create
```

O bootstrap só cria o administrador se nenhum ADMIN existir. Depois, use “Cadastrar atendente” no dashboard; novos usuários são sempre STAFF. Senhas novas precisam de pelo menos 12 caracteres e no máximo 72 bytes UTF-8. A senha nunca é impressa pelo comando.

Para renovar a senha de uma conta existente, configure `ACCOUNT_EMAIL` e `ACCOUNT_PASSWORD` e execute:

```text
npm run user:password
```

Remova essas variáveis da sessão depois do uso e não as mantenha na configuração pública do serviço. No PowerShell, obtenha a senha sem eco com `Read-Host -AsSecureString` e converta apenas para a variável de ambiente do subprocesso. As contas de demonstração do README são exclusivas de desenvolvimento: produção recusa senhas que não atendam à política. Nenhuma senha do banco existente foi alterada automaticamente.

JWTs têm validade de 8 horas. Para invalidar todas as sessões imediatamente, substitua JWT_SECRET no serviço. Alterar apenas uma senha não revoga JWTs já emitidos.

## Dashboard

Dentro de `frontend`, instale com `npm ci` e configure `API_URL=https://<dominio-da-api>`. Essa variável fica no servidor Next.js. A variável antiga `NEXT_PUBLIC_API_URL` ainda é aceita como fallback, mas não é necessária; retire-a da configuração nova.

```text
Build: npm run build
Start: npm start
```

Sirva o dashboard por HTTPS. O cookie é HttpOnly, Secure em produção e SameSite Strict. Consultas e mutações autenticadas passam pelo servidor; o bearer não é enviado em props ao navegador. A CSP usa nonce por resposta e o HTML é dinâmico. Se trocar de conta Cloudinary, ajuste `images.remotePatterns` em `next.config.ts` para o caminho da conta correspondente.

## Aplicativo

Dentro de `mobile`, instale com `npm ci`. Configure `EXPO_PUBLIC_API_URL=https://<dominio-da-api>` no ambiente de build. Essa URL é pública; não coloque credenciais em variáveis `EXPO_PUBLIC_*`. O código rejeita HTTP em produção, e a configuração também recusa exportações de produção sem HTTPS.

Para testar somente o bundle Android:

```text
npx expo export --platform android
```

Esse comando não gera APK/AAB assinado. A distribuição Android/iOS exige preparar o projeto e o perfil da conta Expo/EAS com os identificadores e credenciais corretos; não foi feita publicação nem assinatura durante esta tarefa. HTTP com IP local continua permitido no desenvolvimento.

O JWT é persistido em SecureStore no dispositivo, o usuário é validado em `/me` na restauração e HTTP 401 limpa o estado da sessão. Na versão web do app, o token fica somente em memória. A atualização apaga as chaves antigas do AsyncStorage e exige novo login.

## Verificação antes de publicar

```text
backend: npm test && npm run build && npm audit
frontend: npm run build && npm audit
mobile: npm run lint && npx tsc --noEmit && npx expo install --check && npm audit
```

Os testes HTTP do backend usam dados simulados. Valide em staging, com banco isolado, upload real e dispositivos, o fluxo mesa → itens → cozinha → finalização. A exclusão de pedido exige ADMIN e só aceita rascunhos; pedidos enviados/concluídos não podem ter seus itens alterados. Consulte [AUDITORIA_SEGURANCA.md](./AUDITORIA_SEGURANCA.md) para os resultados executados e seus limites.
