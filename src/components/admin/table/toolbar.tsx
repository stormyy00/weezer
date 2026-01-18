"use no memo";

import { type Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CrossIcon } from "lucide-react";
import DataTableFacetedFilter from "./filter";

type DataTableToolbarProps<TData> = {
  table: Table<TData>;
  searchPlaceholder?: string;
  searchKey?: string;
  filters?: {
    columnId: string;
    title: string;
    options: {
      label: string;
      value: string;
    }[];
  }[];
};

const DataTableToolbar = <TData,>({
  table,
  searchPlaceholder = "Filter...",
  searchKey,
  filters = [],
}: DataTableToolbarProps<TData>) => {
  const isFiltered =
    table.getState().columnFilters.length > 0 || table.getState().globalFilter;

  return (
    <div className="flex items-center justify-between relative z-50">
      <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
        <Input
          placeholder={searchPlaceholder}
          value={
            (searchKey
              ? (table.getColumn(searchKey)?.getFilterValue() as string)
              : undefined) ?? ""
          }
          onChange={(event) => {
            if (searchKey) {
              table.getColumn(searchKey)?.setFilterValue(event.target.value);
            }
          }}
          className="h-8 w-[150px] lg:w-[250px] relative z-10"
          autoComplete="off"
        />
        <div className="flex gap-x-2">
          {filters.map(({ columnId, title, options }) => {
            const column = table.getColumn(columnId);
            if (!column) return null;
            return (
              <DataTableFacetedFilter
                key={columnId}
                column={column}
                title={title}
                options={options}
              />
            );
          })}
        </div>
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters();
              table.setGlobalFilter("");
            }}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <CrossIcon className="ms-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default DataTableToolbar;
