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
    const response = await fetch(`json/ai-ml-courses.json?t=${Date.now()}`);
    allCourses = await response.json();
    filteredCourses = allCourses;
    renderCourses();
    setupEventListeners();
  } catch (error) {
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
  const query = searchBar.value.trim().toLowerCase();
  const selectedProviders = [...filters.querySelectorAll('input[name="provider"]:checked')]
    .map(el => el.value.toLowerCase());

  filteredCourses = allCourses.filter(course => {
    const titleMatch = course.title.toLowerCase().includes(query);
    const matchesQuery = query === '' || titleMatch;

    const matchesProvider =
      selectedProviders.length === 0 ||
      (course.provider && selectedProviders.includes(course.provider.toLowerCase()));

    return matchesQuery && matchesProvider;
  });

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
            <a href="${course.link || course.url}" target="_blank" class="btn btn-primary btn-sm">Go to course</a>
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
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  if (totalPages <= 1) return;

  const createPageItem = (page, text = null, active = false, disabled = false) => {
    const li = document.createElement('li');
    li.className = `page-item${active ? ' active' : ''}${disabled ? ' disabled' : ''}`;
    li.innerHTML = `<a href="#" class="page-link">${text || page}</a>`;
    if (!disabled && !active) {
      li.addEventListener('click', e => {
        e.preventDefault();
        currentPage = page;
        renderCourses();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
    paginationContainer.appendChild(li);
  };

  // Previous button
  createPageItem(currentPage - 1, '«', false, currentPage === 1);

  const maxVisible = 2; // how many pages around the current one
  let startPage = Math.max(2, currentPage - maxVisible);
  let endPage = Math.min(totalPages - 1, currentPage + maxVisible);

  // Always show first page
  createPageItem(1, '1', currentPage === 1);

  // Ellipsis before middle pages
  if (startPage > 2) {
    const dots = document.createElement('li');
    dots.className = 'page-item disabled';
    dots.innerHTML = `<span class="page-link">…</span>`;
    paginationContainer.appendChild(dots);
  }

  // Middle pages
  for (let i = startPage; i <= endPage; i++) {
    createPageItem(i, `${i}`, currentPage === i);
  }

  // Ellipsis after middle pages
  if (endPage < totalPages - 1) {
    const dots = document.createElement('li');
    dots.className = 'page-item disabled';
    dots.innerHTML = `<span class="page-link">…</span>`;
    paginationContainer.appendChild(dots);
  }

  // Always show last page
  if (totalPages > 1) {
    createPageItem(totalPages, `${totalPages}`, currentPage === totalPages);
  }

  // Next button
  createPageItem(currentPage + 1, '»', false, currentPage === totalPages);
}

loadCourses();
