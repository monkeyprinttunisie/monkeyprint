"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Store } from "@monkeyprint/db";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { updateStoreOrdersToPaid } from "@/actions/orderActions";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/ui/dataTable/dataTableColumnHeader";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "@/../i18n/navigation";

type StoreWithEarnings = Store & {
  netEarnings?: number;
};

export const columns: ColumnDef<StoreWithEarnings>[] = [
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
  },
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      return (
        <Avatar>
          <AvatarImage src={row.getValue("image")} alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "wallet",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Wallet"
        className="justify-start"
      />
    ),
    cell: ({ row }) => {
      const store = row.original;
      const netEarnings = store.netEarnings || 0;

      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "TND",
      }).format(netEarnings);

      return <div className="text-left font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const store = row.original;
      const router = useRouter();
      const [isPaying, setIsPaying] = useState(false);

      const handlePayCustomer = () => {
        toast.custom((t) => (
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-2">Confirm Payment</h3>
            <p className="text-gray-600 mb-4">
              This will mark all fulfilled orders for{" "}
              <strong>{store.name}</strong> as paid. Continue?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => toast.dismiss(t)}>
                Cancel
              </Button>
              <Button
                variant="default"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isPaying}
                onClick={async () => {
                  setIsPaying(true);
                  toast.dismiss(t);

                  try {
                    const result = await updateStoreOrdersToPaid(store.id);

                    if (result.success) {
                      toast.success(result.message);

                      // Ask if they want to print the invoice
                      if (result.count > 0) {
                        toast.custom((t) => (
                          <div className="bg-white rounded-lg shadow-lg p-4 max-w-md mx-auto">
                            <h3 className="text-lg font-semibold mb-2">
                              Print Invoice?
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Would you like to print an invoice for this
                              payment?
                            </p>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => toast.dismiss(t)}
                              >
                                No
                              </Button>
                              <Button
                                variant="default"
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => {
                                  toast.dismiss(t);
                                  router.push(
                                    `/superAdmin/invoice?storeId=${store.id}`
                                  );
                                }}
                              >
                                Yes, Print Invoice
                              </Button>
                            </div>
                          </div>
                        ));
                      }
                    } else {
                      toast.error(result.message || "Failed to update orders.");
                    }
                  } catch (error) {
                    console.error("Error processing payment:", error);
                    toast.error("An error occurred during payment processing.");
                  } finally {
                    setIsPaying(false);
                  }
                }}
              >
                {isPaying ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Processing...
                  </>
                ) : (
                  "Confirm Payment"
                )}
              </Button>
            </div>
          </div>
        ));
      };

      return (
        <>
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
                onClick={() => navigator.clipboard.writeText(store.id)}
              >
                Copy store ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href={`/superAdmin/adminOrders?id=${store.id}`}>
                  View store orders
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href={`/superAdmin/wallet?id=${store.id}`}>
                  View Wallet
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault(); // Prevent the dropdown from closing
                  handlePayCustomer();
                }}
              >
                Pay customer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
