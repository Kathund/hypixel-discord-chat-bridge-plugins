import type BotStatusPlugin from "../../index.ts";
import type { BotStatusConfig } from "./config.ts";
import type { BridgePluginMetadata } from "hypixel-discord-chat-bridge/plugin-api";

export type BotStatusPluginWithData = BotStatusPlugin & { config: BotStatusConfig };

export type BridgePluginMetadataWithId = BridgePluginMetadata & { id: string };
