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
  const selectedLevels = [...filters.querySelectorAll('input[name="level"]:checked')].map(i => i.value.toLowerCase());
  const selectedDurations = [...filters.querySelectorAll('input[name="duration"]:checked')].map(i => i.value);

  filteredCourses = allCourses.filter(course => {
    const matchesQuery =
      course.title.toLowerCase().includes(query) ||
      course.description.toLowerCase().includes(query) ||
      (course.keywords || []).some(k => k.toLowerCase().includes(query));

    const provider = (course.provider || '').toLowerCase();
    const level = (course.level || '').toLowerCase();

    const matchesProvider = selectedProviders.length === 0 || selectedProviders.includes(provider);
    const matchesLevel = selectedLevels.length === 0 || selectedLevels.includes(level);

    const matchesDuration = (() => {
      if (selectedDurations.length === 0) return true;
      const hours = parseFloat(course.duration);
      return selectedDurations.some(d => {
        if (d === '<2') return hours < 2;
        if (d === '2-5') return hours >= 2 && hours <= 5;
        if (d === '>5') return hours > 5;
      });
    })();

    return matchesQuery && matchesProvider && matchesLevel && matchesDuration;
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

  // Create a wrapper row for Bootstrap grid
  const row = document.createElement('div');
  row.className = 'row g-4'; // spacing between cards

  pageItems.forEach(course => {
    const rating = Math.round(course.rating || 0);
    const ratingStars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);

    // Use col-12 col-md-6 to make 2 cards per row on md+ screens
    const cardCol = document.createElement('div');
    cardCol.className = 'col-12 col-md-6';
    cardCol.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${course.image || 'images/default-course.jpg'}" alt="${course.title}" class="card-img-top" />
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${course.title}</h5>
          <h6 class="card-subtitle mb-2">${course.instructor || course.provider || 'Unknown'}</h6>
          <div class="rating mb-2">${ratingStars} (${(course.rating || 0).toFixed(1)})</div>
          <p class="card-text flex-grow-1">${course.description}</p>
          <div class="d-flex justify-content-between align-items-center mt-2">
            <span class="price fw-bold">${course.price || 'Free'}</span>
            <a href="${course.url}" target="_blank" class="btn btn-primary btn-sm">Go to course</a>
          </div>
        </div>
      </div>
    `;
    row.appendChild(cardCol);
  });

  courseContainer.appendChild(row);
  renderPagination();
}

function renderPagination() {
  paginationContainer.innerHTML = '';
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  if (totalPages <= 1) return;

  const createBtn = (label, page, disabled = false) => {
    const btn = document.createElement('button');
    btn.className = `btn btn-outline-primary me-2`;
    btn.textContent = label;
    btn.disabled = disabled;
    btn.onclick = () => {
      if (!disabled) {
        currentPage = page;
        renderCourses();
      }
    };
    return btn;
  };

  // Skip first and previous
  paginationContainer.appendChild(createBtn('«', 1, currentPage === 1));
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

  // Next and skip last
  paginationContainer.appendChild(createBtn('›', currentPage + 1, currentPage === totalPages));
  paginationContainer.appendChild(createBtn('»', totalPages, currentPage === totalPages));
}

// Initialize
document.addEventListener('DOMContentLoaded', loadCourses);
