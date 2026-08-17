import UrchinCommand from "./commands/UrchinCommand.ts";
import axios, { AxiosError, HttpStatusCode } from "axios";
import { BridgePlugin, HypixelDiscordChatBridgeError, type JsonObject, MowojangAPI } from "hypixel-discord-chat-bridge/plugin-api";
import { Errors, HypixelAPIRebornError, isUUID } from "hypixel-api-reborn";
import { access, readFile } from "node:fs/promises";

interface UrchinTag {
  added_on: number | bigint; // int64
  hide_username: boolean;
  reason: string;
  tag_type: string;
  added_by?: number | bigint | null; // int64
  added_by_username?: string | null;
  expires_at?: number | bigint | null; // int64
}

interface UrchinPlayerResponse {
  uuid: string;
  displayname?: string | null;
  tags: UrchinTag[];
}

class UrchinPlugin extends BridgePlugin<UrchinPlugin> {
  override readonly metadata = {
    name: "Urchin",
    description: "Adds Urchin related commands to in game minecraft commands",
    version: "1.0.0",
    author: "kathund",
    link: "https://github.com/Kathund/hypixel-discord-chat-bridge-plugins/tree/main/Urchin"
  } as const;
  #started: boolean = false;

  private BASE_URL: string | undefined;
  private API_KEY: string | undefined;

  override registerExtensions(): Promise<void> {
    this.context.registerMinecraftCommand((minecraft) => new UrchinCommand(minecraft));
    return Promise.resolve();
  }

  override async start(): Promise<void> {
    if (this.#started) return Promise.resolve();
    const configLoad = await this.loadConfig();
    if (!configLoad) return Promise.resolve();
    this.#started = true;
    this.context.logger.info("Urchin plugin started.");
    return Promise.resolve();
  }

  private async loadConfig(): Promise<boolean> {
    try {
      await access("plugins/Urchin/config.json");
    } catch {
      this.context.logger.error("Urchin plugin config not found.");
      return false;
    }
    const file = await readFile("plugins/Urchin/config.json", "utf-8");
    const data = this.parseJsonObject(file, "plugins/Urchin/config.json");
    this.BASE_URL = data.BASE_URL?.toString();
    this.API_KEY = data.API_KEY?.toString();
    return true;
  }

  private parseJsonObject(input: string, source: string): JsonObject {
    const parsed: unknown = JSON.parse(input);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new HypixelDiscordChatBridgeError(`${source} must contain a JSON object.`);
    return parsed as JsonObject;
  }

  override stop(): Promise<void> {
    if (!this.#started) return Promise.resolve();
    this.#started = false;
    this.context.logger.info("Urchin plugin stopped.");
    return Promise.resolve();
  }

  // I love skidding my own code
  // Credit: https://github.com/Hypixel-API-Reborn/hypixel-api-reborn/blob/35e4537a420cf731083b9bdb2ca37776304f4c60/src/Private/RequestHandler.ts#L76-L83
  private async toUUID(input: string): Promise<string> {
    if (!input) throw new HypixelAPIRebornError(Errors.NO_NICKNAME_UUID);
    if (typeof input !== "string") throw new HypixelAPIRebornError(Errors.UUID_NICKNAME_MUST_BE_A_STRING);
    if (isUUID(input)) return input.replace(/-/g, "");
    const profile = await MowojangAPI.getProfile(input);
    if (profile.data === null) throw new HypixelAPIRebornError(Errors.PLAYER_DOES_NOT_EXIST);
    return profile.data.UUID;
  }

  async getPlayer(query: string): Promise<UrchinPlayerResponse | undefined> {
    if (!this.BASE_URL || !this.API_KEY) throw new HypixelDiscordChatBridgeError("Urchin config isn't loaded yet");
    try {
      query = await this.toUUID(query);
      const { data } = await axios.get(`${this.BASE_URL}/player/tags?player=${query}&key=${this.API_KEY}`);
      return data;
    } catch (error: unknown) {
      if (!(error instanceof AxiosError)) throw error;
      switch (error.status) {
        case HttpStatusCode.TooManyRequests:
          throw new HypixelDiscordChatBridgeError("Urchin API is Ratelimited. Please try again later");
        case HttpStatusCode.NotFound:
          return undefined;
        case HttpStatusCode.Unauthorized:
        case HttpStatusCode.Forbidden:
          throw new HypixelDiscordChatBridgeError("Urchin API Key is invalid");
        default:
          throw error;
      }
    }
  }
}

export default UrchinPlugin;
