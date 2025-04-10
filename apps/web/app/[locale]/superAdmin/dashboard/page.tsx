"use client";

import { getAllStores } from "@/actions/storeActions";
import { columns } from "./columns";
import { DataTable } from "../../../components/ui/dataTable/data-table";
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
    <div className="flex flex-col gap-5 items-center h-[92vh] w-screen p-5">
      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={stores} />
      </div>
    </div>
  );
}
