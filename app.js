const submissions = [
  {
    id: "midnight-signals",
    cover: "assets/cover-neon-wave.png",
    audio: "assets/demo-preview.wav",
    song: "Midnight Signals",
    artist: "Aarav Sky",
    client: "Aarav Mehta",
    email: "aarav@soundlift.demo",
    phone: "+91 98765 43210",
    genre: "Electronic Pop",
    language: "English",
    uploadDate: "16 Jun 2026",
    releaseDate: "28 Jun 2026",
    status: "Pending",
    description: "A polished late-night electronic pop release with atmospheric synths, clean vocal production, and a club-ready hook.",
  },
  {
    id: "city-lights",
    cover: "assets/cover-neon-wave.png",
    audio: "assets/demo-preview.wav",
    song: "City Lights",
    artist: "Mira V",
    client: "Mira Verma",
    email: "mira@soundlift.demo",
    phone: "+91 99887 66554",
    genre: "Indie Pop",
    language: "Hindi",
    uploadDate: "14 Jun 2026",
    releaseDate: "25 Jun 2026",
    status: "Completed",
    description: "Warm indie-pop textures built around bright guitars, soft percussion, and intimate bilingual lyrics.",
  },
  {
    id: "after-hours",
    cover: "assets/cover-neon-wave.png",
    audio: "assets/demo-preview.wav",
    song: "After Hours",
    artist: "Nova Lane",
    client: "Naveen Lal",
    email: "nova@soundlift.demo",
    phone: "+91 91234 56780",
    genre: "Hip-Hop",
    language: "English",
    uploadDate: "11 Jun 2026",
    releaseDate: "20 Jun 2026",
    status: "Pending",
    description: "Minimal drums, glossy bass, and sharp vocal layers shaped for late-night streaming playlists.",
  },
];

const app = document.querySelector("#app");
const routes = new Set(["dashboard", "new-release", "uploads"]);
const fallbackIcons = {
  "arrow-left": '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  "arrow-up-right": '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  "audio-lines": '<path d="M2 10v3"/><path d="M6 6v11"/><path d="M10 3v18"/><path d="M14 8v7"/><path d="M18 5v14"/><path d="M22 10v3"/>',
  "badge-check": '<path d="m9 12 2 2 4-4"/><path d="M12 3 14 5.5 17 5l1 3 3 1-1 3 1 3-3 1-1 3-3-.5L12 21l-2-2.5-3 .5-1-3-3-1 1-3-1-3 3-1 1-3 3 .5z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  "clock-3": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5h5"/>',
  "disc-3": '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/><path d="M6 12h2"/><path d="M16 12h2"/>',
  download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  "file-audio": '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 17v-6l5-1v6"/><circle cx="8" cy="17" r="1"/><circle cx="13" cy="16" r="1"/>',
  "image-plus": '<path d="M16 5h6"/><path d="M19 2v6"/><rect x="3" y="5" width="14" height="14" rx="2"/><path d="m3 15 4-4 3 3 2-2 5 5"/>',
  "layout-dashboard": '<rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/>',
  "list-music": '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/><path d="M3 6h4"/><path d="M3 10h4"/>',
  "music-4": '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
  "upload-cloud": '<path d="M16 16 12 12 8 16"/><path d="M12 12v9"/><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/>',
};

function iconRefresh() {
  if (window.lucide) {
    window.lucide.createIcons();
    return;
  }

  document.querySelectorAll("i[data-lucide]").forEach((icon) => {
    const name = icon.dataset.lucide;
    const paths = fallbackIcons[name];
    if (!paths) return;
    icon.outerHTML = `<svg class="fallback-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  });
}

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
}

function statusClass(status) {
  return status.toLowerCase() === "completed" ? "completed" : "pending";
}

function renderRecent() {
  const list = document.querySelector("#recent-list");
  if (!list) return;

  list.innerHTML = submissions
    .slice(0, 3)
    .map(
      (item) => `
        <a class="release-row" href="#details/${item.id}">
          <img class="cover-thumb" src="${item.cover}" alt="${item.song} cover" />
          <span>
            <span class="song-title">${item.song}</span>
            <span class="song-meta">${item.artist} · ${item.uploadDate}</span>
          </span>
          <span class="pill ${statusClass(item.status)}">${item.status}</span>
        </a>
      `,
    )
    .join("");
}

function renderUploads() {
  const table = document.querySelector("#uploads-table");
  if (!table) return;

  table.innerHTML = submissions
    .map(
      (item) => `
        <article class="table-row">
          <img class="cover-thumb" src="${item.cover}" alt="${item.song} cover" />
          <div class="table-data">
            <span class="table-cell">
              <span class="table-label">Song Name</span>
              <strong class="table-value">${item.song}</strong>
            </span>
            <span class="table-cell">
              <span class="table-label">Artist Name</span>
              <span class="table-value">${item.artist}</span>
            </span>
            <span class="table-cell">
              <span class="table-label">Upload Date</span>
              <span class="table-value">${item.uploadDate}</span>
            </span>
            <a class="button ghost small" href="#details/${item.id}">
              <i data-lucide="eye"></i>
              View Details
            </a>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderDetails(id) {
  const item = submissions.find((submission) => submission.id === id) || submissions[0];
  const detailsPage = document.querySelector("#details-page");
  if (!detailsPage) return;

  detailsPage.innerHTML = `
    <a class="button ghost small" href="#uploads">
      <i data-lucide="arrow-left"></i>
      Back To Uploads
    </a>
    <article class="details-card details-grid">
      <img class="details-cover" src="${item.cover}" alt="${item.song} cover art" />
      <div class="details-info">
        <div>
          <span class="eyebrow">${item.status} release</span>
          <h1>${item.song}</h1>
          <p>${item.description}</p>
        </div>
        <div class="info-grid">
          <div class="info-item"><span>Artist Name</span><strong>${item.artist}</strong></div>
          <div class="info-item"><span>Genre</span><strong>${item.genre}</strong></div>
          <div class="info-item"><span>Language</span><strong>${item.language}</strong></div>
          <div class="info-item"><span>Release Date</span><strong>${item.releaseDate}</strong></div>
        </div>
        <audio controls preload="none" src="${item.audio}"></audio>
        <a class="button primary" href="${item.audio}" download>
          <i data-lucide="download"></i>
          Download Audio
        </a>
        <a class="button ghost" href="${item.cover}" download>
          <i data-lucide="image-plus"></i>
          Download Cover
        </a>
      </div>
    </article>
    <article class="details-card">
      <div class="section-head">
        <div>
          <span class="eyebrow">Client information</span>
          <h2>${item.client}</h2>
        </div>
      </div>
      <div class="info-grid">
        <div class="info-item"><span>Name</span><strong>${item.client}</strong></div>
        <div class="info-item"><span>Email</span><strong>${item.email}</strong></div>
        <div class="info-item"><span>Phone</span><strong>${item.phone}</strong></div>
      </div>
    </article>
  `;
}

function bindUploads() {
  const form = document.querySelector("#release-form");
  if (!form) return;

  document.querySelectorAll("[data-browse]").forEach((button) => {
    button.addEventListener("click", () => document.getElementById(button.dataset.browse)?.click());
  });

  const audioInput = document.querySelector("#audio-upload");
  const coverInput = document.querySelector("#cover-upload");
  const audioMeta = document.querySelector("#audio-meta");
  const coverMeta = document.querySelector("#cover-meta");
  const coverPreview = document.querySelector("#cover-preview");

  function updateAudio(file) {
    if (!file) return;
    audioMeta.textContent = `${file.name} · ${formatBytes(file.size)}`;
  }

  function updateCover(file) {
    if (!file) return;
    coverMeta.textContent = `${file.name} · ${formatBytes(file.size)}`;
    const reader = new FileReader();
    reader.onload = () => {
      coverPreview.innerHTML = `<img src="${reader.result}" alt="Selected cover art preview" />`;
    };
    reader.readAsDataURL(file);
  }

  audioInput.addEventListener("change", () => updateAudio(audioInput.files[0]));
  coverInput.addEventListener("change", () => updateCover(coverInput.files[0]));

  document.querySelectorAll(".drop-zone").forEach((zone) => {
    const input = zone.dataset.drop === "audio" ? audioInput : coverInput;
    const updater = zone.dataset.drop === "audio" ? updateAudio : updateCover;

    ["dragenter", "dragover"].forEach((eventName) => {
      zone.addEventListener(eventName, (event) => {
        event.preventDefault();
        zone.classList.add("dragging");
      });
    });

    ["dragleave", "drop"].forEach((eventName) => {
      zone.addEventListener(eventName, (event) => {
        event.preventDefault();
        zone.classList.remove("dragging");
      });
    });

    zone.addEventListener("drop", (event) => {
      const [file] = event.dataTransfer.files;
      if (!file) return;
      const transfer = new DataTransfer();
      transfer.items.add(file);
      input.files = transfer.files;
      updater(file);
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    form.classList.add("is-loading");
    form.querySelector("button[type='submit']").disabled = true;

    window.setTimeout(() => {
      form.classList.remove("is-loading");
      form.classList.add("is-success");
      window.setTimeout(() => {
        form.reset();
        audioMeta.textContent = "No audio selected";
        coverMeta.textContent = "No cover selected";
        coverPreview.innerHTML = '<i data-lucide="image-plus"></i>';
        form.classList.remove("is-success");
        form.querySelector("button[type='submit']").disabled = false;
        iconRefresh();
      }, 1500);
    }, 1200);
  });
}

function setActive(route) {
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("active", link.dataset.route === route);
  });
}

function render() {
  const hash = window.location.hash.replace("#", "") || "dashboard";
  const [route, detailId] = hash.split("/");
  const routeName = routes.has(route) ? route : route === "details" ? "details" : "dashboard";
  const templateId = `${routeName}-template`;
  const template = document.getElementById(templateId);

  app.classList.remove("page-transition");
  void app.offsetWidth;
  app.innerHTML = template.innerHTML;
  app.classList.add("page-transition");

  setActive(routeName === "details" ? "uploads" : routeName);
  renderRecent();
  renderUploads();
  if (routeName === "details") renderDetails(detailId);
  bindUploads();
  iconRefresh();
  app.focus({ preventScroll: true });
}

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", render);
window.addEventListener("mousemove", (event) => {
  const x = `${Math.round((event.clientX / window.innerWidth) * 100)}%`;
  const y = `${Math.round((event.clientY / window.innerHeight) * 100)}%`;
  document.documentElement.style.setProperty("--mx", x);
  document.documentElement.style.setProperty("--my", y);
});
