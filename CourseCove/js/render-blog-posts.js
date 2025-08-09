function renderBlogPosts(jsonPath, containerId, paginationId = null, itemsPerPage = 8) {
  let allPosts = [];
  let filteredPosts = [];
  let currentPage = 1;

  const container = document.getElementById(containerId);
  const pagination = paginationId ? document.getElementById(paginationId) : null;
  const filterSelect = document.getElementById("filterSelect");
  const searchInput = document.getElementById("searchInput");

  function applyFilters() {
    const source = filterSelect?.value || "all";
    const query = searchInput?.value.toLowerCase() || "";

    filteredPosts = allPosts;

    // Filter by source
    if (source !== "all") {
      filteredPosts = filteredPosts.filter((post) => {
        if (source === "Scott") return post.link.includes("scotthyoung");
        if (source === "Ali") return post.link.includes("aliabdaal");
        if (source === "Learning") return post.link.includes("learningscientists");
        if (source === "Edutopia") return post.link.includes("edutopia");
        return true;
      });
    }

    // Filter by search text
    if (query) {
      filteredPosts = filteredPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.preview.toLowerCase().includes(query)
      );
    }

    currentPage = 1; // reset page when filters change
    renderPage(currentPage);
  }

  function renderPage(page) {
    container.innerHTML = "";

    if (filteredPosts.length === 0) {
      container.innerHTML = `<div class="col"><p>No blog posts found.</p></div>`;
      if (pagination) pagination.innerHTML = '';
      return;
    }

    const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pagePosts = filteredPosts.slice(start, end);

    pagePosts.forEach((post) => {
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

    if (pagination) {
      renderPagination(page, totalPages);
    }
  }

  function renderPagination(current, total) {
    pagination.innerHTML = "";

    // Previous button
    const prevLi = document.createElement("li");
    prevLi.className = `page-item${current === 1 ? " disabled" : ""}`;
    prevLi.innerHTML = `<a class="page-link" href="#" tabindex="-1">Previous</a>`;
    prevLi.addEventListener("click", (e) => {
      e.preventDefault();
      if (current > 1) {
        currentPage--;
        renderPage(currentPage);
      }
    });
    pagination.appendChild(prevLi);

    // Page numbers (show max 5 for better UX)
    const maxPagesToShow = 5;
    let startPage = Math.max(1, current - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;
    if (endPage > total) {
      endPage = total;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      const li = document.createElement("li");
      li.className = `page-item${i === current ? " active" : ""}`;
      li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
      li.addEventListener("click", (e) => {
        e.preventDefault();
        currentPage = i;
        renderPage(currentPage);
      });
      pagination.appendChild(li);
    }

    // Next button
    const nextLi = document.createElement("li");
    nextLi.className = `page-item${current === total ? " disabled" : ""}`;
    nextLi.innerHTML = `<a class="page-link" href="#">Next</a>`;
    nextLi.addEventListener("click", (e) => {
      e.preventDefault();
      if (current < total) {
        currentPage++;
        renderPage(currentPage);
      }
    });
    pagination.appendChild(nextLi);
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
