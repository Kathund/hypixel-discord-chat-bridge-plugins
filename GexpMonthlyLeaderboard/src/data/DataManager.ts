import GexpUserManager from "./GexpUser/GexpUserManager.ts";
import { mkdir } from "node:fs/promises";
import type GexpMonthlyLeaderboardPlugin from "../../index.ts";
import type { Lifecycle } from "hypixel-discord-chat-bridge/plugin-api";

class DataManager implements Lifecycle {
  readonly gexpUserManager: GexpUserManager;

  constructor(readonly plugin: GexpMonthlyLeaderboardPlugin) {
    this.gexpUserManager = new GexpUserManager(this);
  }

  async start(): Promise<void> {
    await mkdir("./data/plugins/gexpMonthlyLeaderboard", { recursive: true });
    await this.gexpUserManager.start();
  }

  async stop(): Promise<void> {
    await this.gexpUserManager.stop();
  }
}

export default DataManager;
