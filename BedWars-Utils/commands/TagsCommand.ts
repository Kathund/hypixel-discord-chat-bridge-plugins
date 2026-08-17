import {
  MinecraftCommand,
  MinecraftCommandData,
  MinecraftCommandDataOption,
  type MinecraftManagerWithPlugin,
  MowojangAPI,
  titleCase
} from "hypixel-discord-chat-bridge/plugin-api";
import type BedWarsUtilsPlugin from "../index.js";

class TagsCommand extends MinecraftCommand<MinecraftManagerWithPlugin<BedWarsUtilsPlugin>> {
  override readonly data = new MinecraftCommandData()
    .setName("tags")
    .setAliases(["tag"])
    .setDescription("Fetch tags")
    .setOptions([new MinecraftCommandDataOption().setName("username").setDescription("Minecraft Username")]);

  static noTagReturn: string = "Clean";

  async getSeraphTag(UUID: string): Promise<string> {
    if (!this.minecraft.plugin.seraph) return "UNKNOWN";
    const data = await this.minecraft.plugin.seraph.getBlacklist(UUID);
    if (!data || data.data.blacklist.tagged === false) return TagsCommand.noTagReturn;
    return data.data.blacklist.report_type;
  }

  async getUrchinTag(UUID: string): Promise<string> {
    if (!this.minecraft.plugin.urchin) return "UNKNOWN";
    const data = await this.minecraft.plugin.urchin.getTags(UUID);
    if (!data || data.tags.length === 0) return TagsCommand.noTagReturn;
    const tag = data.tags[0];
    if (!tag) return TagsCommand.noTagReturn;
    return tag.tag_type;
  }

  async getVegaTag(UUID: string): Promise<string> {
    if (!this.minecraft.plugin.vega) return "UNKNOWN";
    const data = await this.minecraft.plugin.vega.getBlacklist(UUID);
    if (!data || data.blacklisted === false) return TagsCommand.noTagReturn;
    return data.data.type;
  }

  override async execute(player: string, message: string): Promise<void> {
    player = this.getArgs(message)[0] || player;
    const profile = await MowojangAPI.getProfile(player);
    if (profile.data === null) return await this.send(`${player} does not exist!`);

    const tagSources = [
      ["seraph", this.getSeraphTag(profile.data.UUID)],
      ["urchin", this.getUrchinTag(profile.data.UUID)],
      ["vega", this.getVegaTag(profile.data.UUID)]
    ] as const;

    const tags = await Promise.all(tagSources.map(async ([name, promise]) => ({ name, tag: await promise })));
    await this.send(`${profile.data.username}'s tags: ${tags.map(({ name, tag }) => `${titleCase(name)}: ${titleCase(tag)}`).join(" | ")}`);
  }
}

export default TagsCommand;
