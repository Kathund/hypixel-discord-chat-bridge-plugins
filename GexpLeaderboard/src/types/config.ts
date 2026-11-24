import zod from "zod";

export const GexpLeaderboardConfigDiscordElement = zod.object({
  channelId: zod.string().nullable(),
  leaderboardMessageId: zod.string().nullable(),
  leaderboardInfoMessageId: zod.string().nullable()
});

export const GexpLeaderboardConfigDiscord = zod.object({ monthly: GexpLeaderboardConfigDiscordElement, yearly: GexpLeaderboardConfigDiscordElement });

export const GexpLeaderboardConfig = zod.object({
  configVersion: zod.number().int().positive().meta({ description: "!IMPORTANT DO NOT TOUCH\nConfig format version number" }),
  discord: GexpLeaderboardConfigDiscord
});
export type GexpLeaderboardConfig = zod.infer<typeof GexpLeaderboardConfig>;
