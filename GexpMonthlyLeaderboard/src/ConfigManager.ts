import { BasicConfigManager, type MigrationMap } from "hypixel-discord-chat-bridge/plugin-api";
import { GexpMonthlyLeaderboardConfig } from "./types/config.ts";

class ConfigManager extends BasicConfigManager<GexpMonthlyLeaderboardConfig> {
  protected readonly configPath = "data/plugins/gexpMonthlyLeaderboard/config.json";
  protected readonly defaultConfigPath = "plugins/GexpMonthlyLeaderboard/config.example.json";
  protected readonly schema = GexpMonthlyLeaderboardConfig;
  protected readonly versions: Record<number, MigrationMap> = {};
}

export default ConfigManager;
