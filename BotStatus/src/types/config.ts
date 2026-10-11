import zod from "zod";

export const BotStatusConfigDiscord = zod.object({ messageId: zod.string().nullable() });

export const BotStatusConfig = zod.object({
  configVersion: zod.number().int().positive().meta({ description: "!IMPORTANT DO NOT TOUCH\nConfig format version number" }),
  discord: BotStatusConfigDiscord
});
export type BotStatusConfig = zod.infer<typeof BotStatusConfig>;
