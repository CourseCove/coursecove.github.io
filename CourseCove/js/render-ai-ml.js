function renderPagination() {
  paginationContainer.innerHTML = '';
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  if (totalPages <= 1) return;

  const ul = document.createElement('ul');
  ul.className = 'pagination justify-content-center flex-wrap';

  const createPageItem = (page, text = null, active = false, disabled = false) => {
    const li = document.createElement('li');
    li.className = `page-item${active ? ' active' : ''}${disabled ? ' disabled' : ''}`;
    li.innerHTML = `<a href="#" class="page-link">${text || page}</a>`;
    if (!disabled && !active) {
      li.addEventListener('click', e => {
        e.preventDefault();
        currentPage = page;
        renderCourses();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
    return li;
  };

  // Previous button
  ul.appendChild(createPageItem(currentPage - 1, '«', false, currentPage === 1));

  const maxVisible = 2; // pages before/after current
  let startPage = Math.max(2, currentPage - maxVisible);
  let endPage = Math.min(totalPages - 1, currentPage + maxVisible);

  // Always show first page
  ul.appendChild(createPageItem(1, '1', currentPage === 1));

  if (startPage > 2) {
    const dots = document.createElement('li');
    dots.className = 'page-item disabled';
    dots.innerHTML = `<span class="page-link">…</span>`;
    ul.appendChild(dots);
  }

  for (let i = startPage; i <= endPage; i++) {
    ul.appendChild(createPageItem(i, `${i}`, currentPage === i));
  }

  if (endPage < totalPages - 1) {
    const dots = document.createElement('li');
    dots.className = 'page-item disabled';
    dots.innerHTML = `<span class="page-link">…</span>`;
    ul.appendChild(dots);
  }

  // Always show last page
  if (totalPages > 1) {
    ul.appendChild(createPageItem(totalPages, `${totalPages}`, currentPage === totalPages));
  }

  // Next button
  ul.appendChild(createPageItem(currentPage + 1, '»', false, currentPage === totalPages));

  paginationContainer.appendChild(ul);
}
