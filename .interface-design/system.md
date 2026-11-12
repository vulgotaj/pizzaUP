# pizzaUP — Cantina acolhedora

Referência visual: http://localhost:4400/c/5x0NsEte1T

Direção escolhida por Felipe: uma cantina acolhedora, com amarelo próximo ao queijo e marrom avermelhado próximo à carne assada. Aplicação autorizada no webapp e no mobile. Preservar a ordem dos elementos, condições, handlers, rotas e contratos da API.

## Fundamentos

| Papel | Cor |
| --- | --- |
| Fundo de papel | `#F7EED8` |
| Cartão de louça | `#FFF9EA` |
| Campo | `#F0E3C7` |
| Ação principal, queijo | `#EDBC4C` |
| Hover / pressionado | `#E3AE3E` / `#D39B2D` |
| Marca e títulos, carne assada | `#78382B` |
| Texto e texto sobre amarelo | `#452C24` |
| Apoio | `#786054` |
| Divisória decorativa | `#E4D5B8` |
| Borda de controle | `#8D765E` |
| Produção: texto / fundo | `#755113` / `#F3DFAB` |
| Erro e exclusão: texto / fundo | `#AB302F` / `#FBE7DF` |

Não usar branco sobre o amarelo. Cor de ação não significa sucesso. Exclusão tem ícone e vermelho próprio. Não adicionar novos estados ou controles para acomodar o tema.

Tipografia: Fraunces 600 nos títulos, 700 no nome pizzaUP; DM Sans 400/500/600/700 na leitura e controles; IBM Plex Mono 500 nas quantidades. Preços tabulares. Escala: títulos 32/28/24/20, corpo 16, apoio 14, legenda 12. Nome com tracking negativo e sublinhado amarelo apenas no UP.

Profundidade por superfícies sólidas e bordas finas, sem sombras decorativas. Modal sobre scrim marrom. Sidebar compartilha o fundo da página. Inputs têm fundo levemente mais escuro que o cartão.

Espaçamento: base 4px, 8–16 dentro de grupos, 24–32 entre blocos. Raios: controles 6px, cartões 10px, modal 14px. Foco marrom avermelhado e visível; respeitar movimento reduzido.

## Padrões

- Botão principal: amarelo, texto escuro semibold; 48px web e mínimo 52px mobile. Botão secundário: transparente com borda, texto marrom. Alvos compactos têm mínimo 44px web / 48px mobile.
- Campo: 52px web / mínimo 56px mobile, borda de controle e fundo de massa. Labels e placeholders usam DM Sans; placeholder mantém contraste.
- Comanda web: mesa + status; resumo dos itens; divisória pontilhada; total + Detalhes. Borda superior marrom e título Fraunces. Grid e sidebar existentes preservados.
- Item mobile: cartão claro, nome e quantidade/preço à esquerda, remover à direita. Quantidade com controles de 48px e número monoespaçado.
- Modal web: margem lateral mínima de 16px; conteúdo rola quando excede a altura disponível. Os detalhes de cada item se empilham em larguras pequenas, mantendo a ordem do DOM.

## Onde manter

Web: `frontend/src/app/globals.css`, fontes em `frontend/src/app/layout.tsx`, primitives em `frontend/src/components/ui`.

Mobile: `mobile/constants/theme.ts`, carregamento em `mobile/app/_layout.tsx`, controles em `mobile/components`. Importar cada peso diretamente do subdiretório dos pacotes de fontes para não incluir todas as variantes no bundle. As fontes são empacotadas; não carregadas remotamente no uso.

Na revisão: comparar desktop 1280/768/390px e mobile 390/360px, verificar modais, teclado, safe area, texto aumentado, loading, vazio e erros já existentes. Testes visuais com fixtures não substituem a conferência em aparelho Android/iOS.
