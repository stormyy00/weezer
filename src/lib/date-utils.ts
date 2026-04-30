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

/**
 * Returns "now" as a millisecond timestamp in the same fake-UTC frame the
 * database uses (PT wall-clock tagged as UTC). Compare directly against
 * `parseEventDate(event.start_time).getTime()` for correct ordering.
 */
export function getNowInPT(): number {
	const now = new Date();
	const formatter = new Intl.DateTimeFormat("en-US", {
		timeZone: "America/Los_Angeles",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	});
	const parts = Object.fromEntries(
		formatter.formatToParts(now).map((p) => [p.type, p.value]),
	);
	return Date.UTC(
		Number(parts.year),
		Number(parts.month) - 1,
		Number(parts.day),
		Number(parts.hour),
		Number(parts.minute),
		Number(parts.second),
	);
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
