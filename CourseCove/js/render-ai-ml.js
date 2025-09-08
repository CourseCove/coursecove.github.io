// CourseCove/js/render-ai-ml.js
// Mirrors render-courses.js pagination behavior and ensures cards actually render.

(() => {
  // ---- CONFIG ----
  const CANDIDATE_JSON_PATHS = [
    "./json/ai-ml-courses.json",
    "json/ai-ml-courses.json",
    "/CourseCove/json/ai-ml-courses.json"
  ];
  const PER_PAGE = 12;

  // ---- DOM ----
  const coursesEl = document.getElementById("courses") || document.querySelector(".courses") || document.querySelector("#course-list");
  const paginationEl = document.getElementById("pagination") || document.querySelector(".pagination") || document.querySelector("#pager");

  if (!coursesEl) {
    console.error("[render-ai-ml] Missing #courses container.");
  }
  if (!paginationEl) {
    console.error("[render-ai-ml] Missing #pagination container.");
  }

  // ---- State ----
  let courses = [];
  let currentPage = 1;
  let totalPages = 1;

  // ---- Utils ----
  // Try multiple paths so a wrong relative path won't silently fail.
  async function fetchFirstAvailable(paths) {
    let lastErr;
    for (const p of paths) {
      try {
        const res = await fetch(p, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr || new Error("Unable to fetch JSON");
  }

  function coerceArray(data) {
    // Accept either an array or an object with { courses: [...] }
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.courses)) return data.courses;
    return [];
  }

  // Responsive: fewer neighbors on small screens
  function deltaByWidth() {
    const w = window.innerWidth || document.documentElement.clientWidth || 1024;
    if (w < 420) return 1;   // phone
    if (w < 768) return 2;   // tablet
    return 3;                // desktop
  }

  // Build compact page list with ellipses, identical to math logic
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

  // Optional: hydrate from ?page=
  function initPageFromURL() {
    try {
      const u = new URL(location.href);
      const p = parseInt(u.searchParams.get("page") || "1", 10);
      if (!Number.isNaN(p) && p >= 1) currentPage = p;
    } catch { /* noop */ }
  }

  function updateURLPageParam() {
    try {
      const u = new URL(location.href);
      u.searchParams.set("page", String(currentPage));
      history.replaceState({}, "", u);
    } catch { /* noop */ }
  }

  // ---- Rendering ----
  function renderCourses() {
    if (!coursesEl) return;
    const start = (currentPage - 1) * PER_PAGE;
    const end = start + PER_PAGE;
    const slice = courses.slice(start, end);

    coursesEl.innerHTML = slice.map(c => {
      const title = c.title ?? "";
      const url = c.url ?? "#";
      const desc = c.description ?? "";
      const instructor = c.instructor ?? "—";
      const rating = c.rating ?? "—";
      const level = c.level ?? "—";
      const duration = c.duration ?? "—";
      const price = c.price ?? "—";
      const image = c.image || "";

      // Match the card structure you use elsewhere; image is optional.
      return `
        <article class="card">
          <a href="${url}" target="_blank" rel="noopener">
            ${image ? `<img src="${image}" alt="${title}" loading="lazy">` : ""}
            <h3>${title}</h3>
          </a>
          <p>${desc}</p>
          <p><strong>Instructor:</strong> ${instructor}</p>
          <p><strong>Rating:</strong> ${rating}</p>
          <p><strong>Level:</strong> ${level}</p>
          <p><strong>Duration:</strong> ${duration}</p>
          <p><strong>Price:</strong> ${price}</p>
        </article>
      `;
    }).join("");

    // If nothing rendered, show a friendly message
    if (!slice.length) {
      coursesEl.innerHTML = `<p style="text-align:center;opacity:.7">No courses found.</p>`;
    }
  }

  function addBtn(label, onClick, { title, aria, disabled, active } = {}) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = String(label);
    if (title) b.title = title;
    if (aria) b.setAttribute("aria-label", aria);
    if (disabled) b.disabled = true;
    if (active) b.classList.add("active");
    if (onClick) b.addEventListener("click", onClick);
    paginationEl.appendChild(b);
  }

  function addDots() {
    const s = document.createElement("span");
    s.className = "ellipsis";
    s.textContent = "…";
    s.setAttribute("aria-hidden", "true");
    paginationEl.appendChild(s);
  }

  function renderPagination() {
    if (!paginationEl) return;
    const delta = deltaByWidth();
    const pages = buildPageList(currentPage, totalPages, delta);

    paginationEl.innerHTML = "";

    // First «
    addBtn("«", () => gotoPage(1), {
      title: "First page",
      aria: "Go to first page",
      disabled: currentPage === 1
    });

    // Prev ‹
    addBtn("‹", () => gotoPage(currentPage - 1), {
      title: "Previous page",
      aria: "Go to previous page",
      disabled: currentPage === 1
    });

    // Numbered + ellipses
    pages.forEach(p => {
      if (p === "...") return addDots();
      addBtn(p, () => gotoPage(p), {
        aria: `Go to page ${p}`,
        active: p === currentPage
      });
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

  function gotoPage(n) {
    const target = Math.max(1, Math.min(totalPages, n));
    if (target === currentPage) return;
    currentPage = target;
    renderCourses();
    renderPagination();
    updateURLPageParam();
    if (coursesEl && coursesEl.scrollIntoView) {
      coursesEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function attachKeyboardNav() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft" && currentPage > 1) gotoPage(currentPage - 1);
      if (e.key === "ArrowRight" && currentPage < totalPages) gotoPage(currentPage + 1);
    });
  }

  function onResizeRecompute() {
    window.addEventListener("resize", () => {
      // Rebuild the bar with new delta window
      renderPagination();
    });
  }

  // ---- Init ----
  (async function init() {
    try {
      const data = await fetchFirstAvailable(CANDIDATE_JSON_PATHS);
      courses = coerceArray(data);
      totalPages = Math.max(1, Math.ceil(courses.length / PER_PAGE));
      initPageFromURL();
      if (currentPage > totalPages) currentPage = totalPages;
      renderCourses();
      renderPagination();
      attachKeyboardNav();
      onResizeRecompute();
    } catch (err) {
      console.error("[render-ai-ml] Failed to load courses JSON:", err);
      if (coursesEl) {
        coursesEl.innerHTML = `<p style="text-align:center;color:#b91c1c">Failed to load AI/ML courses.</p>`;
      }
    }
  })();
})();
