import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Calendar, Menu, X } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "./ui/button";
import { MoonIcon, SunIcon } from "./ui/icons";
import { cn } from "@/lib/utils";

const ITEMS = [
  { name: "Events", href: "/events" },
  { name: "Organizations", href: "/organizations" },
  { name: "FAQ", href: "/faq" },
];

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "py-3" : "py-4"
      )}
    >
      <div className="max-w-2xl mx-auto px-3 md:px-6">
        <div
          className={cn(
            "relative flex items-center justify-between h-14 px-6",
            "bg-white/80 dark:bg-[#0f141b]/80 backdrop-blur-xl",
            "border border-gray-200/60 dark:border-white/10",
            "rounded-2xl shadow-lg shadow-gray-900/5 dark:shadow-black/20",
            "transition-all duration-300"
          )}
        >
          <div
            onClick={() => navigate({ to: "/" })}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-ucr-blue via-ucr-blue/90 to-ucr-blue text-white shadow-md shadow-ucr-blue/25 group-hover:shadow group-hover:shadow-ucr-blue/30 transition-shadow duration-200">
              <Calendar size={18} strokeWidth={2.5} />
            </div>
            <span className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
              Events
            </span>
          </div>

          <div className="hidden md:absolute md:left-1/2 md:-translate-x-1/2 md:flex items-center gap-1">
            {ITEMS.map(({ href, name }) => (
              <button
                key={name}
                onClick={() => navigate({ to: href })}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white rounded-lg hover:bg-gray-100/50 dark:hover:bg-white/5 transition-all duration-200"
              >
                {name}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? <SunIcon /> : <MoonIcon />}
            </Button>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-xl text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-200"
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <div
          className={cn(
            "md:hidden mt-3 rounded-2xl origin-top transition-all duration-300",
            "bg-white/95 dark:bg-[#0f141b]/95 backdrop-blur-xl",
            "border border-gray-200/60 dark:border-white/10",
            "shadow-xl shadow-gray-900/10 dark:shadow-black/30 overflow-hidden",
            open
              ? "scale-100 opacity-100"
              : "scale-95 opacity-0 pointer-events-none"
          )}
        >
          <div className="flex flex-col">
            {ITEMS.map(({ href, name }) => (
              <button
                key={name}
                onClick={() => {
                  setOpen(false);
                  navigate({ to: href });
                }}
                className="px-6 py-3.5 text-sm font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-200 text-left"
              >
                {name}
              </button>
            ))}

            <div className="p-4 border-t border-gray-100 dark:border-white/5">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                {theme === "light" ? <SunIcon /> : <MoonIcon />}
                <span className="ml-2 text-sm">
                  {theme === "light" ? "Light mode" : "Dark mode"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
