import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db } from "@/db";
import { feedback } from "@/db/schemas";

// Zod validation schema
const submitFeedbackSchema = z
	.object({
		userId: z.string().nullable(),
		name: z.string().min(1, "Name is required"),
		email: z.string().email("Invalid email").optional().or(z.literal("")),
		isAnonymous: z.boolean(),
		category: z.enum(
			[
				"Organization Contact",
				"Bug Report",
				"Feature Request",
				"General Feedback",
			],
			{ message: "Please select a category" },
		),
		organizationName: z.string().optional().or(z.literal("")),
		message: z
			.string()
			.min(10, "Message must be at least 10 characters")
			.max(2000, "Message must be less than 2000 characters"),
	})
	.refine(
		(data) => {
			// If category is "Organization Contact", organizationName is required
			if (data.category === "Organization Contact") {
				return (
					!!data.organizationName && data.organizationName.trim().length > 0
				);
			}
			return true;
		},
		{
			message: "Organization name is required when contacting an organization",
			path: ["organizationName"],
		},
	);

export type SubmitFeedbackInput = z.infer<typeof submitFeedbackSchema>;

export const submitFeedback = createServerFn()
	.inputValidator(submitFeedbackSchema)
	.handler(
		async ({
			data,
		}): Promise<{ success: boolean; message: string; id?: string }> => {
			try {
				const [result] = await db
					.insert(feedback)
					.values({
						userId: data.userId,
						name: data.isAnonymous ? "Anonymous" : data.name,
						email: data.email || null,
						isAnonymous: data.isAnonymous,
						category: data.category,
						organizationName: data.organizationName || null,
						message: data.message,
						status: "pending",
					})
					.returning({ id: feedback.id });

				return {
					success: true,
					message: "Thank you for your feedback! We'll review it shortly.",
					id: result.id,
				};
			} catch (error) {
				console.error("Failed to submit feedback:", error);
				return {
					success: false,
					message: "Failed to submit feedback. Please try again.",
				};
			}
		},
	);
