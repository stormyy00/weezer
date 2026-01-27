import { createFileRoute, useLocation } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label, RequiredLabel } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { submitFeedback } from "@/fn/feedback";
import { CheckCircle2, AlertCircle, Loader2, Home, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { SignInProvider } from "@/lib/signin";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getServerSession } from "@/fn/auth";

export const Route = createFileRoute("/feedback")({
	component: FeedbackPage,
	loader: async () => {
		return getServerSession();
	},
});

function FeedbackPage() {
	const session = Route.useLoaderData();
	const [isLoading, setIsLoading] = useState(false);
	const [submitStatus, setSubmitStatus] = useState<
		"idle" | "success" | "error"
	>("idle");
	const [submitMessage, setSubmitMessage] = useState("");
	const [showSuccessCard, setShowSuccessCard] = useState(false);
	const callback = useLocation().publicHref;

	type category =
		| "Organization Contact"
		| "Bug Report"
		| "Feature Request"
		| "General Feedback";

	const form = useForm({
		defaultValues: {
			name: session?.user?.name || "",
			email: session?.user?.email || "",
			isAnonymous: false,
			category: "" as category | "",
			organizationName: "",
			message: "",
		},
		onSubmit: async ({ value }) => {
			if (value.category === "Organization Contact" && !session?.user) {
				setSubmitStatus("error");
				setSubmitMessage("Please sign in to contact organizations.");
				return;
			}

			setIsLoading(true);
			setSubmitStatus("idle");

			try {
				const result = await submitFeedback({
					data: {
						userId: session?.user?.id || null,
						...value,
						category: value.category as category,
					},
				});

				if (result.success) {
					setSubmitStatus("success");
					setSubmitMessage(result.message);
					setShowSuccessCard(true);
					form.reset();
					if (session?.user) {
						form.setFieldValue("name", session.user.name || "");
						form.setFieldValue("email", session.user.email || "");
					}
				} else {
					setSubmitStatus("error");
					setSubmitMessage(result.message);
				}
			} catch (error) {
				setSubmitStatus("error");
				setSubmitMessage("An unexpected error occurred. Please try again.");
			} finally {
				setIsLoading(false);
				if (submitStatus === "error") {
					setTimeout(() => setSubmitStatus("idle"), 5000);
				}
			}
		},
	});

	// Handle submit another request
	const handleSubmitAnother = () => {
		setShowSuccessCard(false);
		setSubmitStatus("idle");
		form.reset();
		if (session?.user) {
			form.setFieldValue("name", session.user.name || "");
			form.setFieldValue("email", session.user.email || "");
		}
	};

	return (
		<div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50 dark:from-[#0a0e13] dark:via-[#0f141b] dark:to-[#0a0e13]">
			<div className="max-w-5xl mx-auto pt-28 px-4 pb-16">
				<div className="text-center mb-4">
					<h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
						Feedback
					</h1>
					<p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
						We value your feedback! Let us know how we can improve. Note: For
						organization contact requests, you are required to
						<button
							type="button"
							onClick={() => SignInProvider("google", callback)}
							className="text-ucr-blue dark:text-ucr-gold font-semibold ml-1 cursor-pointer hover:underline"
						>
							Sign In
						</button>
						.
					</p>
				</div>

				{/* Success Card */}
				{showSuccessCard ? (
					<Card className="max-w-2xl mx-auto border-2 border-green-200 dark:border-green-800">
						<CardHeader className="text-center pb-4">
							<div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
								<CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
							</div>
							<CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
								Request Received!
							</CardTitle>
							<CardDescription className="text-base mt-2">
								{submitMessage ||
									"Thank you for your feedback. We'll review it shortly."}
							</CardDescription>
						</CardHeader>
						<CardContent className="pb-4">
							<p className="text-sm text-center text-gray-600 dark:text-gray-400">
								We appreciate you taking the time to help us improve. Your
								feedback has been successfully submitted.
							</p>
						</CardContent>
						<CardFooter className="flex flex-col sm:flex-row gap-3 pt-4">
							<Button
								onClick={() => (window.location.href = "/events")}
								className="w-full sm:flex-1 bg-ucr-blue hover:bg-ucr-blue/90 dark:bg-ucr-blue dark:hover:bg-ucr-blue/90 text-white"
							>
								<Home className="w-4 h-4 mr-2" />
								Return to Events Home
							</Button>
							<Button
								onClick={handleSubmitAnother}
								variant="outline"
								className="w-full sm:flex-1"
							>
								<Send className="w-4 h-4 mr-2" />
								Submit Another Request
							</Button>
						</CardFooter>
					</Card>
				) : (
					<div
						className={cn(
							"max-w-2xl mx-auto",
							"bg-white/80 dark:bg-[#141827]/80 backdrop-blur-xl",
							"border border-gray-200/60 dark:border-white/10",
							"rounded-2xl shadow-lg shadow-gray-900/5 dark:shadow-black/20",
							"p-6 sm:p-8",
						)}
					>
						{/* Error Messages */}
						{submitStatus === "error" && (
							<div
								className={cn(
									"mb-6 p-4 rounded-lg flex items-start gap-3",
									"bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800",
								)}
							>
								<AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
								<p className="text-sm font-medium text-red-800 dark:text-red-300">
									{submitMessage}
								</p>
							</div>
						)}

						<form
							onSubmit={(e) => {
								e.preventDefault();
								e.stopPropagation();
								form.handleSubmit();
							}}
							className="space-y-6"
						>
							{/* Category Select */}
							<form.Field
								name="category"
								validators={{
									onChange: ({ value }) => {
										if (!value || value.trim().length === 0) {
											return "Please select a category";
										}
										return undefined;
									},
								}}
							>
								{(field) => (
									<div className="space-y-2">
										<RequiredLabel htmlFor="category">Category</RequiredLabel>
										<Select
											value={field.state.value}
											onValueChange={(value) =>
												field.handleChange(value as category)
											}
										>
											<SelectTrigger id="category">
												<SelectValue placeholder="Select a category" />
											</SelectTrigger>
											<SelectContent align="center">
												<SelectItem value="Organization Contact">
													Organization Contact
												</SelectItem>
												<SelectItem value="Bug Report">Bug Report</SelectItem>
												<SelectItem value="Feature Request">
													Feature Request
												</SelectItem>
												<SelectItem value="General Feedback">
													General Feedback
												</SelectItem>
											</SelectContent>
										</Select>
										{field.state.meta.errors && (
											<p className="text-sm text-destructive">
												{field.state.meta.errors[0]}
											</p>
										)}
									</div>
								)}
							</form.Field>

							{/* Show auth warning if Organization Contact selected without login */}
							<form.Subscribe selector={(state) => state.values.category}>
								{(category) =>
									category === "Organization Contact" &&
									!session?.user && (
										<div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
											<p className="text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2">
												<AlertCircle className="w-4 h-4 shrink-0" />
												You must be signed in to contact organizations.
											</p>
										</div>
									)
								}
							</form.Subscribe>

							{/* Conditional Organization Name */}
							<form.Subscribe selector={(state) => state.values.category}>
								{(category) =>
									category === "Organization Contact" && (
										<form.Field
											name="organizationName"
											validators={{
												onChange: ({ value }) => {
													if (!value || value.trim().length === 0) {
														return "Organization name is required";
													}
													return undefined;
												},
											}}
										>
											{(field) => (
												<div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
													<RequiredLabel htmlFor="organizationName">
														Organization Name
													</RequiredLabel>
													<Input
														id="organizationName"
														type="text"
														placeholder="Enter organization name"
														value={field.state.value}
														onChange={(e) => field.handleChange(e.target.value)}
														onBlur={field.handleBlur}
													/>
													{field.state.meta.errors && (
														<p className="text-sm text-destructive">
															{field.state.meta.errors[0]}
														</p>
													)}
												</div>
											)}
										</form.Field>
									)
								}
							</form.Subscribe>

							{/* Name and Email in same row on desktop */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								{/* Name Field */}
								<form.Field
									name="name"
									validators={{
										onChange: ({ value }) => {
											if (!value || value.trim().length === 0) {
												return "Name is required";
											}
											return undefined;
										},
									}}
								>
									{(field) => (
										<div className="space-y-2">
											<RequiredLabel htmlFor="name">Name</RequiredLabel>
											<form.Subscribe
												selector={(state) => state.values.isAnonymous}
											>
												{(isAnonymous) => (
													<Input
														id="name"
														type="text"
														placeholder={
															isAnonymous ? "Anonymous" : "Your name"
														}
														value={field.state.value}
														onChange={(e) => field.handleChange(e.target.value)}
														onBlur={field.handleBlur}
														disabled={isAnonymous}
													/>
												)}
											</form.Subscribe>
											{field.state.meta.errors && (
												<p className="text-sm text-destructive">
													{field.state.meta.errors[0]}
												</p>
											)}
										</div>
									)}
								</form.Field>

								{/* Email Field - Hidden when anonymous, required for Organization Contact */}
								<form.Subscribe
									selector={(state) => ({
										isAnonymous: state.values.isAnonymous,
										category: state.values.category,
									})}
								>
									{({ isAnonymous, category }) =>
										!isAnonymous && (
											<form.Field
												name="email"
												validators={{
													onChange: ({ value, fieldApi }) => {
														const currentCategory =
															fieldApi.form.getFieldValue("category");
														const isOrgContact =
															currentCategory === "Organization Contact";

														// Required for Organization Contact
														if (isOrgContact) {
															if (!value || value.trim().length === 0) {
																return "Email is required for organization contact";
															}
														}

														// Basic email validation if provided
														if (value && value.trim().length > 0) {
															const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
															if (!emailRegex.test(value)) {
																return "Invalid email address";
															}
														}
														return undefined;
													},
												}}
											>
												{(field) => (
													<div className="space-y-2 animate-in fade-in duration-200">
														{category === "Organization Contact" ? (
															<RequiredLabel htmlFor="email">
																Email
															</RequiredLabel>
														) : (
															<Label htmlFor="email">
																Email{" "}
																<span className="text-gray-500 text-xs">
																	(optional, for follow-up)
																</span>
															</Label>
														)}
														<Input
															id="email"
															type="email"
															placeholder="your.email@example.com"
															value={field.state.value}
															onChange={(e) =>
																field.handleChange(e.target.value)
															}
															onBlur={field.handleBlur}
														/>
														{field.state.meta.errors && (
															<p className="text-sm text-destructive">
																{field.state.meta.errors[0]}
															</p>
														)}
													</div>
												)}
											</form.Field>
										)
									}
								</form.Subscribe>
							</div>

							{/* Anonymous Checkbox - Disabled when Organization Contact */}
							<form.Subscribe selector={(state) => state.values.category}>
								{(category) => (
									<form.Field name="isAnonymous">
										{(field) => (
											<div className="flex items-center gap-2">
												<Checkbox
													id="isAnonymous"
													checked={field.state.value}
													disabled={category === "Organization Contact"}
													onCheckedChange={(checked) => {
														field.handleChange(checked as boolean);
														if (checked) {
															form.setFieldValue("name", "Anonymous");
															form.setFieldValue("email", "");
														} else {
															form.setFieldValue(
																"name",
																session?.user?.name || "",
															);
															form.setFieldValue(
																"email",
																session?.user?.email || "",
															);
														}
													}}
												/>
												<Label
													htmlFor="isAnonymous"
													className={cn(
														"font-normal cursor-pointer",
														category === "Organization Contact" &&
															"opacity-50 cursor-not-allowed",
													)}
												>
													Submit as Anonymous
													{category === "Organization Contact" && (
														<span className="text-xs text-muted-foreground ml-1">
															(not available for organization contact)
														</span>
													)}
												</Label>
											</div>
										)}
									</form.Field>
								)}
							</form.Subscribe>

							{/* Message Field */}
							<form.Field
								name="message"
								validators={{
									onChange: ({ value }) => {
										if (!value || value.trim().length === 0) {
											return "Message is required";
										}
										if (value.length < 10) {
											return "Message must be at least 10 characters";
										}
										if (value.length > 2000) {
											return "Message must be less than 2000 characters";
										}
										return undefined;
									},
								}}
							>
								{(field) => (
									<div className="space-y-2">
										<RequiredLabel htmlFor="message">Message</RequiredLabel>
										<Textarea
											id="message"
											placeholder="Provide details about your feedback..."
											className="resize-none min-h-30"
											rows={6}
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
										/>
										<div className="flex justify-between items-center">
											{field.state.meta.errors ? (
												<p className="text-sm text-destructive">
													{field.state.meta.errors[0]}
												</p>
											) : (
												<div />
											)}
											<p className="text-xs text-gray-500">
												{field.state.value?.length || 0}/2000 characters
											</p>
										</div>
									</div>
								)}
							</form.Field>

							{/* Submit Button - Disabled if message is empty */}
							<form.Subscribe selector={(state) => state.values.message}>
								{(message) => (
									<Button
										type="submit"
										disabled={
											isLoading || !message || message.trim().length < 10
										}
										className="w-full h-11 bg-ucr-blue hover:bg-ucr-blue/90 dark:bg-ucr-blue dark:hover:bg-ucr-blue/90 text-white font-medium"
									>
										{isLoading ? (
											<>
												<Loader2 className="w-4 h-4 mr-2 animate-spin" />
												Submitting...
											</>
										) : (
											"Submit Feedback"
										)}
									</Button>
								)}
							</form.Subscribe>
						</form>
					</div>
				)}
			</div>
		</div>
	);
}
