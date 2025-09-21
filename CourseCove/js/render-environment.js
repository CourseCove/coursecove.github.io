const courseContainer = document.getElementById('course-container');
const paginationContainer = document.getElementById('pagination');
const filters = document.getElementById('filters');
const searchBar = document.getElementById('searchBar');

let allCourses = [];
let filteredCourses = [];
let currentPage = 1;
const itemsPerPage = 12;

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

  currentPage = 1; // Reset page after filter
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
  if (currentPage < 1) currentPage = 1;

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const arr = filteredCourses.slice(start, end);

  arr.forEach(c => {
    const rt = Math.round(c.rating || 0);
    const stars = '⭐'.repeat(rt) + '☆'.repeat(5 - rt);
    const card = document.createElement('div');
    card.className = 'col mb-4';
    card.innerHTML = `
      <div class="card h-100 shadow-sm">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${c.title}</h5>
          <p class="card-text flex-grow-1">${c.description}</p>
          <div class="d-flex justify-content-between align-items-center mt-2">
            <span>${stars}</span>
            <a href="${c.url}" target="_blank" class="btn btn-primary btn-sm">Go to course</a>
          </div>
        </div>
      </div>`;
    courseContainer.appendChild(card);
  });

  // Pagination with limited page buttons
  const totalPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(totalPagesToShow / 2));
  let endPage = startPage + totalPagesToShow - 1;
  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - totalPagesToShow + 1);
  }

  // Prev button
  const prev = document.createElement('li');
  prev.className = 'page-item' + (currentPage === 1 ? ' disabled' : '');
  prev.innerHTML = `<a href="#" class="page-link">Prev</a>`;
  prev.addEventListener('click', e => {
    e.preventDefault();
    if (currentPage > 1) {
      currentPage--;
      renderCourses();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
  paginationContainer.appendChild(prev);

  // Page buttons
  for (let i = startPage; i <= endPage; i++) {
    const li = document.createElement('li');
    li.className = 'page-item' + (i === currentPage ? ' active' : '');
    li.innerHTML = `<a href="#" class="page-link">${i}</a>`;
    li.addEventListener('click', e => {
      e.preventDefault();
      currentPage = i;
      renderCourses();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    paginationContainer.appendChild(li);
  }

  // Next button
  const next = document.createElement('li');
  next.className = 'page-item' + (currentPage === totalPages ? ' disabled' : '');
  next.innerHTML = `<a href="#" class="page-link">Next</a>`;
  next.addEventListener('click', e => {
    e.preventDefault();
    if (currentPage < totalPages) {
      currentPage++;
      renderCourses();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
  paginationContainer.appendChild(next);
}

loadCourses();
