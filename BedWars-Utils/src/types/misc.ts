import { type MinecraftCommand, type MinecraftManagerWithPlugin } from "hypixel-discord-chat-bridge/plugin-api";
import type BedWarsUtilsPlugin from "../../index.ts";
import type UrchinManager from "../Urchin/UrchinManager.ts";
import type VegaManager from "../Vega/VegaManager.ts";
import type { BedWarsUtilsConfig } from "./config.ts";

export type CommandConstructor = new (minecraft: MinecraftManagerWithPlugin<BedWarsUtilsPlugin>) => MinecraftCommand<MinecraftManagerWithPlugin<BedWarsUtilsPlugin>>;

export type BedWarsUtilsPluginWithData = BedWarsUtilsPlugin & { config: BedWarsUtilsConfig; urchin: UrchinManager; vega: VegaManager };
