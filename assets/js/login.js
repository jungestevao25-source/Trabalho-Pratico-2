function showAuthAlert(message, type = "warning") {
  const container = document.querySelector("#auth-alert");
  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="alert alert-${type}" role="alert">${message}</div>
  `;
}

async function handleLogin(event) {
  event.preventDefault();

  const login = document.querySelector("#login-usuario")?.value.trim();
  const senha = document.querySelector("#login-senha")?.value;

  if (!login || !senha) {
    showAuthAlert("Informe login e senha para continuar.");
    return;
  }

  try {
    const users = await window.App.apiFetch(`/usuarios?login=${encodeURIComponent(login)}&senha=${encodeURIComponent(senha)}`);

    if (!users.length) {
      showAuthAlert("Credenciais invalidas.");
      return;
    }

    window.App.setCurrentUser(users[0]);
    window.location.href = "index.html";
  } catch (error) {
    console.error(error);
    showAuthAlert("Nao foi possivel realizar login agora.", "danger");
  }
}

async function handleRegister(event) {
  event.preventDefault();

  const nome = document.querySelector("#register-nome")?.value.trim();
  const email = document.querySelector("#register-email")?.value.trim();
  const login = document.querySelector("#register-usuario")?.value.trim();
  const senha = document.querySelector("#register-senha")?.value;

  if (!nome || !email || !login || !senha) {
    showAuthAlert("Preencha todos os campos do cadastro.");
    return;
  }

  try {
    const existing = await window.App.apiFetch(`/usuarios?login=${encodeURIComponent(login)}`);
    if (existing.length) {
      showAuthAlert("Este login ja esta em uso.");
      return;
    }

    const novoUsuario = await window.App.apiFetch("/usuarios", {
      method: "POST",
      body: JSON.stringify({
        nome,
        email,
        login,
        senha,
        admin: false
      })
    });

    window.App.setCurrentUser(novoUsuario);
    window.location.href = "index.html";
  } catch (error) {
    console.error(error);
    showAuthAlert("Nao foi possivel cadastrar agora.", "danger");
  }
}

function init() {
  window.App.bindAuthUI();

  const loginForm = document.querySelector("#login-form");
  const registerForm = document.querySelector("#register-form");

  loginForm?.addEventListener("submit", handleLogin);
  registerForm?.addEventListener("submit", handleRegister);
}

document.addEventListener("DOMContentLoaded", init);
