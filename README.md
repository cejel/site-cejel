# Site do Centro Espírita Jesus no Lar

Site estático em HTML, CSS e JavaScript puro. Sem build, sem back-end, sem
dependência de runtime. Dá para abrir os arquivos direto no navegador e sobe
em qualquer hospedagem, inclusive FTP comum.

## Páginas

```
index.html                                  Início
atividades/atendimento-fraterno/            Terça, 20h
atividades/passe/                           sem horário próprio
atividades/palestra-publica/                Quarta, 20h
atividades/estudo-sistematizado/            Quinta, 20h
atividades/evangelizacao-infantojuvenil/    Sábado, 9h30
atividades/roda-de-conversa/                Sábado, 9h30
atividades/sopa-fraterna/                   Sábado, 11h30
atividades/bazar/                           Segunda a sexta
atividades/livraria/                        nos dias de atividade
doacoes/index.html                          Doações
contato/index.html                          Contato
```

**Não existe página índice de atividades.** A lista completa vive na seção
`#atividades` da home, e é para lá que apontam o rótulo "Atividades" do
cabeçalho, o breadcrumb das nove subpáginas e o botão do hero. O submenu do
cabeçalho dá acesso direto a cada atividade.

Como consequência, a URL `/atividades/` sozinha não resolve para nada. Se
alguém digitá-la, o servidor responde 404 ou lista o diretório, dependendo da
hospedagem. Vale um redirecionamento de `/atividades/` para `/#atividades`
quando o site subir.

## Como editar

Duas opções, e elas não se misturam bem:

1. **Editar o gerador** em `_ferramentas/gen_site.py` e rodar
   `python _ferramentas/gen_site.py`. Todo o texto das atividades está na
   lista `ATIVIDADES` no começo do arquivo. É o caminho recomendado enquanto
   o conteúdo ainda estiver mudando, porque mantém cabeçalho, rodapé e
   cartões iguais nas 12 páginas.
2. **Editar o HTML na mão.** Funciona, é HTML comum, mas a próxima execução
   do gerador desfaz a alteração.

### Proteção contra sobrescrita

O gerador guarda em `_ferramentas/.geracao.json` a impressão digital de cada
arquivo que escreveu. Se, na execução seguinte, algum HTML estiver diferente
do que ele gerou, isso significa que alguém o editou à mão. Nesse caso o
conteúdo anterior é copiado para `_ferramentas/_edicoes-manuais/`, com data e
hora no nome, e um aviso em destaque aparece no terminal.

A edição não se perde, mas também não volta sozinha: é preciso levá-la para
o `gen_site.py`, senão some na geração seguinte.

### Tom de voz

As onze páginas internas (as nove atividades, Doações e Contato) usam
registro impessoal e doutrinário, sem tratamento direto ao leitor: nenhuma
ocorrência de "você", "seu" ou imperativo dirigido a quem lê. As frases
usam construções como "os que procuram a casa", "a atividade visa",
"recomenda-se". O vocabulário segue o panfleto de 2017 da própria casa e a
forma como a Federação Espírita Brasileira descreve as mesmas atividades.

O papel dessas páginas é esclarecer, não contornar objeções. Os blocos de
destaque trazem orientação prática ou aviso de escopo, não argumentos de
persuasão.

**A home segue em registro próprio**, mais direto, e ficou de fora dessa
revisão por decisão da casa. Os textos curtos dos cartões da home vivem no
campo `cartao` de cada atividade; os das páginas internas, nos campos
`resumo` e `corpo`. Alterar um não afeta o outro.

### O curso vigente do Estudo Sistematizado

A casa alterna ESDE e ESME com uma turma e uma professora. O curso atual
aparece em **um único lugar**: o bloco marcado com `TURMA ATUAL` dentro de
`ATIVIDADES` no `gen_site.py`, na entrada `estudo-sistematizado`. Quando a
turma concluir o ESME e voltar ao ESDE, são duas frases para trocar ali.

## Ferramentas

Ficam em `_ferramentas/` e só são necessárias para regerar coisas. Precisam
de Python com Pillow e, para o QR, de segno.

| script | o que faz |
| --- | --- |
| `gen_site.py` | gera as 12 páginas HTML |
| `build_assets.py` | recolore o logo para a paleta, recorta e espelha as fotos, exporta WebP responsivo e gera os favicons |
| `build_pix.py` | monta o BR Code do Pix e desenha o QR em SVG |
| `icones-phosphor/` | os 23 SVG usados, do pacote oficial `@phosphor-icons/core` |
| `pix-brcode.txt` | o payload do Pix em texto, para conferência |
| `transcrever.py` | transcreve áudio localmente, offline e sem limite |

## Mandar feedback por áudio

Grave com o **Gravador de Som do Windows** (ou o gravador do celular), largue
o arquivo em `audios/` e peça a transcrição. Não grave dentro do chat: é ali
que a gravação corta.

```
python _ferramentas/transcrever.py          # pega o áudio mais novo de audios/
python _ferramentas/transcrever.py x.m4a    # um arquivo específico
python _ferramentas/transcrever.py x.m4a --tempos    # com marcas de tempo
python _ferramentas/transcrever.py x.m4a --modelo small   # 2x mais rápido, erra mais
```

Sai um `.txt` ao lado do áudio. Roda offline, o áudio não sai da máquina e
não há cota nem custo.

Usa `faster-whisper` com o modelo `medium`, em CPU. Na primeira execução
baixa 1,5 GB de pesos e guarda em cache; depois transcreve a cerca de 1,6
vez o tempo real, ou seja, um áudio de 5 minutos leva perto de 3 minutos.
Aceita m4a direto, sem ffmpeg instalado, porque o PyAV já vem junto.

A constante `VOCABULARIO` no topo do script lista os termos do projeto e é
passada como contexto ao modelo. Sem ela, "hero" sai como "Hirof" e "bazar"
como "basar". Vale acrescentar palavras novas conforme aparecerem.

A GPU fica de fora de propósito. A GTX 1050 Ti é Pascal e não faz float16
eficiente, e a aceleração ainda exigiria as DLLs do CUDA runtime, que o pip
não traz. Com 20 núcleos a CPU dá conta.

## Decisões que valem saber antes de mexer

**Três azuis, com papéis distintos.** O ciano `#42C8E6` não pode carregar
texto: dá 1,97:1 sobre branco. Ele é superfície, botão e acento decorativo, e
texto sobre ele usa `#152D32` (7,32:1). O azul profundo `#0E469B` veio da
identidade da casa e carrega todos os rótulos de acento, os dias da
programação, os ícones, o título do hero e o anel de foco; dá 8,87:1 sobre
branco e 7,60:1 sobre o ciano pálido. O teal `#152D32` é a tinta do corpo e
o fundo do botão principal e do rodapé.

**No hero o botão não pode ser ciano.** O fundo é o ciano pálido `#E2F0F3`, e
o `#42C8E6` separa só 1,69:1 dele, então o botão desapareceria. Ele usa o
teal `#152D32`.

**Corpo de texto secundário usa `#303E40`, não `#747B7C`.** O segundo dá
4,31:1 sobre branco e reprova por pouco.

**O logo foi recolorido, e só isso.** O arquivo oficial da casa usa o
azul-marinho `#33547F`; a placa da fachada usa o ciano, e o site segue a
fachada. **As letras não foram redesenhadas**: o remapeamento é pixel a
pixel, e a contagem de pixels da tipografia é idêntica nos dois arquivos
(50.132 px). O cabeçalho usa apenas o recorte do símbolo, sem tipografia
nenhuma. O original fica em
`uploads/_do_site_antigo/2024-03_LOGO-CEJEL.png`.

**As marcas da Sopa Fraterna e da Roda de Conversa aparecem nas cores
originais, sobre branco.** Elas são de outra identidade gráfica da casa e
não foram recoloridas.

**Duas atividades não têm foto.** Atendimento Fraterno e Sopa Fraterna usam
capa tipográfica, com o ícone em marca d'água sobre gradiente ciano. É um
padrão do sistema, não um espaço vazio. Quando as fotos chegarem, basta
trocar o campo `capa` daquela atividade no `gen_site.py` para
`{"tipo": "foto", "arquivo": "...", "largs": [...], "alt": "..."}` e rodar o
`build_assets.py` com a imagem nova.

**Tema claro único.** O modo escuro foi removido a pedido da casa. O
`color-scheme: light` em `tokens.css` também trava os controles nativos do
navegador no claro.

**O cabeçalho mostra só o símbolo.** O nome continua no HTML como texto para
leitor de tela, senão o link da home ficaria sem rótulo acessível.

**O menu de Atividades abre no `:hover` e no `:focus-within`**, sem
JavaScript. No celular ele vira lista recuada, sempre aberta, para não exigir
um segundo toque.

**O rodapé usa `cejel-logo-claro.png`.** Na versão padrão o "JESUS no LAR" é
teal escuro e sumia contra o fundo do rodapé. A variante clara é gerada a
partir do logo principal, trocando só o teal por branco.

**Sem cookies e sem medição de acesso.** O mapa é do OpenStreetMap, por
iframe, sem cookie do Google. O link de rota abre o Google Maps só quando a
pessoa clica.

## Pendências

- [ ] **Testar o QR do Pix com um aplicativo de banco de verdade.** O
      payload segue o padrão EMV do Banco Central e o CRC foi validado
      contra o vetor de teste oficial, mas nada substitui uma leitura real
      antes de publicar.
- [ ] Fotografar o Atendimento Fraterno e a Sopa Fraterna.
- [ ] WhatsApp, esperando aprovação da presidente. Quando sair, o bloco
      entra na página de contato e a página de doações passa a ter um canal
      direto além do Instagram.
- [ ] Refinar o texto da Sopa Fraterna, escrito como primeira versão.
- [ ] Conferir se o e-mail `contato@cejesusnolar.com.br` está ativo. Hoje
      ele não aparece no site, porque ninguém acompanha a caixa.
- [ ] Página de estrutura organizacional, quando a casa quiser. A navegação
      já aceita um quinto item sem quebrar em duas linhas.

## Quando assumir o domínio

O site foi feito para substituir o `cejesusnolar.com.br`, que hoje roda um
WordPress abandonado. Os caminhos são todos relativos, então basta subir a
pasta na raiz do domínio. Vale prever redirecionamento das URLs antigas, que
usam o formato `?page_id=N` e `?p=N`.
