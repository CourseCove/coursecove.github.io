// Wait for DOM
document.addEventListener("DOMContentLoaded", () => {
  const courseContainer = document.getElementById("courses");
  const searchInput = document.getElementById("searchInput");

  let courses = [];

  // Load JSON
  fetch("courses.json?t=" + Date.now())
    .then((response) => response.json())
    .then((data) => {
      courses = data;
      renderCourses(courses);
    })
    .catch((error) => {
      console.error("Failed to load courses:", error);
      courseContainer.innerHTML = "<p>Failed to load course data.</p>";
    });

  // Render function
  function renderCourses(courseList) {
    courseContainer.innerHTML = "";

    if (courseList.length === 0) {
      courseContainer.innerHTML = "<p>No courses found.</p>";
      return;
    }

    courseList.forEach((course) => {
      const card = document.createElement("div");
      card.className = "course-card";

      const ratingStars = "⭐".repeat(Math.round(course.rating)) + "☆".repeat(5 - Math.round(course.rating));

      card.innerHTML = `
        <img src="${course.image}" alt="Thumbnail for ${course.title}" class="course-thumb" />
        <h3 class="course-title">${course.title}</h3>
        <p class="course-instructor"><strong>${course.instructor}</strong></p>
        <p class="course-description">${course.description}</p>
        <p class="course-rating">${ratingStars} (${course.rating.toFixed(1)})</p>
        <p class="course-price">${course.price}</p>
        <a href="${course.url}" target="_blank" rel="noopener noreferrer" class="course-link">Go to Course</a>
      `;

      courseContainer.appendChild(card);
    });
  }

  // Filter courses by search text
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    const filtered = courses.filter((course) =>
      course.title.toLowerCase().includes(query) ||
      course.instructor.toLowerCase().includes(query) ||
      course.description.toLowerCase().includes(query)
    );
    renderCourses(filtered);
  });
});
