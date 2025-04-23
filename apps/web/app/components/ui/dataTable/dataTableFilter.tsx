import { Table } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { Button } from "@/components/ui/button";
import { Funnel } from "lucide-react";
import { Input } from "@/components/ui/input";
import React from "react";

interface DataTableFilterProps<TData> {
  table: Table<TData>;
}

export function DataTableFilter<TData>({ table }: DataTableFilterProps<TData>) {
  // Get the first filterable column as the default filter
  const firstFilterableColumn = table
    .getAllColumns()
    .find((column) => column.getCanFilter())?.id;

  const [filterColumn, setFilterColumn] = React.useState<string>(
    firstFilterableColumn || ""
  );

  return (
    <div className="flex items-center py-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="ml-auto h-8 lg:flex">
            <Funnel />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Select filter</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {table
            .getAllColumns()
            .filter((column) => column.getCanFilter())
            .map((column) => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={filterColumn === column.id} // Only one filter can be active
                  onCheckedChange={() => {
                    // Clear all filters and set the selected column as the active filter
                    table.resetColumnFilters();
                    setFilterColumn(column.id || "");
                  }}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              );
            })}
        </DropdownMenuContent>
      </DropdownMenu>
      <Input
        placeholder={`Search by ${filterColumn}...`}
        value={
          (table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""
        }
        onChange={(event) => {
          // Clear all filters and set the value for the selected column
          table.resetColumnFilters();
          table.getColumn(filterColumn)?.setFilterValue(event.target.value);
        }}
        className="max-w-sm"
      />
    </div>
  );
}
