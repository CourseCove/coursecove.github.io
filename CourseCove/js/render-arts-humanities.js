const courseContainer = document.getElementById('course-container');
const paginationContainer = document.getElementById('pagination');
const filters = document.getElementById('filters');
const searchBar = document.getElementById('searchBar');

let allCourses = [];
let filteredCourses = [];
let currentPage = 1;
const itemsPerPage = 12;
const maxPageButtons = 5; // How many page numbers to show at once

async function loadCourses() {
  try {
    const resp = await fetch(`json/arts-humanities-courses.json?t=${Date.now()}`);
    allCourses = await resp.json();
    filteredCourses = allCourses;
    setupEventListeners();
    renderCourses();
  } catch (e) {
    courseContainer.innerHTML = '<p class="text-danger">Failed to load courses.</p>';
  }
}

function setupEventListeners() {
  searchBar.addEventListener('input', () => {
    currentPage = 1;
    applyFilters();
  });
  filters.addEventListener('change', () => {
    currentPage = 1;
    applyFilters();
  });
}

function applyFilters() {
  const q = searchBar.value.trim().toLowerCase();
  const selProv = [...filters.querySelectorAll('input[name="provider"]:checked')].map(i => i.value.toLowerCase());
  const selLev = [...filters.querySelectorAll('input[name="level"]:checked')].map(i => i.value.toLowerCase());
  const selDur = [...filters.querySelectorAll('input[name="duration"]:checked')].map(i => i.value);

  filteredCourses = allCourses.filter(c => {
    const t = c.title.toLowerCase(), d = c.description.toLowerCase(), instr = (c.instructor||'').toLowerCase();
    const mQ = !q || t.includes(q) || d.includes(q) || instr.includes(q);
    const prov = (c.provider||'').toLowerCase(), lev = (c.level||'').toLowerCase();
    const mProv = !selProv.length || selProv.includes(prov);
    const mLev = !selLev.length || selLev.includes(lev);
    const hrs = parseFloat(c.duration) || 0;
    const mDur = !selDur.length || selDur.some(r => r===' <2'? hrs<2 : r==='2-5'? hrs>=2&&hrs<=5 : hrs>5);
    return mQ && mProv && mLev && mDur;
  });

  renderCourses();
}

function renderCourses() {
  courseContainer.innerHTML = '';
  paginationContainer.innerHTML = '';

  if (filteredCourses.length === 0) {
    courseContainer.innerHTML = '<p>No courses found.</p>';
    return;
  }

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const arr = filteredCourses.slice(start, end);

  arr.forEach(c => {
    const rt = Math.round(c.rating || 0);
    const stars = '⭐'.repeat(rt) + '☆'.repeat(5-rt);
    const card = document.createElement('div');
    card.className = 'col';
    card.innerHTML = `
      <div class="card h-100 shadow-sm">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${c.title}</h5>
          <p class="card-text flex-grow-1">${c.description}</p>
          <div class="d-flex justify-content-between align-items-center mt-2">
            <a href="${c.url}" target="_blank" class="btn btn-primary btn-sm">Go to course</a>
          </div>
        </div>
      </div>`;
    courseContainer.appendChild(card);
  });

  // --- Pagination ---
  const ul = document.createElement('ul');
  ul.className = 'pagination justify-content-center';

  // Skip to first
  const firstLi = document.createElement('li');
  firstLi.className = 'page-item' + (currentPage === 1 ? ' disabled' : '');
  firstLi.innerHTML = `<a class="page-link" href="#">&laquo;</a>`;
  firstLi.addEventListener('click', e => {
    e.preventDefault();
    currentPage = 1;
    renderCourses();
    window.scrollTo({top:0, behavior:'smooth'});
  });
  ul.appendChild(firstLi);

  // Previous
  const prevLi = document.createElement('li');
  prevLi.className = 'page-item' + (currentPage === 1 ? ' disabled' : '');
  prevLi.innerHTML = `<a class="page-link" href="#">&#8249;</a>`;
  prevLi.addEventListener('click', e => {
    e.preventDefault();
    if (currentPage > 1) {
      currentPage--;
      renderCourses();
      window.scrollTo({top:0, behavior:'smooth'});
    }
  });
  ul.appendChild(prevLi);

  // Page numbers (show currentPage ± 2)
  const half = Math.floor(maxPageButtons / 2);
  let startPage = Math.max(1, currentPage - half);
  let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
  if (endPage - startPage < maxPageButtons - 1) {
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    const li = document.createElement('li');
    li.className = 'page-item' + (i === currentPage ? ' active' : '');
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.addEventListener('click', e => {
      e.preventDefault();
      currentPage = i;
      renderCourses();
      window.scrollTo({top:0, behavior:'smooth'});
    });
    ul.appendChild(li);
  }

  // Next
  const nextLi = document.createElement('li');
  nextLi.className = 'page-item' + (currentPage === totalPages ? ' disabled' : '');
  nextLi.innerHTML = `<a class="page-link" href="#">&#8250;</a>`;
  nextLi.addEventListener('click', e => {
    e.preventDefault();
    if (currentPage < totalPages) {
      currentPage++;
      renderCourses();
      window.scrollTo({top:0, behavior:'smooth'});
    }
  });
  ul.appendChild(nextLi);

  // Skip to last
  const lastLi = document.createElement('li');
  lastLi.className = 'page-item' + (currentPage === totalPages ? ' disabled' : '');
  lastLi.innerHTML = `<a class="page-link" href="#">&raquo;</a>`;
  lastLi.addEventListener('click', e => {
    e.preventDefault();
    currentPage = totalPages;
    renderCourses();
    window.scrollTo({top:0, behavior:'smooth'});
  });
  ul.appendChild(lastLi);

  paginationContainer.appendChild(ul);
}

loadCourses();
