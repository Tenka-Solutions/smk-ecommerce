import { redirect } from "next/navigation";

export default async function LegacyPaymentReturnPage({
  searchParams,
}: {
  searchParams: Promise<{
    order?: string;
    status?: string;
  }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams({
    status: "unverified",
    reason: "legacy_return",
  });

  if (params.order) {
    query.set("order", params.order);
  }

  redirect(`/compra/pendiente?${query.toString()}`);
}
