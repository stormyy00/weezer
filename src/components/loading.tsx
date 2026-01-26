import { LoaderCircle } from "lucide-react";

const loading = () => {
	return (
		<div className="flex h-screen w-full bg-white dark:bg-black flex-col items-center justify-center">
			<p className="text-3xl font-bold text-ucr-blue dark:text-ucr-gold">
				Loading
			</p>
			<LoaderCircle className="animate-spin text-ucr-blue dark:text-ucr-gold" />
		</div>
	);
};

export default loading;
