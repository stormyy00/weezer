function getTimeZoneOffset(date: Date, timeZone: string): number {
	const formatter = new Intl.DateTimeFormat("en-US", {
		timeZone,
		hour12: false,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});

	const parts = formatter.formatToParts(date);
	const values = Object.fromEntries(
		parts.map((part) => [part.type, part.value]),
	);
	const isoString = `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:${values.second}.000Z`;

	return new Date(isoString).getTime() - date.getTime();
}

function parseDateInTimeZone(dateString: string, timeZone: string): Date {
	const match = dateString.match(
		/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?/,
	);

	if (!match) {
		return new Date(dateString);
	}

	const [, year, month, day, hour, minute, second, millisecond] = match;
	const utcDate = new Date(
		Date.UTC(
			Number(year),
			Number(month) - 1,
			Number(day),
			Number(hour),
			Number(minute),
			Number(second),
			Number(millisecond ?? 0),
		),
	);
	const offset = getTimeZoneOffset(utcDate, timeZone);

	return new Date(utcDate.getTime() - offset);
}

export function parseEventDate(dateString?: string | null) {
	if (!dateString) {
		return null;
	}

	const timeZone = "America/Los_Angeles";

	return parseDateInTimeZone(dateString, timeZone);
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

	// Use Pacific Time zone for formatting
	const timeZone = "America/Los_Angeles";
	const date = parseDateInTimeZone(dateString, timeZone);

	// Format: "Wed"
	const day = date.toLocaleDateString("en-US", {
		weekday: "short",
		timeZone,
	});

	// Format: "Jan 14"
	const monthDay = date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		timeZone,
	});

	// Format: "3:00 PM"
	const time = date.toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
		timeZone,
	});

	return { day, monthDay, time, isTBD: false };
}
