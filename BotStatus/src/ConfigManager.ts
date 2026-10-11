import { BasicConfigManager, type MigrationMap } from "hypixel-discord-chat-bridge/plugin-api";
import { BotStatusConfig } from "./types/config.ts";

class ConfigManager extends BasicConfigManager<BotStatusConfig> {
  protected readonly configPath = "data/plugins/botStatus/config.json";
  protected readonly defaultConfigPath = "plugins/BotStatus/config.example.json";
  protected readonly schema = BotStatusConfig;
  protected readonly versions: Record<number, MigrationMap> = {};
}

export default ConfigManager;
