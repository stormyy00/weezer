import { useNavigate, useRouterState } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const FeedbackButton = () => {
	const navigate = useNavigate();
	const router = useRouterState();
	const pathname = router.location.pathname;

	// Don't show on feedback page itself
	if (pathname === "/feedback") return null;

	return (
		<button
			onClick={() => navigate({ to: "/feedback" })}
			className={cn(
				"fixed bottom-6 right-6 z-50",
				"group flex items-center justify-center",
				"h-12 w-12 hover:w-36 rounded-full",
				"bg-ucr-blue dark:bg-ucr-gold",
				"text-white dark:text-gray-900",
				"shadow-lg shadow-ucr-blue/30 dark:shadow-ucr-gold/30",
				"hover:shadow-xl hover:shadow-ucr-blue/40 dark:hover:shadow-ucr-gold/40",
				"hover:scale-105 active:scale-95",
				"transition-all duration-300 ease-out",
				"cursor-pointer",
				"animate-[pulse-subtle_3s_ease-in-out_infinite]",
			)}
			aria-label="Send feedback"
		>
			<MessageCircle
				size={20}
				strokeWidth={2}
				className="shrink-0 transition-transform duration-300 group-hover:rotate-12"
			/>
			<span
				className={cn(
					"text-sm font-semibold tracking-tight",
					"w-0 overflow-hidden opacity-0",
					"group-hover:w-18 group-hover:opacity-100 group-hover:ml-2",
					"transition-all duration-300 ease-out",
					"whitespace-nowrap",
				)}
			>
				Feedback
			</span>
		</button>
	);
};

export default FeedbackButton;
