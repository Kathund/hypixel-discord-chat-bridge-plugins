import BasicManager from "../BasicManager.ts";
import SeraphCommand from "./commands/SeraphCommand.js";
import type BedWarsUtilsPlugin from "../../index.js";
import type { CommandConstructor } from "../types/misc.ts";
import type { BedWarsUtilsConfig } from "../types/config.ts";
import type { SeraphBlacklistResponse } from "../types/seraph.ts";

class SeraphManager extends BasicManager {
  static commands: CommandConstructor[] = [SeraphCommand];
  constructor(plugin: BedWarsUtilsPlugin, config: BedWarsUtilsConfig["seraph"]) {
    super(plugin, config.baseUrl, "Seraph", { "seraph-api-key": config.apiKey });
  }

  async getBlacklist(query: string): Promise<SeraphBlacklistResponse | undefined> {
    query = await this.plugin.toUUID(query);
    return this.request<SeraphBlacklistResponse>(`${query}/blacklist`);
  }
}

export default SeraphManager;
