const sources = window.REYKJAVIK_SOURCES;

const state = {
  search: "",
  priority: "All",
  phase: "All",
  side: "All",
  sort: "date"
};

const priorityOrder = { Core: 0, Context: 1, Lead: 2 };

const els = {
  total: document.getElementById("stat-total"),
  core: document.getElementById("stat-core"),
  repos: document.getElementById("stat-repos"),
  search: document.getElementById("source-search"),
  priorityFilters: document.getElementById("priority-filters"),
  phaseFilters: document.getElementById("phase-filters"),
  sideFilters: document.getElementById("side-filters"),
  sort: document.getElementById("sort-select"),
  count: document.getElementById("result-count"),
  list: document.getElementById("source-list"),
  hofdiSessions: document.getElementById("hofdi-sessions"),
  hofdiWorkstreams: document.getElementById("hofdi-workstreams"),
  timeline: document.getElementById("timeline-list"),
  collections: document.getElementById("collection-map"),
  resetFilters: document.getElementById("reset-filters"),
  copyLinks: document.getElementById("copy-links"),
  exportCsv: document.getElementById("export-csv")
};

const sourceIndex = new Map(sources.map((source) => [source.id, source]));

const hofdiSessions = [
  {
    label: "Session I",
    time: "Oct 11 morning",
    theme: "Opening positions, agenda, and first package proposals.",
    us: "frus-v-d301",
    soviet: "nsa203-doc10"
  },
  {
    label: "Session II",
    time: "Oct 11 afternoon",
    theme: "Arms control moves to the center of the summit.",
    us: "frus-v-d302",
    soviet: "nsa203-doc12"
  },
  {
    label: "Session III",
    time: "Oct 12 morning",
    theme: "Near-agreement on reductions, with SDI and ABM terms tightening.",
    us: "frus-v-d306",
    soviet: "nsa203-doc14"
  },
  {
    label: "Final Session",
    time: "Oct 12 afternoon",
    theme: "The summit closes over the laboratory-testing and SDI dispute.",
    us: "frus-v-d308",
    soviet: "nsa203-doc16"
  }
];

const hofdiWorkstreams = [
  {
    label: "Overnight Arms-Control Work",
    ids: ["frus-xi-d159", "frus-xi-d160", "nsa203-doc17"],
    note: "Nitze, Akhromeyev, Hill, and the military experts worked through the overnight negotiating text."
  },
  {
    label: "Non-Arms-Control Channel",
    ids: ["frus-v-d303", "frus-v-d304"],
    note: "Separate working-group records track regional, bilateral, and human-rights issues during the same Hofdi interval."
  },
  {
    label: "Media and Site Evidence",
    ids: ["reagan-photo-gorbachev-summits", "reagan-whtv-027-gorbachev-greeting"],
    note: "The Reagan Library photo and video records anchor the physical setting and arrival sequence at Hofdi House."
  }
];

function unique(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function normalize(value) {
  return String(value || "").toLowerCase();
}

function sourceHaystack(source) {
  return [
    source.title,
    source.date,
    source.phase,
    source.side,
    source.priority,
    source.type,
    source.repository,
    source.collection,
    source.url,
    source.summary
  ].join(" ");
}

function makeButton(label, active, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.setAttribute("aria-pressed", String(active));
  button.addEventListener("click", onClick);
  return button;
}

function renderFilters() {
  const priorities = ["All", "Core", "Context", "Lead"];
  const phases = ["All", ...unique(sources.map((source) => source.phase))];
  const sides = ["All", ...unique(sources.map((source) => source.side))];

  fillFilter(els.priorityFilters, priorities, "priority");
  fillFilter(els.phaseFilters, phases, "phase");
  fillFilter(els.sideFilters, sides, "side");
}

function fillFilter(container, values, key) {
  container.replaceChildren(
    ...values.map((value) =>
      makeButton(value, state[key] === value, () => {
        state[key] = value;
        render();
      })
    )
  );
}

function filteredSources() {
  const query = normalize(state.search);
  return sources
    .filter((source) => state.priority === "All" || source.priority === state.priority)
    .filter((source) => state.phase === "All" || source.phase === state.phase)
    .filter((source) => state.side === "All" || source.side === state.side)
    .filter((source) => !query || normalize(sourceHaystack(source)).includes(query))
    .sort((a, b) => {
      if (state.sort === "repository") {
        return a.repository.localeCompare(b.repository) || a.date.localeCompare(b.date);
      }
      if (state.sort === "priority") {
        return priorityOrder[a.priority] - priorityOrder[b.priority] || a.date.localeCompare(b.date);
      }
      return a.date.localeCompare(b.date) || priorityOrder[a.priority] - priorityOrder[b.priority];
    });
}

function renderStats() {
  els.total.textContent = sources.length;
  els.core.textContent = sources.filter((source) => source.priority === "Core").length;
  els.repos.textContent = unique(sources.map((source) => source.repository)).length;
}

function renderSources(items) {
  els.count.textContent = `${items.length} source${items.length === 1 ? "" : "s"} shown`;
  els.list.replaceChildren(...items.map(sourceCard));
}

function sourceCard(source) {
  const article = document.createElement("article");
  article.className = "source-card";
  article.dataset.priority = source.priority;

  const meta = document.createElement("div");
  meta.className = "source-meta";
  meta.innerHTML = `
    <span>${escapeHtml(source.date)}</span>
    <span>${escapeHtml(source.repository)}</span>
    <span>${escapeHtml(source.collection)}</span>
  `;

  const main = document.createElement("div");
  main.className = "source-main";
  main.innerHTML = `
    <h3>${escapeHtml(source.title)}</h3>
    <p>${escapeHtml(source.summary)}</p>
    <div class="pill-row">
      <span class="pill">${escapeHtml(source.priority)}</span>
      <span class="pill">${escapeHtml(source.phase)}</span>
      <span class="pill">${escapeHtml(source.side)}</span>
      <span class="pill">${escapeHtml(source.type)}</span>
    </div>
  `;

  const actions = document.createElement("div");
  actions.className = "source-actions";
  const link = document.createElement("a");
  link.href = source.url;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.textContent = "Open";

  const copy = document.createElement("button");
  copy.type = "button";
  copy.textContent = "Copy cite";
  copy.addEventListener("click", async () => {
    await copyText(formatCitation(source));
    copy.textContent = "Copied";
    setTimeout(() => {
      copy.textContent = "Copy cite";
    }, 1000);
  });

  actions.append(link, copy);
  article.append(meta, main, actions);
  return article;
}

function renderTimeline() {
  const timelineItems = sources
    .filter((source) => source.priority === "Core" && ["Road", "Summit", "Aftermath", "Public"].includes(source.phase))
    .sort((a, b) => a.date.localeCompare(b.date));

  els.timeline.replaceChildren(
    ...timelineItems.map((source) => {
      const item = document.createElement("article");
      item.className = "timeline-item";
      item.innerHTML = `
        <time datetime="${escapeHtml(source.date)}">${escapeHtml(source.date)}</time>
        <div>
          <h3>${escapeHtml(source.title)}</h3>
          <p>${escapeHtml(source.repository)} - ${escapeHtml(source.collection)}</p>
        </div>
        <a href="${escapeAttribute(source.url)}" target="_blank" rel="noreferrer">Open source</a>
      `;
      return item;
    })
  );
}

function renderCollections() {
  const groups = [
    ["U.S. official records", (source) => source.side === "US"],
    ["Soviet-side records", (source) => source.side === "Soviet"],
    ["Bilateral meeting records", (source) => source.side === "Bilateral"],
    ["Archive leads and media", (source) => source.priority === "Lead" || source.phase === "Media"]
  ];

  els.collections.replaceChildren(
    ...groups.map(([label, predicate]) => {
      const block = document.createElement("article");
      block.className = "collection-block";
      const count = sources.filter(predicate).length;
      block.innerHTML = `
        <strong>${count}</strong>
        <h3>${escapeHtml(label)}</h3>
        <p>${collectionSummary(label)}</p>
      `;
      return block;
    })
  );
}

function renderHofdi() {
  if (!els.hofdiSessions || !els.hofdiWorkstreams) return;

  els.hofdiSessions.replaceChildren(
    ...hofdiSessions.map((session) => {
      const block = document.createElement("article");
      block.className = "hofdi-session";
      block.innerHTML = `
        <div>
          <span>${escapeHtml(session.time)}</span>
          <h4>${escapeHtml(session.label)}</h4>
          <p>${escapeHtml(session.theme)}</p>
        </div>
        <div class="hofdi-link-row">
          ${sourceLink(session.us, "U.S. record")}
          ${sourceLink(session.soviet, "Russian transcript")}
        </div>
      `;
      return block;
    })
  );

  els.hofdiWorkstreams.replaceChildren(
    ...hofdiWorkstreams.map((workstream) => {
      const block = document.createElement("article");
      block.className = "hofdi-workstream";
      block.innerHTML = `
        <h3>${escapeHtml(workstream.label)}</h3>
        <p>${escapeHtml(workstream.note)}</p>
        <div class="hofdi-link-row">
          ${workstream.ids.map((id) => sourceLink(id, sourceIndex.get(id)?.collection || "Source")).join("")}
        </div>
      `;
      return block;
    })
  );
}

function sourceLink(id, label) {
  const source = sourceIndex.get(id);
  if (!source) {
    return `<span class="source-missing">${escapeHtml(label)}</span>`;
  }
  return `<a href="${escapeAttribute(source.url)}" target="_blank" rel="noreferrer" title="${escapeAttribute(source.title)}">${escapeHtml(label)}</a>`;
}

function collectionSummary(label) {
  const summaries = {
    "U.S. official records": "FRUS/history.state.gov records first; Reagan Library, CIA, and White House records only when they add non-FRUS material.",
    "Soviet-side records": "UN-circulated Soviet statements, FBIS/Russian transcripts, Politburo notes, and Chernyaev-linked records.",
    "Bilateral meeting records": "Session records where the U.S. and Soviet records can be compared or used together.",
    "Archive leads and media": "Finding aids, collection portals, videos, and visual material for deeper harvesting."
  };
  return summaries[label];
}

function formatCitation(source) {
  return `${source.title}. ${source.repository}, ${source.collection}, ${source.date}. ${source.url}`;
}

function exportCsv(items) {
  const headers = ["title", "date", "phase", "side", "priority", "type", "repository", "collection", "url", "summary"];
  const rows = [headers.join(",")].concat(
    items.map((source) =>
      headers.map((key) => csvCell(source[key])).join(",")
    )
  );
  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "reykjavik-primary-sources.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}

function csvCell(value) {
  return `"${String(value || "").replaceAll('"', '""')}"`;
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (error) {
      // Fall back for browsers that expose clipboard but reject programmatic writes.
    }
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

function render() {
  const items = filteredSources();
  renderFilters();
  renderSources(items);
}

els.search.addEventListener("input", (event) => {
  state.search = event.target.value;
  render();
});

els.sort.addEventListener("change", (event) => {
  state.sort = event.target.value;
  render();
});

els.resetFilters.addEventListener("click", () => {
  state.search = "";
  state.priority = "All";
  state.phase = "All";
  state.side = "All";
  state.sort = "date";
  els.search.value = "";
  els.sort.value = "date";
  render();
});

els.copyLinks.addEventListener("click", async () => {
  const text = filteredSources().map(formatCitation).join("\n");
  await copyText(text);
  els.copyLinks.textContent = "Copied";
  setTimeout(() => {
    els.copyLinks.textContent = "Copy links";
  }, 1000);
});

els.exportCsv.addEventListener("click", () => exportCsv(filteredSources()));

renderStats();
renderHofdi();
renderTimeline();
renderCollections();
render();
