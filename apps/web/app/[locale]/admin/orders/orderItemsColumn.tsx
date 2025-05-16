"use client";

import { getProductById } from "@/actions/productActions";
import { DataTableColumnHeader } from "@/components/ui/dataTable/dataTableColumnHeader";
import { OrderItem } from "@monkeyprint/db";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";

const productCache = new Map<string, { id: string; name: string }>();
export const orderItemsColumn: ColumnDef<OrderItem>[] = [
  {
    id: "product name",
    accessorKey: "productId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product Name" />
    ),
    cell: ({ row }) => {
      const [name, setName] = useState<string | null>(null);

      useEffect(() => {
        const fetchProductName = async () => {
          const productId = row.getValue("product name") as string;
          if (productCache.has(productId)) {
            // Use cached data if available
            setName(productCache.get(productId)?.name || null);
          } else {
            // Fetch data and cache it
            const productData = await getProductById(productId);
            if (productData.product) {
              productCache.set(productId, productData.product);
              setName(productData.product.name || null);
            }
          }
        };
        fetchProductName();
      }, [row]);

      return <div>{name || "Loading..."}</div>;
    },
    filterFn: (row, columnId, filterValue) => {
      const productId = row.getValue(columnId) as string;
      if (productCache.has(productId)) {
        const productData = productCache.get(productId);
        return (
          productData?.name
            ?.toLowerCase()
            .includes(filterValue.toLowerCase()) || false
        );
      }
      return false;
    },
  },
  {
    id: "quantity",
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    id: "price",
    accessorKey: "price",
    header: "Price",
  },
];
