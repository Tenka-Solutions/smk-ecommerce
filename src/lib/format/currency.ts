export const VAT_RATE = 0.19;

export function addVat(value: number) {
  return Math.round(value * (1 + VAT_RATE));
}

export function extractTaxAmount(grossValue: number) {
  return Math.round(grossValue - grossValue / (1 + VAT_RATE));
}

export function formatClp(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}
