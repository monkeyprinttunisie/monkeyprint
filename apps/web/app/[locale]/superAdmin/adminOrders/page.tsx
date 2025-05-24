"use client";

import { columns } from "./columns";
import { DataTable } from "@/components/ui/dataTable/data-table";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getOrders, getOrdersByStoreId } from "@/actions/orderActions";
import { OrderWithItems } from "@/actions/orderActions";
import { orderItemsColumn } from "./orderItemsColumn";

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const searchParams = useSearchParams();
  const storeId = searchParams.get("id");

  useEffect(() => {
    const fetchOrders = async () => {
      if (storeId) {
        // Fetch orders for the specific store ID
        const orderData = await getOrdersByStoreId(storeId);
        setOrders(orderData);
      } else {
        // Fetch all orders if no store ID is provided
        const allOrders = await getOrders();
        setOrders(allOrders.orders || []);
      }
    };

    fetchOrders();
  }, [storeId]);

  return (
    <div className="items-center mx-2 w-[96vw] lg:w-[100%] lg:px-5">
      <div className="container mx-auto">
        <DataTable
          columns={columns}
          data={orders}
          renderSubTable={(order) => (
            <DataTable
              columns={orderItemsColumn} // Use the orderItemsColumn
              data={order.items || []} // Pass the order items
            />
          )}
        />
      </div>
    </div>
  );
}
