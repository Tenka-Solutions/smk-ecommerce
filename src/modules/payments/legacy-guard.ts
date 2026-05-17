import { NextResponse } from "next/server";

// Central guard for local-only Next payment routes. In production these routes
// must never mutate payment state; hubcafe-backend is the only live Flow path.
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
