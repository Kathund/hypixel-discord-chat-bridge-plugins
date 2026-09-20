import ConfigManager from "./src/ConfigManager.ts";
import SeraphManager from "./src/Seraph/SeraphManager.js";
import TagsCommand from "./src/commands/TagsCommand.js";
import UrchinManager from "./src/Urchin/UrchinManager.js";
import VegaManager from "./src/Vega/VegaManager.js";
import { BridgePlugin, MowojangAPI } from "hypixel-discord-chat-bridge/plugin-api";
import { Errors, HypixelAPIRebornError, isUUID } from "hypixel-api-reborn";
import type { BedWarsUtilsPluginWithData, CommandConstructor } from "./src/types/misc.ts";
import type { BedWarsUtilsConfig } from "./src/types/config.ts";

class BedWarsUtilsPlugin extends BridgePlugin<BedWarsUtilsPlugin> {
  override readonly metadata = {
    name: "BedWars Utils",
    description: "Adds BedWars related commands to in game minecraft commands",
    version: "2.0.0",
    author: "kathund",
    link: "https://github.com/Kathund/hypixel-discord-chat-bridge-plugins/tree/main/BedWars-Utils"
  } as const;
  #started: boolean = false;

  static TagTrimLength: number = 200;
  static commands: CommandConstructor[] = [TagsCommand, ...SeraphManager.commands, ...UrchinManager.commands, ...VegaManager.commands];
  readonly cache = new Map<string, { data: unknown; expiresAt: number }>();
  config?: BedWarsUtilsConfig;
  seraph?: SeraphManager;
  urchin?: UrchinManager;
  vega?: VegaManager;

  override registerExtensions(): Promise<void> {
    BedWarsUtilsPlugin.commands.forEach((Command) => this.context.registerMinecraftCommand((minecraft) => new Command(minecraft)));
    return Promise.resolve();
  }

  override async start(): Promise<void> {
    if (this.#started) return Promise.resolve();
    const configLoad = await this.loadData();
    if (!configLoad) return Promise.resolve();
    this.#started = true;
    this.context.logger.info("BedWars Utils plugin started.");
    return Promise.resolve();
  }

  private async loadData(): Promise<boolean> {
    const configManager = new ConfigManager();
    this.config = await configManager.init();
    this.seraph = new SeraphManager(this, this.config.seraph);
    this.urchin = new UrchinManager(this, this.config.urchin);
    this.vega = new VegaManager(this, this.config.urchin);
    return true;
  }

  override stop(): Promise<void> {
    if (!this.#started) return Promise.resolve();
    this.#started = false;
    this.context.logger.info("BedWars Utils plugin stopped.");
    return Promise.resolve();
  }

  // I love skidding my own code
  // Credit: https://github.com/Hypixel-API-Reborn/hypixel-api-reborn/blob/35e4537a420cf731083b9bdb2ca37776304f4c60/src/Private/RequestHandler.ts#L76-L83
  async toUUID(input: string): Promise<string> {
    if (!input) throw new HypixelAPIRebornError(Errors.NO_NICKNAME_UUID);
    if (typeof input !== "string") throw new HypixelAPIRebornError(Errors.UUID_NICKNAME_MUST_BE_A_STRING);
    if (isUUID(input)) return input.replace(/-/g, "");
    const profile = await MowojangAPI.getProfile(input);
    if (profile.data === null) throw new HypixelAPIRebornError(Errors.PLAYER_DOES_NOT_EXIST);
    return profile.data.UUID;
  }

  isFullyLoaded(): this is BedWarsUtilsPluginWithData {
    if (this.config === undefined) return false;
    return true;
  }
}

export default BedWarsUtilsPlugin;
