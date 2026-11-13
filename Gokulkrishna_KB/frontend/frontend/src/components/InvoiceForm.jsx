import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { money } from "../config";
import { calculateLineTotal, formatAmount, formatCurrency, sumCurrency, todayString } from "../utils/format";
import Icon from "./Icon";
import Notice from "./Notice";

let keySeq = 0;
const nextKey = () => `line-${(keySeq += 1)}`;

const blankItem = () => ({ clientKey: nextKey(), product_name: "", quantity: "1", price: "" });

const DECIMAL_2 = /^\d+(\.\d{1,2})?$/;

function validate(customerName, invoiceDate, items) {
  const errors = { items: {} };
  if (!customerName.trim()) errors.customer_name = "Enter the customer's name.";
  if (!invoiceDate) errors.date = "Choose the invoice date.";
  if (items.length === 0) errors.general = "Add at least one line item.";

  for (const item of items) {
    const e = {};
    if (!item.product_name.trim()) e.product_name = "Enter a product or service.";
    const qty = String(item.quantity).trim();
    if (!qty) e.quantity = "Required";
    else if (!DECIMAL_2.test(qty) || Number(qty) <= 0) e.quantity = "More than 0, up to 2 decimals";
    const price = String(item.price).trim();
    if (!price) e.price = "Required";
    else if (!DECIMAL_2.test(price)) e.price = "0 or more, up to 2 decimals";
    if (Object.keys(e).length) errors.items[item.clientKey] = e;
  }

  const hasErrors =
    errors.customer_name || errors.date || errors.general || Object.keys(errors.items).length;
  return hasErrors ? errors : null;
}

export default function InvoiceForm({ initialInvoice, onSave, saving, error }) {
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState(initialInvoice?.customer_name ?? "");
  const [invoiceDate, setInvoiceDate] = useState(initialInvoice?.date ?? todayString());
  const [items, setItems] = useState(
    initialInvoice?.items?.length
      ? initialInvoice.items.map((item) => ({
          id: item.id,
          clientKey: nextKey(),
          product_name: item.product_name,
          quantity: String(Number(item.quantity)),
          price: Number(item.price).toFixed(2),
        }))
      : [blankItem()],
  );
  const [attempted, setAttempted] = useState(false);
  const [focusKey, setFocusKey] = useState(null);
  const rowRefs = useRef({});

  const errors = useMemo(
    () => (attempted ? validate(customerName, invoiceDate, items) : null),
    [attempted, customerName, invoiceDate, items],
  );
  const err = errors ?? { items: {} };

  const lineTotals = useMemo(
    () => items.map((item) => (DECIMAL_2.test(item.quantity) && DECIMAL_2.test(item.price) ? calculateLineTotal(item.quantity, item.price) : "0.00")),
    [items],
  );
  const total = useMemo(() => sumCurrency(lineTotals), [lineTotals]);

  // Put the cursor in a newly added line.
  useEffect(() => {
    if (focusKey && rowRefs.current[focusKey]) {
      rowRefs.current[focusKey].focus();
      setFocusKey(null);
    }
  }, [focusKey, items]);

  function updateItem(key, field, value) {
    setItems((current) => current.map((item) => (item.clientKey === key ? { ...item, [field]: value } : item)));
  }

  function addItem() {
    const item = blankItem();
    setItems((current) => [...current, item]);
    setFocusKey(item.clientKey);
  }

  function submit(event) {
    event.preventDefault();
    setAttempted(true);
    if (validate(customerName, invoiceDate, items)) return;

    onSave({
      customer_name: customerName.trim(),
      date: invoiceDate,
      items: items.map(({ id, product_name, quantity, price }) => ({
        ...(id ? { id } : {}),
        product_name: product_name.trim(),
        quantity: Number(quantity).toFixed(2),
        price: Number(price).toFixed(2),
      })),
    });
  }

  const errorCount =
    (err.customer_name ? 1 : 0) +
    (err.date ? 1 : 0) +
    Object.values(err.items).reduce((n, e) => n + Object.keys(e).length, 0);

  return (
    <form className="invoice-form" onSubmit={submit} noValidate>
      <Notice>{error}</Notice>
      {errors && errorCount > 0 && (
        <Notice>
          {errorCount === 1 ? "One field needs attention" : `${errorCount} fields need attention`} before this
          invoice can be saved.
        </Notice>
      )}

      <div className="form-sheet">
        <div className="form-sheet__head">
          <div className="field field--grow">
            <label className="field__label" htmlFor="customer-name">
              Bill to
            </label>
            <input
              id="customer-name"
              className={`input input--lg${err.customer_name ? " is-invalid" : ""}`}
              maxLength={200}
              placeholder="Customer or company name"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              aria-invalid={Boolean(err.customer_name)}
              aria-describedby={err.customer_name ? "customer-error" : undefined}
              autoFocus={!initialInvoice}
            />
            {err.customer_name && (
              <p className="field__error" id="customer-error">
                {err.customer_name}
              </p>
            )}
          </div>
          <div className="field">
            <label className="field__label" htmlFor="invoice-date">
              Invoice date
            </label>
            <input
              id="invoice-date"
              className={`input input--lg${err.date ? " is-invalid" : ""}`}
              type="date"
              value={invoiceDate}
              onChange={(event) => setInvoiceDate(event.target.value)}
              aria-invalid={Boolean(err.date)}
            />
            {err.date && <p className="field__error">{err.date}</p>}
          </div>
          <div className="field">
            <span className="field__label">Invoice number</span>
            <p className="field__static">
              {initialInvoice ? initialInvoice.invoice_number : <span className="muted">Assigned when saved</span>}
            </p>
          </div>
        </div>

        <div className="table-scroll">
          <table className="lines">
            <thead>
              <tr>
                <th className="lines__no" scope="col">
                  #
                </th>
                <th scope="col">Product or service</th>
                <th scope="col" className="num lines__qty">
                  Qty
                </th>
                <th scope="col" className="num lines__price">
                  Unit price
                </th>
                <th scope="col" className="num lines__total">
                  Amount
                </th>
                <th className="lines__remove">
                  <span className="sr-only">Remove</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const ie = err.items[item.clientKey] ?? {};
                return (
                  <tr key={item.clientKey}>
                    <td className="lines__no">{index + 1}</td>
                    <td>
                      <input
                        ref={(node) => {
                          rowRefs.current[item.clientKey] = node;
                        }}
                        className={`input input--cell${ie.product_name ? " is-invalid" : ""}`}
                        aria-label={`Product or service, line ${index + 1}`}
                        maxLength={200}
                        placeholder="Description"
                        value={item.product_name}
                        onChange={(event) => updateItem(item.clientKey, "product_name", event.target.value)}
                        aria-invalid={Boolean(ie.product_name)}
                      />
                      {ie.product_name && <p className="field__error">{ie.product_name}</p>}
                    </td>
                    <td className="lines__qty">
                      <input
                        className={`input input--cell num${ie.quantity ? " is-invalid" : ""}`}
                        aria-label={`Quantity, line ${index + 1}`}
                        inputMode="decimal"
                        value={item.quantity}
                        onChange={(event) => updateItem(item.clientKey, "quantity", event.target.value.trim())}
                        aria-invalid={Boolean(ie.quantity)}
                      />
                      {ie.quantity && <p className="field__error">{ie.quantity}</p>}
                    </td>
                    <td className="lines__price">
                      <input
                        className={`input input--cell num${ie.price ? " is-invalid" : ""}`}
                        aria-label={`Unit price, line ${index + 1}`}
                        inputMode="decimal"
                        placeholder="0.00"
                        value={item.price}
                        onChange={(event) => updateItem(item.clientKey, "price", event.target.value.trim())}
                        onBlur={(event) => {
                          const v = event.target.value;
                          if (DECIMAL_2.test(v)) updateItem(item.clientKey, "price", Number(v).toFixed(2));
                        }}
                        aria-invalid={Boolean(ie.price)}
                      />
                      {ie.price && <p className="field__error">{ie.price}</p>}
                    </td>
                    <td className="num lines__total">{formatAmount(lineTotals[index])}</td>
                    <td className="lines__remove">
                      <button
                        type="button"
                        className="icon-btn icon-btn--danger"
                        aria-label={`Remove line ${index + 1}`}
                        title={items.length === 1 ? "An invoice needs at least one line" : "Remove line"}
                        disabled={items.length === 1}
                        onClick={() => setItems((current) => current.filter((i) => i.clientKey !== item.clientKey))}
                      >
                        <Icon name="trash" size={17} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="form-sheet__foot">
          <button type="button" className="btn btn--quiet btn--sm add-line" onClick={addItem}>
            <Icon name="plus" size={16} />
            Add line
          </button>
          <dl className="totals">
            <div>
              <dt>
                Subtotal, {items.length} {items.length === 1 ? "line" : "lines"}
              </dt>
              <dd>{formatAmount(total)}</dd>
            </div>
            <div className="totals__grand">
              <dt>Total ({money.currency})</dt>
              <dd>{formatCurrency(total)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="form-actions">
        <button
          className="btn"
          type="button"
          onClick={() => navigate(initialInvoice ? `/invoices/${initialInvoice.id}` : "/")}
          disabled={saving}
        >
          Cancel
        </button>
        <button className="btn btn--primary" type="submit" disabled={saving}>
          {saving ? "Saving…" : initialInvoice ? "Save changes" : "Save invoice"}
        </button>
      </div>
    </form>
  );
}
