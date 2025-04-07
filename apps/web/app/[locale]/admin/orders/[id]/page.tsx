import OrderDetailClient from "./order-detail-client";

export default function OrderDetailPage({ params }: any) {
  return <OrderDetailClient id={params.id} />;
}
