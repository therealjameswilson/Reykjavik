function isHistoryStateDocumentUrl(value) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "history.state.gov" &&
      /^\/historicaldocuments\/frus[^/]+\/d\d+$/i.test(url.pathname) &&
      !url.search &&
      !url.hash
    );
  } catch (error) {
    return false;
  }
}

const sources = window.REYKJAVIK_SOURCES.filter((source) => isHistoryStateDocumentUrl(source.url));

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
  volumes: document.getElementById("stat-volumes"),
  search: document.getElementById("source-search"),
  priorityFilters: document.getElementById("priority-filters"),
  phaseFilters: document.getElementById("phase-filters"),
  sideFilters: document.getElementById("side-filters"),
  sort: document.getElementById("sort-select"),
  count: document.getElementById("result-count"),
  list: document.getElementById("source-list"),
  hofdiSessions: document.getElementById("hofdi-sessions"),
  hofdiWorkstreams: document.getElementById("hofdi-workstreams"),
  negotiatorConnections: document.getElementById("negotiator-connections"),
  principals: document.getElementById("principal-list"),
  hofdiPhotos: document.getElementById("hofdi-photos"),
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
    records: ["frus-v-d301"]
  },
  {
    label: "Session II",
    time: "Oct 11 afternoon",
    theme: "Arms control moves to the center of the summit.",
    records: ["frus-v-d302"]
  },
  {
    label: "Session III",
    time: "Oct 12 morning",
    theme: "Near-agreement on reductions, with SDI and ABM terms tightening.",
    records: ["frus-v-d306", "frus-xi-d162"]
  },
  {
    label: "Final Session",
    time: "Oct 12 afternoon",
    theme: "The summit closes over the laboratory-testing and SDI dispute.",
    records: ["frus-v-d308", "frus-xi-d164", "frus-xi-d165"]
  }
];

const hofdiWorkstreams = [
  {
    label: "Overnight Arms-Control Work",
    ids: ["frus-xi-d159", "frus-xi-d160"],
    note: "Nitze, Akhromeyev, Hill, and the military experts worked through the overnight negotiating text."
  },
  {
    label: "Non-Arms-Control Channel",
    ids: ["frus-v-d303", "frus-v-d304"],
    note: "Separate working-group records track regional, bilateral, and human-rights issues during the same Hofdi interval."
  },
  {
    label: "Foreign-Minister Drafting",
    ids: ["frus-v-d307", "frus-xi-d163"],
    note: "Shultz, Shevardnadze, and the arms-control teams translated the leader-level discussion into a follow-up record."
  }
];

const principalPeople = [
  {
    name: "Ronald Reagan",
    side: "U.S.",
    role: "President",
    note: "Leader-channel principal for the four Hofdi House sessions.",
    ids: ["frus-v-d301", "frus-v-d302", "frus-v-d306", "frus-v-d308"]
  },
  {
    name: "George Shultz",
    side: "U.S.",
    role: "Secretary of State",
    note: "Foreign-minister channel and Sunday drafting room participant.",
    ids: ["frus-v-d283", "frus-v-d307", "frus-xi-d163"]
  },
  {
    name: "Mikhail Gorbachev",
    side: "Soviet",
    role: "General Secretary",
    note: "Soviet leader-channel principal across the official Hofdi session records.",
    ids: ["frus-v-d301", "frus-v-d302", "frus-v-d306", "frus-v-d308"]
  },
  {
    name: "Eduard Shevardnadze",
    side: "Soviet",
    role: "Foreign Minister",
    note: "Foreign-minister channel counterpart to Shultz before, during, and after Hofdi.",
    ids: ["frus-v-d283", "frus-v-d307", "frus-vi-d6"]
  }
];

const negotiatorConnections = [
  {
    label: "Leader Channel",
    us: "Reagan",
    soviet: "Gorbachev",
    note: "The main bilateral record: four Hofdi leader sessions preserved in the official FRUS sequence.",
    ids: ["frus-v-d301", "frus-v-d302", "frus-v-d306", "frus-v-d308"]
  },
  {
    label: "Foreign-Minister Channel",
    us: "Shultz",
    soviet: "Shevardnadze",
    note: "The practical drafting and follow-up channel linking the September preparatory meetings, the Sunday drafting session, and Vienna.",
    ids: ["frus-v-d283", "frus-v-d291", "frus-v-d292", "frus-v-d307", "frus-xi-d163", "frus-vi-d6"]
  },
  {
    label: "Arms-Control Experts",
    us: "Nitze / Hill / Kampelman",
    soviet: "Akhromeyev / Soviet military team",
    note: "The overnight lane where military and arms-control experts converted the leader package into text.",
    ids: ["frus-xi-d159", "frus-xi-d160"]
  },
  {
    label: "Room and Record Support",
    us: "Matlock / U.S. interpreters",
    soviet: "Soviet interpreters",
    note: "The visible support layer in the Hofdi photo run: interpreters and note-takers made the leader-channel comparison possible.",
    ids: ["frus-v-d301", "frus-v-d302"]
  }
];

const hofdiPhotos = [
  {
    code: "C37412-24",
    date: "Oct. 11, 1986",
    src: "https://www.reaganlibrary.gov/public/archives/photographs/thumbnails/c37412-24.jpg",
    title: "Four-principal Hofdi table",
    caption: "Reagan and Gorbachev meet at Hofdi House with George Shultz, Eduard Shevardnadze, Jack Matlock, and Dmitry Zarechnak.",
    tags: ["Reagan", "Shultz", "Gorbachev", "Shevardnadze"],
    source: "frus-v-d301"
  },
  {
    code: "C37408-16A",
    date: "Oct. 11, 1986",
    src: "https://www.reaganlibrary.gov/public/archives/photographs/thumbnails/c37408-16a.jpg",
    title: "Leader meeting with interpreter support",
    caption: "Reagan and Gorbachev meet at Hofdi House with Jack Matlock and Dmitry Zarechnak.",
    tags: ["Reagan", "Gorbachev", "Matlock"],
    source: "frus-v-d301"
  },
  {
    code: "C37418-7",
    date: "Oct. 12, 1986",
    src: "https://www.reaganlibrary.gov/public/archives/photographs/thumbnails/c37418-7.jpg",
    title: "U.S. staff briefing inside Hofdi",
    caption: "Reagan briefs with Ken Adelman, George Shultz, Donald Regan, Robert Linhard, Paul Nitze, and John Poindexter.",
    tags: ["Reagan", "Shultz", "Nitze", "Poindexter"],
    source: "frus-v-d306"
  },
  {
    code: "C37435-18",
    date: "Oct. 12, 1986",
    src: "https://www.reaganlibrary.gov/public/archives/photographs/thumbnails/c37435-18.jpg",
    title: "Second-day Hofdi greeting",
    caption: "Reagan greets Gorbachev at Hofdi House before the final day of the Reykjavik Summit.",
    tags: ["Reagan", "Gorbachev"],
    source: "frus-v-d306"
  }
];

function isReaganLibraryPhotoUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && /(^|\.)reaganlibrary\.gov$/i.test(url.hostname);
  } catch (error) {
    return false;
  }
}

function unique(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function normalize(value) {
  return String(value || "").toLowerCase();
}

function phaseLabel(value) {
  return value === "Road" ? "Lead-up" : value;
}

function frusVolumeId(source) {
  try {
    return new URL(source.url).pathname.split("/")[2] || "";
  } catch (error) {
    return "";
  }
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
  const priorities = [
    "All",
    ...["Core", "Context", "Lead"].filter((priority) => sources.some((source) => source.priority === priority))
  ];
  const phases = ["All", ...unique(sources.map((source) => source.phase))];
  const sides = ["All", ...unique(sources.map((source) => source.side))];

  fillFilter(els.priorityFilters, priorities, "priority");
  fillFilter(els.phaseFilters, phases, "phase");
  fillFilter(els.sideFilters, sides, "side");
}

function fillFilter(container, values, key) {
  container.replaceChildren(
    ...values.map((value) =>
      makeButton(key === "phase" ? phaseLabel(value) : value, state[key] === value, () => {
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
      if (state.sort === "volume") {
        return a.url.localeCompare(b.url, undefined, { numeric: true }) || a.date.localeCompare(b.date);
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
  els.volumes.textContent = unique(sources.map(frusVolumeId)).length;
}

function renderSources(items) {
  els.count.textContent = `${items.length} document${items.length === 1 ? "" : "s"} shown`;
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
      <span class="pill">${escapeHtml(phaseLabel(source.phase))}</span>
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
  link.textContent = "Open FRUS";

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
          <p>${escapeHtml(source.collection)}</p>
        </div>
        <a href="${escapeAttribute(source.url)}" target="_blank" rel="noreferrer">Open FRUS document</a>
      `;
      return item;
    })
  );
}

function renderCollections() {
  const groups = [
    {
      label: "Lead-up",
      count: sources.filter((source) => source.phase === "Road" || source.phase === "Public").length,
      summary: "Preparation, exchanges, intelligence, and policy records before the October 11 opening session."
    },
    {
      label: "Summit",
      count: sources.filter((source) => source.phase === "Summit").length,
      summary: "Leader sessions, foreign-minister discussions, and the overnight arms-control working record."
    },
    {
      label: "Aftermath",
      count: sources.filter((source) => source.phase === "Aftermath").length,
      summary: "Immediate assessments and the diplomatic and arms-control sequence that followed Hofdi."
    },
    {
      label: "FRUS volumes",
      count: unique(sources.map(frusVolumeId)).length,
      summary: "Volumes V, VI, XI, and XLIV Part 1, with each record linked to its official document page."
    }
  ];

  els.collections.replaceChildren(
    ...groups.map((group) => {
      const block = document.createElement("article");
      block.className = "collection-block";
      block.innerHTML = `
        <strong>${group.count}</strong>
        <h3>${escapeHtml(group.label)}</h3>
        <p>${escapeHtml(group.summary)}</p>
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
          ${session.records.map((id) => sourceLink(id, compactSourceLabel(id))).join("")}
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

function renderNegotiators() {
  if (!els.negotiatorConnections || !els.principals || !els.hofdiPhotos) return;

  els.negotiatorConnections.replaceChildren(
    ...negotiatorConnections.map((connection) => {
      const row = document.createElement("article");
      row.className = "connection-lane";
      row.innerHTML = `
        <div class="connection-node connection-node-us">
          <span>U.S.</span>
          <strong>${escapeHtml(connection.us)}</strong>
        </div>
        <div class="connection-bridge">
          <span>${escapeHtml(connection.label)}</span>
          <p>${escapeHtml(connection.note)}</p>
          <div class="hofdi-link-row">
            ${connection.ids.map((id) => sourceLink(id, compactSourceLabel(id))).join("")}
          </div>
        </div>
        <div class="connection-node connection-node-soviet">
          <span>Soviet</span>
          <strong>${escapeHtml(connection.soviet)}</strong>
        </div>
      `;
      return row;
    })
  );

  els.principals.replaceChildren(
    ...principalPeople.map((person) => {
      const card = document.createElement("article");
      card.className = "principal-card";
      card.innerHTML = `
        <span>${escapeHtml(person.side)}</span>
        <h4>${escapeHtml(person.name)}</h4>
        <strong>${escapeHtml(person.role)}</strong>
        <p>${escapeHtml(person.note)}</p>
        <div class="hofdi-link-row">
          ${person.ids.map((id) => sourceLink(id, compactSourceLabel(id))).join("")}
        </div>
      `;
      return card;
    })
  );

  els.hofdiPhotos.replaceChildren(
    ...hofdiPhotos
      .filter(
        (photo) =>
          isReaganLibraryPhotoUrl(photo.src) &&
          isHistoryStateDocumentUrl(sourceIndex.get(photo.source)?.url)
      )
      .map((photo) => {
        const source = sourceIndex.get(photo.source);
        const card = document.createElement("article");
        card.className = "photo-card";
        card.innerHTML = `
          <div class="photo-media">
            <img src="${escapeAttribute(photo.src)}" alt="${escapeAttribute(photo.caption)}" loading="lazy">
          </div>
          <div>
            <span>${escapeHtml(photo.code)} / ${escapeHtml(photo.date)}</span>
            <h3>${escapeHtml(photo.title)}</h3>
            <p>${escapeHtml(photo.caption)}</p>
            <div class="photo-tags">
              ${photo.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
            </div>
            <a class="photo-source-link" href="${escapeAttribute(source.url)}" target="_blank" rel="noreferrer">Related FRUS document</a>
          </div>
        `;
        return card;
      })
  );
}

function sourceLink(id, label) {
  const source = sourceIndex.get(id);
  if (!source || !isHistoryStateDocumentUrl(source.url)) {
    return `<span class="source-missing">${escapeHtml(label)}</span>`;
  }
  return `<a href="${escapeAttribute(source.url)}" target="_blank" rel="noreferrer" title="${escapeAttribute(source.title)}">${escapeHtml(label)}</a>`;
}

function compactSourceLabel(id) {
  const source = sourceIndex.get(id);
  if (!source) return "Source";
  return source.collection.replace("FRUS ", "").replace("Document ", "Doc. ");
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
  link.download = "reykjavik-frus-documents.csv";
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
renderNegotiators();
renderTimeline();
renderCollections();
render();
