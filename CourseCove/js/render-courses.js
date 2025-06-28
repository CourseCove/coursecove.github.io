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

  const selectedProviders = [...filters.querySelectorAll('input[name="provider"]:checked')].map(el => el.value.toLowerCase());
  const selectedLevels = [...filters.querySelectorAll('input[name="level"]:checked')].map(el => el.value.toLowerCase());
  const selectedDurations = [...filters.querySelectorAll('input[name="duration"]:checked')].map(el => el.value);

  filteredCourses = allCourses.filter(course => {
    const titleMatch = course.title.toLowerCase().includes(query);
    const descMatch = course.description.toLowerCase().includes(query);
    const instructorMatch = course.instructor.toLowerCase().includes(query);
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
  paginationContainer.innerHTML = '';

  if (filteredCourses.length === 0) {
    courseContainer.innerHTML = '<p>No courses found.</p>';
    return;
  }

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const coursesToShow = filteredCourses.slice(start, end);

  coursesToShow.forEach(course => {
    const starsCount = Math.round(course.rating || 0);
    const stars = '⭐'.repeat(starsCount) + '☆'.repeat(5 - starsCount);

    const card = document.createElement('div');
    card.className = 'col';
    card.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${course.image || 'images/default-course.jpg'}" class="card-img-top" alt="${course.title}" />
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${course.title}</h5>
          <p class="text-muted mb-1"><small>Instructor: ${course.instructor}</small></p>
          <p class="mb-1">${stars} (${course.rating || 'N/A'})</p>
          <p class="card-text flex-grow-1">${course.description}</p>
          <p><strong>Level:</strong> ${course.level || 'N/A'}</p>
          <p><strong>Provider:</strong> ${course.provider || 'N/A'}</p>
          <p><strong>Duration:</strong> ${course.duration || 'N/A'} hours</p>
          <p><strong>Price:</strong> ${course.price || 'Free'}</p>
          <a href="${course.url}" target="_blank" rel="noopener" class="btn btn-primary mt-auto">Go to Course</a>
        </div>
      </div>
    `;
    courseContainer.appendChild(card);
  });

  // Pagination buttons
  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement('li');
    li.className = 'page-item' + (i === currentPage ? ' active' : '');
    li.innerHTML = `<a href="#" class="page-link">${i}</a>`;
    li.addEventListener('click', e => {
      e.preventDefault();
      if (currentPage !== i) {
        currentPage = i;
        renderCourses();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
    paginationContainer.appendChild(li);
  }
}

loadCourses();
