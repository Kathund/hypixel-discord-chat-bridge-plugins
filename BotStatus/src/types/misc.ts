import type BotStatusPlugin from "../../index.ts";
import type { BotStatusConfig } from "./config.ts";

export type BotStatusPluginWithData = BotStatusPlugin & { config: BotStatusConfig };
