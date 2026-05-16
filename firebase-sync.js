/* ============================================================
   BOLÃO BR — Camada de sincronização via Firebase
   ============================================================
   Este arquivo SOBRESCREVE o stub CloudSync do index.html
   quando window.FIREBASE_CONFIG está configurado.
   Carrega o Firebase SDK via CDN (compat).
   ============================================================ */

(function () {
  if (!window.FIREBASE_CONFIG) {
    // Modo offline: deixa o CloudSync original (no-op) ativo.
    return;
  }

  // Carrega o SDK do Firebase via CDN — versão "compat" (mais fácil pra script global)
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function bootFirebase() {
    const base = "https://www.gstatic.com/firebasejs/10.13.2/";
    await loadScript(base + "firebase-app-compat.js");
    await loadScript(base + "firebase-auth-compat.js");
    await loadScript(base + "firebase-firestore-compat.js");

    firebase.initializeApp(window.FIREBASE_CONFIG);
    const auth = firebase.auth();
    const db = firebase.firestore();

    // Persistência local pra funcionar offline depois de logar
    try {
      await db.enablePersistence({ synchronizeTabs: true });
    } catch (e) {
      console.warn("Persistência offline não disponível:", e.code);
    }

    window._firebaseReady = true;
    window._firebaseAuth = auth;
    window._firebaseDb = db;

    // Implementa CloudSync de verdade
    window.CloudSync = {
      isOnline() {
        return !!auth.currentUser;
      },

      getUid() {
        return auth.currentUser ? auth.currentUser.uid : null;
      },

      getUserEmail() {
        return auth.currentUser ? auth.currentUser.email : null;
      },

      /* ===== AUTH ===== */
      async signUp(email, password, displayName) {
        const cred = await auth.createUserWithEmailAndPassword(email, password);
        if (displayName) {
          await cred.user.updateProfile({ displayName });
        }
        // Cria documento /users/{uid}
        await db.collection("users").doc(cred.user.uid).set({
          email,
          displayName: displayName || email.split("@")[0],
          avatar: "🇧🇷",
          team: "BRA",
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        return cred.user;
      },

      async signIn(email, password) {
        const cred = await auth.signInWithEmailAndPassword(email, password);
        return cred.user;
      },

      async signOut() {
        await auth.signOut();
        // Limpa estado local sensível
        localStorage.removeItem("bolao_br_state_v1");
        location.reload();
      },

      async sendPasswordReset(email) {
        await auth.sendPasswordResetEmail(email);
      },

      onAuthChange(callback) {
        return auth.onAuthStateChanged(callback);
      },

      /* ===== GRUPOS ===== */
      async createGroup(group) {
        const uid = this.getUid();
        if (!uid) throw new Error("Usuário não autenticado");
        const ref = db.collection("groups").doc(group.id);
        await ref.set({
          id: group.id,
          name: group.name,
          emoji: group.emoji,
          color: group.color,
          code: group.code,
          creator: uid,
          members: [uid],
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        return group;
      },

      async findGroupByCode(code) {
        const snap = await db
          .collection("groups")
          .where("code", "==", code.toUpperCase())
          .limit(1)
          .get();
        if (snap.empty) return null;
        const d = snap.docs[0];
        return { id: d.id, ...d.data() };
      },

      async joinGroup(groupId) {
        const uid = this.getUid();
        if (!uid) throw new Error("Usuário não autenticado");
        await db
          .collection("groups")
          .doc(groupId)
          .update({
            members: firebase.firestore.FieldValue.arrayUnion(uid),
          });
        return true;
      },

      async leaveGroup(groupId) {
        const uid = this.getUid();
        if (!uid) return;
        await db
          .collection("groups")
          .doc(groupId)
          .update({
            members: firebase.firestore.FieldValue.arrayRemove(uid),
          });
      },

      /* Lista todos os grupos do usuário (em tempo real) */
      subscribeMyGroups(callback) {
        const uid = this.getUid();
        if (!uid) return () => {};
        return db
          .collection("groups")
          .where("members", "array-contains", uid)
          .onSnapshot((snap) => {
            const groups = [];
            snap.forEach((d) => groups.push({ id: d.id, ...d.data() }));
            callback(groups);
          });
      },

      /* ===== PALPITES ===== */
      async publishPrediction(matchId, prediction) {
        const uid = this.getUid();
        if (!uid) return;
        await db
          .collection("predictions")
          .doc(uid)
          .collection("matches")
          .doc(matchId)
          .set({
            ...prediction,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          });
      },

      async loadMyPredictions() {
        const uid = this.getUid();
        if (!uid) return {};
        const snap = await db
          .collection("predictions")
          .doc(uid)
          .collection("matches")
          .get();
        const out = {};
        snap.forEach((d) => (out[d.id] = d.data()));
        return out;
      },

      /* Ranking de um grupo: busca palpites de todos os membros em tempo real */
      subscribeGroupPredictions(groupId, callback) {
        const groupRef = db.collection("groups").doc(groupId);
        return groupRef.onSnapshot(async (snap) => {
          if (!snap.exists) return;
          const data = snap.data();
          const members = data.members || [];
          // Para cada membro, busca palpites e usuário
          const results = await Promise.all(
            members.map(async (uid) => {
              const userDoc = await db.collection("users").doc(uid).get();
              const predSnap = await db
                .collection("predictions")
                .doc(uid)
                .collection("matches")
                .get();
              const preds = {};
              predSnap.forEach((d) => (preds[d.id] = d.data()));
              return {
                uid,
                user: userDoc.exists ? userDoc.data() : { displayName: "Anônimo" },
                predictions: preds,
              };
            })
          );
          callback(results);
        });
      },

      /* ===== PLACARES OFICIAIS =====
         Em produção, uma Cloud Function alimenta /scores com placares reais
         vindos de uma API esportiva (api-football, sportradar, etc.).
         No MVP, isso fica aguardando ser populado. */
      subscribeOfficialScores(callback) {
        return db.collection("scores").onSnapshot((snap) => {
          const map = {};
          snap.forEach((d) => (map[d.id] = d.data()));
          callback(map);
        });
      },

      /* ===== PERFIL ===== */
      async updateProfile(updates) {
        const uid = this.getUid();
        if (!uid) return;
        await db.collection("users").doc(uid).update(updates);
      },
    };

    // Dispara evento pra app saber que pode prosseguir
    document.dispatchEvent(new CustomEvent("firebaseReady"));
    console.info("✅ Firebase ativo. Sincronização em tempo real habilitada.");
  }

  bootFirebase().catch((err) => {
    console.error("Erro inicializando Firebase:", err);
    alert(
      "Erro ao carregar Firebase. Verifique sua firebase-config.js. " +
        "O app vai rodar em modo offline.\n\n" +
        err.message
    );
  });
})();
