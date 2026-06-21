function createFavoriteCard(item) {
  return `
    <div class="col-12 col-md-6 col-xl-4">
      <article class="card card-musicalizacao h-100">
        <a class="card-link-imagem" href="details.html?id=${item.id}">
          <img src="${item.imagem}" alt="${item.titulo}">
        </a>
        <div class="card-body d-flex flex-column">
          <span class="badge text-bg-warning align-self-start mb-3">${item.categoria}</span>
          <h3 class="h4 mb-2">${item.titulo}</h3>
          <p class="text-light-emphasis">${item.descricaoCurta}</p>
          <div class="mt-auto d-flex gap-2 flex-wrap">
            <a class="btn btn-warning fw-semibold" href="details.html?id=${item.id}">Ver detalhes</a>
          </div>
        </div>
      </article>
    </div>
  `;
}

async function renderFavoritos() {
  const user = window.App.requireLoggedUser();
  if (!user) {
    return;
  }

  window.App.bindAuthUI();
  const list = document.querySelector("#favoritos-list");

  try {
    const favoritos = await window.App.apiFetch(`/favoritos?usuarioId=${user.id}`);
    if (!favoritos.length) {
      list.innerHTML = '<div class="col-12"><p class="mensagem-vazia">Voce ainda nao marcou nenhum item como favorito.</p></div>';
      return;
    }

    const ids = favoritos.map((fav) => fav.itemId);
    const allCursos = await window.App.apiFetch("/cursos");
    const cursosFavoritos = allCursos.filter((curso) => ids.includes(Number(curso.id)));

    list.innerHTML = cursosFavoritos.map((curso) => createFavoriteCard(curso)).join("");
  } catch (error) {
    console.error(error);
    list.innerHTML = '<div class="col-12"><p class="mensagem-vazia">Erro ao carregar favoritos.</p></div>';
  }
}

document.addEventListener("DOMContentLoaded", renderFavoritos);
