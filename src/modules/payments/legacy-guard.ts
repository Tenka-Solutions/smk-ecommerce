import { NextResponse } from "next/server";

export function blockLegacyPaymentRouteInProduction() {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  return NextResponse.json(
    {
      error:
        "Ruta legacy de pagos desactivada en produccion. Usa hubcafe-backend con Flow.",
    },
    { status: 410 }
  );
}
