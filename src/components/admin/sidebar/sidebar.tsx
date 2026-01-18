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
import { Calendar, SearchSlash, User } from "lucide-react";
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
      className={`h-screen bg-[#f7f9fc] text-[#1f2b38] border-r border-[#dfe6ef] shadow-sm transition-all duration-300 ${
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
            <span className="font-semibold text-base text-[#3A5E94] tracking-tight">
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
                      ? "bg-[#E4ECF9] text-[#3A5E94] font-semibold border border-[#9DB7D2]"
                      : "text-[#3A5E94]/80 hover:text-[#3A5E94] hover:bg-[#E4ECF9]/50"
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
          className={`flex items-center py-2 rounded-lg text-[#1f2b38]/70 hover:text-[#3A5E94] hover:bg-[#E4ECF9]/50 transition-all duration-200 text-sm font-medium ${
            open ? "justify-start gap-3 px-3" : "justify-center px-2"
          }`}
        >
          <SidebarTrigger className="text-[#3A5E94] p-0 h-5 w-5" />
          {open && <span>Collapse Sidebar</span>}
        </button>
        <button
          onClick={async () => {
            await signOut();
            navigate({ to: "/" });
          }}
          className={`flex items-center py-2 rounded-lg text-[#1f2b38]/70 hover:text-[#3A5E94] hover:bg-[#E4ECF9]/50 transition-all duration-200 text-sm font-medium ${
            open ? "justify-start gap-3 px-3" : "justify-center px-2"
          }`}
        >
          <User className="text-[#3A5E94] p-0 h-5 w-5" />
          {open && <span>Log out</span>}
        </button>
      </SidebarFooter>
    </SidebarComponent>
  );
};

export default Sidebar;
