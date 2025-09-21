function renderCourses(data) {
  const container = document.getElementById('course-listings');
  container.innerHTML = '';

  data.forEach(course => {
    if (course.title && course.url) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.textContent = course.title;
      a.href = course.url;
      a.target = '_blank';
      li.appendChild(a);
      container.appendChild(li);
    }
  });
}

function setupSearch(data) {
  const input = document.getElementById('search-input');
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    const filtered = data.filter(c => 
      c.title && c.title.toLowerCase().includes(q)
    );
    renderCourses(filtered);
  });
}

// Load JSON and render
fetch('./json/math-courses.json')
  .then(response => response.json())
  .then(data => {
    renderCourses(data);
    setupSearch(data);
  })
  .catch(err => console.error('Error loading courses:', err));

