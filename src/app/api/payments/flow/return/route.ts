import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getFlowPaymentStatus } from "@/modules/payments/providers/flow";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const token = form.get("token");
  return handle(typeof token === "string" ? token : null);
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  return handle(token);
}

async function handle(token: string | null) {
  if (!token) {
    return NextResponse.redirect(new URL("/compra/rechazada", env.siteUrl));
  }

  let paid = false;
  let commerceOrder: string | null = null;

  try {
    const status = await getFlowPaymentStatus(token);
    paid = status.status === 2;
    commerceOrder = status.commerceOrder ?? null;
  } catch {
    paid = false;
  }

  const target = new URL(
    paid ? "/compra/exito" : "/compra/rechazada",
    env.siteUrl
  );
  if (commerceOrder) {
    target.searchParams.set("order", commerceOrder);
  }
  target.searchParams.set("reference", token);

  return NextResponse.redirect(target);
}
