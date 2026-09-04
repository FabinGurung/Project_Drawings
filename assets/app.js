const cards = document.getElementById("stageCards");
const filters = document.querySelectorAll(".filter");

function badge(status) {
  return `<span class="badge b-${status}">${status}</span>`;
}

async function loadStatus() {
  const response = await fetch("data/project_status.json", {cache: "no-store"});
  if (!response.ok) throw new Error("Status data could not be loaded.");
  return response.json();
}

function render(data, filter = "ALL") {
  cards.innerHTML = data.stages
    .filter(stage => filter === "ALL" || stage.status === filter || stage.secondary_status === filter)
    .map(stage => `
      <article class="card stage-card" data-status="${stage.status}">
        <div class="stage">${stage.stage} · ${stage.version}</div>
        <h3>${stage.title}</h3>
        <div class="meta">
          ${badge(stage.status)}
          ${stage.secondary_status ? badge(stage.secondary_status) : ""}
          <span class="badge">${stage.e2k_impact}</span>
        </div>
        <div class="note">${stage.note}</div>
        ${stage.blockers ? `<div class="alert"><b>Open engineering blockers</b><ul>${stage.blockers.map(item => `<li>${item}</li>`).join("")}</ul></div>` : ""}
        <div class="small">Detailed governed evidence remains in the private project record.</div>
      </article>`)
    .join("");
}

loadStatus().then(data => {
  filters.forEach(button => {
    button.onclick = () => {
      filters.forEach(item => item.classList.remove("active"));
      button.classList.add("active");
      render(data, button.dataset.filter);
    };
  });
  render(data);
}).catch(error => {
  cards.innerHTML = `<div class="alert"><b>Publication data unavailable.</b> ${error.message}</div>`;
});
