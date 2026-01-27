import { createFileRoute } from "@tanstack/react-router";
import { getImageFromR2 } from "@/lib/r2";

export const Route = createFileRoute("/api/images/$")({
	server: {
		handlers: {
			GET: async ({ params }) => {
				// Extract the full path after /api/images/
				const imagePath = params["_splat"];

				// Validate path to prevent directory traversal attacks
				if (
					!imagePath ||
					imagePath.includes("..") ||
					imagePath.startsWith("/")
				) {
					return new Response("Invalid image path", { status: 400 });
				}

				// Fetch the image from R2
				const imageData = await getImageFromR2(imagePath);

				if (!imageData) {
					return new Response("Image not found", { status: 404 });
				}

				// Determine content type based on file extension
				const ext = imagePath.split(".").pop()?.toLowerCase();
				const contentType =
					ext === "jpg" || ext === "jpeg"
						? "image/jpeg"
						: ext === "png"
							? "image/png"
							: ext === "gif"
								? "image/gif"
								: ext === "webp"
									? "image/webp"
									: "application/octet-stream";

				// Convert Uint8Array to Buffer for Response
				return new Response(Buffer.from(imageData), {
					status: 200,
					headers: {
						"Content-Type": contentType,
						"Cache-Control": "public, max-age=31536000, immutable",
					},
				});
			},
		},
	},
});
