let allCourses = [];
let filteredCourses = [];
let currentPage = 1;
const itemsPerPage = 10;

const searchBar = document.getElementById('searchBar');
const courseContainer = document.getElementById('course-container');
const paginationContainer = document.getElementById('pagination');
const filters = document.getElementById('filters');

fetch('json/ai-ml-courses.json')
  .then(res => res.json())
  .then(data => {
    allCourses = data;
    filteredCourses = data;
    renderCourses();
    setupEventListeners();
  });

function renderCourses() {
  courseContainer.innerHTML = '';
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageItems = filteredCourses.slice(start, end);

  pageItems.forEach(course => {
    const col = document.createElement('div');
    col.className = 'col';
    col.innerHTML = `
      <div class="card h-100">
        <img src="images/ai.jpg" class="card-img-top" alt="${course.title}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${course.title}</h5>
          <h6 class="card-subtitle mb-2 text-muted">${course.provider}</h6>
          <p class="card-text">${course.description}</p>
          <div class="mt-auto">
            <a href="${course.url}" class="btn btn-outline-info mt-3" target="_blank">View Course</a>
          </div>
        </div>
      </div>
    `;
    courseContainer.appendChild(col);
  });

  renderPagination();
}


function renderPagination() {
  paginationContainer.innerHTML = '';
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  if (totalPages <= 1) return;

  if (currentPage > 1) {
    const prev = document.createElement('button');
    prev.textContent = 'Previous';
    prev.onclick = () => {
      currentPage--;
      renderCourses();
    };
    paginationContainer.appendChild(prev);
  }

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === currentPage) btn.disabled = true;
    btn.onclick = () => {
      currentPage = i;
      renderCourses();
    };
    paginationContainer.appendChild(btn);
  }

  if (currentPage < totalPages) {
    const next = document.createElement('button');
    next.textContent = 'Next';
    next.onclick = () => {
      currentPage++;
      renderCourses();
    };
    paginationContainer.appendChild(next);
  }
}

function setupEventListeners() {
  searchBar.addEventListener('input', applyFilters);
  filters.addEventListener('change', applyFilters);
}

function applyFilters() {
  const query = searchBar.value.toLowerCase();
  const selectedProviders = [...filters.querySelectorAll('input[name="provider"]:checked')].map(i => i.value);
  const selectedLevels = [...filters.querySelectorAll('input[name="level"]:checked')].map(i => i.value);
  const selectedDurations = [...filters.querySelectorAll('input[name="duration"]:checked')].map(i => i.value);

  filteredCourses = allCourses.filter(course => {
    const matchesQuery =
      course.title.toLowerCase().includes(query) ||
      course.description.toLowerCase().includes(query) ||
      (course.keywords || []).some(k => k.toLowerCase().includes(query));

    const matchesProvider = selectedProviders.length === 0 || selectedProviders.includes(course.provider);
    const matchesLevel = selectedLevels.length === 0 || selectedLevels.includes(course.level);

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

  currentPage = 1;
  renderCourses();
}
