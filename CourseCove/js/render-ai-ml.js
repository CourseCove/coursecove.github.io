document.addEventListener("DOMContentLoaded", () => {
  // ------- Config -------
  const COURSES_PER_PAGE = 6;
  const DATA_FILE = "ai-ml.json";

  // ------- Helpers -------
  const byId = (id) => document.getElementById(id);
  const q = (sel) => document.querySelector(sel);
  const make = (tag, cls) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    return el;
  };

  // Try common paths so it works on Netlify (/coursecove/…) and locally
  async function fetchFirstOk(urls) {
    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (res.ok) return await res.json();
      } catch (e) {
        // ignore and try next
      }
    }
    throw new Error("Could not load AI/ML data from any known path.");
  }

  // Resolve containers (create if the page didn't include them)
  function resolveContainers() {
    let list =
      byId("course-list") ||
      q(".course-list") ||
      byId("courses-container") ||
      byId("cards-grid") ||
      q("#cards, .cards");

    if (!list) {
      const main = q("main") || document.body;
      const section = make("section");
      const h = make("h2");
      h.textContent = "Courses";
      list = make("div");
      list.id = "course-list";
      section.appendChild(h);
      section.appendChild(list);
      main.appendChild(section);
    }

    let pager =
      byId("pagination") || q(".pagination") || q("#pager") || null;

    if (!pager) {
      pager = make("nav");
      pager.id = "pagination";
      list.after(pager);
    }

    return { list, pager };
  }

  // Inject minimal CSS so pagination fits nicely without relying on site CSS
  function injectPaginationCSS() {
    if (document.getElementById("ai-ml-pagination-css")) return;
    const style = make("style");
    style.id = "ai-ml-pagination-css";
    style.textContent = `
      #pagination, .pagination {
        display: flex; flex-wrap: wrap; gap: .5rem; justify-content: center; align-items: center; margin: 1.25rem 0;
      }
      #pagination button, .pagination button {
        border: 1px solid #ddd; padding: .5rem .75rem; min-width: 2.25rem; border-radius: .5rem; cursor: pointer; background: #fff;
      }
      #pagination button[disabled] { opacity: .5; cursor: not-allowed; }
      #pagination button.active { font-weight: 700; border-color: #333; }
      #pagination .ellipsis { pointer-events: none; border: none; background: transparent; min-width: auto; padding: 0 .25rem; }
      .course-card {
        display: flex; flex-direction: column; border: 1px solid #eee; border-radius: .75rem; overflow: hidden; padding: 1rem; gap: .5rem;
        background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.04);
      }
      .course-card img { width: 100%; height: 160px; object-fit: cover; border-radius: .5rem; }
      .course-grid {
        display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      }
      .course-link { display:inline-block; text-decoration:none; border:1px solid #222; padding:.5rem .75rem; border-radius:.5rem; }
    `;
    document.head.appendChild(style);
  }

  // Card template (robust to missing fields)
  function courseCardHTML(c) {
    const img = c.image || c.thumbnail || c.cover || "https://via.placeholder.com/640x360?text=Course";
    const title = c.title || c.name || "Untitled course";
    const desc = c.description || c.summary || "";
    const inst = c.instructor || c.author || c.provider || "";
    const level = c.level ? `<p><strong>Level:</strong> ${c.level}</p>` : "";
    const duration = c.duration ? `<p><strong>Duration:</strong> ${c.duration}</p>` : "";
    const rating = c.rating ? `<p><strong>Rating:</strong> ${c.rating}</p>` : "";
    const price = c.price ? `<p><strong>Price:</strong> ${c.price}</p>` : "";
    const url = c.url || c.link || "#";

    return `
      <div class="course-card">
        <img src="${img}" alt="${title}">
        <h3>${title}</h3>
        ${desc ? `<p>${desc}</p>` : ""}
        ${inst ? `<p><strong>Instructor/Provider:</strong> ${inst}</p>` : ""}
        ${level}${duration}${rating}${price}
        <a href="${url}" target="_blank" rel="noopener" class="course-link">View Course</a>
      </div>
    `;
  }

  // Windowed page numbers: keep it compact so it fits the page
  function buildPageRange(current, total, window = 7) {
    const pages = [];
    const add = (p) => pages.push(p);
    const addEllipsis = () => pages.push("…");

    if (total <= window) {
      for (let i = 1; i <= total; i++) add(i);
      return pages;
    }

    const first = 1;
    const last = total;
    const range = 2; // numbers around current

    add(first);
    if (current > first + range + 1) addEllipsis();

    const start = Math.max(first + 1, current - range);
    const end = Math.min(last - 1, current + ra
