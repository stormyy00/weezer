import {
  Sidebar as SidebarComponent,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Calendar, User } from "lucide-react";
import { TABS } from "@/data/navigation";
import { signOut } from "@/lib/auth-client";

import { useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

const Sidebar = ({pathname}: {pathname: string}) => {
  const navigate = useNavigate();
  const { open, toggleSidebar } = useSidebar();

  const path = pathname.split("/");
  const navParent = path[1];
  const NAVTABS = TABS[navParent]?.tabs ?? [];
  const generalPath = `/${path.slice(1, 3).join("/")}`;

  return (
    <SidebarComponent
      collapsible="none"
      className={`sticky top-0 left-0 h-screen bg-ucr-blue dark:bg-[#141827] text-[#1f2b38] border-r border-ucr-blue dark:border-[#141827] shadow-sm transition-all duration-300 ${
        open ? "w-64" : "w-[72px] min-w-[72px]"
      } flex flex-col justify-between z-30`}
    >
      <SidebarHeader className="px-4 py-4">
        <div
          className={`flex items-center gap-3 ${!open ? "justify-center" : ""}`}
        >
          <div className="bg-[#3A5E94] rounded-xl h-10 w-10 flex items-center justify-center shadow-md">
            <Calendar className="h-5 w-5 text-white" />
          </div>

          {open && (
            <span className="font-bold text-xl text-white dark:text-white/80 tracking-tight">
              Admin 
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto px-3">
        {NAVTABS.map(({ link, icon, name }, idx) => (
          <>
              <SidebarMenu key={idx}>
                <SidebarMenuItem>
                  <button
                    onClick={() => navigate({ to: link })}
                    className={`w-full flex items-center py-1.5 px-3 rounded-lg transition-all duration-200 gap-2
                  ${
                    generalPath === link
                      ? "bg-ucr-blue/60 dark:bg-[#E4ECF9]/20 text-white dark:text-ucr-yellow font-semibold"
                      : "text-white/70 dark:text-ucr-yellow/80 hover:text-white/80 dark:hover:text-ucr-yellow hover:bg-white/10 dark:hover:bg-[#E4ECF9]/10"
                  }
                  ${!open ? "justify-center px-2" : ""}
                  `}
                  >
                    <span>{icon}</span>
                    {open && (
                      <Link
                        to={link}
                        className="flex-1 text-left text-sm font-medium"
                      >
                        {name}
                      </Link>
                    )}
                  </button>
                </SidebarMenuItem>
              </SidebarMenu>
            {/* </SidebarGroupContent> */}
            {/* </SidebarGroup> */}
          </>
        ))}
      </SidebarContent>

      <SidebarFooter className="px-3 py-3 flex flex-col gap-2">
        <button
          onClick={toggleSidebar}
          className={`flex items-center py-2 rounded-lg text-white/90  hover:text-white dark:hover:ucr-yellow hover:bg-white/10 dark:hover:bg-[#E4ECF9]/10 transition-all duration-200 text-sm font-medium ${
            open ? "justify-start gap-3 px-3" : "justify-center px-2"
          }`}
        >
          <SidebarTrigger className="text-white p-0 h-5 w-5" />
          {open && <span>Collapse Sidebar</span>}
        </button>
        <button
          onClick={async () => {
            await signOut();
            navigate({ to: "/" });
          }}
          className={`flex items-center py-2 rounded-lg text-white/90  hover:text-white dark:hover:ucr-yellow hover:bg-white/10 dark:hover:bg-[#E4ECF9]/10 transition-all duration-200 text-sm font-medium ${
            open ? "justify-start gap-3 px-3" : "justify-center px-2"
          }`}
        >
          <User className="text-white p-0 h-5 w-5" />
          {open && <span>Log out</span>}
        </button>
      </SidebarFooter>
    </SidebarComponent>
  );
};

export default Sidebar;
