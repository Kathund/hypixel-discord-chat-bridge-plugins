import {
  ButtonResponse,
  type DiscordManagerWithPlugin,
  DiscordStringSelectMenu,
  DiscordStringSelectMenuData,
  type StringSelectMenuInteractionWithGuild
} from "hypixel-discord-chat-bridge/plugin-api";
import type BotStatusPlugin from "../../index.ts";

class DebugInfoViewPlugin extends DiscordStringSelectMenu<DiscordManagerWithPlugin<BotStatusPlugin>> {
  override readonly data = new DiscordStringSelectMenuData("debugInfoViewPlugin");
  override response: ButtonResponse = ButtonResponse.Update;

  override async execute(interaction: StringSelectMenuInteractionWithGuild) {
    await interaction.editReply(this.discord.plugin.getMessageDataPlugin(interaction.values[0]));
  }
}

export default DebugInfoViewPlugin;
