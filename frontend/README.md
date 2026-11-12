# pizzaUP — Dashboard web

Interface administrativa e de acompanhamento da cozinha, desenvolvida com Next.js 16, React 19, TypeScript, Tailwind CSS 4 e shadcn/ui/Base UI.

**Atualizado em 11/11/2026:** as telas e a integração com a API estão implementadas. A etapa de produto pendente é aplicar o design final. O progresso completo e os limites técnicos estão no [contexto do projeto](../CONTEXTO_PROJETO.md).

## Acesso de demonstração

- E-mail: `felipe@teste.com`
- Senha: `teste123`
- Login local: [http://localhost:3000/login](http://localhost:3000/login)

O dashboard exige perfil `ADMIN`. A conta precisa existir no banco conectado à API; não há seed automático. O cadastro é restrito a administradores autenticados e cria usuários `STAFF`; o login web recusa contas sem perfil administrativo. As contas de demonstração com senha curta só funcionam em desenvolvimento. O acesso de teste do app está no [README principal](../README.md#acessos-para-demonstração).

## Funcionalidades implementadas

- Cadastro, login, logout e proteção das páginas administrativas.
- Listagem e cadastro de categorias.
- Listagem e cadastro de produtos com nome, descrição, categoria, preço e imagem.
- Máscara de preço em reais, conversão para centavos e prévia de imagem antes do envio.
- Arquivamento de produtos por exclusão lógica.
- Listagem de pedidos enviados e ainda não finalizados, com mesa, itens e total.
- Modal com dados do cliente, itens, quantidades, subtotais e finalização do preparo.
- Navegação com sidebar no desktop e menu para telas menores.

## Execução local

Com a API em funcionamento, execute nesta pasta:

```bash
npm install
```

Crie `.env.local` com:

```env
API_URL=http://localhost:3333
```

A URL é utilizada somente pelo servidor Next.js; em produção, deve usar HTTPS. Reinicie o servidor após alterar a configuração.

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). A rota `/` redireciona para `/login`.

Para gerar e servir o build de produção:

```bash
npm run build
npm run start
```

Esses são os scripts disponíveis no `package.json`; não há scripts de lint ou testes automatizados neste módulo.

## Rotas

| Caminho | Função |
|---|---|
| `/` | Redireciona para login. |
| `/login` | Autenticação. |
| `/register` | Cadastro de atendente `STAFF`, restrito a `ADMIN`. |
| `/access-denied` | Informa ausência de permissão administrativa. |
| `/dashboard` | Pedidos da cozinha. |
| `/dashboard/products` | Consulta, cadastro e arquivamento de produtos. |
| `/dashboard/categories` | Consulta e cadastro de categorias. |

## Organização e integração

| Diretório/arquivo | Responsabilidade |
|---|---|
| `src/app/` | Rotas e layouts do App Router. |
| `src/actions/` | Server Actions de autenticação, categorias, produtos e finalização de pedidos. |
| `src/components/dashboard/` | Navegação, formulários, pedidos e modal de detalhes. |
| `src/components/forms/` | Formulários de login e cadastro. |
| `src/components/ui/` | Componentes de interface compartilhados. |
| `src/lib/api.ts` | Cliente HTTP com suporte a JWT e tratamento de erros. |
| `src/lib/auth.ts` | Cookie de sessão, consulta do usuário e exigência de `ADMIN`. |
| `src/lib/types.ts` e `src/lib/format.ts` | Tipos e formatação de valores monetários. |
| `src/app/globals.css` | Estilos globais e tokens do visual atual. |

A sessão usa o cookie `token_pizzaUP`, HttpOnly, com duração de 8 horas, SameSite Strict e Secure em produção. Pedidos e detalhes usam Server Actions autenticadas: o JWT fica no servidor, sem ser passado aos componentes do navegador. As respostas HTML possuem CSP com nonce e proteção contra enquadramento. As mutações de categorias e produtos revalidam os caminhos correspondentes.

## Imagens e atualização dos pedidos

As imagens são enviadas para Cloudinary pela API. O formulário aceita JPG/JPEG/PNG de até 5 MB. `next.config.ts` permite até `6mb` nas Server Actions para acomodar o arquivo e os metadados; sua regra `images.remotePatterns` permite o caminho Cloudinary da conta atual. Ao trocar de conta, ajuste essa regra para que as imagens sejam exibidas.

A cozinha consulta `/orders?draft=false` e filtra os pedidos não finalizados. Atualize a lista pelo botão de atualização após enviar um pedido pelo app. A consulta também acontece ao abrir a tela e ao fechar os detalhes; não há atualização em tempo real. Após finalizar o preparo, o pedido deixa a lista de pendentes.

O preço é armazenado em centavos: `4500` corresponde a R$ 45,00. O painel calcula o total por preço do produto multiplicado pela quantidade.

## Pendência e documentação relacionada

A troca para o design final está pendente. As falhas de filtro por categoria e inclusão de itens foram corrigidas. Consulte o [relatório de correções](../AUDITORIA_SEGURANCA.md) e o [guia de deploy](../DEPLOY.md).

- [Execução dos três módulos e roteiro de demonstração](../README.md)
- [Referência da API](../endpoints.md)
- [Guia do aplicativo mobile](../mobile/README.md)
