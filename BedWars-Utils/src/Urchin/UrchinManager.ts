import BasicManager from "../BasicManager.ts";
import SessionsCommand from "./commands/SessionCommand.js";
import UrchinCommand from "./commands/UrchinCommand.js";
import WinstreakCommand from "./commands/WinstreakCommand.js";
import { BedWars } from "hypixel-api-reborn";
import type BedWarsUtilsPlugin from "../../index.js";
import type { BedWarsUtilsConfig } from "../types/config.ts";
import type { CommandConstructor } from "../types/misc.ts";
import type { SessionType, UrchinSessionResponse, UrchinTagsResponse, UrchinWinstreakResopnse } from "../types/urchin.ts";

class UrchinManager extends BasicManager {
  static commands: CommandConstructor[] = [SessionsCommand, UrchinCommand, WinstreakCommand];
  constructor(plugin: BedWarsUtilsPlugin, config: BedWarsUtilsConfig["urchin"]) {
    super(plugin, config.baseUrl, "Urchin", { "X-API-Key": config.apiKey });
  }

  async getTags(query: string): Promise<UrchinTagsResponse | undefined> {
    query = await this.plugin.toUUID(query);
    return this.request<UrchinTagsResponse>(`player/tags?player=${query}`);
  }

  async getWinstreaks(query: string): Promise<UrchinWinstreakResopnse | undefined> {
    query = await this.plugin.toUUID(query);
    return this.request<UrchinWinstreakResopnse>(`player/winstreaks?player=${query}`);
  }

  async getBedWarsSession(query: string, type: SessionType): Promise<BedWars | undefined> {
    query = await this.plugin.toUUID(query);
    const data = await this.request<UrchinSessionResponse>(`player/sessions/${type}?player=${query}`);
    if (data === undefined) return undefined;
    return new BedWars(data.delta?.stats?.Bedwars ?? {});
  }
}

export default UrchinManager;
