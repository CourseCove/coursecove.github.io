async function renderBlogPosts(jsonPath, containerId) {
  try {
    const response = await fetch(`${jsonPath}?t=${Date.now()}`);
    const posts = await response.json();
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    posts.forEach(post => {
      const col = document.createElement('div');
      col.className = 'col';

      col.innerHTML = `
        <div class="card h-100 shadow-sm">
          <a href="${post.link}" target="_blank" rel="noopener">
            <img src="${post.thumbnail}" alt="${post.title}" class="card-img-top" style="object-fit: cover; height: 200px;">
          </a>
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${post.title}</h5>
            <p class="card-text flex-grow-1">${post.preview}</p>
            <a href="${post.link}" target="_blank" class="btn btn-primary mt-auto">Read More</a>
          </div>
        </div>
      `;

      container.appendChild(col);
    });
  } catch (error) {
    console.error("Failed to render blog posts:", error);
    container.innerHTML = '<p class="text-danger">Failed to load blog posts.</p>';
  }
}
