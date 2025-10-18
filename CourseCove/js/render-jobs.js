const container = document.getElementById("job-container");
const searchBar = document.getElementById("searchBar");
const jobTagsContainer = document.getElementById("job-tags");
const pagination = document.getElementById("pagination");
const lastUpdatedEl = document.getElementById("last-updated");

let allJobs = [];
let currentPage = 1;
const itemsPerPage = 8;
let selectedTags = new Set();

// Sources
const sources = [
  // WeWorkRemotely categories
  { name: "WWR - Programming", type: "rss", url: "https://weworkremotely.com/categories/remote-programming-jobs.rss" },
  { name: "WWR - Design", type: "rss", url: "https://weworkremotely.com/categories/remote-design-jobs.rss" },
  { name: "WWR - Marketing", type: "rss", url: "https://weworkremotely.com/categories/remote-marketing-jobs.rss" },
  { name: "WWR - Customer Support", type: "rss", url: "https://weworkremotely.com/categories/remote-customer-support-jobs.rss" },
  { name: "WWR - Sales", type: "rss", url: "https://weworkremotely.com/categories/remote-sales-jobs.rss" },
  { name: "WWR - DevOps", type: "rss", url: "https://weworkremotely.com/categories/remote-devops-sysadmin-jobs.rss" },
  { name: "WWR - Finance/Legal", type: "rss", url: "https://weworkremotely.com/categories/remote-finance-legal-jobs.rss" },
  { name: "WWR - Copywriting/Content", type: "rss", url: "https://weworkremotely.com/categories/remote-copywriting-content-jobs.rss" },

  // Other sources
  { name: "RemoteOK", type: "json", url: "https://remoteok.io/remote-jobs.json" },
  { name: "Remotive", type: "json", url: "https://remotive.io/api/remote-jobs" }
];

// RSS fetch helper
async function fetchRSS(url) {
  const encoded = encodeURIComponent(url);
  const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encoded}`);
  const data = await res.json();
  return data.items.map(item => ({
    source: url.includes("weworkremotely") ? "WeWorkRemotely" : "RSS Feed",
    title: item.title,
    company: item.author || "",
    location: item.categories ? item.categories.join(", ") : "",
    url: item.link,
    tags: item.categories || []
  }));
}

// Fetch all jobs
async function fetchJobs() {
  const jobs = [];
  for (const src of sources) {
    try {
      if (src.type === "json") {
        const res = await fetch(src.url);
        const data = await res.json();
        if (src.name === "RemoteOK") {
          const items = data.slice(1).map(job => ({
            source: src.name,
            title: job.position,
            company: job.company,
            location: job.location,
            url: job.url,
            tags: job.tags || []
          }));
          jobs.push(...items);
        }
        if (src.name === "Remotive") {
          const items = data.jobs.map(job => ({
            source: src.name,
            title: job.title,
            company: job.company_name,
            location: job.candidate_required_location,
            url: job.url,
            tags: job.tags || []
          }));
          jobs.push(...items);
        }
      } else if (src.type === "rss") {
        const items = await fetchRSS(src.url);
        jobs.push(...items);
      }
    } catch (err) {
      console.warn("Failed to fetch", src.name, err);
    }
  }
  allJobs = jobs.sort((a, b) => a.title.localeCompare(b.title));
  localStorage.setItem("jobsData", JSON.stringify(allJobs));
  localStorage.setItem("jobsLastFetch", new Date().toDateString());
  updateLastUpdated();
  renderFilters();
  renderJobs();
}

// Last updated
function updateLastUpdated() {
  const now = new Date();
  lastUpdatedEl.textContent = `Last Updated: ${now.toLocaleString()}`;
}

// Load cached or fetch
function loadJobs() {
  const lastFetch = localStorage.getItem("jobsLastFetch");
  const today = new Date().toDateString();
  if (lastFetch === today && localStorage.getItem("jobsData")) {
    allJobs = JSON.parse(localStorage.getItem("jobsData"));
    updateLastUpdated();
    renderFilters();
    renderJobs();
  } else {
    fetchJobs();
  }
}

// Filters
function renderFilters() {
  const tags = [...new Set(allJobs.flatMap(job => job.tags))].sort();
  jobTagsContainer.innerHTML = tags.map(tag => `
    <div>
      <input type="checkbox" value="${tag}" id="tag-${tag}" checked>
      <label for="tag-${tag}">${tag}</label>
    </div>
  `).join('');

  const checkboxes = jobTagsContainer.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(cb => {
    selectedTags.add(cb.value);
    cb.addEventListener('change', () => {
      if (cb.checked) selectedTags.add(cb.value);
      else selectedTags.delete(cb.value);
      currentPage = 1;
      renderJobs();
    });
  });
}

// Filter jobs
function getFilteredJobs() {
  const query = searchBar.value.toLowerCase();
  return allJobs.filter(job =>
    job.title.toLowerCase().includes(query) ||
    job.company.toLowerCase().includes(query)
  ).filter(job =>
    selectedTags.size === 0 || job.tags.some(tag => selectedTags.has(tag))
  );
}

// Render jobs
function renderJobs() {
  const filtered = getFilteredJobs();
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  if (currentPage > totalPages) currentPage = totalPages || 1;
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageItems = filtered.slice(start, end);

  container.innerHTML = pageItems.map(job => `
    <div class="col">
      <div class="card h-100 p-3">
        <h5>${job.title}</h5>
        <p><strong>${job.company}</strong> — ${job.location}</p>
        <p>Tags: ${job.tags.join(', ')}</p>
        <p><em>${job.source}</em></p>
        <a href="${job.url}" target="_blank">View Job</a>
      </div>
    </div>
  `).join('');

  renderPagination(totalPages);
}

// Pagination
function renderPagination(totalPages) {
  pagination.innerHTML = '';
  if (totalPages <= 1) return;
  pagination.innerHTML += `<li class="page-item ${currentPage===1?'disabled':''}"><a class="page-link" href="#" data-page="${currentPage-1}">Previous</a></li>`;
  for (let i=1;i<=totalPages;i++){
    pagination.innerHTML += `<li class="page-item ${i===currentPage?'active':''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
  }
  pagination.innerHTML += `<li class="page-item ${currentPage===totalPages?'disabled':''}"><a class="page-link" href="#" data-page="${currentPage+1}">Next</a></li>`;

  pagination.querySelectorAll('.page-link').forEach(link=>{
    link.addEventListener('click',e=>{
      e.preventDefault();
      const page=parseInt(link.getAttribute('data-page'));
      if(!isNaN(page) && page>=1 && page<=totalPages){
        currentPage=page;
        renderJobs();
        window.scrollTo({top:0,behavior:'smooth'});
      }
    });
  });
}

// Search
searchBar.addEventListener("input",()=>{currentPage=1;renderJobs();});

// Init
loadJobs();
