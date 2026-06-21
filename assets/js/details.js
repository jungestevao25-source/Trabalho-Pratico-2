let currentItemId = null;
let isCurrentFavorite = false;

async function fetchItem(id) {
  try {
    return await window.App.apiFetch(`/cursos/${id}`);
  } catch (error) {
    if (String(error.message || "").includes("404")) {
      return null;
    }
    throw error;
  }
}

async function fetchComments(itemId) {
  return window.App.apiFetch(`/comentarios?itemId=${itemId}`);
}

function renderMessage(title, message) {
  const container = document.querySelector("#detalhe-item");

  if (!container) {
    return;
  }

  container.innerHTML = `
    <section class="detalhe-bloco p-4 p-md-5 rounded-4 text-center">
      <span class="badge text-bg-warning mb-3">Detalhes</span>
      <h2 class="titulo-secao mb-3">${title}</h2>
      <p class="text-light-emphasis mb-4">${message}</p>
      <a class="btn btn-warning fw-semibold" href="index.html#catalogo">Voltar para a Home</a>
    </section>
  `;
}

function renderItem(item) {
  const container = document.querySelector("#detalhe-item");

  if (!container) {
    return;
  }

  const tags = (item.tags || [])
    .map((tag) => `<span class="tag-chip">${tag}</span>`)
    .join("");

  const favoritoIcone = isCurrentFavorite ? "&#10084;" : "&#9825;";

  container.innerHTML = `
    <section class="detalhe-bloco p-4 p-md-5 rounded-4 mb-4">
      <div class="row g-4 align-items-start">
        <div class="col-12 col-lg-5">
          <div class="detalhe-capa">
            <img src="${item.imagem}" alt="${item.titulo}">
          </div>
        </div>
        <div class="col-12 col-lg-7">
          <div class="d-flex justify-content-between align-items-start gap-2 mb-3">
            <span class="badge text-bg-warning">${item.categoria}</span>
            <button id="favorite-detail-button" class="btn btn-favorito ${isCurrentFavorite ? "favorito-ativo" : ""}" type="button" aria-label="Favoritar item">${favoritoIcone}</button>
          </div>
          <h2 class="display-6 fw-semibold mb-3">${item.titulo}</h2>
          <p class="lead text-light-emphasis">${item.descricaoCurta}</p>
          <p>${item.descricaoCompleta}</p>
          <ul class="meta-lista mt-4 mb-4">
            <li><span>Preco</span><span>${item.preco}</span></li>
            <li><span>Nivel</span><span>${item.nivel}</span></li>
            <li><span>Modalidade</span><span>${item.modalidade}</span></li>
            <li><span>Duracao</span><span>${item.duracao}</span></li>
            <li><span>Instrutor</span><span>${item.instrutor}</span></li>
          </ul>
          <div class="d-flex flex-wrap gap-2">
            ${tags}
          </div>
        </div>
      </div>
    </section>
  `;

  const button = document.querySelector("#favorite-detail-button");
  if (!button) {
    return;
  }

  button.addEventListener("click", async () => {
    const user = window.App.getCurrentUser();
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    try {
      isCurrentFavorite = await window.App.toggleFavorite(user.id, currentItemId);
      renderItem(item);
    } catch (error) {
      console.error(error);
      alert("Nao foi possivel atualizar favorito agora.");
    }
  });
}

function renderComments(comments) {
  const container = document.querySelector("#detalhe-item");
  if (!container) {
    return;
  }

  const bloco = document.createElement("section");
  bloco.className = "detalhe-bloco p-4 p-md-5 rounded-4";

  if (!comments.length) {
    bloco.innerHTML = `
      <h3 class="h5 mb-3">Comentarios dos alunos</h3>
      <p class="mensagem-vazia mb-0">Este item ainda nao possui comentarios cadastrados.</p>
    `;
    container.appendChild(bloco);
    return;
  }

  const htmlComentarios = comments
    .map(
      (comentario) => `
        <article class="comentario-item">
          <h4 class="h6 mb-1">${comentario.autor}</h4>
          <p class="mb-1 text-light-emphasis">${comentario.texto}</p>
          <small class="text-warning">Nota: ${comentario.nota}/5</small>
        </article>
      `
    )
    .join("");

  bloco.innerHTML = `
    <h3 class="h5 mb-3">Comentarios dos alunos</h3>
    <div class="d-flex flex-column gap-3">${htmlComentarios}</div>
  `;

  container.appendChild(bloco);
}

async function init() {
  window.App.bindAuthUI();
  const container = document.querySelector("#detalhe-item");

  if (!container) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));
  currentItemId = id;

  if (!id) {
    renderMessage("Item nao informado", "A URL precisa conter o parametro id para exibir os detalhes do item.");
    return;
  }

  try {
    const user = window.App.getCurrentUser();
    const [item, comentarios] = await Promise.all([fetchItem(id), fetchComments(id)]);

    if (!item) {
      renderMessage("Item nao encontrado", "O item solicitado nao existe na colecao principal do JSON Server.");
      return;
    }

    if (user) {
      const favoritos = await window.App.getFavoriteItemIds(user.id);
      isCurrentFavorite = favoritos.has(id);
    }

    renderItem(item);
    renderComments(comentarios);
  } catch (error) {
    console.error(error);
    renderMessage("Erro ao carregar o item", "Nao foi possivel buscar os dados no JSON Server agora.");
  }
}

document.addEventListener("DOMContentLoaded", init);