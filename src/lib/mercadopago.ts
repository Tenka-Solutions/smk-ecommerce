import { MercadoPagoConfig, Preference } from "mercadopago";

export function getPreferenceClient(): Preference {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) {
    throw new Error("MP_ACCESS_TOKEN env variable is not set");
  }
  const client = new MercadoPagoConfig({ accessToken: token });
  return new Preference(client);
}
