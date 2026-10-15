# 💍 Desafios de Casamento — Francisca & Nelson

Site mobile-first para desafios fotográficos num casamento. Cada mesa tem um QR code que leva à página do seu desafio, onde os convidados fazem upload de fotos para uma pasta específica no Google Drive. A página inicial mostra o progresso de todos os desafios.

## ✨ Funcionalidades

- 📱 Interface mobile-first com design de casamento (rosa/dourado, animações de corações)
- 📸 Upload de fotos pela câmera ou pela galeria do telemóvel
- 🖼️ Galeria de miniaturas com lightbox (ver em grande, navegar anterior/próximo)
- 📊 Barras de progresso por desafio (meta: 25 fotos cada)
- 🗂️ Cada desafio tem a sua própria pasta no Google Drive
- 🎉 Celebração animada quando um desafio atinge a meta
- 🔒 Proxy Vercel para evitar erros CORS com o Google Apps Script

## 📁 Estrutura do Projeto

```
desafios-casamento/
├── index.html              ← Página principal (SPA com hash routing)
├── css/
│   └── style.css           ← Tema de casamento + animações
├── js/
│   ├── config.js           ← Lista dos 15 desafios + URL do proxy
│   ├── home.js             ← Página inicial com barras de progresso
│   └── challenge.js        ← Página de desafio + upload + galeria + lightbox
├── api/
│   └── drive.js            ← Proxy Vercel → Google Apps Script
├── apps-script/
│   └── Code.gs             ← Backend Google Apps Script (Drive)
├── assets/
│   └── couple.jpg          ← Foto dos noivos
├── Codigos/                ← QR codes de cada desafio (PNG)
├── package.json            ← Node.js 24.x
└── .gitignore
```

## 🎯 Desafios (15)

| ID | Categoria | Nome | Meta |
|---|---|---|---|
| `refrao` | Poses Divertidas | A Foto do Refrão | 25 |
| `infiltrado` | Poses Divertidas | O Infiltrado | 25 |
| `brinde` | Poses Divertidas | Guerra de Olhares / Brinde | 25 |
| `coreografia` | Poses Divertidas | A Melhor Coreografia | 25 |
| `abraco` | Poses de Grupo | O Abraço de Grupo | 25 |
| `cima` | Poses de Grupo | Perspetiva de Cima | 25 |
| `oculos` | Poses de Grupo | Óculos e Acessórios | 25 |
| `danca-lenta` | Poses de Grupo | A Dança Lenta | 25 |
| `beijo` | Poses de Grupo | Beijo Disfarçado | 25 |
| `cumplice` | Poses de Grupo | O Olhar Cúmplice | 25 |
| `noivos` | Para Convidados | Com os Noivos | 25 |
| `modelo` | Para Convidados | Pose de Modelo | 25 |
| `brinde-mesa` | Para Convidados | Brinde da Mesa | 25 |
| `sapato` | Para Convidados | Sapato Extravagante | 25 |
| `espontanea` | Para Convidados | Foto Espontânea | 25 |

## 🔧 Configuração Passo a Passo

### 1. Pasta no Google Drive

1. Cria uma pasta no Google Drive para o álbum do casamento
2. Garante que és o **dono** da pasta (ou tens permissão de Editor)
3. Copia o ID da pasta (parte final do URL)
   - Exemplo: `https://drive.google.com/drive/folders/1EYrNLbzeEL0ju429FrIHcPTy9OD6cmH4` → ID é `1EYrNLbzeEL0ju429FrIHcPTy9OD6cmH4`
4. No ficheiro [apps-script/Code.gs](apps-script/Code.gs), atualiza a variável:
   ```js
   var PARENT_FOLDER_ID = '1EYrNLbzeEL0ju429FrIHcPTy9OD6cmH4';
   ```

### 2. Google Apps Script

1. Vai a [script.google.com](https://script.google.com) e cria um novo projeto
2. Apaga o código padrão e cola o conteúdo de [apps-script/Code.gs](apps-script/Code.gs)
3. **Autoriza as permissões**:
   - No editor, seleciona a função `setupFolders` no dropdown
   - Clica em ▶️ **Executar**
   - Clica em "Review permissions" → seleciona a tua conta → "Allow"
4. **Faz deploy como Web App**:
   - Clica em **Deploy → New deployment**
   - Tipo: **Web app**
   - **Execute as**: `Eu` (a tua conta Google)
   - **Who has access**: `Anyone`
   - Clica em **Deploy**
5. Copia o **URL do Web App** (ex: `https://script.google.com/macros/s/AKfycb.../exec`)

### 3. Proxy Vercel

No ficheiro [api/drive.js](api/drive.js), atualiza o URL do Apps Script:
```js
const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycb.../exec';
```

O frontend já usa `/api/drive` (relativo) definido em [js/config.js](js/config.js):
```js
const APPS_SCRIPT_URL = '/api/drive';
```

### 4. Setup Inicial (criar as 15 pastas)

Depois de deployar, abre no navegador:
```
https://desafios-casamento-roan.vercel.app/api/drive?action=setup
```

Isto cria uma subpasta para cada desafio dentro da pasta principal do Drive e retorna os links de cada uma.

## 🚀 Deploy

O site está publicado na Vercel: **https://desafios-casamento-roan.vercel.app**

- O repositório está ligado à Vercel (deploy automático a cada push para `main`)
- A pasta `api/` é reconhecida automaticamente pela Vercel como serverless functions
- Requer Node.js 24.x (definido em `package.json`)

## 📱 Como Usar

### Página Inicial
Mostra todos os 15 desafios com as respetivas barras de progresso e contadores de fotos.

### Página de Desafio
URL: `https://desafios-casamento-roan.vercel.app/#/challenge/{ID_DO_DESAFIO}`

Exemplo: `https://desafios-casamento-roan.vercel.app/#/challenge/noivos`

Funcionalidades:
- 📷 **Tirar Foto** — abre a câmera do telemóvel
- 🖼️ **Da Galeria** — escolhe uma foto existente
- A foto é comprimida (max 1280px, JPEG 80%) antes do envio
- Galeria de miniaturas atualizada automaticamente
- Clica numa miniatura para ver em tamanho grande (lightbox)
- No lightbox: botões ◀ ▶ para navegar, ✕ para fechar, swipe no mobile

## 📋 QR Codes

Os QR codes estão na pasta `Codigos/`. Cada um aponta para a página do respetivo desafio:
- `refrao.png` → `/#/challenge/refrao`
- `noivos.png` → `/#/challenge/noivos`
- etc.

Imprime e coloca um QR code em cada mesa.

## 🔍 Endpoints da API

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/drive?action=progress` | Retorna contagem de fotos por desafio |
| GET | `/api/drive?action=gallery&challengeId=ID` | Lista de fotos do desafio |
| GET | `/api/drive?action=setup` | Cria as 15 pastas no Drive |
| POST | `/api/drive` | Envia uma foto (body: `{challengeId, image}` em base64) |

## 🐛 Troubleshooting

### Erro CORS ao fazer fetch
**Causa**: O frontend está a chamar o Apps Script diretamente.
**Solução**: Garante que `APPS_SCRIPT_URL` em [js/config.js](js/config.js) é `/api/drive` e não o URL direto do Apps Script.

### Erro 403 (Forbidden) do Apps Script
**Causa**: O deploy não está como "Anyone" ou as permissões não foram autorizadas.
**Solução**:
1. No Apps Script, executa a função `setupFolders` manualmente e autoriza todas as permissões
2. Cria um **novo** deployment (não edites o antigo) com "Who has access: Anyone"
3. Copia o novo URL e atualiza [api/drive.js](api/drive.js)

### Fotos não aparecem na galeria
**Causa**: A foto não está partilhada publicamente.
**Solução**: O [Code.gs](apps-script/Code.gs) já define `ANYONE_WITH_LINK` no upload. Se ainda assim não aparecer, verifica manualmente as permissões da foto no Drive.

### Miniaturas não carregam
Usa o link direto do `lh3.googleusercontent.com`:
```
https://lh3.googleusercontent.com/d/{FILE_ID}=w400
```

## 📜 Licença

Projeto privado para uso no casamento.
