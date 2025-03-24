import OrderDetailClient from "./order-detail-client";

export default function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <OrderDetailClient id={params.id} />;
}
