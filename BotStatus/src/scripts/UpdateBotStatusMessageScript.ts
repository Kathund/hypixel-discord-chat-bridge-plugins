import { BasicScript, type ScriptManagerWithPlugin, intervalSchedule } from "hypixel-discord-chat-bridge/plugin-api";
import type BotStatusPlugin from "../../index.ts";

class UpdateBotStatusMessageScript extends BasicScript<ScriptManagerWithPlugin<BotStatusPlugin>> {
  constructor(scripts: ScriptManagerWithPlugin<BotStatusPlugin>) {
    super(scripts, { id: "updateBotStatusMessage", enabled: true, schedule: intervalSchedule("5m") });
  }

  override async execute() {
    const message = await this.scripts.plugin.getMessage();
    if (!message) return;
    await message.edit(this.scripts.plugin.getMessageData());
  }
}

export default UpdateBotStatusMessageScript;
