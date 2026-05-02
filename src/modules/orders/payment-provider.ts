const paymentProviderLabels: Record<string, string> = {
  flow: "Flow",
  transbank: "Webpay / Transbank",
  webpay: "Webpay",
  mercadopago: "Mercado Pago",
  mock: "Registro antiguo",
};

function humanizeProvider(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function formatPaymentProvider(provider?: string | null) {
  const normalized = String(provider ?? "")
    .trim()
    .toLowerCase();

  if (!normalized) {
    return "No definido";
  }

  return paymentProviderLabels[normalized] ?? humanizeProvider(normalized);
}

export function isLegacyPaymentProvider(provider?: string | null) {
  return String(provider ?? "")
    .trim()
    .toLowerCase() === "mock";
}
