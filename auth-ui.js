/* ============================================================
   BOLÃO BR — Tela de Login / Cadastro
   ============================================================
   Aparece como overlay quando o Firebase está configurado mas
   o usuário ainda não fez login.
   Permite criar conta, entrar, recuperar senha e também
   "continuar offline" (modo demo).
   ============================================================ */

(function () {
  // Se Firebase não configurado, não mostra tela de login (modo offline)
  if (!window.FIREBASE_CONFIG) return;

  function buildOverlay() {
    const div = document.createElement("div");
    div.id = "auth-overlay";
    div.innerHTML = `
      <style>
        #auth-overlay {
          position: fixed; inset: 0; z-index: 300;
          background: radial-gradient(800px 600px at 50% 30%, #1a2747 0%, #050811 70%);
          display: flex; align-items: center; justify-content: center;
          padding: 24px; overflow-y: auto;
        }
        #auth-overlay .auth-card {
          width: 100%; max-width: 380px;
          background: linear-gradient(180deg, #0d1322, #070b16);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px; padding: 28px 24px;
          box-shadow: 0 30px 80px rgba(0,0,0,0.5);
        }
        #auth-overlay .auth-logo {
          font-family: 'Anton', Impact, sans-serif;
          letter-spacing: .04em;
          font-size: 36px;
          text-align: center; line-height: 1; margin-bottom: 6px;
        }
        #auth-overlay .auth-sub {
          font-family: 'Manrope', sans-serif;
          color: #7a8499; text-align: center; font-size: 12px;
          letter-spacing: .12em; margin-bottom: 20px;
        }
        #auth-overlay .auth-tabs {
          display: grid; grid-template-columns: 1fr 1fr;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 4px;
          margin-bottom: 18px;
        }
        #auth-overlay .auth-tab {
          padding: 8px 12px; border-radius: 8px;
          font-size: 12px; font-weight: 800; color: #7a8499;
          text-transform: uppercase; letter-spacing: .08em;
          cursor: pointer; border: none; background: transparent;
          transition: all .2s;
        }
        #auth-overlay .auth-tab.active {
          background: #00ffa3; color: #04140c;
        }
        #auth-overlay .auth-field {
          margin-bottom: 12px;
        }
        #auth-overlay .auth-field label {
          display: block; font-size: 10px; letter-spacing: .14em;
          color: #7a8499; font-weight: 700; margin-bottom: 4px;
          text-transform: uppercase;
        }
        #auth-overlay .auth-field input {
          width: 100%; padding: 12px 14px;
          background: #161f33; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; color: #e9ecf2;
          font-family: 'Manrope', sans-serif; font-size: 14px;
          outline: none; transition: border-color .2s;
        }
        #auth-overlay .auth-field input:focus {
          border-color: #00ffa3;
        }
        #auth-overlay .auth-btn-primary {
          width: 100%; padding: 14px;
          background: linear-gradient(180deg, #00ffa3 0%, #00c982 100%);
          color: #04140c; border: none; border-radius: 14px;
          font-family: 'Anton', Impact, sans-serif;
          font-size: 15px; letter-spacing: .12em;
          cursor: pointer; box-shadow: 0 8px 24px rgba(0,255,163,.25);
          margin-top: 6px;
        }
        #auth-overlay .auth-btn-primary:active { transform: scale(.98); }
        #auth-overlay .auth-btn-primary:disabled {
          opacity: .5; cursor: not-allowed;
        }
        #auth-overlay .auth-link {
          display: block; text-align: center; margin-top: 14px;
          font-size: 12px; color: #00e5ff; text-decoration: none;
          font-weight: 600; cursor: pointer; background: none; border: none;
        }
        #auth-overlay .auth-divider {
          height: 1px; background: rgba(255,255,255,0.08);
          margin: 20px 0 14px;
        }
        #auth-overlay .auth-offline {
          width: 100%; padding: 10px;
          background: transparent; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; color: #7a8499;
          font-family: 'Manrope', sans-serif; font-size: 12px;
          cursor: pointer;
        }
        #auth-overlay .auth-error {
          background: rgba(255,45,135,0.1);
          border: 1px solid rgba(255,45,135,0.4);
          color: #ff2d87;
          padding: 10px 12px; border-radius: 10px;
          font-size: 12px; margin-bottom: 14px;
          display: none;
        }
        #auth-overlay .auth-error.show { display: block; }
        #auth-overlay .auth-spinner {
          display: inline-block; width: 14px; height: 14px;
          border: 2px solid rgba(0,0,0,0.2); border-top-color: #04140c;
          border-radius: 50%; animation: authspin .8s linear infinite;
          vertical-align: middle; margin-right: 6px;
        }
        @keyframes authspin { to { transform: rotate(360deg); } }
        #auth-overlay .auth-flag-row {
          text-align: center; font-size: 28px; margin-bottom: 4px;
        }
      </style>

      <div class="auth-card">
        <div class="auth-flag-row">🇧🇷⚽🏆</div>
        <div class="auth-logo">
          <span style="color:#00ffa3">BOLÃO</span> <span style="color:#ffd60a">BR</span>
        </div>
        <div class="auth-sub">COPA 2026 · ENTRE PARA PALPITAR</div>

        <div class="auth-tabs">
          <button class="auth-tab active" data-tab="login">Entrar</button>
          <button class="auth-tab" data-tab="signup">Criar conta</button>
        </div>

        <div class="auth-error" id="auth-error"></div>

        <!-- LOGIN -->
        <form id="auth-login-form">
          <div class="auth-field">
            <label>E-mail</label>
            <input type="email" id="login-email" placeholder="seu@email.com" required autocomplete="email" />
          </div>
          <div class="auth-field">
            <label>Senha</label>
            <input type="password" id="login-password" placeholder="••••••••" required autocomplete="current-password" />
          </div>
          <button type="submit" class="auth-btn-primary" id="login-btn">ENTRAR</button>
          <button type="button" class="auth-link" id="forgot-link">Esqueci minha senha</button>
        </form>

        <!-- SIGNUP -->
        <form id="auth-signup-form" style="display:none">
          <div class="auth-field">
            <label>Apelido</label>
            <input type="text" id="signup-name" placeholder="Ex: Tio Beto" required maxlength="22" autocomplete="nickname" />
          </div>
          <div class="auth-field">
            <label>E-mail</label>
            <input type="email" id="signup-email" placeholder="seu@email.com" required autocomplete="email" />
          </div>
          <div class="auth-field">
            <label>Senha (mín. 6 caracteres)</label>
            <input type="password" id="signup-password" placeholder="••••••••" required minlength="6" autocomplete="new-password" />
          </div>
          <button type="submit" class="auth-btn-primary" id="signup-btn">CRIAR CONTA</button>
        </form>

        <div class="auth-divider"></div>
        <button class="auth-offline" id="offline-btn">Continuar sem login (modo offline)</button>
      </div>
    `;
    document.body.appendChild(div);
    return div;
  }

  function showError(msg) {
    const el = document.getElementById("auth-error");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 6000);
  }

  function translateAuthError(code) {
    const map = {
      "auth/invalid-email": "E-mail inválido.",
      "auth/user-disabled": "Usuário desabilitado.",
      "auth/user-not-found": "E-mail não cadastrado. Crie uma conta.",
      "auth/wrong-password": "Senha incorreta.",
      "auth/invalid-credential": "E-mail ou senha incorretos.",
      "auth/email-already-in-use": "Este e-mail já tem conta. Faça login.",
      "auth/weak-password": "Senha muito fraca. Use pelo menos 6 caracteres.",
      "auth/too-many-requests": "Muitas tentativas. Tente novamente em alguns minutos.",
      "auth/network-request-failed": "Sem internet. Verifique sua conexão.",
    };
    return map[code] || "Erro: " + code;
  }

  function setLoading(btnId, loading, originalText) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    if (loading) {
      btn.disabled = true;
      btn.innerHTML = '<span class="auth-spinner"></span>AGUARDE...';
    } else {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  }

  function wireUp(overlay) {
    // Tabs
    overlay.querySelectorAll(".auth-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        overlay.querySelectorAll(".auth-tab").forEach((t) =>
          t.classList.toggle("active", t === tab)
        );
        const isLogin = tab.dataset.tab === "login";
        overlay.querySelector("#auth-login-form").style.display = isLogin
          ? "block"
          : "none";
        overlay.querySelector("#auth-signup-form").style.display = isLogin
          ? "none"
          : "block";
      });
    });

    // Login
    overlay.querySelector("#auth-login-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value;
      setLoading("login-btn", true);
      try {
        await window.CloudSync.signIn(email, password);
        // onAuthChange vai detectar e fechar a tela
      } catch (err) {
        showError(translateAuthError(err.code));
        setLoading("login-btn", false, "ENTRAR");
      }
    });

    // Signup
    overlay.querySelector("#auth-signup-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("signup-name").value.trim();
      const email = document.getElementById("signup-email").value.trim();
      const password = document.getElementById("signup-password").value;
      setLoading("signup-btn", true);
      try {
        await window.CloudSync.signUp(email, password, name);
      } catch (err) {
        showError(translateAuthError(err.code));
        setLoading("signup-btn", false, "CRIAR CONTA");
      }
    });

    // Reset password
    overlay.querySelector("#forgot-link").addEventListener("click", async () => {
      const email = document.getElementById("login-email").value.trim();
      if (!email) {
        showError("Digite seu e-mail no campo acima primeiro.");
        return;
      }
      try {
        await window.CloudSync.sendPasswordReset(email);
        showError("✅ E-mail de recuperação enviado para " + email);
      } catch (err) {
        showError(translateAuthError(err.code));
      }
    });

    // Offline mode
    overlay.querySelector("#offline-btn").addEventListener("click", () => {
      // Marca como modo offline e deixa o app carregar
      window._offlineMode = true;
      overlay.remove();
      if (window._appBoot) window._appBoot();
    });
  }

  function closeOverlay() {
    const ov = document.getElementById("auth-overlay");
    if (ov) ov.remove();
  }

  // Espera Firebase carregar e mostra a tela
  document.addEventListener("firebaseReady", () => {
    const overlay = buildOverlay();
    wireUp(overlay);

    // Monitora estado de login
    window.CloudSync.onAuthChange((user) => {
      if (user) {
        // Logou! Fecha overlay e dispara boot do app.
        closeOverlay();
        if (window._appBoot) window._appBoot();
      }
    });
  });
})();
