function renderBlogPosts(jsonPath, containerId) {
  fetch(jsonPath)
    .then((response) => response.json())
    .then((data) => {
      const container = document.getElementById(containerId);
      const filterSelect = document.getElementById("filterSelect");

      const render = (filter) => {
        container.innerHTML = "";

        let filtered = data;
        if (filter !== "all") {
          filtered = data.filter((blog) => {
            if (filter === "Scott") return blog.title.includes("Scott") || blog.link.includes("scotthyoung");
            if (filter === "Ali") return blog.link.includes("aliabdaal");
            if (filter === "Learning") return blog.link.includes("learningscientists");
            if (filter === "Edutopia") return blog.link.includes("edutopia");
            return true;
          });
        }

        filtered.forEach((blog) => {
          const card = document.createElement("div");
          card.className = "col";

          card.innerHTML = `
            <div class="card h-100 shadow-sm">
              <img src="${blog.thumbnail}" class="card-img-top" alt="${blog.title}" style="object-fit: cover; height: 180px;">
              <div class="card-body d-flex flex-column">
                <h5 class="card-title">${blog.title}</h5>
                <p class="card-text flex-grow-1">${blog.preview}</p>
                <a href="${blog.link}" class="btn btn-primary mt-2" target="_blank" rel="noopener noreferrer">Read More</a>
              </div>
            </div>
          `;
          container.appendChild(card);
        });
      };

      // Initial render
      render("all");

      // Re-render on filter change
      filterSelect.addEventListener("change", (e) => {
        render(e.target.value);
      });
    })
    .catch((error) => {
      console.error("Error fetching blog posts:", error);
    });
}
