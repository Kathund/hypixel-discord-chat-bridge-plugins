import { type MinecraftCommand, type MinecraftManagerWithPlugin } from "hypixel-discord-chat-bridge/plugin-api";
import type BedWarsUtilsPlugin from "./index.js";

export type CommandConstructor = new (minecraft: MinecraftManagerWithPlugin<BedWarsUtilsPlugin>) => MinecraftCommand<MinecraftManagerWithPlugin<BedWarsUtilsPlugin>>;
export interface ConfigData {
  BASE_URL?: string;
  API_KEY?: string;
}
