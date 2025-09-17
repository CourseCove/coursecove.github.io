// assuming languagesData is your full list of language courses
const pageSize = 10;
let currentPage = 1;
const totalPages = Math.ceil(languagesData.length / pageSize);

function renderPage(page) {
  currentPage = page;
  const start = (page - 1) * pageSize;
  const pageItems = languagesData.slice(start, start + pageSize);
  // render pageItems into your container
  renderLanguages(pageItems);

  renderPagination();
}

function renderPagination() {
  const pager = document.getElementById('pagination');
  pager.innerHTML = '';

  function makeButton(text, targetPage, disabled) {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.disabled = disabled;
    btn.addEventListener('click', () => renderPage(targetPage));
    btn.classList.add('page-btn');
    if (disabled) btn.classList.add('disabled');
    return btn;
  }

  // skip to first
  pager.appendChild(makeButton('«', 1, currentPage === 1));
  // previous
  pager.appendChild(makeButton('‹', currentPage - 1, currentPage === 1));

  // page number links
  for (let p = 1; p <= totalPages; p++) {
    const btn = makeButton(p, p, false);
    if (p === currentPage) btn.classList.add('active');
    pager.appendChild(btn);
  }

  // next and skip to last
  pager.appendChild(makeButton('›', currentPage + 1, currentPage === totalPages));
  pager.appendChild(makeButton('»', totalPages, currentPage === totalPages));
}

// on initial load
document.addEventListener('DOMContentLoaded', () => {
  renderPage(1);
});
