import SeraphManager from "./src/Seraph/SeraphManager.js";
import TagsCommand from "./src/commands/TagsCommand.js";
import UrchinManager from "./src/Urchin/UrchinManager.js";
import VegaManager from "./src/Vega/VegaManager.js";
import ms, { type StringValue } from "ms";
import { BridgePlugin, MowojangAPI } from "hypixel-discord-chat-bridge/plugin-api";
import { Errors, HypixelAPIRebornError, isUUID } from "hypixel-api-reborn";
import { access, readFile } from "node:fs/promises";
import type { CommandConstructor, ConfigData } from "./types.js";

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
  CACHE_DURATION = ms("5m");
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
    try {
      await access("plugins/BedWars-Utils/config.json");
    } catch {
      this.context.logger.error("BedWars Utils plugin config not found.");
      return false;
    }
    const data = JSON.parse(await readFile("plugins/BedWars-Utils/config.json", "utf-8"));
    this.CACHE_DURATION = ms((data?.CACHE_DURATION ?? "5m") as StringValue);
    this.loadSeraph(data?.seraph ?? {});
    this.loadUrchin(data?.urchin ?? {});
    this.loadVega(data?.vega ?? {});
    return true;
  }

  private loadSeraph({ BASE_URL, API_KEY }: ConfigData) {
    if (!BASE_URL || !API_KEY) {
      this.context.logger.error("BedWars Utils plugin config is missing seraph data");
      return false;
    }
    this.seraph = new SeraphManager(this, BASE_URL, API_KEY);
  }

  private loadUrchin({ BASE_URL, API_KEY }: ConfigData) {
    if (!BASE_URL || !API_KEY) {
      this.context.logger.error("BedWars Utils plugin config is missing urchin data");
      return false;
    }
    this.urchin = new UrchinManager(this, BASE_URL, API_KEY);
  }

  private loadVega({ BASE_URL }: ConfigData) {
    if (!BASE_URL) {
      this.context.logger.error("BedWars Utils plugin config is missing vega data");
      return false;
    }
    this.vega = new VegaManager(this, BASE_URL);
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
}

export default BedWarsUtilsPlugin;
