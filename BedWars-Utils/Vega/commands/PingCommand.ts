import {
  MinecraftCommand,
  MinecraftCommandData,
  MinecraftCommandDataOption,
  type MinecraftManagerWithPlugin,
  MowojangAPI,
  getMostRecent
} from "hypixel-discord-chat-bridge/plugin-api";
import type BedWarsUtilsPlugin from "../../index.js";
import type { VegaPingItem } from "../types.js";

class PingCommand extends MinecraftCommand<MinecraftManagerWithPlugin<BedWarsUtilsPlugin>> {
  override readonly data = new MinecraftCommandData()
    .setName("ping")
    .setDescription("Fetch vega ping data")
    .setOptions([new MinecraftCommandDataOption().setName("username").setDescription("Minecraft Username")]);

  override async execute(player: string, message: string): Promise<void> {
    if (!this.minecraft.plugin.vega) return await this.send("Vega data wasn't loadded correctly");
    player = this.getArgs(message)[0] || player;
    const profile = await MowojangAPI.getProfile(player);
    if (profile.data === null) return await this.send(`${player} does not exist!`);
    const data = await this.minecraft.plugin.vega.getPing(profile.data.UUID);
    if (!data || data.data.length === 0) return await this.send(`${profile.data.username} has no Vega ping entries.`);
    const { min, avg, max } = getMostRecent<VegaPingItem>(data.data) ?? { avg: 0, day: "UNKNOWN", max: 0, min: 0, timestamp: 0 };
    await this.send(`[Vega] ${profile.data.username}'s ping is ${avg}ms | Min: ${min}ms | Average: ${avg}ms | Max: ${max}ms`);
  }
}

export default PingCommand;
