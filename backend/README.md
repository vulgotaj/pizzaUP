# pizzaUP — API REST

Backend central do dashboard e do aplicativo de atendimento. Usa Node.js, TypeScript 6, Express 5, Prisma 7, PostgreSQL, Zod, JWT, bcryptjs, Multer e Cloudinary.

**Atualizado em 11/11/2026:** implementa autenticação, categorias, produtos e operações de pedidos e itens. Os clientes web e mobile já estão presentes no projeto; a troca para o design final das interfaces está pendente. As correções e verificações estão no [relatório de segurança](../AUDITORIA_SEGURANCA.md).

## Configuração local

Nesta pasta:

```bash
npm install
```

Copie `.env.example` para `.env`. No PowerShell:

```powershell
Copy-Item .env.example .env
```

Em shells Unix, use `cp .env.example .env`.

| Variável | Finalidade |
|---|---|
| `PORT` | Porta HTTP; padrão `3333`. |
| `DATABASE_URL` | Conexão PostgreSQL com o banco da aplicação. |
| `JWT_SECRET` | Chave usada para assinar e verificar tokens. |
| `CLOUDINARY_CLOUD_NAME` | Identificação da conta Cloudinary. |
| `CLOUDINARY_API_KEY` | Chave de acesso ao Cloudinary. |
| `CLOUDINARY_API_SECRET` | Segredo de acesso ao Cloudinary. |

Crie o banco indicado por `DATABASE_URL` e execute:

```bash
npx prisma generate --config prisma7.config.ts
npx prisma migrate deploy --config prisma7.config.ts
npm run dev
```

O nome de configuração usado pelo projeto é `prisma7.config.ts`; informe `--config` nos comandos da CLI. O client gerado em `src/generated/prisma` não é versionado.

A API atende em [http://localhost:3333](http://localhost:3333), sem prefixo `/api`. Não há rota cadastrada em `/`. Há `/health` para saúde do processo. Os comandos `npm test`, `npm run typecheck`, `npm run build`, `npm start` e `npm run db:migrate` cobrem teste, compilação, produção e migrações.

## Organização

```text
backend/
├── prisma/
│   ├── schema.prisma          # Modelos e relações
│   └── migrations/            # Migrações versionadas
├── src/
│   ├── @types/                # Extensão de tipos do Express
│   ├── config/                # Multer e Cloudinary
│   ├── controllers/           # Entrada e resposta HTTP
│   ├── middlewares/           # Validação, JWT e perfil administrativo
│   ├── prisma/                # Client com adaptador PostgreSQL
│   ├── schemas/               # Validação Zod
│   ├── services/              # Regras de negócio e acesso aos dados
│   ├── routes.ts              # Registro dos endpoints
│   └── server.ts              # Express, CORS e tratamento global de erros
├── .env.example
└── prisma7.config.ts
```

## Contratos e comportamento

- `/users`, `/session` e `/me` atendem cadastro, autenticação e consulta do usuário.
- `POST /users` exige `ADMIN` e cria somente `STAFF`. Criação/arquivamento de catálogo e finalização/exclusão de pedidos também exigem `ADMIN`.
- Categorias são criadas/listadas; produtos são criados/listados e arquivados com `disabled=true`.
- O upload de produto usa `multipart/form-data`, com imagem obrigatória no campo `file`, JPG/JPEG/PNG de até 5 MB. O buffer vai para Cloudinary; a URL resultante é salva em `banner`.
- Preços são inteiros em centavos. No formulário multipart, envie `price` como texto contendo dígitos, por exemplo `4500` para R$ 45,00.
- Pedidos começam em rascunho (`draft=true`, `status=false`). Enviar altera `draft=false`; finalizar altera `status=true`.
- Pedidos são compartilhados pela equipe autenticada. Itens só podem ser alterados em rascunhos; enviar exige itens; finalizar exige pedido enviado e pendente. As mutações usam transações e lock do pedido pai.
- Exclusão de produto é lógica; exclusão de pedido exige ADMIN e rascunho, é física e remove os itens por cascata.
- Erros de entrada usam 400; autenticação 401; perfil 403; recurso ausente 404; conflito de estado 409; limite de tentativas 429; falhas inesperadas 500 com mensagem genérica. JWT usa HS256, emissor/audiência explícitos e duração de 8 horas.

Métodos, parâmetros, respostas, exemplos e limitações estão na [referência dos endpoints](../endpoints.md).

## Dados para demonstração

Os acessos fornecidos para dashboard e app estão no [README principal](../README.md#acessos-para-demonstração). Não há seed de contas ou cardápio. Uma base nova precisa ser preparada: use `npm run admin:create` com as variáveis `ACCOUNT_*` para o primeiro administrador; depois cadastre atendentes no dashboard. Veja o [guia de deploy](../DEPLOY.md). Para inspecionar a base com Prisma Studio:

```bash
npx prisma studio --config prisma7.config.ts
```

O dashboard permite cadastrar categorias e produtos após o acesso administrativo.

## Limites conhecidos

O filtro por categoria e a validação de produtos foram corrigidos. Os testes automatizados isolam o acesso ao banco; concorrência em PostgreSQL, upload real e o fluxo com dados reais devem ser validados em staging. Limites de requisição em memória são por processo; múltiplas réplicas exigem limitação compartilhada no proxy ou store.

Consulte o [contexto técnico](../CONTEXTO_PROJETO.md) para arquitetura, estados dos pedidos, validações e limites da integração, e o [guia principal](../README.md#como-executar) para iniciar os três módulos.
