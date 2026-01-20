import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Separator } from "@/components/ui/separator";
import DashboardSidebar from "./sidebar/sidebar";
import { Button } from "../ui/button";
import { Link, useLocation } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import Search from "@/components/search";
import { MoonIcon, SunIcon } from "../ui/icons";
import { useTheme } from "@/hooks/use-theme";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  const { theme, setTheme } = useTheme();
  const pathSegments = pathname.split("/").filter((segment) => segment);

  const relevantSegments =
    pathSegments[0] === "admin" ? pathSegments.slice(1) : pathSegments;

  return (
    <SidebarProvider>
      <DashboardSidebar pathname={pathname} />
      <SidebarInset className="bg-background overflow-auto">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 justify-between w-full px-4 ">
            {/* <SidebarTrigger className="-ml-1" /> */}
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb className="w-full">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/admin">Admin</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {relevantSegments.length > 0 && <BreadcrumbSeparator />}
                {relevantSegments.map((segment, index) => {
                  const href = `/admin/${relevantSegments
                    .slice(0, index + 1)
                    .join("/")}`;
                  const isLast = index === relevantSegments.length - 1;
                  return (
                    <>
                      <BreadcrumbItem key={href}>
                        {isLast ? (
                          <BreadcrumbPage className="capitalize">
                            {segment}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild className="capitalize">
                            <Link to={href}>{segment}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {!isLast && <BreadcrumbSeparator />}
                    </>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
            <Search />
            <div className="flex gap-2">
              {/* opens a notifications panel with filter between jobs + messages */}
              <Button size="sm" variant="outline">
                <Bell size={16} />
              </Button>
              <Button
                variant="ghost"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                {theme === "light" ? <SunIcon /> : <MoonIcon />}
              </Button>
              <Button size="sm" variant="outline" className="border-ucr-blue/40 text-ucr-blue hover:bg-ucr-blue/10 dark:border-ucr-gold/40 dark:text-ucr-yellow">
                Reports
              </Button>
              <Button size="sm" variant="outline" className="bg-ucr-blue border-ucr-blue/40 text-white hover:text-white hover:bg-ucr-blue/80 dark:border-ucr-gold/40 dark:text-ucr-black dark:bg-ucr-gold/90 dark:hover:bg-ucr-gold">
                Check Jobs
              </Button>
            </div>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
