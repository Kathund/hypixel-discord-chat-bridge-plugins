import DataManager from "./src/data/DataManager.js";
import GoToSelfButton from "./src/buttons/GoToSelfButton.ts";
import NextPageButton from "./src/buttons/NextPageButton.ts";
import PreviousPageButton from "./src/buttons/PreviousPageButton.ts";
import UpdateGexpLeaderboardScript from "./src/scripts/UpdateGexpLeaderboard.ts";
import UpdateStatChannelsScriptNew from "./src/scripts/UpdateStatChannelsScriptNew.js";
import ViewMoreButton from "./src/buttons/ViewMoreButton.ts";
import { Application, BridgePlugin, type BridgePluginContext } from "hypixel-discord-chat-bridge/plugin-api";

class LunaliaPlugin extends BridgePlugin<LunaliaPlugin> {
  readonly data: DataManager;
  override readonly metadata = { name: "Lunalia Utils", description: "Lunalia plugin shit", version: "1.0.0", author: "kathund" } as const;
  #started: boolean = false;
  private enabled: boolean = false;

  constructor(context: BridgePluginContext<LunaliaPlugin>, application: Application) {
    super(context, application);
    this.data = new DataManager(this);
    this.enabled = this.application.config.discord.serverId === "1456428206230999075";
  }

  override registerExtensions(): Promise<void> {
    if (!this.enabled) return Promise.resolve();
    this.context.registerButton((discord) => new GoToSelfButton(discord));
    this.context.registerButton((discord) => new NextPageButton(discord));
    this.context.registerButton((discord) => new PreviousPageButton(discord));
    this.context.registerButton((discord) => new ViewMoreButton(discord));
    this.context.registerScript((scripts) => new UpdateStatChannelsScriptNew(scripts));
    this.context.registerScript((scripts) => new UpdateGexpLeaderboardScript(scripts));
    return Promise.resolve();
  }

  override async start(): Promise<void> {
    if (!this.enabled) return Promise.resolve();
    if (this.#started) return Promise.resolve();
    await this.data.start();
    this.#started = true;
    this.context.logger.info("Lunalia Utils plugin started.");
    return Promise.resolve();
  }

  override async stop(): Promise<void> {
    if (!this.enabled) return Promise.resolve();
    if (!this.#started) return Promise.resolve();
    await this.data.stop();
    this.#started = false;
    this.context.logger.info("Lunalia Utils plugin stopped.");
    return Promise.resolve();
  }
}

export default LunaliaPlugin;
