import BasicManager from "../../BasicManager.js";
import SeraphCommand from "./commands/SeraphCommand.js";
import type BedWarsUtilsPlugin from "../../index.js";
import type { CommandConstructor } from "../../types.js";
import type { SeraphBlacklistResponse } from "./types.js";

class SeraphManager extends BasicManager {
  static commands: CommandConstructor[] = [SeraphCommand];
  constructor(plugin: BedWarsUtilsPlugin, BASE_URL: string, API_KEY: string) {
    super(plugin, BASE_URL, "Seraph", { "seraph-api-key": API_KEY });
  }

  async getBlacklist(query: string): Promise<SeraphBlacklistResponse | undefined> {
    query = await this.plugin.toUUID(query);
    return this.request<SeraphBlacklistResponse>(`${query}/blacklist`);
  }
}

export default SeraphManager;
