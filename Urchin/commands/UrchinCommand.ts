import { MinecraftCommand, MinecraftCommandData, MinecraftCommandDataOption, type MinecraftManagerWithPlugin, MowojangAPI } from "hypixel-discord-chat-bridge/plugin-api";
import { titleCase, truncateString } from "../../../src/utils/stringUtils.ts";
import type UrchinPlugin from "../index.js";

class UrchinCommand extends MinecraftCommand<MinecraftManagerWithPlugin<UrchinPlugin>> {
  override readonly data = new MinecraftCommandData()
    .setName("urchin")
    .setDescription("Fetch urchin tags")
    .setAliases(["tag", "tags"])
    .setOptions([new MinecraftCommandDataOption().setName("username").setDescription("Minecraft Username")]);

  override async execute(player: string, message: string): Promise<void> {
    player = this.getArgs(message)[0] || player;
    const profile = await MowojangAPI.getProfile(player);
    if (profile.data === null) return await this.send(`${player} does not exist!`);
    const data = await this.minecraft.plugin.getPlayer(profile.data.username);
    if (!data || data.tags.length === 0) return await this.send(`${profile.data.username} has no Urchin tags.`);
    const tag = data.tags[0];
    if (!tag) return await this.send(`${profile.data.username} has no Urchin tags.`);
    const reason = truncateString(tag.reason, 100);
    await this.send(`${profile.data.username} is tagged for ${titleCase(tag.tag_type)} | ${reason}`);
  }
}

export default UrchinCommand;
