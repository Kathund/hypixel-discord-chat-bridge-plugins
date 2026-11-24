import { BasicConfigManager, ConfigChangeType, type MigrationMap } from "hypixel-discord-chat-bridge/plugin-api";
import { GexpLeaderboardConfig } from "./types/config.ts";

class ConfigManager extends BasicConfigManager<GexpLeaderboardConfig> {
  protected readonly configPath = "data/plugins/gexpLeaderboard/config.json";
  protected readonly defaultConfigPath = "plugins/GexpLeaderboard/config.example.json";
  protected readonly schema = GexpLeaderboardConfig;
  protected readonly versions: Record<number, MigrationMap> = {
    2: {
      "discord.channelId": { key: "discord.monthly.channelId", change: ConfigChangeType.Move },
      "discord.leaderboardMessageId": { key: "discord.monthly.leaderboardMessageId", change: ConfigChangeType.Move },
      "discord.leaderboardInfoMessageId": { key: "discord.monthly.leaderboardInfoMessageId", change: ConfigChangeType.Move }
    }
  };
}

export default ConfigManager;
