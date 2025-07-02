function renderBlogPosts(jsonPath, containerId) {
  let allPosts = [];

  const container = document.getElementById(containerId);
  const filterSelect = document.getElementById("filterSelect");
  const searchInput = document.getElementById("searchInput");

  function applyFilters() {
    const source = filterSelect?.value || "all";
    const query = searchInput?.value.toLowerCase() || "";

    let filtered = allPosts;

    // Filter by source
    if (source !== "all") {
      filtered = filtered.filter((post) => {
        if (source === "Scott") return post.link.includes("scotthyoung");
        if (source === "Ali") return post.link.includes("aliabdaal");
        if (source === "Learning") return post.link.includes("learningscientists");
        if (source === "Edutopia") return post.link.includes("edutopia");
        return true;
      });
    }

    // Filter by search text
    if (query) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.preview.toLowerCase().includes(query)
      );
    }

    render(filtered);
  }

  function render(posts) {
    container.innerHTML = "";

    if (posts.length === 0) {
      container.innerHTML = `<div class="col"><p>No blog posts found.</p></div>`;
      return;
    }

    posts.forEach((post) => {
      const col = document.createElement("div");
      col.className = "col";

      col.innerHTML = `
        <div class="card h-100 shadow-sm">
          <img src="${post.thumbnail}" class="card-img-top" alt="${post.title}" style="object-fit: cover; height: 180px;">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${post.title}</h5>
            <p class="card-text flex-grow-1">${post.preview}</p>
            <a href="${post.link}" class="btn btn-primary mt-2" target="_blank">Read More</a>
          </div>
        </div>
      `;

      container.appendChild(col);
    });
  }

  // Load JSON and initialize
  fetch(jsonPath)
    .then((res) => res.json())
    .then((data) => {
      allPosts = data;
      applyFilters();
    })
    .catch((err) => console.error("Error loading blog data:", err));

  // Live filter triggers
  filterSelect?.addEventListener("change", applyFilters);
  searchInput?.addEventListener("input", applyFilters);
}
