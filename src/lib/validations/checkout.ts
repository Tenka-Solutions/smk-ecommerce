import { z } from "zod";

// Validates Chilean RUT format (e.g. 12345678-9 or 12345678-K)
function isValidRut(rut: string): boolean {
  const clean = rut.replace(/[.\-]/g, "").toUpperCase();
  if (!/^\d{7,8}[0-9K]$/.test(clean)) return false;
  const digits = clean.slice(0, -1);
  const verifier = clean.slice(-1);
  let sum = 0;
  let multiplier = 2;
  for (let i = digits.length - 1; i >= 0; i--) {
    sum += parseInt(digits[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const remainder = 11 - (sum % 11);
  const expected =
    remainder === 11 ? "0" : remainder === 10 ? "K" : String(remainder);
  return verifier === expected;
}

export const checkoutSchema = z.object({
  name: z.string().min(3, "Ingresa tu nombre completo"),
  email: z.string().email("Correo electrónico inválido"),
  phone: z
    .string()
    .regex(/^\+?56\s?9\s?\d{4}\s?\d{4}$/, "Teléfono chileno inválido (ej: +56 9 1234 5678)"),
  rut: z.string().refine(isValidRut, { message: "RUT inválido" }),
  region: z.string().min(1, "Selecciona una región"),
  comuna: z.string().min(2, "Ingresa tu comuna"),
  address: z.string().min(5, "Ingresa tu dirección"),
  notes: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
