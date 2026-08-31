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

class UrchinCommand extends MinecraftCommand<MinecraftManagerWithPlugin<BedWarsUtilsPlugin>> {
  override readonly data = new MinecraftCommandData()
    .setName("urchin")
    .setDescription("Fetch urchin tags")
    .setOptions([new MinecraftCommandDataOption().setName("username").setDescription("Minecraft Username")]);

  override async execute(player: string, message: string): Promise<void> {
    if (!this.minecraft.plugin.urchin) return await this.send("Urchin data wasn't loadded correctly");
    player = this.getArgs(message)[0] || player;
    const profile = await MowojangAPI.getProfile(player);
    if (profile.data === null) return await this.send(`${player} does not exist!`);
    const data = await this.minecraft.plugin.urchin.getTags(profile.data.UUID);
    if (!data || data.tags.length === 0) return await this.send(`${profile.data.username} has no Urchin tags.`);
    const tag = data.tags[0];
    if (!tag) return await this.send(`${profile.data.username} has no Urchin tags.`);
    await this.send(truncateString(`[Urchin] ${profile.data.username} is tagged for ${titleCase(tag.tag_type)} | ${tag.reason}`, BedWarsUtilsPlugin.TagTrimLength));
  }
}

export default UrchinCommand;
