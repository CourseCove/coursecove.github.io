function renderCourses(data) {
  const container = document.getElementById('course-listings');
  container.innerHTML = '';

  data.forEach(course => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.textContent = course.title;
    a.href = course.url;
    a.target = '_blank';
    li.appendChild(a);
    container.appendChild(li);
  });
}

function setupSearch(data) {
  const input = document.getElementById('search-input');
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    const filtered = data.filter(c => c.title.toLowerCase().includes(q));
    renderCourses(filtered);
  });
}

// Load JSON and init
fetch('./json/math-courses.json')
  .then(r => r.json())
  .then(data => {
    setupSearch(data);
    renderCourses(data);
  });
