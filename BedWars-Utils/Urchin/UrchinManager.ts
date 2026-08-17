import BasicManager from "../BasicManager.js";
import SessionsCommand from "./commands/SessionCommand.js";
import UrchinCommand from "./commands/UrchinCommand.js";
import WinstreakCommand from "./commands/WinstreakCommand.js";
import { BedWars } from "hypixel-api-reborn";
import type BedWarsUtilsPlugin from "../index.js";
import type { CommandConstructor } from "../types.js";
import type { SessionType, UrchinSessionResponse, UrchinTagsResponse, UrchinWinstreakResopnse } from "./types.js";

class UrchinManager extends BasicManager {
  static commands: CommandConstructor[] = [SessionsCommand, UrchinCommand, WinstreakCommand];
  constructor(plugin: BedWarsUtilsPlugin, BASE_URL: string, API_KEY: string) {
    super(plugin, BASE_URL, "Urchin", { "X-API-Key": API_KEY });
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
