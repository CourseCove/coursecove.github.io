document.addEventListener("DOMContentLoaded", () => {
  const coursesPerPage = 6;
  let currentPage = 1;
  let coursesData = [];

  async function fetchCourses() {
    try {
      const response = await fetch("CourseCove/data/ai-ml.json");
      coursesData = await response.json();
      renderCourses();
      renderPagination();
    } catch (error) {
      console.error("Error fetching AI/ML courses:", error);
    }
  }

  function renderCourses() {
    const courseContainer = document.getElementById("course-list");
    courseContainer.innerHTML = "";

    const start = (currentPage - 1) * coursesPerPage;
    const end = start + coursesPerPage;
    const paginatedCourses = coursesData.slice(start, end);

    paginatedCourses.forEach((course) => {
      const courseCard = document.createElement("div");
      courseCard.classList.add("course-card");

      courseCard.innerHTML = `
        <img src="${course.image}" alt="${course.title}">
        <h3>${course.title}</h3>
        <p>${course.description}</p>
        <p><strong>Instructor:</strong> ${course.instructor}</p>
        <p><strong>Rating:</strong> ${course.rating}</p>
        <p><strong>Price:</strong> ${course.price}</p>
        <a href="${course.url}" target="_blank" class="course-link">View Course</a>
      `;
      courseContainer.appendChild(courseCard);
    });
  }

  function renderPagination() {
    const paginationContainer = document.getElementById("pagination");
    paginationContainer.innerHTML = "";

    const pageCount = Math.ceil(coursesData.length / coursesPerPage);

    // Skip backward button
    const prevBtn = document.createElement("button");
    prevBtn.innerText = "«";
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderCourses();
        renderPagination();
      }
    });
    paginationContainer.appendChild(prevBtn);

    // Numbered buttons
    for (let i = 1; i <= pageCount; i++) {
      const btn = document.createElement("button");
      btn.innerText = i;
      btn.classList.toggle("active", i === currentPage);
      btn.addEventListener("click", () => {
        currentPage = i;
        renderCourses();
        renderPagination();
      });
      paginationContainer.appendChild(btn);
    }

    // Skip forward button
    const nextBtn = document.createElement("button");
    nextBtn.innerText = "»";
    nextBtn.disabled = currentPage === pageCount;
    nextBtn.addEventListener("click", () => {
      if (currentPage < pageCount) {
        currentPage++;
        renderCourses();
        renderPagination();
      }
    });
    paginationContainer.appendChild(nextBtn);
  }

  fetchCourses();
});
