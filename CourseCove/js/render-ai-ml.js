let allCourses = [];
let filteredCourses = [];
let currentPage = 1;
const itemsPerPage = 10;

const searchBar = document.getElementById('searchBar');
const courseContainer = document.getElementById('courses');
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
    const div = document.createElement('div');
    div.className = 'course';
    div.innerHTML = `
      <h3><a href="${course.url}" target="_blank">${course.title}</a></h3>
      <p>${course.description}</p>
      <p><strong>Provider:</strong> ${course.provider}</p>
      <p><strong>Level:</strong> ${course.level}</p>
      <p><strong>Duration:</strong> ${course.duration}</p>
    `;
    courseContainer.appendChild(div);
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
