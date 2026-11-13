import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Icon from "../components/Icon";
import InvoiceForm from "../components/InvoiceForm";
import Notice from "../components/Notice";
import PageHeader from "../components/PageHeader";
import { useToast } from "../components/Toast";
import { getApiError } from "../services/api";
import { getInvoice, updateInvoice } from "../services/invoiceService";

export default function EditInvoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getInvoice(id)
      .then((result) => active && setInvoice(result))
      .catch((requestError) => active && setError(getApiError(requestError)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  async function save(payload) {
    setSaving(true);
    setError("");
    try {
      const updated = await updateInvoice(id, payload);
      toast.success(`Invoice ${updated?.invoice_number ?? invoice.invoice_number} updated.`);
      navigate(`/invoices/${id}`);
    } catch (requestError) {
      setError(getApiError(requestError));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  }

  const back = (
    <Link to={invoice ? `/invoices/${invoice.id}` : "/"} className="back-link">
      <Icon name="back" size={16} />
      {invoice ? `Back to ${invoice.invoice_number}` : "All invoices"}
    </Link>
  );

  return (
    <>
      <PageHeader
        back={back}
        title={invoice ? `Edit ${invoice.invoice_number}` : "Edit invoice"}
        description="Change the customer, date or lines. The total is recalculated when you save."
      />
      {loading ? (
        <div className="form-sheet form-sheet--loading" aria-busy="true" />
      ) : invoice ? (
        <InvoiceForm key={invoice.id} initialInvoice={invoice} onSave={save} saving={saving} error={error} />
      ) : (
        <Notice>{error || "This invoice could not be found."}</Notice>
      )}
    </>
  );
}
