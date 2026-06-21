function showCrudAlert(message, type = "warning") {
  const container = document.querySelector("#crud-alert");
  if (!container) {
    return;
  }
  container.innerHTML = `<div class="alert alert-${type}" role="alert">${message}</div>`;
}

function parseTags(value) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function getFormData() {
  return {
    titulo: document.querySelector("#titulo")?.value.trim(),
    categoria: document.querySelector("#categoria")?.value.trim(),
    imagem: document.querySelector("#imagem")?.value.trim(),
    preco: document.querySelector("#preco")?.value.trim(),
    nivel: document.querySelector("#nivel")?.value.trim(),
    modalidade: document.querySelector("#modalidade")?.value.trim(),
    duracao: document.querySelector("#duracao")?.value.trim(),
    instrutor: document.querySelector("#instrutor")?.value.trim(),
    descricaoCurta: document.querySelector("#descricaoCurta")?.value.trim(),
    descricaoCompleta: document.querySelector("#descricaoCompleta")?.value.trim(),
    tags: parseTags(document.querySelector("#tags")?.value || ""),
    destaque: document.querySelector("#destaque")?.checked || false
  };
}

function setFormData(item = null) {
  document.querySelector("#curso-id").value = item?.id || "";
  document.querySelector("#titulo").value = item?.titulo || "";
  document.querySelector("#categoria").value = item?.categoria || "";
  document.querySelector("#imagem").value = item?.imagem || "";
  document.querySelector("#preco").value = item?.preco || "";
  document.querySelector("#nivel").value = item?.nivel || "";
  document.querySelector("#modalidade").value = item?.modalidade || "";
  document.querySelector("#duracao").value = item?.duracao || "";
  document.querySelector("#instrutor").value = item?.instrutor || "";
  document.querySelector("#descricaoCurta").value = item?.descricaoCurta || "";
  document.querySelector("#descricaoCompleta").value = item?.descricaoCompleta || "";
  document.querySelector("#tags").value = (item?.tags || []).join(", ");
  document.querySelector("#destaque").checked = Boolean(item?.destaque);
}

async function loadTable() {
  const tbody = document.querySelector("#crud-table-body");
  const cursos = await window.App.apiFetch("/cursos");

  tbody.innerHTML = cursos
    .map(
      (curso) => `
      <tr>
        <td>${curso.id}</td>
        <td>${curso.titulo}</td>
        <td>${curso.categoria}</td>
        <td>${curso.preco}</td>
        <td>
          <div class="d-flex gap-2 flex-wrap">
            <button class="btn btn-sm btn-outline-warning" data-action="edit" data-id="${curso.id}">Editar</button>
            <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${curso.id}">Excluir</button>
          </div>
        </td>
      </tr>
    `
    )
    .join("");
}

async function handleSubmit(event) {
  event.preventDefault();
  const id = document.querySelector("#curso-id").value;
  const data = getFormData();

  try {
    if (id) {
      await window.App.apiFetch(`/cursos/${id}`, {
        method: "PUT",
        body: JSON.stringify({ id: Number(id), ...data })
      });
      showCrudAlert("Item atualizado com sucesso.", "success");
    } else {
      await window.App.apiFetch("/cursos", {
        method: "POST",
        body: JSON.stringify(data)
      });
      showCrudAlert("Item criado com sucesso.", "success");
    }

    setFormData();
    await loadTable();
  } catch (error) {
    console.error(error);
    showCrudAlert("Falha ao salvar item.", "danger");
  }
}

async function handleTableClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const action = button.dataset.action;
  const id = button.dataset.id;

  try {
    if (action === "edit") {
      const item = await window.App.apiFetch(`/cursos/${id}`);
      setFormData(item);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (action === "delete") {
      const confirmado = window.confirm("Deseja realmente excluir este item?");
      if (!confirmado) {
        return;
      }

      await window.App.apiFetch(`/cursos/${id}`, { method: "DELETE" });
      showCrudAlert("Item excluido com sucesso.", "success");
      await loadTable();
    }
  } catch (error) {
    console.error(error);
    showCrudAlert("Falha ao executar a acao.", "danger");
  }
}

async function init() {
  const user = window.App.requireAdmin();
  if (!user) {
    return;
  }

  window.App.bindAuthUI();

  document.querySelector("#curso-form")?.addEventListener("submit", handleSubmit);
  document.querySelector("#btn-cancelar")?.addEventListener("click", () => setFormData());
  document.querySelector("#crud-table-body")?.addEventListener("click", handleTableClick);

  await loadTable();
}

document.addEventListener("DOMContentLoaded", init);
