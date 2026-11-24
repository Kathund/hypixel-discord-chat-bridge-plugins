import type GexpLeaderboardPlugin from "../../index.ts";
import type { GexpLeaderboardConfig } from "./config.ts";

export type GexpLeaderboardPluginWithData = GexpLeaderboardPlugin & { config: GexpLeaderboardConfig };
