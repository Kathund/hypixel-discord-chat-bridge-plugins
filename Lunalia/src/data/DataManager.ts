import GexpUserManager from "./GexpUser/GexpUserManager.js";
import { mkdir } from "node:fs/promises";
import type LunaliaPlugin from "../../index.js";
import type { Lifecycle } from "hypixel-discord-chat-bridge/plugin-api";

class DataManager implements Lifecycle {
  readonly gexpUserManager: GexpUserManager;
  constructor(readonly plugin: LunaliaPlugin) {
    this.gexpUserManager = new GexpUserManager(this);
  }

  async start(): Promise<void> {
    await mkdir("./data/plugins/lunaliaUtils", { recursive: true });
    await Promise.all([this.gexpUserManager.start()]);
  }

  async stop(): Promise<void> {
    await Promise.all([this.gexpUserManager.stop()]);
  }
}

export default DataManager;
