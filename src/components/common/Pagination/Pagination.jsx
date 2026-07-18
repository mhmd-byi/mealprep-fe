import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

/**
 * Reusable Pagination Component
 *
 * Props:
 *  - totalItems    {number}   Total number of items in the full dataset
 *  - currentPage   {number}   The active page (1-indexed)
 *  - rowsPerPage   {number}   How many rows to show per page
 *  - onPageChange  {function} Called with the new page number
 *  - onRowsChange  {function} Called with the new rows-per-page value
 *  - rowsOptions   {number[]} (optional) Array of rows-per-page choices; defaults to [10, 25, 50, 100]
 */
const Pagination = ({
  totalItems,
  currentPage,
  rowsPerPage,
  onPageChange,
  onRowsChange,
  rowsOptions = [10, 25, 50, 100],
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, totalItems);

  // Build a smart page-number window with ellipsis
  const buildPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const pageNumbers = buildPageNumbers();

  const handleRowsChange = (e) => {
    onRowsChange(Number(e.target.value));
    onPageChange(1); // reset to page 1 whenever rows-per-page changes
  };

  // Shared nav button classes
  const navBtnBase =
    "flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 bg-white text-gray-600 transition-colors duration-200 hover:border-theme-color-1 hover:text-theme-color-1 hover:bg-green-50 disabled:opacity-30 disabled:cursor-not-allowed";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 bg-white rounded-b-lg">
      {/* Left: rows per page selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
          Rows per page:
        </span>
        <select
          id="pagination-rows-select"
          className="text-sm font-semibold text-gray-700 bg-gray-50 border border-gray-300 rounded-md px-2 py-1 pr-7 cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-theme-color-1 focus:border-theme-color-1 hover:border-theme-color-1 transition-colors duration-200"
          value={rowsPerPage}
          onChange={handleRowsChange}
          aria-label="Rows per page"
        >
          {rowsOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* Centre: item range info */}
      <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
        {totalItems === 0
          ? "No results"
          : `${startItem}–${endItem} of ${totalItems}`}
      </span>

      {/* Right: navigation controls */}
      <div className="flex items-center gap-1">
        {/* First page */}
        <button
          className={navBtnBase}
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="First page"
          title="First page"
        >
          <ChevronsLeft size={16} />
        </button>

        {/* Previous page */}
        <button
          className={navBtnBase}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          title="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Numbered pages */}
        <div className="flex items-center gap-1 mx-1">
          {pageNumbers.map((page, idx) =>
            page === "..." ? (
              <span
                key={`ellipsis-${idx}`}
                className="w-7 h-8 flex items-center justify-center text-sm text-gray-400 select-none"
              >
                &hellip;
              </span>
            ) : (
              <button
                key={page}
                id={`pagination-page-${page}`}
                className={`min-w-[32px] h-8 px-2 rounded-md border text-sm font-semibold transition-colors duration-200 ${
                  currentPage === page
                    ? "bg-theme-color-1 border-theme-color-1 text-white shadow-sm cursor-default"
                    : "bg-white border-gray-300 text-gray-700 hover:border-theme-color-1 hover:text-theme-color-1 hover:bg-green-50"
                }`}
                onClick={() => onPageChange(page)}
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? "page" : undefined}
              >
                {page}
              </button>
            )
          )}
        </div>

        {/* Next page */}
        <button
          className={navBtnBase}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          title="Next page"
        >
          <ChevronRight size={16} />
        </button>

        {/* Last page */}
        <button
          className={navBtnBase}
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Last page"
          title="Last page"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
