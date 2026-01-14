import React from "react";
import { ChartBarBig, Laptop, Logs, Notebook, User } from "lucide-react";
import { useSearch } from "@/hooks/use-search";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
// import { sidebarData } from './layout/data/sidebar-data'
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "@tanstack/react-router";

export function CommandMenu() {
  const navigate = useNavigate();
  const { open, setOpen } = useSearch();

  const TABS = {
    tabs: [
      {
        name: "Overview",
        link: "/admin/overview",
        icon: <Laptop />,
      },
      {
        name: "Users",
        link: "/admin/users",
        icon: <User />,
      },
      {
        name: "Logs",
        link: "/admin/logs",
        icon: <Logs />,
      },
      {
        name: "Metrics",
        link: "/admin/metrics",
        icon: <ChartBarBig />,
      },
      {
        name: "Audit Logs",
        link: "/admin/audit-logs",
        icon: <Notebook />,
      },
    ],
  };

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false);
      command();
    },
    [setOpen],
  );

  return (
    <CommandDialog modal open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search for an organization..." />
      <CommandList>
        <ScrollArea type="hover" className="h-72 pe-1">
          <CommandEmpty>No results found.</CommandEmpty>
          {TABS.tabs.map((group) => (
            <CommandGroup key={group.name} heading={group.name}>
              <CommandItem
                key={`${group.link}`}
                value={group.name}
                onSelect={() => {
                  runCommand(() => navigate({ to: group.link }));
                }}
              >
                <div className="flex size-4 items-center justify-center">
                  <div className="text-muted-foreground/80">{group.icon}</div>
                </div>
                {group.name}
              </CommandItem>
            </CommandGroup>
          ))}
          <CommandSeparator />
        </ScrollArea>
      </CommandList>
    </CommandDialog>
  );
}
