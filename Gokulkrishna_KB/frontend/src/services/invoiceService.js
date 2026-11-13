import api from "./api";

export async function listInvoices(params = {}) {
  const { data } = await api.get("/invoices", { params });
  return data;
}

export async function getInvoice(id) {
  const { data } = await api.get(`/invoices/${id}`);
  return data;
}

export async function createInvoice(payload) {
  const { data } = await api.post("/invoices", payload);
  return data;
}

export async function updateInvoice(id, payload) {
  const { data } = await api.put(`/invoices/${id}`, payload);
  return data;
}

export async function deleteInvoice(id) {
  const { data } = await api.delete(`/invoices/${id}`);
  return data;
}

/**
 * Every invoice matching the filters, across all pages (for CSV export and printing).
 * Uses the largest page size the API accepts, stepping down if it rejects one.
 */
export async function listAllInvoices(filters = {}) {
  const sizes = [100, 50, 20, 10];
  for (const limit of sizes) {
    try {
      const first = await listInvoices({ ...filters, page: 1, limit });
      const items = [...(first.items ?? [])];
      const pages = Math.min(first.pages ?? 1, 500);
      for (let page = 2; page <= pages; page += 1) {
        const next = await listInvoices({ ...filters, page, limit });
        items.push(...(next.items ?? []));
      }
      return {
        items,
        total: first.total ?? items.length,
        filtered_total_amount: first.filtered_total_amount,
      };
    } catch (error) {
      const tooLarge = error.response?.status === 422 && limit !== sizes[sizes.length - 1];
      if (!tooLarge) throw error;
    }
  }
  return { items: [], total: 0, filtered_total_amount: 0 };
}
