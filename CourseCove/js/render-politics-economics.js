/* Robust course list + pagination + search/filter script
   Expects:
     - #course-container  (container where results will be injected)
     - #pagination        (container for pagination buttons)
     - #filters           (optional: container with provider/level/duration checkboxes)
     - #searchBar         (optional input[type="text"] for search)
   Fetches: json/politics-economics-courses.json?t=TIMESTAMP
   Renders: simple <ul> of <li><a>Course Title</a></li>
*/

const courseContainer = document.getElementById('course-container') || createFallback('course-container');
const paginationContainer = document.getElementById('pagination') || createFallback('pagination');
const filters = document.getElementById('filters'); // optional
const searchBar = document.getElementById('searchBar'); // optional

let allCourses = [];
let filteredCourses = [];
let currentPage = 1;
const itemsPerPage = 12;
const maxPageButtons = 5; // window size for page numbers

function createFallback(id) {
  // create a harmless placeholder if element is missing so script doesn't break
  const el = document.createElement('div');
  el.id = id;
  // don't automatically append filters or search fallback; just append containers for results/pagination
  document.body.appendChild(el);
  return el;
}

document.addEventListener('DOMContentLoaded', loadCourses);

async function loadCourses() {
  try {
    const res = await fetch(`json/politics-economics-courses.json?t=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = await res.json();

    // normalize data to a flat array of objects with at least { title, url }
    allCourses = normalizeData(raw);
    // remove empty entries and duplicates
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
  // If it's already an array of course objects, return it
  if (Array.isArray(data)) {
    return data;
  }

  // If it's { categories: [ { name, courses: [...] } ] }
  if (data && Array.isArray(data.categories)) {
    const out = [];
    data.categories.forEach(cat => {
      if (Array.isArray(cat.courses)) {
        cat.courses.forEach(c => {
          // attach category if desired: c._category = cat.name
          out.push(c);
        });
      }
    });
    return out;
  }

  // If it's { courses: [...] }
  if (data && Array.isArray(data.courses)) {
    return data.courses;
  }

  // Unexpected shape — try to extract any nested arrays
  // (best-effort)
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
    if (!title || !url) return; // skip if missing required fields
    // normalize URL (simple)
    const normUrl = url.startsWith('http') ? url : `https://${url.replace(/^\/+/, '')}`;
    if (seen.has(normUrl)) return;
    seen.add(normUrl);
    out.push({
      title,
      url: normUrl,
      // keep optional fields for filtering if present
      description: (item.description || '').toString(),
      instructor: (item.instructor || '').toString(),
      provider: (item.provider || '').toString(),
      level: (item.level || '').toString(),
      duration: (item.duration || '').toString()
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

  // Accessibility: keyboard support for pagination container (delegation)
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

  const selectedLevels = filters
    ? [...filters.querySelectorAll('input[name="level"]:checked')].map(el => el.value.toLowerCase())
    : [];

  const selectedDurations = filters
    ? [...filters.querySelectorAll('input[name="duration"]:checked')].map(el => el.value)
    : [];

  filteredCourses = allCourses.filter(course => {
    const titleMatch = course.title.toLowerCase().includes(query);
    const descMatch = (course.description || '').toLowerCase().includes(query);
    const instructorMatch = (course.instructor || '').toLowerCase().includes(query);
    const matchesQuery = query === '' || titleMatch || descMatch || instructorMatch;

    const matchesProvider = selectedProviders.length === 0 || (course.provider && selectedProviders.includes(course.provider.toLowerCase()));
    const matchesLevel = selectedLevels.length === 0 || (course.level && selectedLevels.includes(course.level.toLowerCase()));

    const matchesDuration = (() => {
      if (selectedDurations.length === 0) return true;
      const hours = parseFloat(course.duration) || 0;
      return selectedDurations.some(d => {
        if (d === '<2') return hours < 2;
        if (d === '2-5') return hours >= 2 && hours <= 5;
        if (d === '>5') return hours > 5;
        return false;
      });
    })();

    return matchesQuery && matchesProvider && matchesLevel && matchesDuration;
  });

  // ensure currentPage valid after filtering
  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / itemsPerPage));
  if (currentPage > totalPages) currentPage = totalPages;
  renderCourses();
}

function renderCourses() {
  // clear
  courseContainer.innerHTML = '';

  if (!Array.isArray(filteredCourses) || filteredCourses.length === 0) {
    courseContainer.innerHTML = '<p>No courses found.</p>';
    paginationContainer.innerHTML = '';
    return;
  }

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageItems = filteredCourses.slice(start, end);

  // Create an accessible list and append simple list items (title + link)
  const ul = document.createElement('ul');
  ul.style.listStyle = 'none';
  ul.style.padding = '0';
  ul.style.margin = '0';

  pageItems.forEach(course => {
    const li = document.createElement('li');
    li.style.padding = '8px 0';
    li.style.borderBottom = '1px solid #eee';

    const a = document.createElement('a');
    a.href = course.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = course.title;
    a.style.textDecoration = 'none';
    a.style.color = '#0d6efd';

    li.appendChild(a);
    ul.appendChild(li);
  });

  courseContainer.appendChild(ul);

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

  // Helper to create a button
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

  // First / Prev
  if (currentPage > 1) {
    paginationContainer.appendChild(mkBtn('« First', 'first'));
    paginationContainer.appendChild(mkBtn('‹ Prev', 'prev'));
  }

  // Page number window
  let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
  // ensure window size
  if (endPage - startPage + 1 < maxPageButtons) {
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    const isCurrent = i === currentPage;
    const btn = mkBtn(i.toString(), 'goto', i, isCurrent);
    if (isCurrent) {
      btn.classList.add('active');
    }
    paginationContainer.appendChild(btn);
  }

  // Next / Last
  if (currentPage < totalPages) {
    paginationContainer.appendChild(mkBtn('Next ›', 'next'));
    paginationContainer.appendChild(mkBtn('Last »', 'last'));
  }
}
