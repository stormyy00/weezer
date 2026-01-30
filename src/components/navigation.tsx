import { useState, useEffect } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Calendar, LogOut, Menu, X } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "./ui/button";
import { MoonIcon, SettingsIcon, SunIcon } from "./ui/icons";
import { cn } from "@/lib/utils";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { signOut } from "@/lib/auth-client";

const ITEMS = [
	{ name: "Events", href: "/events" },
	{ name: "Organizations", href: "/organizations" },
	{ name: "FAQ", href: "/faq" },
];

type Session = {
	user: {
		id: string;
		name: string;
		email: string;
		image?: string | null;
	};
	session: {
		id: string;
		expiresAt: Date;
	};
} | null;

const Navigation = ({ session }: { session: Session }) => {
	const [scrolled, setScrolled] = useState(false);
	const [open, setOpen] = useState(false);
	const navigate = useNavigate();
	const { theme, setTheme } = useTheme();
	const router = useRouterState();
	const pathname = router.location.pathname;

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 20);
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const handleSignOut = async () => {
		await signOut();
		navigate({ to: "/" });
	};

	return (
		<div
			className={cn(
				"fixed top-0 left-0 right-0 z-50 transition-all duration-300",
				scrolled ? "py-3" : "py-4",
			)}
		>
			<div className="max-w-2xl mx-auto px-3 md:px-6">
				<div
					className={cn(
						"relative flex items-center justify-between h-14 px-6",
						"bg-white/80 dark:bg-[#0f141b]/80 backdrop-blur-xl",
						"border border-gray-200/60 dark:border-white/10",
						"rounded-2xl shadow-lg shadow-gray-900/5 dark:shadow-black/20",
						"transition-all duration-300",
					)}
				>
					<div
						onClick={() => navigate({ to: "/" })}
						className="flex items-center gap-2 group cursor-pointer"
					>
						{/* <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-ucr-blue via-ucr-blue/90 to-ucr-blue text-white shadow-md shadow-ucr-blue/25 group-hover:shadow group-hover:shadow-ucr-blue/30 transition-shadow duration-200"> */}
						<img src="/logo.svg" alt="Logo" className="w-12 h-12" />
						{/* </div> */}
						{/* <span className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
							Events
						</span> */}
					</div>

					<div className="hidden md:absolute md:left-1/2 md:-translate-x-1/2 md:flex items-center gap-1 relative">
						{ITEMS.map(({ href, name }) => {
							const isActive = pathname.startsWith(href);

							return (
								<button
									key={name}
									onClick={() => navigate({ to: href })}
									className={cn(
										"relative px-4 cursor-pointer  text-sm font-medium rounded-xl transition-all duration-300",
										isActive
											? "text-gray-900 dark:text-white"
											: "text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white",
									)}
								>
									{name}
									<span
										className={cn(
											"absolute left-1/2 -bottom-1 h-0.5 w-0 transition-all duration-300",
											"bg-ucr-blue dark:bg-ucr-gold",
											isActive && "w-6 -translate-x-1/2",
										)}
									/>
								</button>
							);
						})}
					</div>

					{!session ? (
						<div className="hidden md:flex items-center gap-2">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setTheme(theme === "light" ? "dark" : "light")}
							>
								{theme === "light" ? <SunIcon /> : <MoonIcon />}
							</Button>
						</div>
					) : (
						<div className="hidden md:flex items-center gap-2">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setTheme(theme === "light" ? "dark" : "light")}
							>
								{theme === "light" ? <SunIcon /> : <MoonIcon />}
							</Button>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon">
										<SettingsIcon size={16} />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="start" className="">
									<DropdownMenuItem onClick={handleSignOut}>
										<LogOut size={16} />
										<span className="ml-2 text-sm">Log out</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					)}

					<button
						onClick={() => setOpen(!open)}
						className="md:hidden p-2 rounded-xl text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-200"
					>
						{open ? <X size={22} /> : <Menu size={22} />}
					</button>
				</div>
				<div
					className={cn(
						"md:hidden mt-3 rounded-2xl overflow-hidden transition-all duration-300",
						"bg-white/95 dark:bg-[#0f141b]/95 backdrop-blur-xl",
						"border border-gray-200/60 dark:border-white/10",
						"shadow-xl shadow-gray-900/10 dark:shadow-black/30",
						open
							? "max-h-96 opacity-100 translate-y-0"
							: "max-h-0 opacity-0 -translate-y-2 pointer-events-none",
					)}
				>
					<div className="flex flex-col py-2">
						{ITEMS.map(({ href, name }) => {
							const isActive = pathname.startsWith(href);

							return (
								<button
									key={name}
									onClick={() => {
										setOpen(false);
										navigate({ to: href });
									}}
									className={cn(
										"px-6 py-3.5 text-sm font-medium text-left transition-colors duration-200",
										isActive
											? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white"
											: "text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-white/5",
									)}
								>
									{name}
								</button>
							);
						})}

						<div className="p-3 border-t border-gray-100 dark:border-white/5">
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
							{session && (
								<Button
									variant="ghost"
									className="ml-2 w-full justify-start"
									onClick={handleSignOut}
								>
									<LogOut size={16} />
									<span className="ml-2 text-sm">Log out</span>
								</Button>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Navigation;
