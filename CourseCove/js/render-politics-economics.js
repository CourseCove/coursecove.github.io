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
    const response = await fetch(`json/politics-economics-courses.json?t=${Date.now()}`);
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
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${course.title}</h5>
          <p class="card-text flex-grow-1">${course.description}</p>
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

  // First page button
  if (currentPage > 1) {
    const firstBtn = document.createElement('button');
    firstBtn.className = 'btn btn-outline-primary me-2';
    firstBtn.textContent = '« First';
    firstBtn.onclick = () => {
      currentPage = 1;
      renderCourses();
    };
    paginationContainer.appendChild(firstBtn);
  }

  // Previous button
  if (currentPage > 1) {
    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn btn-outline-primary me-2';
    prevBtn.textContent = '‹ Prev';
    prevBtn.onclick = () => {
      currentPage--;
      renderCourses();
    };
    paginationContainer.appendChild(prevBtn);
  }

  // Page numbers (show max 5 pages around current)
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.className = 'btn btn-outline-primary me-2';
    pageBtn.textContent = i;
    if (i === currentPage) {
      pageBtn.disabled = true;
      pageBtn.classList.add('active');
    }
    pageBtn.onclick = () => {
      currentPage = i;
      renderCourses();
    };
    paginationContainer.appendChild(pageBtn);
  }

  // Next button
  if (currentPage < totalPages) {
    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-outline-primary me-2';
    nextBtn.textContent = 'Next ›';
    nextBtn.onclick = () => {
      currentPage++;
      renderCourses();
    };
    paginationContainer.appendChild(nextBtn);
  }

  // Last page button
  if (currentPage < totalPages) {
    const lastBtn = document.createElement('button');
    lastBtn.className = 'btn btn-outline-primary';
    lastBtn.textContent = 'Last »';
    lastBtn.onclick = () => {
      currentPage = totalPages;
      renderCourses();
    };
    paginationContainer.appendChild(lastBtn);
  }
}


  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.className = 'btn btn-outline-primary me-2';
    pageBtn.textContent = i;
    if (i === currentPage) {
      pageBtn.disabled = true;
      pageBtn.classList.add('active');
    }
    pageBtn.onclick = () => {
      currentPage = i;
      renderCourses();
    };
    paginationContainer.appendChild(pageBtn);
  }

  if (currentPage < totalPages) {
    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-outline-primary';
    nextBtn.textContent = 'Next';
    nextBtn.onclick = () => {
      currentPage++;
      renderCourses();
    };
    paginationContainer.appendChild(nextBtn);
  }
}

document.addEventListener('DOMContentLoaded', loadCourses);
