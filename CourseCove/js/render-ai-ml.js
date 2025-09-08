// CourseCove/js/render-ai-ml.js
// Fixed pagination to match math page behavior (windowed pages + ellipses + skip buttons)

(() => {
  const JSON_URL = "/json/ai-ml-courses.json"; // path from ai-ml.html to its JSON
  const PER_PAGE = 12;

  const coursesEl = document.getElementById("courses");
  const paginationEl = document.getElementById("pagination");

  let courses = [];
  let currentPage = 1;
  let totalPages = 1;

  // --- Responsive density: fewer numbered buttons on small screens ---
  function deltaByWidth() {
    const w = window.innerWidth || document.documentElement.clientWidth;
    if (w < 420) return 1; // mobile
    if (w < 768) return 2; // tablet
    return 3;              // desktop
  }

  // --- Build compact page list: [1, "...", 5,6,7, "...", last] ---
  function buildPageList(current, total, delta = 2) {
    if (total <= 1) return [1];

    const left = Math.max(2, current - delta);
    const right = Math.min(total - 1, current + delta);

    const pages = [1];
    if (left > 2) pages.push("...");
    for (let p = left; p <= right; p++) pages.push(p);
    if (right < total - 1) pages.push("...");
    pages.push(total);

    return pages;
  }

  // --- Render current page of cards (adjust card markup to your styling if needed) ---
  function renderCourses() {
    const start = (currentPage - 1) * PER_PAGE;
    const end = start + PER_PAGE;
    const slice = courses.slice(start, end);

    coursesEl.innerHTML = slice.map(c => `
      <article class="card">
        <a href="${c.url}" target="_blank" rel="noopener">
          <h3>${c.title ?? ""}</h3>
        </a>
        <p>${c.description ?? ""}</p>
        <p><strong>Instructor:</strong> ${c.instructor ?? "—"}</p>
        <p><strong>Rating:</strong> ${c.rating ?? "—"}</p>
        <p><strong>Level:</strong> ${c.level ?? "—"}</p>
        <p><strong>Duration:</strong> ${c.duration ?? "—"}</p>
        <p><strong>Price:</strong> ${c.price ?? "—"}</p>
      </article>
    `).join("");
  }

  function gotoPage(n) {
    const target = Math.max(1, Math.min(totalPages, n));
    if (target === currentPage) return;
    currentPage = target;
    renderCourses();
    renderPagination();
    // Optional: smooth scroll up to the grid after page change
    if (coursesEl && coursesEl.scrollIntoView) {
      coursesEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    // Optional: keep ?page= in URL like the math page may do
    if (history && history.replaceState) {
      const url = new URL(location.href);
      url.searchParams.set("page", String(currentPage));
      history.replaceState({}, "", url);
    }
  }

  function renderPagination() {
    const delta = deltaByWidth();
    const pages = buildPageList(currentPage, totalPages, delta);
    paginationEl.innerHTML = "";

    const addBtn = (label, onClick, opts = {}) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = String(label);
      if (opts.title) b.title = opts.title;
      if (opts.aria) b.setAttribute("aria-label", opts.aria);
      if (opts.disabled) b.disabled = true;
      if (opts.active) b.classList.add("active");
      if (onClick) b.addEventListener("click", onClick);
      paginationEl.appendChild(b);
    };

    const addDots = () => {
      const s = document.createElement("span");
      s.className = "ellipsis";
      s.textContent = "…";
      s.setAttribute("aria-hidden", "true");
      paginationEl.appendChild(s);
    };

    // « First
    addBtn("«", () => gotoPage(1), {
      title: "First page",
      aria: "Go to first page",
      disabled: currentPage === 1
    });

    // ‹ Prev
    addBtn("‹", () => gotoPage(currentPage - 1), {
      title: "Previous page",
      aria: "Go to previous page",
      disabled: currentPage === 1
    });

    // numbered pages + ellipses
    pages.forEach(p => {
      if (p === "...") {
        addDots();
      } else {
        addBtn(p, () => gotoPage(p), {
          aria: `Go to page ${p}`,
          active: p === currentPage
        });
      }
    });

    // Next ›
    addBtn("›", () => gotoPage(currentPage + 1), {
      title: "Next page",
      aria: "Go to next page",
      disabled: currentPage === totalPages
    });

    // Last »
    addBtn("»", () => gotoPage(totalPages), {
      title: "Last page",
      aria: "Go to last page",
      disabled: currentPage === totalPages
    });
  }

  // Optional: read ?page= from URL on load
  function initPageFromURL() {
    const pageParam = new URL(location.href).searchParams.get("page");
    const p = pageParam ? parseInt(pageParam, 10) : 1;
    if (!Number.isNaN(p) && p >= 1) currentPage = p;
  }

  async function loadCourses() {
    const res = await fetch(JSON_URL);
    courses = await res.json();
    totalPages = Math.max(1, Math.ceil(courses.length / PER_PAGE));
    initPageFromURL();
    if (currentPage > totalPages) currentPage = totalPages;
    renderCourses();
    renderPagination();
  }

  // Keep pagination compact on resize (recompute ellipses window)
  function handleResize() {
    window.addEventListener("resize", () => {
      renderPagination();
    });
  }

  // Keyboard navigation (Left/Right arrows)
  function handleKeys() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft" && currentPage > 1) gotoPage(currentPage - 1);
      if (e.key === "ArrowRight" && currentPage < totalPages) gotoPage(currentPage + 1);
    });
  }

  loadCourses();
  handleResize();
  handleKeys();
})();
