import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import CreateInvoice from "./pages/CreateInvoice";
import Dashboard from "./pages/Dashboard";
import EditInvoice from "./pages/EditInvoice";
import InvoiceDetails from "./pages/InvoiceDetails";
import InvoiceReport from "./pages/InvoiceReport";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="invoices/new" element={<CreateInvoice />} />
        <Route path="invoices/:id/edit" element={<EditInvoice />} />
        <Route path="invoices/:id" element={<InvoiceDetails />} />
        <Route path="reports" element={<InvoiceReport />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

