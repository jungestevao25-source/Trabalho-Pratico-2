const authorInfo = {
  nome: "Estevao Jung",
  curso: "Engenharia de Software - PUC Minas",
  matricula: "1647177",
  turma: "Manha",
  projeto: "Preludio - Musicalizacao para Adultos",
  descricao: "Projeto individual com home dinamica, detalhes, login, favoritos e CRUD administrativo via JSON Server.",
  github: "https://github.com/",
  linkedin: "https://www.linkedin.com/"
};

let allItems = [];
let favoriteIds = new Set();
let categoriasChart = null;

function getSearchTerm() {
  const input = document.querySelector("#search-input");
  return (input?.value || "").trim().toLowerCase();
}

function filterItems(items, term) {
  if (!term) {
    return items;
  }

  return items.filter((item) => {
    const titulo = (item.titulo || "").toLowerCase();
    const descricaoCurta = (item.descricaoCurta || "").toLowerCase();
    const descricaoCompleta = (item.descricaoCompleta || "").toLowerCase();
    return (
      titulo.includes(term) ||
      descricaoCurta.includes(term) ||
      descricaoCompleta.includes(term)
    );
  });
}

function createFavoriteButton(itemId, isFavorite) {
  const user = window.App.getCurrentUser();
  const button = document.createElement("button");
  button.type = "button";
  button.className = `btn btn-favorito ${isFavorite ? "favorito-ativo" : ""}`;
  button.innerHTML = isFavorite ? "&#10084;" : "&#9825;";
  button.title = isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos";
  button.setAttribute("aria-label", button.title);

  button.addEventListener("click", async (event) => {
    event.preventDefault();

    if (!user) {
      window.location.href = "login.html";
      return;
    }

    try {
      const novoEstado = await window.App.toggleFavorite(user.id, itemId);
      if (novoEstado) {
        favoriteIds.add(Number(itemId));
      } else {
        favoriteIds.delete(Number(itemId));
      }
      renderFilteredCards();
    } catch (error) {
      console.error(error);
      alert("Nao foi possivel atualizar favorito agora.");
    }
  });

  return button;
}

function createCard(item) {
  const isFavorite = favoriteIds.has(Number(item.id));
  const column = document.createElement("div");
  column.className = "col-12 col-md-6 col-xl-4";

  column.innerHTML = `
    <article class="card card-musicalizacao h-100">
      <a class="card-link-imagem" href="details.html?id=${item.id}">
        <img src="${item.imagem}" alt="${item.titulo}">
      </a>
      <div class="card-body d-flex flex-column">
        <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
          <span class="badge text-bg-warning">${item.categoria}</span>
          <div class="favorito-container"></div>
        </div>
        <h3 class="h4 mb-2">
          <a class="link-warning link-offset-2 link-underline-opacity-0 link-underline-opacity-75-hover" href="details.html?id=${item.id}">
            ${item.titulo}
          </a>
        </h3>
        <p class="text-light-emphasis">${item.descricaoCurta}</p>
        <ul class="meta-lista mt-2 mb-3">
          <li><span>Preco</span><span>${item.preco}</span></li>
          <li><span>Nivel</span><span>${item.nivel}</span></li>
        </ul>
        <div class="mt-auto d-flex gap-2 flex-wrap align-items-center">
          <a class="btn btn-warning fw-semibold" href="details.html?id=${item.id}">Ver detalhes</a>
          <span class="tag-info">${item.modalidade}</span>
        </div>
      </div>
    </article>
  `;

  column
    .querySelector(".favorito-container")
    .appendChild(createFavoriteButton(item.id, isFavorite));

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
        <p class="mensagem-vazia">Nenhum curso encontrado para o filtro informado.</p>
      </div>
    `;
    return;
  }

  items.forEach((item) => list.appendChild(createCard(item)));
}

function renderFilteredCards() {
  const filtered = filterItems(allItems, getSearchTerm());
  renderCards(filtered);
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
    <button class="carousel-control-next" type="button" data-bs-target="#carousel-destaques" data-bs-slide="next" aria-label="Proximo slide">
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
    </button>
  `;
}

function renderChart(items) {
  const chartElement = document.querySelector("#chart-categorias");
  if (!chartElement || !window.Chart) {
    return;
  }

  const counts = items.reduce((acc, item) => {
    const categoria = item.categoria || "Sem categoria";
    acc[categoria] = (acc[categoria] || 0) + 1;
    return acc;
  }, {});

  if (categoriasChart) {
    categoriasChart.destroy();
  }

  categoriasChart = new Chart(chartElement, {
    type: "bar",
    data: {
      labels: Object.keys(counts),
      datasets: [
        {
          label: "Quantidade de cursos",
          data: Object.values(counts),
          backgroundColor: [
            "rgba(255, 193, 7, 0.75)",
            "rgba(194, 162, 57, 0.75)",
            "rgba(238, 206, 115, 0.75)",
            "rgba(171, 130, 31, 0.75)",
            "rgba(255, 213, 79, 0.75)"
          ],
          borderColor: "rgba(255, 193, 7, 1)",
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: "#f6e6ad"
          }
        }
      },
      scales: {
        x: {
          ticks: { color: "#f6e6ad" },
          grid: { color: "rgba(255,255,255,0.08)" }
        },
        y: {
          beginAtZero: true,
          ticks: { color: "#f6e6ad" },
          grid: { color: "rgba(255,255,255,0.08)" }
        }
      }
    }
  });
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
      <p class="mb-2"><strong>Matricula:</strong> ${authorInfo.matricula}</p>
      <p class="mb-2"><strong>Turma:</strong> ${authorInfo.turma}</p>
      <p class="mb-2"><strong>Projeto:</strong> ${authorInfo.projeto}</p>
      <p class="mb-3 text-light-emphasis">${authorInfo.descricao}</p>
      <div class="d-flex gap-2 flex-wrap">
        <a class="btn btn-outline-warning btn-sm" href="${authorInfo.github}" target="_blank" rel="noopener">GitHub</a>
        <a class="btn btn-outline-warning btn-sm" href="${authorInfo.linkedin}" target="_blank" rel="noopener">LinkedIn</a>
      </div>
    </article>
  `;
}

function bindSearch() {
  const input = document.querySelector("#search-input");
  const button = document.querySelector("#search-button");
  if (!input || !button) {
    return;
  }

  const applySearch = () => renderFilteredCards();
  button.addEventListener("click", applySearch);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      applySearch();
    }
  });
  input.addEventListener("input", () => {
    if (!input.value.trim()) {
      renderFilteredCards();
    }
  });
}

async function init() {
  window.App.bindAuthUI();
  const user = window.App.getCurrentUser();

  try {
    allItems = await window.App.apiFetch("/cursos");
    if (user) {
      favoriteIds = await window.App.getFavoriteItemIds(user.id);
    }

    renderFeatured(allItems);
    renderFilteredCards();
    renderChart(allItems);
    renderAuthor();
    bindSearch();
  } catch (error) {
    console.error(error);
    const featured = document.querySelector("#carousel-destaques");
    const list = document.querySelector("#lista-itens");
    if (featured) {
      featured.innerHTML = '<p class="mensagem-vazia">Erro ao carregar os destaques da API.</p>';
    }
    if (list) {
      list.innerHTML = '<div class="col-12"><p class="mensagem-vazia">Erro ao carregar a lista de itens.</p></div>';
    }
  }
}

document.addEventListener("DOMContentLoaded", init);
