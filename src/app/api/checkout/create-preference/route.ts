import { NextRequest, NextResponse } from "next/server";
import { getPreferenceClient } from "@/lib/mercadopago";
import { checkoutSchema } from "@/lib/validations/checkout";
import { CartItem } from "@/lib/cart-store";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yellowbox.cl";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, payer } = body as { items: CartItem[]; payer: unknown };

    // Validate payer data
    const payerResult = checkoutSchema.safeParse(payer);
    if (!payerResult.success) {
      return NextResponse.json(
        { error: "Datos del comprador inválidos" },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Carrito vacío" }, { status: 400 });
    }

    const { name, email, phone, rut } = payerResult.data;
    const [firstName, ...lastParts] = name.split(" ");
    const lastName = lastParts.join(" ") || firstName;

    const preference = await getPreferenceClient().create({
      body: {
        items: items.map((item) => ({
          id: item.id,
          title: item.name,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.price,
          currency_id: "CLP",
        })),
        payer: {
          name: firstName,
          surname: lastName,
          email,
          phone: { area_code: "56", number: phone.replace(/\D/g, "").slice(-8) },
          identification: { type: "RUT", number: rut.replace(/[.\-]/g, "") },
        },
        back_urls: {
          success: `${BASE_URL}/confirmacion`,
          failure: `${BASE_URL}/pago-fallido`,
          pending: `${BASE_URL}/confirmacion`,
        },
        auto_return: "approved",
        statement_descriptor: "YELLOW BOX",
      },
    });

    return NextResponse.json({ init_point: preference.init_point });
  } catch (err) {
    console.error("[create-preference]", err);
    return NextResponse.json(
      { error: "Error interno al crear la preferencia de pago" },
      { status: 500 }
    );
  }
}
