// Array of courses (replace with your actual data array)
const items = [
  // Example:
  // { name: "Course 1", url: "#", instructor: "Instructor A" },
];

let currentPage = 1;
const itemsPerPage = 10; // Adjust as needed

// Function to render courses for the current page
function renderItems() {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const itemsToRender = items.slice(startIndex, endIndex);

  const container = document.getElementById('items-container');
  container.innerHTML = '';

  itemsToRender.forEach(item => {
    const courseEl = document.createElement('div');
    courseEl.classList.add('course-item'); // optional, for styling
    courseEl.innerHTML = `
      <h3><a href="${item.url}">${item.name}</a></h3>
      <p>${item.instructor}</p>
    `;
    container.appendChild(courseEl);
  });

  createPaginationControls(items.length);
}

// Function to create pagination using <ul> and <li>
function createPaginationControls(totalItems) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginationUl = document.querySelector('#pagination-controls ul');
  paginationUl.innerHTML = '';

  // Previous button
  const prevLi = document.createElement('li');
  prevLi.classList.add('page-item');
  prevLi.innerHTML = `<a class="page-link" href="#">Previous</a>`;
  if (currentPage === 1) prevLi.classList.add('disabled');
  prevLi.addEventListener('click', e => {
    e.preventDefault();
    if (currentPage > 1) {
      currentPage--;
      renderItems();
    }
  });
  paginationUl.appendChild(prevLi);

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement('li');
    li.classList.add('page-item');
    if (i === currentPage) li.classList.add('active');
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.addEventListener('click', e => {
      e.preventDefault();
      currentPage = i;
      renderItems();
    });
    paginationUl.appendChild(li);
  }

  // Next button
  const nextLi = document.createElement('li');
  nextLi.classList.add('page-item');
  nextLi.innerHTML = `<a class="page-link" href="#">Next</a>`;
  if (currentPage === totalPages) nextLi.classList.add('disabled');
  nextLi.addEventListener('click', e => {
    e.preventDefault();
    if (currentPage < totalPages) {
      currentPage++;
      renderItems();
    }
  });
  paginationUl.appendChild(nextLi);
}

// Initial render
renderItems();
