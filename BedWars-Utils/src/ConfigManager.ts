import { BasicConfigManager, ConfigChangeType, type MigrationMap } from "hypixel-discord-chat-bridge/plugin-api";
import { BedWarsUtilsConfig } from "./types/config.js";

class ConfigManager extends BasicConfigManager<BedWarsUtilsConfig> {
  protected readonly configPath = "plugins/BedWars-Utils/config.json";
  protected readonly defaultConfigPath = "plugins/BedWars-Utils/config.example.json";
  protected readonly schema = BedWarsUtilsConfig;
  protected readonly versions: Record<number, MigrationMap> = {
    2: {
      "urchin.BASE_URL": { key: "urchin.baseUrl", change: ConfigChangeType.Move },
      "urchin.API_KEY": { key: "urchin.apiKey", change: ConfigChangeType.Move },
      "seraph.BASE_URL": { key: "seraph.baseUrl", change: ConfigChangeType.Move },
      "seraph.API_KEY": { key: "seraph.apiKey", change: ConfigChangeType.Move },
      "vega.API_KEY": { key: "vega.baseUrl", change: ConfigChangeType.Move }
    }
  };
}

export default ConfigManager;
