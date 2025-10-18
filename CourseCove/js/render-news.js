const container = document.getElementById("news-container");
const searchBar = document.getElementById("searchBar");
const filters = document.querySelectorAll('input[name="source"]');
const pagination = document.getElementById("pagination");

let allNews = [];
let currentPage = 1;
const itemsPerPage = 8;

// List of RSS feeds
const feeds = [
  { name: "ScienceDaily", url: "https://www.sciencedaily.com/rss/top/science.xml" },
  { name: "Nature", url: "https://www.nature.com/nature/articles?type=news&format=rss" },
  { name: "Phys.org", url: "https://phys.org/rss-feed/" },
  { name: "MIT News", url: "https://news.mit.edu/rss/feed" },
  { name: "ScienceMag", url: "https://www.sciencemag.org/rss/news_current.xml" }
];

// Fetch news via rss2json.com
async function fetchNews() {
  try {
    const allItems = [];

    for (const feed of feeds) {
      const feedUrl = encodeURIComponent(feed.url);
      const url = `https://api.rss2json.com/v1/api.json?rss_url=${feedUrl}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.items) {
        const items = data.items.map(item => ({
          source: feed.name,
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
          contentSnippet: item.content || item.description || ""
        }));
        allItems.push(...items);
      }
    }

    // Sort by date
    allNews = allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    renderNews();

  } catch (err) {
    container.innerHTML = `<p class="text-danger">Failed to load news.</p>`;
    console.error(err);
  }
}

// Filter news based on search and checkboxes
function getFilteredNews() {
  const selectedSources = Array.from(filters)
    .filter(f => f.checked)
    .map(f => f.value);
  const query = searchBar.value.toLowerCase();

  return allNews.filter(item =>
    selectedSources.includes(item.source) &&
    (item.title.toLowerCase().includes(query) ||
      (item.contentSnippet && item.contentSnippet.toLowerCase().includes(query)))
  );
}

// Render news cards for current page
function renderNews() {
  const filtered = getFilteredNews();
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  if (currentPage > totalPages) currentPage = totalPages || 1;

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageItems = filtered.slice(start, end);

  container.innerHTML = pageItems.map(item => `
    <div class="col">
      <div class="card news-card h-100 p-3">
        <h5>${item.title}</h5>
        <p>${item.contentSnippet}</p>
        <p><em>${item.source} — ${new Date(item.pubDate).toLocaleDateString()}</em></p>
        <a href="${item.link}" target="_blank">Read more</a>
      </div>
    </div>
  `).join('');

  renderPagination(totalPages);
}

// Render pagination buttons
function renderPagination(totalPages) {
  pagination.innerHTML = '';

  if (totalPages <= 1) return;

  // Previous button
  const prevClass = currentPage === 1 ? 'disabled' : '';
  pagination.innerHTML += `<li class="page-item ${prevClass}"><a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a></li>`;

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const activeClass = i === currentPage ? 'active' : '';
    pagination.innerHTML += `<li class="page-item ${activeClass}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
  }

  // Next button
  const nextClass = currentPage === totalPages ? 'disabled' : '';
  pagination.innerHTML += `<li class="page-item ${nextClass}"><a class="page-link" href="#" data-page="${currentPage + 1}">Next</a></li>`;

  // Add click listeners
  const pageLinks = pagination.querySelectorAll('.page-link');
  pageLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const page = parseInt(link.getAttribute('data-page'));
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        currentPage = page;
        renderNews();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
}

// Event listeners
searchBar.addEventListener("input", () => { currentPage = 1; renderNews(); });
filters.forEach(f => f.addEventListener("change", () => { currentPage = 1; renderNews(); }));

// Initial fetch
fetchNews();
