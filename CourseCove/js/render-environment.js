async function renderCourses(jsonPath, containerId) {
    try {
      const response = await fetch(`${jsonPath}?t=${Date.now()}`);
      const courses = await response.json();
      const container = document.getElementById(containerId);
      container.innerHTML = '';
  
      courses.forEach(course => {
        const rating = Math.round(course.rating);
        const ratingStars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  
        const card = document.createElement('div');
        card.className = 'col';
        card.innerHTML = `
          <div class="card h-100 shadow-sm">
            <img src="${course.image}" alt="${course.title}" class="card-img-top" />
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${course.title}</h5>
              <h6 class="card-subtitle mb-2 text-muted">${course.instructor}</h6>
              <div class="rating mb-2">${ratingStars} (${course.rating.toFixed(1)})</div>
              <p class="card-text flex-grow-1">${course.description}</p>
              <div class="d-flex justify-content-between align-items-center mt-2">
                <span class="price fw-bold">${course.price}</span>
                <a href="${course.url}" target="_blank" class="btn btn-primary btn-sm">Go to course</a>
              </div>
            </div>
          </div>
        `;
        container.appendChild(card);
      });
    } catch (error) {
      console.error("Failed to render courses:", error);
      document.getElementById(containerId).innerHTML = '<p class="text-danger">Failed to load course data.</p>';
    }
  }
  