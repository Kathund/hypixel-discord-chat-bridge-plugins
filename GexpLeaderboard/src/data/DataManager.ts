import GexpUserManager from "./GexpUser/GexpUserManager.ts";
import { mkdir } from "node:fs/promises";
import type GexpLeaderboardPlugin from "../../index.ts";
import type { Lifecycle } from "hypixel-discord-chat-bridge/plugin-api";

class DataManager implements Lifecycle {
  readonly gexpUserManager: GexpUserManager;

  constructor(readonly plugin: GexpLeaderboardPlugin) {
    this.gexpUserManager = new GexpUserManager(this);
  }

  async start(): Promise<void> {
    await mkdir("./data/plugins/gexpLeaderboard", { recursive: true });
    await this.gexpUserManager.start();
  }

  async stop(): Promise<void> {
    await this.gexpUserManager.stop();
  }
}

export default DataManager;
