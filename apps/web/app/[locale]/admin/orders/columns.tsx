"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/ui/dataTable/dataTableColumnHeader";
import { Checkbox } from "@/components/ui/checkbox";
import { getStoreById } from "@/actions/storeActions";
import { useEffect, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrderWithItems } from "@/actions/orderActions";
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

const storeCache = new Map<string, { id: string; name: string }>();
export const columns: ColumnDef<OrderWithItems>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
  },
  {
    id: "ref",
    accessorKey: "id",
    header: "Ref",
  },
  {
    id: "store name",
    accessorKey: "storeId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Store Name" />
    ),
    cell: ({ row }) => {
      const [name, setName] = useState<string | null>(null);

      useEffect(() => {
        const fetchStoreName = async () => {
          const storeId = row.getValue("store name") as string;
          if (storeCache.has(storeId)) {
            // Use cached data if available
            setName(storeCache.get(storeId)?.name || null);
          } else {
            // Fetch data and cache it
            const storeData = await getStoreById(storeId);
            if (storeData) {
              storeCache.set(storeId, storeData);
              setName(storeData.name || null);
            }
          }
        };
        fetchStoreName();
      }, [row]);

      return <div>{name}</div>;
    },
    filterFn: (row, columnId, filterValue) => {
      const storeId = row.getValue(columnId) as string;
      if (storeCache.has(storeId)) {
        // Use cached data for filtering
        const storeData = storeCache.get(storeId);
        return (
          storeData?.name?.toLowerCase().includes(filterValue.toLowerCase()) ||
          false
        );
      }
      return false; // If not cached, assume no match
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status");
      return (
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${status === "PENDING"
              ? "bg-yellow-500"
              : status === "COMPLETED"
                ? "bg-green-500"
                : status === "PRINTED"
                  ? "bg-blue-500"
                  : status === "FULFILLED"
                    ? "bg-purple-500"
                    : "bg-red-500"
              }`}
          />
          {status as string}
        </div>
      );
    },
  },
  {
    id: "price",
    accessorKey: "totalPrice",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("price"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "TND",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const createdAt = new Date(row.getValue("createdAt"));
      const formattedDate = createdAt.toLocaleString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      return <div>{formattedDate}</div>;
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Updated" />
    ),
    cell: ({ row }) => {
      const createdAt = new Date(row.getValue("updatedAt"));
      const formattedDate = createdAt.toLocaleString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      return <div>{formattedDate}</div>;
    },
  },
  {
    id: "shipping method",
    accessorKey: "shippingMethod",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Shipping Method" />
    ),
  },
  {
    id: "shipping fee",
    accessorKey: "shippingFee",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Shipping Fee" />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("shipping fee"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "TND",
      }).format(amount);

      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    id: "items",
    accessorKey: "items",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Items" />
    ),
    cell: ({ row }) => (
      <Button
        variant="outline"
        className=""
        onClick={row.getToggleExpandedHandler()} // Toggle expanded state
      >
        {row.getIsExpanded() ? "Collapse" : "View Items"} {/* Dynamic label */}
      </Button>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const order = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(order.id)}
            >
              Copy order ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem
              onClick={row.getToggleExpandedHandler()} // Toggle expanded state
            >
              {row.getIsExpanded() ? "Collapse" : "View details"}{" "}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
  },
];
