import { company, money } from "../config";
import { formatAmount, formatCurrency, formatDate, formatQuantity } from "../utils/format";

/** The invoice as a document. Rendered on screen and printed as-is on A4. */
export default function InvoiceDocument({ invoice }) {
  const contact = [company.email, company.phone].filter(Boolean);
  return (
    <article className="doc" aria-label={`Invoice ${invoice.invoice_number}`}>
      <header className="doc__head">
        <div className="doc__seller">
          <p className="doc__seller-name">{company.name}</p>
          {company.address && <p>{company.address}</p>}
          {contact.length > 0 && <p>{contact.join("  /  ")}</p>}
          {company.taxId && <p>GSTIN {company.taxId}</p>}
        </div>
        <div className="doc__title">
          <h2>Invoice</h2>
          <p className="doc__number">{invoice.invoice_number}</p>
        </div>
      </header>

      <section className="doc__meta">
        <div>
          <p className="doc__label">Billed to</p>
          <p className="doc__customer">{invoice.customer_name}</p>
        </div>
        <div>
          <p className="doc__label">Invoice date</p>
          <p className="doc__value">{formatDate(invoice.date)}</p>
        </div>
        <div className="doc__due">
          <p className="doc__label">Amount due</p>
          <p className="doc__due-amount">{formatCurrency(invoice.total_amount)}</p>
        </div>
      </section>

      <table className="doc-table">
        <thead>
          <tr>
            <th className="doc-table__no">#</th>
            <th>Description</th>
            <th className="num">Qty</th>
            <th className="num">Unit price</th>
            <th className="num">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={item.id ?? index}>
              <td className="doc-table__no">{index + 1}</td>
              <td>{item.product_name}</td>
              <td className="num">{formatQuantity(item.quantity)}</td>
              <td className="num">{formatAmount(item.price)}</td>
              <td className="num">{formatAmount(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="doc__totals">
        <dl className="totals">
          <div>
            <dt>Subtotal</dt>
            <dd>{formatAmount(invoice.total_amount)}</dd>
          </div>
          <div className="totals__grand">
            <dt>Total ({money.currency})</dt>
            <dd>{formatCurrency(invoice.total_amount)}</dd>
          </div>
        </dl>
      </div>

      <footer className="doc__foot">
        {company.note && <p>{company.note}</p>}
        <p className="doc__foot-ref">
          {company.name}, invoice {invoice.invoice_number}
        </p>
      </footer>
    </article>
  );
}
