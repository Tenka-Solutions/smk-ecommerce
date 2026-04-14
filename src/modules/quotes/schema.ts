import { z } from "zod";

const phoneRegex = /^\+?56\s?9\s?\d{4}\s?\d{4}$/;

export const quoteRequestSchema = z.object({
  name: z.string().min(3, "Ingresa tu nombre"),
  email: z.string().email("Ingresa un correo válido"),
  phone: z.string().regex(phoneRegex, "Ingresa un teléfono chileno válido"),
  company: z.string().trim().optional(),
  message: z.string().min(12, "Describe brevemente tu requerimiento"),
  productIds: z.array(z.string()).default([]),
});

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;
