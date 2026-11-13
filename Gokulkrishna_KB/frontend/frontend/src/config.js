const env = import.meta.env;

export const money = {
  currency: env.VITE_CURRENCY || "INR",
  locale: env.VITE_LOCALE || "en-IN",
};

// Printed on invoices. Change these in .env (see .env.example).
export const company = {
  name: env.VITE_COMPANY_NAME || "Ledgerly Trading Co.",
  address: env.VITE_COMPANY_ADDRESS ?? "2nd Floor, Marine Drive, Kochi, Kerala 682031",
  email: env.VITE_COMPANY_EMAIL ?? "accounts@ledgerly.example",
  phone: env.VITE_COMPANY_PHONE ?? "+91 484 000 0000",
  taxId: env.VITE_COMPANY_TAX_ID ?? "",
  note:
    env.VITE_INVOICE_NOTE ??
    "Thank you for your business. Payment is due within 30 days of the invoice date.",
};
