import { z } from "zod";
import { CartItem } from "@/lib/cart-store";

const phoneRegex = /^\+?56\s?9\s?\d{4}\s?\d{4}$/;

function isValidRut(rut: string) {
  const clean = rut.replace(/[.\-]/g, "").toUpperCase();
  if (!/^\d{7,8}[0-9K]$/.test(clean)) {
    return false;
  }

  const digits = clean.slice(0, -1);
  const verifier = clean.slice(-1);
  let sum = 0;
  let multiplier = 2;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    sum += Number.parseInt(digits[index], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (sum % 11);
  const expected =
    remainder === 11 ? "0" : remainder === 10 ? "K" : String(remainder);

  return verifier === expected;
}

export const checkoutCustomerSchema = z
  .object({
    documentType: z.enum(["boleta", "factura"]).default("boleta"),
    fullName: z.string().min(3, "Ingresa tu nombre completo"),
    email: z.string().email("Ingresa un correo válido"),
    phone: z.string().regex(phoneRegex, "Ingresa un teléfono chileno válido"),
    rut: z
      .string()
      .trim()
      .optional()
      .refine((value) => !value || isValidRut(value), "RUT inválido"),
    companyName: z.string().trim().optional(),
    businessName: z.string().trim().optional(),
    businessActivity: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.documentType !== "factura") return;
    if (!data.rut || !isValidRut(data.rut)) {
      ctx.addIssue({
        path: ["rut"],
        code: z.ZodIssueCode.custom,
        message: "RUT requerido para factura",
      });
    }
    if (!data.businessName?.trim()) {
      ctx.addIssue({
        path: ["businessName"],
        code: z.ZodIssueCode.custom,
        message: "Razón social requerida para factura",
      });
    }
    if (!data.businessActivity?.trim()) {
      ctx.addIssue({
        path: ["businessActivity"],
        code: z.ZodIssueCode.custom,
        message: "Giro requerido para factura",
      });
    }
  });

export const checkoutShippingSchema = z.object({
  region: z.string().min(2, "Selecciona una región"),
  comuna: z.string().min(2, "Ingresa la comuna"),
  street: z.string().min(3, "Ingresa la dirección"),
  number: z.string().min(1, "Ingresa el número"),
  apartment: z.string().trim().optional(),
  references: z.string().trim().optional(),
  deliveryNotes: z.string().trim().optional(),
});

export const checkoutItemSchema = z.object({
  id: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const checkoutPayloadSchema = z.object({
  customer: checkoutCustomerSchema,
  shipping: checkoutShippingSchema,
  items: z.array(checkoutItemSchema).min(1, "Tu carrito está vacío"),
  authMode: z.enum(["guest", "google"]).default("guest"),
});

export type CheckoutPayload = z.infer<typeof checkoutPayloadSchema>;
export type CheckoutCustomerInput = z.infer<typeof checkoutCustomerSchema>;
export type CheckoutShippingInput = z.infer<typeof checkoutShippingSchema>;

export function toCheckoutItemPayload(items: CartItem[]) {
  return items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
  }));
}
