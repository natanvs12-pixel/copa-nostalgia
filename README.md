# 🏆 BOLÃO BR · Copa do Mundo 2026

App de bolão estilo Cartola, com **login e senha**, sincronização em tempo real entre amigos, tabelinha nostálgica pra preencher placar, chave de mata-mata e área de zoeira. Funciona offline (PWA) e instala como app no celular.

---

## 🚀 Passo a Passo Completo

Você vai precisar de **3 contas gratuitas** (10 minutos pra criar todas):

| Conta        | Pra quê                     | Custo |
| ------------ | --------------------------- | ----- |
| **GitHub**   | Hospedar o código           | grátis |
| **Vercel**   | Publicar o site (URL real)  | grátis |
| **Firebase** | Login, banco, tempo real    | grátis (até ~50k usuários) |

---

## 📦 PASSO 1 — Subir o código pro GitHub

1. Crie conta em <https://github.com/signup> se ainda não tem.
2. Clique no `+` no canto superior direito → **New repository**.
3. Nome: `bolao-br` (ou o que quiser). Marque **Public**. Clique **Create**.
4. Na próxima tela, clique em **uploading an existing file**.
5. **Arraste TODOS os arquivos** desta pasta (o ZIP descompactado) pra dentro.
6. Escreva uma mensagem ("primeira versão") e clique em **Commit changes**.

Pronto. Seu código está no GitHub.

---

## 🌐 PASSO 2 — Publicar no Vercel

1. Vá em <https://vercel.com/signup> e clique em **Continue with GitHub**.
2. Autorize a Vercel a acessar seus repositórios.
3. No painel da Vercel, clique em **Add New… → Project**.
4. Encontre `bolao-br` na lista e clique **Import**.
5. Não mude nada nas configurações — só clique em **Deploy**.
6. Aguarde uns 30 segundos.

**Pronto!** Vai aparecer uma URL tipo `https://bolao-br.vercel.app`. Esse é o seu app online. Já dá pra abrir no celular e usar — só que ainda em modo offline (sem login multi-usuário).

> 💡 Toda vez que você editar um arquivo no GitHub, a Vercel publica a nova versão sozinha. Mágico.

---

## 🔥 PASSO 3 — Ativar o Firebase (login + sync)

### 3.1 — Criar o projeto

1. Vá em <https://console.firebase.google.com/>
2. Clique em **Adicionar projeto** (use sua conta Google).
3. Nome: `bolao-br` (ou qualquer um).
4. Pode desativar o Google Analytics (não precisa).
5. Clique em **Criar projeto** → aguarde → **Continuar**.

### 3.2 — Adicionar o app Web

1. Dentro do projeto, clique no ícone **`</>`** (Adicionar app → Web).
2. Apelido do app: `bolao-br-web` → clique **Registrar app**.
3. Vai aparecer um bloco de código tipo:

```js
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXX...",
  authDomain: "bolao-br.firebaseapp.com",
  projectId: "bolao-br",
  storageBucket: "bolao-br.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abc123"
};
```

4. **Copie esses valores!**
5. Abra o arquivo `firebase-config.js` (no GitHub, clique no arquivo → ✏️ editar) e substitua os valores `COLE_AQUI_SUA_API_KEY` etc. pelos seus.
6. Clique em **Commit changes**. A Vercel republica sozinha.

### 3.3 — Ativar Login por Email/Senha

1. No menu lateral do Firebase: **Compilação → Authentication**.
2. Clique em **Começar**.
3. Aba **Sign-in method** → clique em **E-mail/senha** → ative o primeiro toggle → **Salvar**.

### 3.4 — Ativar Firestore (banco de dados)

1. No menu lateral: **Compilação → Firestore Database**.
2. Clique em **Criar banco de dados**.
3. Escolha **Modo de produção** → **Próxima**.
4. Local: `southamerica-east1` (São Paulo) → **Ativar**.
5. Aguarde uns segundos. Quando abrir, clique na aba **Regras**.
6. **Apague o conteúdo todo** e cole o conteúdo do arquivo `firestore.rules` (deste projeto).
7. Clique em **Publicar**.

### 3.5 — Autorizar seu domínio Vercel

1. Volte em **Authentication → Configurações → Domínios autorizados**.
2. Clique em **Adicionar domínio** → cole seu domínio Vercel (`bolao-br.vercel.app`) → **Adicionar**.

---

## ✅ Pronto! Testando

1. Abra a URL do seu app (`https://bolao-br.vercel.app`).
2. Vai aparecer a **tela de login**.
3. Clique em **Criar conta**, preencha apelido + e-mail + senha (mín. 6 caracteres) → **CRIAR CONTA**.
4. Você entra no app. Vai pra **Grupos → + NOVO**, cria um grupo. O app gera um código tipo `BR-K7M3Q`.
5. Compartilhe o código pelo WhatsApp.
6. Seu amigo abre a URL no celular dele → **Criar conta** → vai em **Grupos → 🔗 ENTRAR** → digita o código → cai no mesmo grupo.
7. Cada um palpita no próprio celular. O ranking aparece em tempo real pra todo mundo.

---

## 📱 Instalar como app no celular

Depois de aberto no navegador:

- **iPhone (Safari):** botão **Compartilhar** → **Adicionar à Tela de Início**.
- **Android (Chrome):** menu **⋮** → **Instalar app** ou **Adicionar à tela inicial**.

Vai virar um ícone na tela inicial, com splash screen, sem barra de navegador.

---

## 📁 Estrutura dos arquivos

```
bolao-br/
├── index.html              ← app principal (HTML + JS + CSS)
├── firebase-config.js      ← suas credenciais do Firebase ⚠️
├── firebase-sync.js        ← lógica de sync com Firebase
├── auth-ui.js              ← tela de login/cadastro
├── manifest.json           ← config do PWA (ícone, nome)
├── service-worker.js       ← cache offline
├── icon.svg                ← ícone do app
├── vercel.json             ← config da Vercel
├── firestore.rules         ← regras de segurança do banco
├── package.json
├── .gitignore
└── README.md
```

---

## 🎮 Como o app funciona

- **🏟️ Início:** próximo jogo do Brasil com countdown, jogos ao vivo, ranking mini, CTA do bolão de longo prazo.
- **🎯 Bolão:** todos os 104 jogos da Copa 2026, palpite com placar exato (10 pts), só vencedor (5 pts), etc. Bolão de longo prazo: campeão, vice, artilheiro, surpresa.
- **📋 Tabela:** a tabelinha nostálgica de revista, preenche placar de cada jogo, a classificação dos 12 grupos se atualiza sozinha, e a chave de mata-mata vai mostrando quem avança.
- **👥 Grupos:** cria grupo, gera código pra compartilhar no WhatsApp, ranking entre amigos em tempo real.
- **😂 Zoeira:** figurinhas, frases automáticas, cards de zoeira.
- **⭐ Perfil:** estatísticas, títulos engraçados, histórico.

---

## 💸 Custos

- **Vercel:** grátis pra sempre (plano Hobby cobre tranquilo).
- **Firebase:** plano **Spark (grátis)** cobre:
  - 50.000 leituras de dados/dia
  - 20.000 escritas/dia
  - 1 GB armazenado
  - Auth ilimitado

Pra um bolão de até uns 500 amigos jogando ativo, fica de graça. Acima disso, o plano **Blaze** (pague o que usar) custa centavos por mês.

---

## ❓ Problemas comuns

**"O app abre mas não tem tela de login"**
→ Verifique se o `firebase-config.js` tem suas credenciais reais (não os placeholders).

**"Criar conta dá erro auth/configuration-not-found"**
→ Você esqueceu de ativar **E-mail/senha** no Firebase Authentication. Volte no passo 3.3.

**"Permission denied" ao criar grupo**
→ As regras do Firestore não foram publicadas. Volte no passo 3.4.6.

**"Domain not allowed"**
→ Adicione seu domínio Vercel em Authentication → Domínios autorizados (3.5).

**Esqueci de subir um arquivo**
→ No GitHub: **Add file → Upload files** → arrasta de novo → Commit.

---

## 🚧 Próximos passos (extras)

Coisas que você pode adicionar depois:

1. **Atualizar placares automáticos** via Cloud Function consumindo API esportiva (api-football.com, sportradar). Hoje o usuário preenche manual na aba Tabela.
2. **Notificações push** quando alguém te ultrapassa no ranking (Firebase Cloud Messaging).
3. **Login com Google** (um clique, em vez de email/senha — já vem pronto no Auth).
4. **Sistema de premiação** (resgatar pontos por brindes, se quiser monetizar).

---

Feito com ⚽ e 🍻 — boa Copa pra você e a galera!
