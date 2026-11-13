import Icon from "./Icon";

export default function Pagination({ page, pages, total, pageSize, onPageChange }) {
  if (!total) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <div className="pagination">
      <p>
        {from}–{to} of {total.toLocaleString()}
      </p>
      {pages > 1 && (
        <div className="pagination__buttons">
          <button
            className="btn btn--sm btn--quiet"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            <Icon name="left" size={16} />
            Previous
          </button>
          <span className="pagination__page">
            Page {page} of {pages}
          </span>
          <button
            className="btn btn--sm btn--quiet"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pages}
          >
            Next
            <Icon name="right" size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
