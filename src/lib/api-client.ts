/**
 * API Client for FastAPI Backend (server-only)
 *
 * This module is only imported by server functions (createServerFn).
 * JWT tokens are minted server-side and never reach the browser.
 */

import { auth } from "./auth";
import { getRequestHeaders } from "@tanstack/react-start/server";

const FASTAPI_BASE_URL = process.env.VITE_BACKEND_URL!

export class ApiError extends Error {
	constructor(
		message: string,
		public status?: number,
		public data?: any,
	) {
		super(message);
		this.name = "ApiError";
	}
}

async function getAuthHeaders(): Promise<Record<string, string>> {
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};
	try {
		const requestHeaders = getRequestHeaders();
		const response = await auth.api.getToken({ headers: requestHeaders });
		if (response?.token) {
			headers["Authorization"] = `Bearer ${response.token}`;
			console.log("[API-CLIENT] JWT token attached to request");
		} else {
			console.warn("[API-CLIENT] No token returned from auth.api.getToken");
		}
	} catch (error) {
		console.error("[API-CLIENT] Failed to get JWT token:", error);
	}
	return headers;
}

/**
 * Make a GET request to the FastAPI backend
 */
export async function apiGet<T = any>(endpoint: string): Promise<T> {
	try {
		const url = `${FASTAPI_BASE_URL}${endpoint}`;
		console.log(`[API-CLIENT] GET ${endpoint}`);
		const headers = await getAuthHeaders();
		const response = await fetch(url, {
			method: "GET",
			headers,
		});

		console.log(`[API-CLIENT] GET ${endpoint} -> ${response.status}`);

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new ApiError(
				errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
				response.status,
				errorData,
			);
		}

		return await response.json();
	} catch (error) {
		if (error instanceof ApiError) {
			throw error;
		}
		if (error instanceof Error) {
			throw new ApiError(`Network error: ${error.message}`);
		}
		throw new ApiError("Unknown error occurred");
	}
}

/**
 * Make a POST request to the FastAPI backend
 */
export async function apiPost<T = any>(
	endpoint: string,
	body?: any,
): Promise<T> {
	try {
		const url = `${FASTAPI_BASE_URL}${endpoint}`;
		console.log(`[API-CLIENT] POST ${endpoint}`);
		const headers = await getAuthHeaders();
		const response = await fetch(url, {
			method: "POST",
			headers,
			body: body ? JSON.stringify(body) : undefined,
		});

		console.log(`[API-CLIENT] POST ${endpoint} -> ${response.status}`);

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new ApiError(
				errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
				response.status,
				errorData,
			);
		}

		return await response.json();
	} catch (error) {
		if (error instanceof ApiError) {
			throw error;
		}
		if (error instanceof Error) {
			throw new ApiError(`Network error: ${error.message}`);
		}
		throw new ApiError("Unknown error occurred");
	}
}
