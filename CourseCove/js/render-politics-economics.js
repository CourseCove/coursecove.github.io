/* Robust course list + pagination + search/filter script
   Expects:
     - #course-container  (container where results will be injected)
     - #pagination        (container for pagination buttons)
     - #filters           (optional: container with provider checkboxes)
     - #searchBar         (optional input[type="text"] for search)
   Fetches: json/politics-economics-courses.json?t=TIMESTAMP
   Renders: cards with title + provider + link
*/

const courseContainer = document.getElementById('course-container') || createFallback('course-container');
const paginationContainer = document.getElementById('pagination') || createFallback('pagination');
const filters = document.getElementById('filters'); // provider checkboxes only
const searchBar = document.getElementById('searchBar'); // optional

let allCourses = [];
let filteredCourses = [];
let currentPage = 1;
const itemsPerPage = 12;
const maxPageButtons = 5; // window size for page numbers

function createFallback(id) {
  const el = document.createElement('div');
  el.id = id;
  document.body.appendChild(el);
  return el;
}

document.addEventListener('DOMContentLoaded', loadCourses);

async function loadCourses() {
  try {
    const res = await fetch(`json/politics-economics-courses.json?t=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = await res.json();

    allCourses = normalizeData(raw);
    allCourses = dedupeAndClean(allCourses);

    filteredCourses = allCourses.slice();
    renderCourses();
    setupEventListeners();
  } catch (err) {
    console.error('Failed to load or parse courses JSON:', err);
    courseContainer.innerHTML = '<p class="text-danger">Failed to load courses.</p>';
    paginationContainer.innerHTML = '';
  }
}

function normalizeData(data) {
  if (Array.isArray(data)) return data;

  if (data && Array.isArray(data.categories)) {
    const out = [];
    data.categories.forEach(cat => {
      if (Array.isArray(cat.courses)) out.push(...cat.courses);
    });
    return out;
  }

  if (data && Array.isArray(data.courses)) return data.courses;

  const candidates = [];
  Object.values(data || {}).forEach(v => {
    if (Array.isArray(v)) candidates.push(...v);
  });
  return candidates.length ? candidates : [];
}

function dedupeAndClean(arr) {
  const seen = new Set();
  const out = [];
  arr.forEach(item => {
    if (!item || typeof item !== 'object') return;
    const title = (item.title || '').toString().trim();
    const url = (item.url || item.link || '').toString().trim();
    if (!title || !url) return;
    const normUrl = url.startsWith('http') ? url : `https://${url.replace(/^\/+/, '')}`;
    if (seen.has(normUrl)) return;
    seen.add(normUrl);
    out.push({
      title,
      url: normUrl,
      provider: (item.provider || '').toString().trim()
    });
  });
  return out;
}

function setupEventListeners() {
  if (searchBar) {
    searchBar.addEventListener('input', () => {
      currentPage = 1;
      applyFilters();
    });
  }

  if (filters) {
    filters.addEventListener('change', () => {
      currentPage = 1;
      applyFilters();
    });
  }

  paginationContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    if (action === 'first') { currentPage = 1; renderCourses(); }
    else if (action === 'prev') { currentPage = Math.max(1, currentPage - 1); renderCourses(); }
    else if (action === 'next') {
      const totalPages = Math.ceil(filteredCourses.length / itemsPerPage) || 1;
      currentPage = Math.min(totalPages, currentPage + 1); renderCourses();
    }
    else if (action === 'last') {
      const totalPages = Math.ceil(filteredCourses.length / itemsPerPage) || 1;
      currentPage = totalPages; renderCourses();
    }
    else if (action === 'goto') {
      const p = parseInt(btn.getAttribute('data-page'), 10);
      if (!Number.isNaN(p)) { currentPage = p; renderCourses(); }
    }
  });
}

function applyFilters() {
  const query = (searchBar && searchBar.value || '').trim().toLowerCase();

  const selectedProviders = filters 
    ? [...filters.querySelectorAll('input[name="provider"]:checked')].map(el => el.value.toLowerCase())
    : [];

  filteredCourses = allCourses.filter(course => {
    const matchesQuery =
      course.title.toLowerCase().includes(query) ||
      (course.url || '').toLowerCase().includes(query) ||
      (course.provider || '').toLowerCase().includes(query);

    const matchesProvider = selectedProviders.length === 0 || 
      (course.provider && selectedProviders.includes(course.provider.toLowerCase()));

    return matchesQuery && matchesProvider;
  });

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / itemsPerPage));
  if (currentPage > totalPages) currentPage = totalPages;
  renderCourses();
}

function renderCourses() {
  courseContainer.innerHTML = '';
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageItems = filteredCourses.slice(start, end);

  if (pageItems.length === 0) {
    courseContainer.innerHTML = '<p>No courses found.</p>';
    paginationContainer.innerHTML = '';
    return;
  }

  pageItems.forEach(course => {
    const card = document.createElement('div');
    card.className = 'col';
    card.innerHTML = `
      <div class="card h-100 shadow-sm">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${course.title}</h5>
          <p class="card-text flex-grow-1"><strong>Provider:</strong> ${course.provider}</p>
          <div class="d-flex justify-content-between align-items-center mt-2">
            <a href="${course.url}" target="_blank" class="btn btn-primary btn-sm">Go to course</a>
          </div>
        </div>
      </div>
    `;
    courseContainer.appendChild(card);
  });

  renderPagination();
}

function renderPagination() {
  paginationContainer.innerHTML = '';
  paginationContainer.style.display = 'flex';
  paginationContainer.style.flexWrap = 'wrap';
  paginationContainer.style.gap = '8px';
  paginationContainer.style.alignItems = 'center';

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage) || 1;
  if (totalPages <= 1) return;

  function mkBtn(label, action, page = null, disabled = false) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-outline-primary';
    btn.style.padding = '6px 10px';
    if (disabled) btn.disabled = true;
    btn.setAttribute('data-action', action);
    if (action === 'goto' && page != null) btn.setAttribute('data-page', page);
    btn.textContent = label;
    return btn;
  }

  if (currentPage > 1) {
    paginationContainer.appendChild(mkBtn('« First', 'first'));
    paginationContainer.appendChild(mkBtn('‹ Prev', 'prev'));
  }

  let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
  if (endPage - startPage + 1 < maxPageButtons) {
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    const isCurrent = i === currentPage;
    const btn = mkBtn(i.toString(), 'goto', i, isCurrent);
    if (isCurrent) btn.classList.add('active');
    paginationContainer.appendChild(btn);
  }

  if (currentPage < totalPages) {
    paginationContainer.appendChild(mkBtn('Next ›', 'next'));
    paginationContainer.appendChild(mkBtn('Last »', 'last'));
  }
}
