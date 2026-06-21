const API_URL = "http://localhost:3000";
const COLLECTION = "cursos";

async function fetchItem(id) {
  const response = await fetch(`${API_URL}/${COLLECTION}/${id}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar o item solicitado.");
  }

  return response.json();
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

  container.innerHTML = `
    <section class="detalhe-bloco p-4 p-md-5 rounded-4 mb-4">
      <div class="row g-4 align-items-start">
        <div class="col-12 col-lg-5">
          <div class="detalhe-capa">
            <img src="${item.imagem}" alt="${item.titulo}">
          </div>
        </div>
        <div class="col-12 col-lg-7">
          <span class="badge text-bg-warning mb-3">${item.categoria}</span>
          <h2 class="display-6 fw-semibold mb-3">${item.titulo}</h2>
          <p class="lead text-light-emphasis">${item.descricaoCurta}</p>
          <p>${item.descricaoCompleta}</p>
          <ul class="meta-lista mt-4 mb-4">
            <li><span>Preço</span><span>${item.preco}</span></li>
            <li><span>Nível</span><span>${item.nivel}</span></li>
            <li><span>Modalidade</span><span>${item.modalidade}</span></li>
            <li><span>Duração</span><span>${item.duracao}</span></li>
            <li><span>Instrutor</span><span>${item.instrutor}</span></li>
          </ul>
          <div class="d-flex flex-wrap gap-2">
            ${tags}
          </div>
        </div>
      </div>
    </section>
  `;
}

async function init() {
  const container = document.querySelector("#detalhe-item");

  if (!container) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    renderMessage("Item não informado", "A URL precisa conter o parâmetro id para exibir os detalhes do item.");
    return;
  }

  try {
    const item = await fetchItem(id);

    if (!item) {
      renderMessage("Item não encontrado", "O item solicitado não existe na coleção principal do JSON Server.");
      return;
    }

    renderItem(item);
  } catch (error) {
    console.error(error);
    renderMessage("Erro ao carregar o item", "Não foi possível buscar os dados no JSON Server agora.");
  }
}

document.addEventListener("DOMContentLoaded", init);