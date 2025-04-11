"use client";

import { columns } from "./columns";
import { DataTable } from "../../../components/ui/dataTable/data-table";
import { useEffect, useState } from "react";
import { getOredersByUserId } from "@/actions/orderActions";
import { Order } from "@monkeyprint/db";

export default function AdminOrders(params: { id: string }) {
  const [order, setSOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const orderData = await getOredersByUserId(params.id);
      setSOrders(orderData);
    };
    fetchOrders();
  }, []);

  return (
    <div className="flex flex-col gap-5 items-center h-[92vh] w-screen p-5">
      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={order} />
      </div>
    </div>
  );
}
