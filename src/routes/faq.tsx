import { createFileRoute } from "@tanstack/react-router";

const faqs = [
	{
		question: "What is UCR Events?",
		answer:
			"UCR Events is a centralized hub for all Highlanders events and organizations, pulling data from Highlander Link and social sources.",
	},
	{
		question: "Is UCR Events affiliated with UCR?",
		answer:
			"No, UCR Events is built by a student in an effort to centralize event information for the campus community.",
	},
	{
		question: "How often is the directory updated?",
		answer:
			"We regularly sync organization details and event listings to keep the directory fresh and reliable.",
	},
	{
		question: "I have feedback or suggestions. How can I share them?",
		answer:
			"We welcome your feedback! Please reach out to us through the contact form on our website.",
	},
	{
		question: "I dont see my organization events. What should I do?",
		answer:
			"If your organization is missing, please verify its status on Highlander Link and ensure you have an Instagram account linked. If it's active there but still not listed here, submit a request",
	},
];

export const Route = createFileRoute("/faq")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="w-full max-w-5xl mx-auto pt-28 px-4">
			<div className="mb-5">
				<h1 className="text-4xl font-bold text-gray-900 dark:text-white">
					Frequently Asked Questions
				</h1>
				<p className="mt-3 text-gray-600 dark:text-gray-400 max-w-2xl">
					Quick answers about the UCR Events
				</p>
			</div>

			<div className="divide-y divide-ucr-blue/20 dark:divide-ucr-gold/30">
				{faqs.map((faq) => (
					<div key={faq.question} className="py-5">
						<p className="text-lg font-semibold text-gray-900 dark:text-white">
							{faq.question}
						</p>
						<div className="mt-2 h-0.5 w-12 bg-ucr-blue dark:bg-ucr-gold" />
						<p className="mt-4 text-gray-600 dark:text-gray-300">
							{faq.answer}
						</p>
					</div>
				))}
			</div>
		</div>
	);
}
