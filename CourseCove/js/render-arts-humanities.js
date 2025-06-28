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

  const start = (currentPage - 1)*itemsPerPage;
  const end = start + itemsPerPage;
  const arr = filteredCourses.slice(start, end);

  arr.forEach(c => {
    const rt = Math.round(c.rating || 0);
    const stars = '⭐'.repeat(rt) + '☆'.repeat(5-rt);
    const card = document.createElement('div');
    card.className = 'col';
    card.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${c.image||'images/default-course.jpg'}" class="card-img-top" alt="${c.title}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${c.title}</h5>
          <h6 class="card-subtitle mb-2">${c.instructor || c.provider || 'Unknown'}</h6>
          <div class="rating mb-2">${stars} (${(c.rating||0).toFixed(1)})</div>
          <p class="card-text flex-grow-1">${c.description}</p>
          <div class="d-flex justify-content-between align-items-center mt-2">
            <span class="price fw-bold">${c.price||'Free'}</span>
            <a href="${c.url}" target="_blank" class="btn btn-primary btn-sm">Go to course</a>
          </div>
        </div>
      </div>`;
    courseContainer.appendChild(card);
  });

  for (let i=1; i<=Math.ceil(filteredCourses.length/itemsPerPage); i++) {
    const li = document.createElement('li');
    li.className = 'page-item' + (i===currentPage? ' active':'');
    li.innerHTML = `<a href="#" class="page-link">${i}</a>`;
    li.addEventListener('click', e => {
      e.preventDefault();
      currentPage = i;
      renderCourses();
      window.scrollTo({top:0, behavior:'smooth'});
    });
    paginationContainer.appendChild(li);
  }
}

loadCourses();
