export function parseEventDate(dateString?: string | null): Date | null {
	if (!dateString) {
		return null;
	}

	// new Date() correctly parses ISO 8601 strings with Z suffix
	// e.g., "2026-01-30T23:00:00.000Z" → Date object representing that UTC instant
	const date = new Date(dateString);

	// Check for invalid date
	if (isNaN(date.getTime())) {
		return null;
	}

	return date;
}

export function formatEventDate(dateString?: string | null) {
	if (!dateString) {
		return {
			day: undefined,
			monthDay: undefined,
			time: undefined,
			isTBD: true,
		};
	}

	const date = new Date(dateString);
	if (isNaN(date.getTime())) {
		return {
			day: undefined,
			monthDay: undefined,
			time: undefined,
			isTBD: true,
		};
	}

	// Format in UTC since times are stored as PT but with UTC timezone marker
	// Format: "Wed"
	const day = date.toLocaleDateString("en-US", {
		weekday: "short",
		timeZone: "UTC",
	});

	// Format: "Jan 14"
	const monthDay = date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		timeZone: "UTC",
	});

	// Format: "3:00 PM"
	const time = date.toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
		timeZone: "UTC",
	});

	return { day, monthDay, time, isTBD: false };
}
