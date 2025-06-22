function renderBlogPosts(jsonPath, containerId) {
  fetch(jsonPath)
    .then(res => res.json())
    .then(posts => {
      const container = document.getElementById(containerId);
      posts.forEach(post => {
        const col = document.createElement('div');
        col.className = 'col';

        col.innerHTML = `
          <div class="card h-100">
            <a href="${post.link}" target="_blank" rel="noopener">
              <img src="${post.thumbnail}" class="card-img-top" alt="${post.title}">
            </a>
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${post.title}</h5>
              <p class="card-text">${post.preview}</p>
              <a href="${post.link}" class="btn btn-primary mt-auto" target="_blank">Read More</a>
            </div>
          </div>
        `;

        container.appendChild(col);
      });
    })
    .catch(err => console.error("Error loading blog posts:", err));
}
