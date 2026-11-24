import ConfigManager from "./src/ConfigManager.ts";
import DataManager from "./src/data/DataManager.ts";
import GoToSelfButton from "./src/buttons/GoToSelfButton.ts";
import NextPageButton from "./src/buttons/NextPageButton.ts";
import PreviousPageButton from "./src/buttons/PreviousPageButton.ts";
import SetupCommand from "./src/commands/setup.ts";
import UpdateGexpLeaderboardScript from "./src/scripts/UpdateGexpLeaderboard.ts";
import ViewMonthCommand from "./src/commands/viewMonth.ts";
import ViewMoreButton from "./src/buttons/ViewMoreButton.ts";
import ViewYearCommand from "./src/commands/viewYear.ts";
import { Application, BridgePlugin, type BridgePluginContext } from "hypixel-discord-chat-bridge/plugin-api";
import { GexpLeaderboardConfig } from "./src/types/config.ts";
import { access, writeFile } from "node:fs/promises";
import type { GexpLeaderboardPluginWithData } from "./src/types/misc.ts";

class GexpLeaderboardPlugin extends BridgePlugin<GexpLeaderboardPlugin> {
  readonly data: DataManager;
  override readonly metadata = {
    name: "GEXP Leaderboard",
    description: "Dynamic GEXP Leaderboard that auto resets",
    version: "1.0.0",
    author: "Amber",
    link: "https://github.com/Kathund/hypixel-discord-chat-bridge-plugins/tree/main/GexpLeaderboard"
  } as const;
  #started = false;
  config?: GexpLeaderboardConfig;

  constructor(context: BridgePluginContext<GexpLeaderboardPlugin>, application: Application) {
    super(context, application);
    this.data = new DataManager(this);
  }

  override registerExtensions(): Promise<void> {
    this.context.registerDiscordCommand((discord) => new SetupCommand(discord));
    this.context.registerDiscordCommand((discord) => new ViewMonthCommand(discord));
    this.context.registerDiscordCommand((discord) => new ViewYearCommand(discord));
    this.context.registerButton((discord) => new GoToSelfButton(discord, "monthly"));
    this.context.registerButton((discord) => new GoToSelfButton(discord, "yearly"));
    this.context.registerButton((discord) => new NextPageButton(discord, "monthly"));
    this.context.registerButton((discord) => new NextPageButton(discord, "yearly"));
    this.context.registerButton((discord) => new PreviousPageButton(discord, "monthly"));
    this.context.registerButton((discord) => new PreviousPageButton(discord, "yearly"));
    this.context.registerButton((discord) => new ViewMoreButton(discord, "monthly"));
    this.context.registerButton((discord) => new ViewMoreButton(discord, "yearly"));
    this.context.registerScript((scripts) => new UpdateGexpLeaderboardScript(scripts));
    return Promise.resolve();
  }

  override async start(): Promise<void> {
    if (this.#started) return Promise.resolve();
    const configLoad = await this.loadData();
    if (!configLoad) return Promise.resolve();
    await this.data.start();
    this.#started = true;
    this.context.logger.info(`${this.metadata.name} plugin started.`);
  }

  private async loadData(): Promise<boolean> {
    const configManager = new ConfigManager();
    try {
      await access("data/plugins/gexpLeaderboard/config.json");
    } catch {
      await writeFile("data/plugins/gexpLeaderboard/config.json", JSON.stringify(await configManager.getExampleConfigFile(), null, 2), "utf-8");
    }

    this.config = await configManager.init();
    return true;
  }

  override async stop(): Promise<void> {
    if (!this.#started) return Promise.resolve();
    await this.data.stop();
    this.#started = false;
    this.context.logger.info(`${this.metadata.name} plugin stopped.`);
  }

  getMonthName(month = new Date().getUTCMonth()): string {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[month] ?? "UNKNOWN";
  }

  isFullyLoaded(): this is GexpLeaderboardPluginWithData {
    if (this.config === undefined) return false;
    return true;
  }
}

export default GexpLeaderboardPlugin;
