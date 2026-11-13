# Ledgerly — Sales invoice frontend

React 18 + Vite. Talks to the FastAPI backend at `VITE_API_URL` (default `http://localhost:8000/api/v1`).

## Run

```bash
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm run dev               # http://localhost:5173
```

Production build: `npm run build` (output in `dist/`).

## What's in it

| Page | Path | What you can do |
|---|---|---|
| Invoices | `/` | Search by number, filter by date, page through results, edit, delete, **Export CSV** |
| New / edit invoice | `/invoices/new`, `/invoices/:id/edit` | Add and remove lines, live line amounts and total, errors shown next to each field |
| Invoice | `/invoices/:id` | The invoice as a document: **Print invoice** (A4) or **Export CSV** of its lines |
| Invoice report | `/reports` | Filter by date range and invoice number, period summary and total, **Export CSV**, **Print report** |

### CSV export
- **Invoices / Report**: every invoice matching the current filters (all pages, not just the visible one), plus a total row.
- **Single invoice**: header details, each line, and the total.
- Opens cleanly in Excel: UTF-8 with BOM (₹ displays correctly), amounts as numbers with 2 decimals, and cell values starting with `=`, `+`, `-` or `@` are neutralised so they can't run as formulas.

### Printing
- **Print invoice** prints only the invoice sheet on A4, with the footer note pinned to the bottom. In the print dialog choose *Save as PDF* to email it; the file name defaults to `Invoice <number> - <customer>`.
- **Print report** prints every matching invoice (not only the current page) with column headings repeated on each page and the grand total once at the end.

## Configuration (`.env`)

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Backend base URL |
| `VITE_CURRENCY`, `VITE_LOCALE` | Money format, e.g. `INR` / `en-IN` (default), `USD` / `en-US` |
| `VITE_COMPANY_NAME`, `VITE_COMPANY_ADDRESS`, `VITE_COMPANY_EMAIL`, `VITE_COMPANY_PHONE`, `VITE_COMPANY_TAX_ID` | Seller details printed on every invoice (empty lines are hidden; tax ID prints as GSTIN) |
| `VITE_INVOICE_NOTE` | Footer note on invoices (payment terms, thanks) |

Vite reads these at build time, so restart `npm run dev` or rebuild after changing them.

## Structure

```
src/
  config.js                 currency + seller details from .env
  styles/app.css            design tokens, components, A4 print rules
  components/
    Layout.jsx              top bar and navigation
    InvoiceBrowser.jsx      list + report: filters, paging, delete, CSV, report printing
    InvoiceTable.jsx, InvoiceFilters.jsx, Pagination.jsx
    InvoiceForm.jsx         create/edit form with inline validation
    InvoiceDocument.jsx     the invoice sheet (screen and print)
    Toast.jsx, Notice.jsx, ConfirmDialog.jsx, PageHeader.jsx
    Icon.jsx                small built-in SVG icon set
  pages/                    Dashboard, CreateInvoice, EditInvoice, InvoiceDetails, InvoiceReport
  services/                 axios client + invoice API calls
  utils/format.js           money/date formatting, exact cent arithmetic
  utils/csv.js              CSV building and download
```
