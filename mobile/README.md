# pizzaUP — Aplicativo mobile

Aplicativo de atendimento para abrir mesas, montar pedidos e enviá-los à cozinha. Desenvolvido com Expo SDK 58, React Native 0.88, React 19, TypeScript, Expo Router, Axios e SecureStore.

**Atualizado em 11/11/2026:** o app já possui autenticação e telas para o fluxo de atendimento, integradas à API. A etapa de produto pendente é a aplicação do design final. As limitações técnicas da integração estão no [contexto do projeto](../CONTEXTO_PROJETO.md#estado-e-limites-conhecidos).

## Acesso de demonstração

- E-mail: `beatriz@teste.com`
- Senha: `teste123`

A conta precisa existir no banco conectado à API; não há seed automático. As credenciais de demonstração com senha curta são aceitas apenas em desenvolvimento. O app exige autenticação e não restringe o acesso ao perfil `ADMIN`. O acesso administrativo do dashboard está no [README principal](../README.md#acessos-para-demonstração).

## Funcionalidades implementadas

- Login por e-mail/senha e persistência da sessão entre aberturas do app.
- Logout e proteção das rotas autenticadas.
- Abertura de mesa, criando pedido em rascunho na API.
- Consulta de categorias e solicitação de produtos por categoria.
- Seleção de produto, controle de quantidade e inclusão/remoção de itens.
- Exibição dos itens adicionados e avanço para a confirmação do pedido.
- Identificação do cliente e envio à cozinha pela tela `finish`.

No app, “Finalizar pedido” significa **enviar para preparo** (`PUT /order/send`). A conclusão do preparo acontece no dashboard (`PUT /order/finish`).

## Execução local

Inicie o backend conforme o [guia da API](../backend/README.md). Nesta pasta:

```bash
npm install
```

Crie `.env` com a URL da API acessível pelo aparelho. Exemplo para desenvolvimento local:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3333
```

Substitua o IP pelo endereço acessível no seu ambiente. A URL é lida de `EXPO_PUBLIC_API_URL`; builds de produção exigem HTTPS. O timeout permanece em 12 segundos. Em um celular físico, computador e aparelho devem ter conectividade entre si; permita acesso à porta `3333` no firewall. `localhost` no celular aponta para o próprio dispositivo.

```bash
npm run start
```

Abra o QR code em um cliente Expo compatível com o SDK do projeto ou use um emulador configurado. Os scripts disponíveis são:

| Comando | Finalidade |
|---|---|
| `npm run start` | Inicia o servidor Expo. |
| `npm run android` | Inicia o Expo com abertura no Android. |
| `npm run ios` | Inicia o Expo com abertura no iOS; simulador local requer macOS. |
| `npm run web` | Executa pelo navegador. |
| `npm run lint` | Executa a análise estática com Expo/ESLint. |
| `npx tsc --noEmit` | Verifica tipos, sem gerar arquivos. |

Não há scripts de testes automatizados nem arquivo `eas.json` de distribuição no repositório.

## Telas e organização

| Caminho/diretório | Responsabilidade |
|---|---|
| `app/_layout.tsx` | Provider de autenticação e navegação principal. |
| `app/index.tsx` | Redireciona conforme o estado da sessão. |
| `app/login.tsx` | Login do atendente. |
| `app/(authenticated)/_layout.tsx` | Proteção e navegação do grupo autenticado. |
| `app/(authenticated)/dashboard.tsx` | Abertura de mesa. |
| `app/(authenticated)/order.tsx` | Seleção de categorias/produtos e gerenciamento dos itens. |
| `app/(authenticated)/finish.tsx` | Nome do cliente e envio à cozinha. |
| `components/` | Botão, input, seletor, quantidade e item do pedido. |
| `contexts/AuthContext.tsx` | Login, logout e restauração da sessão. |
| `services/api.ts` | Axios e interceptors de autenticação. |
| `config/api.config.ts` | Endereço da API e timeout. |
| `constants/theme.ts` | Cores, espaçamentos e tipografia do visual atual. |
| `types/` e `utils/` | Tipos e formatação compartilhada. |

O JWT fica em SecureStore no dispositivo; o usuário fica em memória e é consultado em `/me` ao restaurar a sessão. O logout e HTTP 401 limpam token e estado de autenticação. As chaves antigas do AsyncStorage são apagadas, exigindo novo login após a atualização. Na versão web, o token permanece apenas em memória.

## Fluxo de demonstração

1. Entre com `beatriz@teste.com` e senha `teste123`.
2. Informe uma mesa com número inteiro positivo e toque em “Abrir mesa”.
3. Selecione uma categoria e um produto, ajuste a quantidade e adicione o item.
4. Remova um item para explorar a operação e adicione os itens desejados.
5. Com pelo menos um item na lista, toque em “Avançar”.
6. Informe o cliente e toque em “Finalizar pedido” para enviar à cozinha.
7. No dashboard web, atualize a lista para visualizar o pedido e finalizar o preparo.

O filtro por categoria e a inclusão de itens foram corrigidos. A validação de envio e dos estados dos pedidos acontece no servidor.

## Estado e limites conhecidos

O filtro por categoria e a inclusão de itens foram corrigidos na API. A montagem carrega itens anteriores do pedido por `/order/detail`; ainda não existe tela dedicada a listar rascunhos. O botão de voltar não exclui o pedido no servidor.

Lint, TypeScript e compatibilidade de dependências Expo passaram após as correções. O bundle Android foi exportado com URL HTTPS, e uma exportação com URL HTTP foi recusada. Não foi gerado APK/AAB assinado nem executada validação em aparelho. O [guia de deploy](../DEPLOY.md) descreve a preparação de ambiente e os limites de distribuição.
