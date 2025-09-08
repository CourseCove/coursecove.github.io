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
    // ✅ Fetch AI/ML JSON instead of math
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

  const selectedProviders = [...filters.querySelectorAll('input[name="provider"]:checked')].map(el => el.value.toLowerCase());
  const selectedLevels = [...filters.querySelectorAll('input[name="level"]:checked')].map(el => el.value.toLowerCase());
  const selectedDurations = [...filters.querySelectorAll('input[name="duration"]:checked')].map(el => el.value);

  filteredCourses = allCourses.filter(course => {
    const titleMatch = course.title.toLowerCase().includes(query);
    const descMatch = course.description.toLowerCase().includes(query);
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
    const rating = Math.round(course.rating || 0);
    const ratingStars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);

    const card = document.createElement('div');
    card.className = 'col';
    card.innerHTML = `
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
