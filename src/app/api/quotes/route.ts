import { NextResponse } from "next/server";
import { quoteRequestSchema } from "@/modules/quotes/schema";
import { createQuoteRequest } from "@/modules/quotes/service";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = quoteRequestSchema.safeParse(payload);

    if (!result.success) {
      return NextResponse.json(
        {
          error:
            result.error.issues[0]?.message ??
            "No fue posible validar la solicitud.",
        },
        { status: 400 }
      );
    }

    const quote = await createQuoteRequest(result.data);

    return NextResponse.json(
      {
        ok: true,
        id: quote.id,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No pudimos registrar la cotizacion.",
      },
      { status: 500 }
    );
  }
}
