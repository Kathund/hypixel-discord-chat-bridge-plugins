import BedWarsUtilsPlugin from "../../../index.js";
import {
  MinecraftCommand,
  MinecraftCommandData,
  MinecraftCommandDataOption,
  type MinecraftManagerWithPlugin,
  MowojangAPI,
  titleCase,
  truncateString
} from "hypixel-discord-chat-bridge/plugin-api";

class VegaCommand extends MinecraftCommand<MinecraftManagerWithPlugin<BedWarsUtilsPlugin>> {
  override readonly data = new MinecraftCommandData()
    .setName("vega")
    .setDescription("Fetch vega tags")
    .setOptions([new MinecraftCommandDataOption().setName("username").setDescription("Minecraft Username")]);

  override async execute(player: string, message: string): Promise<void> {
    if (!this.minecraft.plugin.isFullyLoaded()) return await this.send("Vega data wasn't loadded correctly");
    player = this.getArgs(message)[0] || player;
    const profile = await MowojangAPI.getProfile(player);
    if (profile.data === null) return await this.send(`${player} does not exist!`);
    const data = await this.minecraft.plugin.vega.getBlacklist(profile.data.UUID);
    if (!data || data.blacklisted === false) return await this.send(`${profile.data.username} has no Vega tags.`);
    await this.send(truncateString(`[Vega] ${profile.data.username} is tagged for ${titleCase(data.data.type)} | ${data.data.reason}`, BedWarsUtilsPlugin.TagTrimLength));
  }
}

export default VegaCommand;
