const API_URL = "http://localhost:3000";
const COLLECTION = "cursos";

const authorInfo = {
  nome: "Estevao Jung",
  curso: "Analise e Desenvolvimento de Sistemas",
  matricula: "1647177",
  projeto: "Preludio - Musicalizacao para Adultos",
  descricao: "Projeto individual com pagina inicial, detalhes por query string e consumo de dados via JSON Server."
};

async function fetchItems() {
  const response = await fetch(`${API_URL}/${COLLECTION}`);

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar os itens da API.");
  }

  return response.json();
}

function createCard(item) {
  const column = document.createElement("div");
  column.className = "col-12 col-md-6 col-xl-4";

  column.innerHTML = `
    <article class="card card-musicalizacao h-100">
      <a class="card-link-imagem" href="details.html?id=${item.id}">
        <img src="${item.imagem}" alt="${item.titulo}">
      </a>
      <div class="card-body d-flex flex-column">
        <span class="badge text-bg-warning align-self-start mb-3">${item.categoria}</span>
        <h3 class="h4 mb-2">
          <a class="link-warning link-offset-2 link-underline-opacity-0 link-underline-opacity-75-hover" href="details.html?id=${item.id}">
            ${item.titulo}
          </a>
        </h3>
        <p class="text-light-emphasis">${item.descricaoCurta}</p>
        <ul class="meta-lista mt-2 mb-3">
          <li><span>Preço</span><span>${item.preco}</span></li>
          <li><span>Nível</span><span>${item.nivel}</span></li>
        </ul>
        <div class="mt-auto d-flex gap-2 flex-wrap align-items-center">
          <a class="btn btn-warning fw-semibold" href="details.html?id=${item.id}">Ver detalhes</a>
          <span class="tag-info">${item.modalidade}</span>
        </div>
      </div>
    </article>
  `;

  return column;
}

function renderCards(items) {
  const list = document.querySelector("#lista-itens");

  if (!list) {
    return;
  }

  list.innerHTML = "";

  if (!items.length) {
    list.innerHTML = `
      <div class="col-12">
        <p class="mensagem-vazia">Nenhum item encontrado na coleção principal.</p>
      </div>
    `;
    return;
  }

  items.forEach((item) => {
    list.appendChild(createCard(item));
  });
}

function renderFeatured(items) {
  const container = document.querySelector("#carousel-destaques");

  if (!container) {
    return;
  }

  const featuredItems = items.filter((item) => item.destaque);

  if (!featuredItems.length) {
    container.innerHTML = '<p class="mensagem-vazia">Nenhum item marcado como destaque.</p>';
    return;
  }

  const indicators = featuredItems
    .map(
      (item, index) => `
        <button type="button" data-bs-target="#carousel-destaques" data-bs-slide-to="${index}" class="${index === 0 ? "active" : ""}" ${index === 0 ? 'aria-current="true"' : ""} aria-label="Slide ${index + 1}: ${item.titulo}"></button>
      `
    )
    .join("");

  const slides = featuredItems
    .map(
      (item, index) => `
        <div class="carousel-item ${index === 0 ? "active" : ""}">
          <article class="destaque-item p-3 p-md-4">
            <div class="row g-4 align-items-center">
              <div class="col-12 col-lg-5">
                <img src="${item.imagem}" class="img-fluid destaque-imagem" alt="${item.titulo}">
              </div>
              <div class="col-12 col-lg-7">
                <span class="badge text-bg-warning mb-3">${item.categoria}</span>
                <h3 class="h2 mb-3">${item.titulo}</h3>
                <p class="mb-3 text-light-emphasis">${item.descricaoCurta}</p>
                <p class="mb-4">${item.preco} | ${item.modalidade}</p>
                <a class="btn btn-warning fw-semibold" href="details.html?id=${item.id}">Ver detalhes deste item</a>
              </div>
            </div>
          </article>
        </div>
      `
    )
    .join("");

  container.innerHTML = `
    <div class="carousel-indicators">${indicators}</div>
    <div class="carousel-inner rounded-4 overflow-hidden">${slides}</div>
    <button class="carousel-control-prev" type="button" data-bs-target="#carousel-destaques" data-bs-slide="prev" aria-label="Slide anterior">
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
    </button>
    <button class="carousel-control-next" type="button" data-bs-target="#carousel-destaques" data-bs-slide="next" aria-label="Próximo slide">
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
    </button>
  `;
}

function renderAuthor() {
  const container = document.querySelector("#sobre-autor");

  if (!container) {
    return;
  }

  container.innerHTML = `
    <article class="detalhe-bloco p-4 p-md-5 rounded-4">
      <h3 class="h4 mb-3">${authorInfo.nome}</h3>
      <p class="mb-2"><strong>Curso:</strong> ${authorInfo.curso}</p>
      <p class="mb-2"><strong>Matrícula:</strong> ${authorInfo.matricula}</p>
      <p class="mb-2"><strong>Projeto:</strong> ${authorInfo.projeto}</p>
      <p class="mb-0 text-light-emphasis">${authorInfo.descricao}</p>
    </article>
  `;
}

async function init() {
  const featuredContainer = document.querySelector("#carousel-destaques");
  const listContainer = document.querySelector("#lista-itens");

  if (!featuredContainer && !listContainer) {
    return;
  }

  try {
    const items = await fetchItems();
    renderFeatured(items);
    renderCards(items);
    renderAuthor();
  } catch (error) {
    console.error(error);

    if (featuredContainer) {
      featuredContainer.innerHTML = '<p class="mensagem-vazia">Erro ao carregar os destaques da API.</p>';
    }

    if (listContainer) {
      listContainer.innerHTML = '<div class="col-12"><p class="mensagem-vazia">Erro ao carregar a lista de itens.</p></div>';
    }
  }
}

document.addEventListener("DOMContentLoaded", init);