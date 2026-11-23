import type GexpMonthlyLeaderboardPlugin from "../../index.ts";
import type { GexpMonthlyLeaderboardConfig } from "./config.ts";

export type GexpMonthlyLeaderboardPluginWithData = GexpMonthlyLeaderboardPlugin & { config: GexpMonthlyLeaderboardConfig };
