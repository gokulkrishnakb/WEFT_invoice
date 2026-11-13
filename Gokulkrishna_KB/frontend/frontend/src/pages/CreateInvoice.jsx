import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import InvoiceForm from "../components/InvoiceForm";
import PageHeader from "../components/PageHeader";
import { useToast } from "../components/Toast";
import { getApiError } from "../services/api";
import { createInvoice } from "../services/invoiceService";

export default function CreateInvoice() {
  const navigate = useNavigate();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(payload) {
    setSaving(true);
    setError("");
    try {
      const invoice = await createInvoice(payload);
      toast.success(`Invoice ${invoice.invoice_number} saved.`);
      navigate(`/invoices/${invoice.id}`);
    } catch (requestError) {
      setError(getApiError(requestError));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        back={
          <Link to="/" className="back-link">
            <Icon name="back" size={16} />
            All invoices
          </Link>
        }
        title="New invoice"
        description="Line amounts and the total update as you type. The invoice number is assigned when you save."
      />
      <InvoiceForm onSave={save} saving={saving} error={error} />
    </>
  );
}
