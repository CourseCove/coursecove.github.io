let allCourses = [];
let filteredCourses = [];
let currentPage = 1;
const itemsPerPage = 12;

const courseContainer = document.getElementById('course-container');
const paginationContainer = document.getElementById('pagination');
const filters = document.getElementById('filters');
const searchBar = document.getElementById('searchBar');

async function loadCourses() {
  try {
    const response = await fetch(`json/languages-courses.json?t=${Date.now()}`);
    allCourses = await response.json();
    filteredCourses = allCourses;
    renderCourses();
    setupEventListeners();
  } catch (err) {
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
  const query = searchBar.value.toLowerCase();
  const selectedProviders = [...filters.querySelectorAll('input[name="provider"]:checked')].map(i => i.value.toLowerCase());

  filteredCourses = allCourses.filter(course => {
    const matchesQuery =
      (course.title || '').toLowerCase().includes(query) ||
      (course.url || '').toLowerCase().includes(query) ||
      (course.provider || '').toLowerCase().includes(query);

    const provider = (course.provider || '').toLowerCase();
    const matchesProvider = selectedProviders.length === 0 || selectedProviders.includes(provider);

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
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  if (totalPages <= 1) return;

  const createBtn = (label, page, disabled = false) => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-outline-primary me-2';
    btn.textContent = label;
    btn.disabled = disabled;
    btn.onclick = () => {
      if (!disabled && page !== currentPage) {
        currentPage = page;
        renderCourses();
      }
    };
    return btn;
  };

  // Skip to first
  paginationContainer.appendChild(createBtn('«', 1, currentPage === 1));

  // Previous
  paginationContainer.appendChild(createBtn('‹', currentPage - 1, currentPage === 1));

  // Page numbers (max 5 visible)
  let start = Math.max(1, currentPage - 2);
  let end = Math.min(totalPages, currentPage + 2);
  if (currentPage <= 2) end = Math.min(totalPages, 5);
  if (currentPage >= totalPages - 1) start = Math.max(1, totalPages - 4);

  for (let i = start; i <= end; i++) {
    const btn = createBtn(i, i);
    if (i === currentPage) {
      btn.disabled = true;
      btn.classList.add('active');
    }
    paginationContainer.appendChild(btn);
  }

  // Next
  paginationContainer.appendChild(createBtn('›', currentPage + 1, currentPage === totalPages));

  // Skip to last
  paginationContainer.appendChild(createBtn('»', totalPages, currentPage === totalPages));
}

// Initialize
document.addEventListener('DOMContentLoaded', loadCourses);
