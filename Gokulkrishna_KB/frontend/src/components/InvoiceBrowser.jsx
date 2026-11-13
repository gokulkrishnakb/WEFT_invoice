import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { company } from "../config";
import { getApiError } from "../services/api";
import { deleteInvoice, listAllInvoices, listInvoices } from "../services/invoiceService";
import { csvAmount, downloadCsv, stamp } from "../utils/csv";
import { formatAmount, formatCurrency, formatDate, sumCurrency } from "../utils/format";
import ConfirmDialog from "./ConfirmDialog";
import Icon from "./Icon";
import InvoiceFilters from "./InvoiceFilters";
import InvoiceTable from "./InvoiceTable";
import Notice from "./Notice";
import PageHeader from "./PageHeader";
import { useToast } from "./Toast";

const PAGE_SIZE = 10;
const emptyFilters = { invoice_number: "", start_date: "", end_date: "" };

function activeParams(filters) {
  const params = {};
  for (const [key, value] of Object.entries(filters)) {
    if (value && value.trim()) params[key] = value.trim();
  }
  return params;
}

function describeFilters(filters) {
  const parts = [];
  if (filters.start_date && filters.end_date) {
    parts.push(`${formatDate(filters.start_date)} to ${formatDate(filters.end_date)}`);
  } else if (filters.start_date) {
    parts.push(`From ${formatDate(filters.start_date)}`);
  } else if (filters.end_date) {
    parts.push(`Up to ${formatDate(filters.end_date)}`);
  }
  if (filters.invoice_number.trim()) parts.push(`invoice number contains “${filters.invoice_number.trim()}”`);
  return parts.length ? parts.join(", ") : "All dates";
}

export default function InvoiceBrowser({ report = false }) {
  const toast = useToast();
  const [values, setValues] = useState(emptyFilters);
  const [filters, setFilters] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(""); // "export" | "print" | ""
  const [printRows, setPrintRows] = useState(null);

  const isFiltered = Object.keys(activeParams(filters)).length > 0;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await listInvoices({ page, limit: PAGE_SIZE, ...activeParams(filters) });
      if (result.items?.length === 0 && page > 1 && result.total > 0) {
        setPage(page - 1); // last row on the final page was deleted
        return;
      }
      setData(result);
    } catch (requestError) {
      setError(getApiError(requestError));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    load();
  }, [load]);

  // Print the full report once every matching row has rendered.
  useEffect(() => {
    if (!printRows) return undefined;
    const done = () => setPrintRows(null);
    window.addEventListener("afterprint", done, { once: true });
    const timer = window.setTimeout(() => window.print(), 60);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("afterprint", done);
    };
  }, [printRows]);

  function applyFilters() {
    if (values.start_date && values.end_date && values.start_date > values.end_date) {
      setError("The start date must be on or before the end date.");
      return;
    }
    setError("");
    setPage(1);
    setFilters({ ...values });
  }

  function clearFilters() {
    setError("");
    setValues(emptyFilters);
    setFilters(emptyFilters);
    setPage(1);
  }

  async function confirmDelete() {
    if (!selected) return;
    setDeleting(true);
    try {
      await deleteInvoice(selected.id);
      toast.success(`Invoice ${selected.invoice_number} deleted.`);
      setSelected(null);
      await load();
    } catch (requestError) {
      toast.error(getApiError(requestError));
    } finally {
      setDeleting(false);
    }
  }

  async function fetchEverything() {
    const all = await listAllInvoices(activeParams(filters));
    const total = all.filtered_total_amount ?? sumCurrency(all.items.map((i) => i.total_amount));
    return { ...all, totalAmount: total };
  }

  async function exportCsv() {
    setBusy("export");
    try {
      const { items, totalAmount } = await fetchEverything();
      if (items.length === 0) {
        toast.error("There are no invoices to export for these filters.");
        return;
      }
      const rows = [
        ["Invoice number", "Customer name", "Invoice date", "Amount"],
        ...items.map((invoice) => [
          invoice.invoice_number,
          invoice.customer_name,
          invoice.date,
          csvAmount(invoice.total_amount),
        ]),
        [],
        ["Total", `${items.length} invoices`, "", csvAmount(totalAmount)],
      ];
      downloadCsv(`${report ? "invoice-report" : "invoices"}-${stamp()}.csv`, rows);
      toast.success(`Exported ${items.length} ${items.length === 1 ? "invoice" : "invoices"} to CSV.`);
    } catch (requestError) {
      toast.error(getApiError(requestError));
    } finally {
      setBusy("");
    }
  }

  async function printReport() {
    setBusy("print");
    try {
      const { items, totalAmount } = await fetchEverything();
      setPrintRows({ items, totalAmount, generated: new Date() });
    } catch (requestError) {
      toast.error(getApiError(requestError));
    } finally {
      setBusy("");
    }
  }

  const count = data?.total ?? 0;
  const totalAmount = data?.filtered_total_amount ?? 0;

  const exportButton = (
    <button className="btn" onClick={exportCsv} disabled={busy !== "" || loading}>
      <Icon name="download" size={17} />
      {busy === "export" ? "Exporting…" : "Export CSV"}
    </button>
  );

  return (
    <>
      {report ? (
        <PageHeader
          className={printRows ? "no-print" : ""}
          title="Invoice report"
          description="Every invoice in the period you choose, with its customer, date and amount."
          actions={
            <>
              {exportButton}
              <button className="btn" onClick={printReport} disabled={busy !== "" || loading}>
                <Icon name="print" size={17} />
                {busy === "print" ? "Preparing…" : "Print report"}
              </button>
            </>
          }
        />
      ) : (
        <PageHeader
          title="Invoices"
          description={
            loading && !data
              ? "Loading invoices…"
              : count === 0
                ? isFiltered
                  ? "No invoices match these filters."
                  : "Nothing billed yet."
                : `${count.toLocaleString()} ${count === 1 ? "invoice" : "invoices"}${
                    isFiltered ? " match" : ""
                  }, totalling ${formatCurrency(totalAmount)}.`
          }
          actions={exportButton}
        />
      )}

      <InvoiceFilters
        values={values}
        onChange={(key, value) => setValues((current) => ({ ...current, [key]: value }))}
        onSubmit={applyFilters}
        onClear={clearFilters}
        idPrefix={report ? "report" : "list"}
        active={isFiltered || Object.values(values).some(Boolean)}
      />

      <Notice>{error}</Notice>

      {report && (
        <section className="statement no-print" aria-label="Report summary">
          <div>
            <p className="statement__label">Period</p>
            <p className="statement__value">{describeFilters(filters)}</p>
          </div>
          <div>
            <p className="statement__label">Invoices</p>
            <p className="statement__value">{loading ? "…" : count.toLocaleString()}</p>
          </div>
          <div className="statement__total">
            <p className="statement__label">Total invoiced</p>
            <p className="statement__amount">{loading ? "…" : formatCurrency(totalAmount)}</p>
          </div>
        </section>
      )}

      <div className={printRows ? "no-print" : undefined}>
        <InvoiceTable
          invoices={data?.items ?? []}
          loading={loading}
          pageData={data}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          onDelete={setSelected}
          readOnly={report}
          filtered={isFiltered}
          emptyAction={
            !report && (
              <Link className="btn btn--primary btn--sm" to="/invoices/new">
                <Icon name="plus" size={16} />
                Create the first invoice
              </Link>
            )
          }
        />
      </div>

      {printRows && (
        <div className="print-only report-print">
          <header className="report-print__head">
            <div>
              <p className="report-print__company">{company.name}</p>
              <h1>Invoice report</h1>
              <p>{describeFilters(filters)}</p>
            </div>
            <p className="report-print__meta">
              Generated {printRows.generated.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
            </p>
          </header>
          <table className="doc-table">
            <thead>
              <tr>
                <th>Invoice number</th>
                <th>Customer name</th>
                <th>Date</th>
                <th className="num">Amount</th>
              </tr>
            </thead>
            <tbody>
              {printRows.items.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice.invoice_number}</td>
                  <td>{invoice.customer_name}</td>
                  <td>{formatDate(invoice.date)}</td>
                  <td className="num">{formatAmount(invoice.total_amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3}>
                  Total, {printRows.items.length} {printRows.items.length === 1 ? "invoice" : "invoices"}
                </td>
                <td className="num">{formatCurrency(printRows.totalAmount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(selected)}
        title={selected ? `Delete invoice ${selected.invoice_number}?` : ""}
        message={
          selected
            ? `This removes the invoice for ${selected.customer_name} (${formatCurrency(
                selected.total_amount,
              )}) and all of its line items. It can't be undone.`
            : ""
        }
        busy={deleting}
        onCancel={() => setSelected(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
