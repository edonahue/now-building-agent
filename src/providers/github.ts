import type { ActivityEvent } from "../core/activity.js";

/** Boundary for a future read-only GitHub adapter; raw API responses never enter core logic. */
export interface ActivityProvider {
  listEvents(
    repository: `${string}/${string}`,
    window: { start: string; end: string },
  ): Promise<readonly ActivityEvent[]>;
}
