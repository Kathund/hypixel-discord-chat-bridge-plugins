import zod from "zod";

export const GexpMonthlyLeaderboardConfigDiscord = zod.object({
  channelId: zod.string().nullable(),
  leaderboardMessageId: zod.string().nullable(),
  leaderboardInfoMessageId: zod.string().nullable()
});

export const GexpMonthlyLeaderboardConfig = zod.object({
  configVersion: zod.number().int().positive().meta({ description: "!IMPORTANT DO NOT TOUCH\nConfig format version number" }),
  discord: GexpMonthlyLeaderboardConfigDiscord
});
export type GexpMonthlyLeaderboardConfig = zod.infer<typeof GexpMonthlyLeaderboardConfig>;
