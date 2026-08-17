import BasicManager from "../BasicManager.js";
import PingCommand from "./commands/PingCommand.js";
import VegaCommand from "./commands/VegaCommand.js";
import type BedWarsUtilsPlugin from "../index.js";
import type { CommandConstructor } from "../types.js";
import type { VegaBlacklistResponse, VegaPingResponse } from "./types.js";

class VegaManager extends BasicManager {
  static commands: CommandConstructor[] = [PingCommand, VegaCommand];
  constructor(plugin: BedWarsUtilsPlugin, BASE_URL: string) {
    super(plugin, BASE_URL, "Vega");
  }

  async getPing(query: string): Promise<VegaPingResponse | undefined> {
    query = await this.plugin.toUUID(query);
    return this.request<VegaPingResponse>(`resources/ping?uuid=${query}`);
  }

  async getBlacklist(query: string): Promise<VegaBlacklistResponse | undefined> {
    query = await this.plugin.toUUID(query);
    return this.request<VegaBlacklistResponse>(`resources/blacklist?uuid=${query}`);
  }
}

export default VegaManager;
