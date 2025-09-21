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
    const response = await fetch(`json/math-courses.json?t=${Date.now()}`);
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

  // Get selected providers (Coursera, Udemy, etc.)
  const selectedProviders = [...filters.querySelectorAll('input[name="provider"]:checked')]
    .map(el => el.value.toLowerCase());

  filteredCourses = allCourses.filter(course => {
    // Search only in title
    const matchesQuery = query === '' || course.title.toLowerCase().includes(query);

    // Provider filter
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
            <a href="${course.link}" target="_blank" class="btn btn-primary btn-sm">Go to course</a>
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
  const maxVisiblePages = 11; // Current page ±5 + first + last

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

  if (totalPages <= 1) return;

  // Previous Arrow
  createPageItem(currentPage - 1, '«', false, currentPage === 1);

  // Always show first page
  createPageItem(1, '1', currentPage === 1);

  // Ellipsis before current range
  if (currentPage > 6) {
    const li = document.createElement('li');
    li.className = 'page-item disabled';
    li.innerHTML = `<span class="page-link">...</span>`;
    paginationContainer.appendChild(li);
  }

  // Pages around currentPage
  const start = Math.max(2, currentPage - 5);
  const end = Math.min(totalPages - 1, currentPage + 5);
  for (let i = start; i <= end; i++) {
    createPageItem(i, `${i}`, currentPage === i);
  }

  // Ellipsis after current range
  if (currentPage < totalPages - 5) {
    const li = document.createElement('li');
    li.className = 'page-item disabled';
    li.innerHTML = `<span class="page-link">...</span>`;
    paginationContainer.appendChild(li);
  }

  // Always show last page
  if (totalPages > 1) {
    createPageItem(totalPages, `${totalPages}`, currentPage === totalPages);
  }

  // Next Arrow
  createPageItem(currentPage + 1, '»', false, currentPage === totalPages);
}

loadCourses();
