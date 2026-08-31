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

class SeraphCommand extends MinecraftCommand<MinecraftManagerWithPlugin<BedWarsUtilsPlugin>> {
  override readonly data = new MinecraftCommandData()
    .setName("seraph")
    .setDescription("Fetch seraph tags")
    .setOptions([new MinecraftCommandDataOption().setName("username").setDescription("Minecraft Username")]);

  override async execute(player: string, message: string): Promise<void> {
    if (!this.minecraft.plugin.seraph) return await this.send("Seraph data wasn't loadded correctly");
    player = this.getArgs(message)[0] || player;
    const profile = await MowojangAPI.getProfile(player);
    if (profile.data === null) return await this.send(`${player} does not exist!`);
    const data = await this.minecraft.plugin.seraph.getBlacklist(profile.data.UUID);
    if (!data || data.data.blacklist.tagged === false) return await this.send(`${profile.data.username} has no Seraph tags.`);
    await this.send(
      truncateString(
        `[Seraph] ${profile.data.username} is tagged for ${titleCase(data.data.blacklist.report_type)} | ${(data.data.blacklist.tooltip ?? data.data.blacklist.reason)
          .replaceAll(`${data.data.blacklist.report_type}: `, "")
          .replaceAll("( Upgraded ) ", "")}`,
        BedWarsUtilsPlugin.TagTrimLength
      )
    );
  }
}

export default SeraphCommand;
