    const container = document.getElementById("article-container");
    const searchBar = document.getElementById("searchBar");
    const filters = document.getElementById("filters");
    const loadingDiv = document.getElementById("loading");

    let query = ""; // ✅ default search
    let page = 0;
    const pageSize = 10;
    let articles = [];
    let isLoading = false;
    let activeFilters = [];

    searchBar.addEventListener("keypress", e => {
      if (e.key === "Enter") {
        query = searchBar.value.trim() || "machine learning";
        page = 0;
        articles = [];
        container.innerHTML = "";
        loadMore();
      }
    });

    filters.addEventListener("change", () => {
      activeFilters = [...filters.querySelectorAll("input:checked")].map(c => c.value);
    
      if (!searchBar.value.trim() && activeFilters.length > 0) {
        // ✅ Use the first active filter as the query if no search term entered
        query = activeFilters[0];
        page = 0;
        articles = [];
        container.innerHTML = "";
        loadMore();
      } else {
        // ✅ Just re-filter already loaded articles
        renderArticles();
      }
    });


    async function loadMore() {
      if (!query || isLoading) return;
      isLoading = true;
      loadingDiv.textContent = "Loading results...";

      // ✅ Fetch Semantic Scholar + arXiv first (always renderable)
      const [semantic, arxiv] = await Promise.all([
        fetchSemanticScholar(query, page),
        fetchArxiv(query, page)
      ]);
      articles = [...articles, ...semantic, ...arxiv];
      renderArticles();

      // ✅ Try CrossRef + PubMed in background
      fetchCrossRef(query, page).then(res => {
        articles = [...articles, ...res]; renderArticles();
      }).catch(()=>{});
      fetchPubMed(query, page).then(res => {
        articles = [...articles, ...res]; renderArticles();
      }).catch(()=>{});

      page++;
      isLoading = false;
      loadingDiv.textContent = "";
    }

    function categorize(text, provider) {
      const t = (text || "").toLowerCase();
      if (provider === "PubMed") return "Medicine";
      if (t.includes("econom") || t.includes("finance")) return "Economics";
      if (t.includes("biology") || t.includes("genetics")) return "Biology";
      if (t.includes("medicine") || t.includes("clinical")) return "Medicine";
      if (t.includes("physics") || t.includes("quantum")) return "Physics";
      if (t.includes("computer") || t.includes("machine learning") || t.includes("artificial intelligence") || t.includes("algorithm")) return "Computer Science";
      if (t.includes("sociology") || t.includes("political") || t.includes("education") || t.includes("social")) return "Social Sciences";
      return "General";
    }

    async function fetchSemanticScholar(query, page) {
      try {
        const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&offset=${page*pageSize}&limit=${pageSize}&fields=title,abstract,url,authors,year,venue`;
        const res = await fetch(url);
        const data = await res.json();
        return data.data.map(p => ({
          title: p.title,
          snippet: p.abstract || "No abstract available.",
          authors: p.authors.map(a => a.name).join(", "),
          url: p.url,
          provider: "Semantic Scholar",
          category: categorize(p.venue || p.abstract || p.title, "Semantic Scholar")
        }));
      } catch { return []; }
    }

    async function fetchArxiv(query, page) {
      try {
        const start = page * pageSize;
        const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=${start}&max_results=${pageSize}`;
        const res = await fetch(url);
        const text = await res.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "application/xml");
        const entries = [...xml.getElementsByTagName("entry")];
        return entries.map(e => {
          const title = e.getElementsByTagName("title")[0].textContent;
          const snippet = e.getElementsByTagName("summary")[0].textContent;
          const authors = [...e.getElementsByTagName("author")].map(a => a.getElementsByTagName("name")[0].textContent).join(", ");
          const url = e.getElementsByTagName("id")[0].textContent;
          return {
            title,
            snippet,
            authors,
            url,
            provider: "arXiv",
            category: categorize(snippet + " " + title, "arXiv")
          };
        });
      } catch { return []; }
    }

    async function fetchCrossRef(query, page) {
      try {
        const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=${pageSize}&offset=${page*pageSize}`;
        const res = await fetch(url);
        const data = await res.json();
        return data.message.items.map(p => ({
          title: p.title ? p.title[0] : "Untitled",
          snippet: p.abstract ? p.abstract.replace(/<[^>]+>/g, '') : "No abstract available.",
          authors: p.author ? p.author.map(a => (a.given || "") + " " + (a.family || "")).join(", ") : "Unknown",
          url: p.URL,
          provider: "CrossRef",
          category: categorize((p.subject || []).join(" ") + " " + (p["container-title"] ? p["container-title"][0] : ""), "CrossRef")
        }));
      } catch { return []; }
    }

    async function fetchPubMed(query, page) {
      try {
        const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&retmax=${pageSize}&retstart=${page*pageSize}&term=${encodeURIComponent(query)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!data.esearchresult || !data.esearchresult.idlist) return [];
        const ids = data.esearchresult.idlist.join(",");
        const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=${ids}`;
        const summaryRes = await fetch(summaryUrl);
        const summaryData = await summaryRes.json();
        const pmArticles = Object.values(summaryData.result).filter(r => r.uid);
        return pmArticles.map(a => ({
          title: a.title || "Untitled",
          snippet: a.source || "No abstract available.",
          authors: a.authors ? a.authors.map(x => x.name).join(", ") : "Unknown",
          url: `https://pubmed.ncbi.nlm.nih.gov/${a.uid}/`,
          provider: "PubMed",
          category: categorize(a.title + " " + (a.source || ""), "PubMed")
        }));
      } catch { return []; }
    }

function renderArticles() {
  container.innerHTML = "";
  let results = articles;
  if (activeFilters.length > 0) {
    results = results.filter(a => activeFilters.includes(a.category));
  }
  if (results.length === 0) {
    container.innerHTML = "<p class='text-center text-muted'>No articles found.</p>";
    return;
  }
  results.forEach(a => {
    const cardCol = document.createElement("div");
    cardCol.classList.add("col");
    cardCol.innerHTML = `
      <div class="card article-card h-100">
        <img src="images/article-placeholder.png" class="card-img-top" alt="Article Image">
        <div class="card-body d-flex flex-column">
          <div class="article-title">${a.title}</div>
          <div class="article-snippet">${a.snippet}</div>
          <div class="article-footer"><strong>Authors:</strong> ${a.authors}<br><strong>Source:</strong> ${a.provider}<br><strong>Category:</strong> ${a.category}</div>
          <a href="${a.url}" target="_blank" class="article-link mt-2">View Article</a>
        </div>
      </div>
    `;
    container.appendChild(cardCol);
  });
}


    // ✅ Load first batch automatically
    window.onload = () => {
      searchBar.value = query;
      loadMore();
    };

    // Infinite scroll
    window.addEventListener("scroll", () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
        loadMore();
      }
    });
