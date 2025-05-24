"use client";

import { getAllStores } from "@/actions/storeActions";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/dataTable/data-table";
import { useEffect, useState } from "react";
import { Store } from "@monkeyprint/db";
//wallet amount imports
import { getStoreNetEarning } from "@/actions/storeActions";

export default function SAdminDashboardPage() {
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    const fetchStores = async () => {
      const storesData = await getAllStores();
      const enhancedStores = await Promise.all(
        storesData.map(async (store) => {
          try {
            // Get earnings data
            const earningsResponse = await getStoreNetEarning(store.id);

            // Safely access netEarnings with optional chaining
            return {
              ...store,
              netEarnings:
                earningsResponse.success && earningsResponse.data
                  ? earningsResponse.data.netEarnings
                  : 0,
            };
          } catch (error) {
            console.error(
              `Error fetching earnings for store ${store.id}:`,
              error
            );
            return {
              ...store,
              netEarnings: 0,
            };
          }
        })
      );
      setStores(enhancedStores);
    };
    fetchStores();
  }, []);

  return (
    <div className=" items-center mx-2 w-[96vw] lg:w-[98vw] lg:pl-2">
      <div className="container mx-auto">
        <DataTable columns={columns} data={stores} />
      </div>
    </div>
  );
}
