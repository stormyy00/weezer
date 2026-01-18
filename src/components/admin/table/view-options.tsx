

import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { type Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { FlipHorizontal2 } from "lucide-react";

type DataTableViewOptionsProps<TData> = {
  table: Table<TData>;
};

const DataTableViewOptions = <TData,>({
  table,
}: DataTableViewOptionsProps<TData>) => {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ms-auto hidden h-8 lg:flex"
        >
          <FlipHorizontal2 className="size-4" />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide(),
          )
          .map(({ id, getIsVisible, toggleVisibility }) => {
            return (
              <DropdownMenuCheckboxItem
                key={id}
                className="capitalize"
                checked={getIsVisible()}
                onCheckedChange={(value) => toggleVisibility(!!value)}
              >
                {id}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DataTableViewOptions;
