function renderPagination() {
  paginationContainer.innerHTML = '';
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  if (totalPages <= 1) return;

  // helper to build buttons
  function makeBtn(label, page, disabled = false, extraClass = '') {
    const btn = document.createElement('button');
    btn.className = `btn btn-outline-primary me-2 ${extraClass}`;
    btn.textContent = label;
    btn.disabled = disabled;
    btn.onclick = () => {
      if (!disabled && page !== currentPage) {
        currentPage = page;
        renderCourses();
      }
    };
    return btn;
  }

  // Skip to first
  paginationContainer.appendChild(makeBtn('«', 1, currentPage === 1));

  // Previous
  paginationContainer.appendChild(makeBtn('‹', currentPage - 1, currentPage === 1));

  // Show up to 5 page numbers (centered around currentPage)
  let start = Math.max(1, currentPage - 2);
  let end = Math.min(totalPages, currentPage + 2);

  if (currentPage <= 2) {
    end = Math.min(totalPages, 5);
  } else if (currentPage >= totalPages - 1) {
    start = Math.max(1, totalPages - 4);
  }

  for (let i = start; i <= end; i++) {
    const btn = makeBtn(i, i, false);
    if (i === currentPage) {
      btn.disabled = true;
      btn.classList.add('active');
    }
    paginationContainer.appendChild(btn);
  }

  // Next
  paginationContainer.appendChild(makeBtn('›', currentPage + 1, currentPage === totalPages));

  // Skip to last
  paginationContainer.appendChild(makeBtn('»', totalPages, currentPage === totalPages));
}
