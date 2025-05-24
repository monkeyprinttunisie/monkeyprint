"use client";

import { getAllStores } from "@/actions/storeActions";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/dataTable/data-table";
import { useEffect, useState } from "react";
import { Store } from "@monkeyprint/db";

export default function SAdminDashboardPage() {
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    const fetchStores = async () => {
      const storesData = await getAllStores();
      setStores(storesData);
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
