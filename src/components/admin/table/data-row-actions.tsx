import { type Row } from "@tanstack/react-table";
import {
  ActivitySquare,
  Hammer,
  Hand,
  MoreHorizontal,
  StopCircle,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

const labels = [
  { label: "Active", value: "active", icon: ActivitySquare },
  { label: "Warn", value: "warn", icon: StopCircle },
  { label: "Suspend", value: "suspend", icon: Hand },
  { label: "Ban", value: "ban", icon: Hammer },
];
type DataTableRowActionsProps<TData> = {
  row: Row<TData>;
};

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  //   const task = taskSchema.parse(row.original)

  //   const { setOpen, setCurrentRow } = useTasks()
  const [value, setValue] = useState("");
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem
        //   onClick={() => {
        //             setCurrentRow(task)
        //             setOpen('update')
        //           }}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem disabled>Edit</DropdownMenuItem>
        <DropdownMenuItem disabled>View</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Action</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={value} onValueChange={setValue}>
              {labels.map((label) => (
                <DropdownMenuRadioItem key={label.value} value={label.value}>
                  <label.icon className=" h-4 w-4" />
                  {label.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            // setCurrentRow(task)
            // setOpen('delete')
          }}
        >
          Delete
          <DropdownMenuShortcut>
            <Trash2 size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
