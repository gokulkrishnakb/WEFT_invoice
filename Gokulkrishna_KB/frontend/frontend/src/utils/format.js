import { money } from "../config";

const currencyFormatter = new Intl.NumberFormat(money.locale, {
  style: "currency",
  currency: money.currency,
});

const plainFormatter = new Intl.NumberFormat(money.locale, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(value) {
  return currencyFormatter.format(Number(value ?? 0));
}

/** Number with grouping and 2 decimals, no currency symbol (for table columns). */
export function formatAmount(value) {
  return plainFormatter.format(Number(value ?? 0));
}

export function formatQuantity(value) {
  const n = Number(value ?? 0);
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

// ---- exact cent arithmetic (avoids floating-point drift in totals) ----
function toCents(value) {
  const text = String(value ?? "0").trim() || "0";
  const negative = text.startsWith("-");
  const [whole = "0", fraction = ""] = text.replace("-", "").split(".");
  const cents =
    BigInt(whole.replace(/\D/g, "") || "0") * 100n +
    BigInt(fraction.replace(/\D/g, "").padEnd(2, "0").slice(0, 2) || "0");
  return negative ? -cents : cents;
}

function fromCents(cents) {
  const sign = cents < 0n ? "-" : "";
  const abs = cents < 0n ? -cents : cents;
  return `${sign}${abs / 100n}.${String(abs % 100n).padStart(2, "0")}`;
}

export function calculateLineTotal(quantity, price) {
  const product = toCents(quantity) * toCents(price);
  return fromCents((product + 50n) / 100n);
}

export function sumCurrency(values) {
  return fromCents(values.reduce((total, value) => total + toCents(value), 0n));
}

// ---- dates ----
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(value) {
  if (!value) return "—";
  return dateFormatter.format(new Date(`${value}T00:00:00Z`));
}

export function todayString() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}
