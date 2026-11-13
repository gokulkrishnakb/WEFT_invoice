import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Icon from "../components/Icon";
import InvoiceDocument from "../components/InvoiceDocument";
import Notice from "../components/Notice";
import PageHeader from "../components/PageHeader";
import { useToast } from "../components/Toast";
import { getApiError } from "../services/api";
import { getInvoice } from "../services/invoiceService";
import { csvAmount, downloadCsv } from "../utils/csv";
import { formatCurrency, formatDate } from "../utils/format";

function BackLink() {
  return (
    <Link to="/" className="back-link no-print">
      <Icon name="back" size={16} />
      All invoices
    </Link>
  );
}

export default function InvoiceDetails() {
  const { id } = useParams();
  const toast = useToast();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    getInvoice(id)
      .then((result) => active && setInvoice(result))
      .catch((requestError) => active && setError(getApiError(requestError)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  // The browser uses the page title as the default PDF file name.
  useEffect(() => {
    if (!invoice) return undefined;
    const previous = document.title;
    document.title = `Invoice ${invoice.invoice_number} - ${invoice.customer_name}`;
    return () => {
      document.title = previous;
    };
  }, [invoice]);

  function exportCsv() {
    const rows = [
      ["Invoice number", invoice.invoice_number],
      ["Customer name", invoice.customer_name],
      ["Invoice date", invoice.date],
      [],
      ["Line", "Product or service", "Quantity", "Unit price", "Amount"],
      ...invoice.items.map((item, index) => [
        index + 1,
        item.product_name,
        Number(item.quantity),
        csvAmount(item.price),
        csvAmount(item.total),
      ]),
      [],
      ["", "", "", "Total", csvAmount(invoice.total_amount)],
    ];
    downloadCsv(`invoice-${invoice.invoice_number}.csv`, rows);
    toast.success(`Invoice ${invoice.invoice_number} exported to CSV.`);
  }

  if (loading) {
    return (
      <>
        <BackLink />
        <div className="doc doc--loading" aria-busy="true" />
      </>
    );
  }

  if (!invoice) {
    return (
      <>
        <PageHeader back={<BackLink />} title="Invoice not available" />
        <Notice>{error || "This invoice could not be found. It may have been deleted."}</Notice>
      </>
    );
  }

  return (
    <div className="details">
      <PageHeader
        back={<BackLink />}
        title={invoice.invoice_number}
        description={`${invoice.customer_name}, ${formatDate(invoice.date)}, ${formatCurrency(invoice.total_amount)}`}
        actions={
          <>
            <Link to={`/invoices/${invoice.id}/edit`} className="btn">
              <Icon name="edit" size={17} />
              Edit
            </Link>
            <button className="btn" onClick={exportCsv}>
              <Icon name="download" size={17} />
              Export CSV
            </button>
            <button className="btn btn--primary" onClick={() => window.print()}>
              <Icon name="print" size={17} />
              Print invoice
            </button>
          </>
        }
      />
      <InvoiceDocument invoice={invoice} />
    </div>
  );
}
