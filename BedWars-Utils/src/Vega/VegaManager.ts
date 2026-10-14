import BasicManager from "../BasicManager.ts";
import PingCommand from "./commands/PingCommand.ts";
import VegaCommand from "./commands/VegaCommand.ts";
import type BedWarsUtilsPlugin from "../../index.ts";
import type { BedWarsUtilsConfig } from "../types/config.ts";
import type { CommandConstructor } from "../types/misc.ts";
import type { VegaBlacklistResponse, VegaPingResponse } from "../types/vega.ts";

class VegaManager extends BasicManager {
  static commands: CommandConstructor[] = [PingCommand, VegaCommand];
  constructor(plugin: BedWarsUtilsPlugin, config: BedWarsUtilsConfig["vega"]) {
    super(plugin, config.baseUrl, "Vega");
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
