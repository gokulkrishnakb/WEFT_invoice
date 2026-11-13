import { Link } from "react-router-dom";
import { formatAmount, formatDate } from "../utils/format";
import { money } from "../config";
import Icon from "./Icon";
import Pagination from "./Pagination";

export default function InvoiceTable({
  invoices,
  loading,
  pageData,
  pageSize,
  onPageChange,
  onDelete,
  readOnly = false,
  emptyAction,
  filtered,
}) {
  const columns = readOnly ? 4 : 5;
  return (
    <div className="table-card">
      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Invoice</th>
              <th scope="col">Customer</th>
              <th scope="col">Date</th>
              <th scope="col" className="num">
                Amount <span className="table__unit">({money.currency})</span>
              </th>
              {!readOnly && (
                <th scope="col" className="table__actions">
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }, (_, index) => (
                <tr key={index} className="table__skeleton">
                  <td colSpan={columns}>
                    <span style={{ width: `${55 + ((index * 17) % 40)}%` }} />
                  </td>
                </tr>
              ))
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={columns} className="table__empty">
                  {filtered ? (
                    <>
                      <strong>No invoices match these filters.</strong>
                      <span>Widen the date range or clear the search.</span>
                    </>
                  ) : (
                    <>
                      <strong>No invoices yet.</strong>
                      <span>Invoices you create will be listed here.</span>
                      {emptyAction}
                    </>
                  )}
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>
                    <Link className="table__number" to={`/invoices/${invoice.id}`}>
                      {invoice.invoice_number}
                    </Link>
                  </td>
                  <td className="table__customer">{invoice.customer_name}</td>
                  <td className="table__date">{formatDate(invoice.date)}</td>
                  <td className="num table__amount">{formatAmount(invoice.total_amount)}</td>
                  {!readOnly && (
                    <td className="table__actions">
                      <Link
                        to={`/invoices/${invoice.id}/edit`}
                        className="icon-btn"
                        aria-label={`Edit ${invoice.invoice_number}`}
                        title="Edit"
                      >
                        <Icon name="edit" size={17} />
                      </Link>
                      <button
                        type="button"
                        className="icon-btn icon-btn--danger"
                        onClick={() => onDelete(invoice)}
                        aria-label={`Delete ${invoice.invoice_number}`}
                        title="Delete"
                      >
                        <Icon name="trash" size={17} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pageData && !loading && (
        <Pagination
          page={pageData.page}
          pages={pageData.pages}
          total={pageData.total}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
