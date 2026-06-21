const API_URL = "http://localhost:3000";

function getCurrentUser() {
  try {
    const userData = sessionStorage.getItem("usuarioCorrente");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Falha ao ler usuario da sessao:", error);
    return null;
  }
}

function setCurrentUser(user) {
  sessionStorage.setItem("usuarioCorrente", JSON.stringify(user));
}

function clearCurrentUser() {
  sessionStorage.removeItem("usuarioCorrente");
}

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`Erro na API: ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function bindAuthUI() {
  const user = getCurrentUser();
  const adminItem = document.querySelector("#nav-admin-item");
  const favoritosItem = document.querySelector("#nav-favoritos-item");
  const authAction = document.querySelector("#auth-action-link");
  const greeting = document.querySelector("#user-greeting");

  if (adminItem) {
    adminItem.classList.toggle("d-none", !(user && user.admin));
  }

  if (favoritosItem) {
    favoritosItem.classList.toggle("d-none", !user);
  }

  if (greeting) {
    greeting.textContent = user ? `Ola, ${user.nome}` : "Voce ainda nao fez login.";
  }

  if (!authAction) {
    return;
  }

  if (user) {
    authAction.textContent = "Logout";
    authAction.href = "#";
    authAction.onclick = (event) => {
      event.preventDefault();
      clearCurrentUser();
      window.location.href = "index.html";
    };
  } else {
    authAction.textContent = "Login";
    authAction.href = "login.html";
    authAction.onclick = null;
  }
}

function requireLoggedUser() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
    return null;
  }
  return user;
}

function requireAdmin() {
  const user = requireLoggedUser();
  if (!user) {
    return null;
  }

  if (!user.admin) {
    alert("Apenas usuarios administradores podem acessar esta area.");
    window.location.href = "index.html";
    return null;
  }

  return user;
}

async function getFavoriteByItemId(usuarioId, itemId) {
  const favoritos = await apiFetch(`/favoritos?usuarioId=${usuarioId}&itemId=${itemId}`);
  return favoritos[0] || null;
}

async function getFavoriteItemIds(usuarioId) {
  const favoritos = await apiFetch(`/favoritos?usuarioId=${usuarioId}`);
  return new Set(favoritos.map((fav) => Number(fav.itemId)));
}

async function toggleFavorite(usuarioId, itemId) {
  const existente = await getFavoriteByItemId(usuarioId, itemId);

  if (existente) {
    await apiFetch(`/favoritos/${existente.id}`, { method: "DELETE" });
    return false;
  }

  await apiFetch("/favoritos", {
    method: "POST",
    body: JSON.stringify({
      usuarioId,
      itemId: Number(itemId)
    })
  });

  return true;
}

window.App = {
  API_URL,
  apiFetch,
  bindAuthUI,
  clearCurrentUser,
  getCurrentUser,
  getFavoriteItemIds,
  requireAdmin,
  requireLoggedUser,
  setCurrentUser,
  toggleFavorite
};
