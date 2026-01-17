export type EventLocation = {
	name: string;
	campus?: string;
};

export type RawEvent = {
	id: string;
	source: "instagram" | "other";
	organization: string; // Primary organization (for backwards compatibility)
	organizations?: string[]; // All organizations (new field for multi-org support)
	organizationId?: string | null; // Primary organization ID (for backwards compatibility)
	organizationIds?: string[]; // All organization IDs (new field for multi-org support)
	title: string;
	description?: string;
	start_time?: string | null;
	end_time?: string | null;
	location?: EventLocation | null;
	tags?: string[];
	media: string[];
	original_post: string;
	confidence?: number;
	created_at?: string | null;
};

export type NormalizedEvent = {
	id: string;
	title: string;
	description?: string;
	organization: string; // Primary organization (for backwards compatibility)
	organizations?: string[]; // All organizations (new field for multi-org support)
	date: {
		day?: string; // "Wed"
		monthDay?: string; // "Jan 14"
		time?: string; // "3:00 PM"
		endTime?: string; // "4:00 PM"
		isTBD: boolean;
	};
	location: {
		name?: string;
		campus?: string;
		isTBD: boolean;
	};
	media: {
		cover?: string; // First image from media array
		all: string[];
	};
	source: {
		platform: "instagram" | "other";
		url: string;
	};
};
