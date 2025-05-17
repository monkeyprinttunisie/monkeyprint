import OrderDetailClient from "./order-detail-client";

export default async function OrderDetailPage({ params }: any) {
  return <OrderDetailClient id={params.id} />;
}
