/* ============================================================
   FIREBASE — CONFIGURAÇÃO DO PROJETO
   ============================================================
   COMO PREENCHER:
   1. Vá em https://console.firebase.google.com/
   2. Crie um projeto novo (use "bolao-br" como nome, ou o que quiser)
   3. Dentro do projeto, clique no ícone "</>" (Web) pra "Adicionar app"
   4. Dê um apelido (ex: bolao-br-web), clique em "Registrar app"
   5. O Firebase vai te mostrar um objeto firebaseConfig — copie os
      valores correspondentes pra cá embaixo.
   6. Não esqueça de também ATIVAR:
      - Authentication → Sign-in method → "E-mail/senha"
      - Firestore Database → Criar banco (modo de produção)
        + colar as regras do arquivo firestore.rules
   ============================================================ */

window.FIREBASE_CONFIG = {
  apiKey: "COLE_AQUI_SUA_API_KEY",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:abcdef1234567890",
};

/* Deixe assim (config inválida/vazia) se quiser rodar em MODO OFFLINE
   (só localStorage, sem login). O app detecta automaticamente. */

// Marca config como inválida se ainda tem o placeholder
if (window.FIREBASE_CONFIG.apiKey === "COLE_AQUI_SUA_API_KEY") {
  window.FIREBASE_CONFIG = null;
  console.info("🔌 Firebase não configurado → rodando em modo offline (localStorage).");
}
