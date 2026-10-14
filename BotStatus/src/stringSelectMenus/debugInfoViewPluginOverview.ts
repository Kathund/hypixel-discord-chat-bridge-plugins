import {
  ButtonResponse,
  type DiscordManagerWithPlugin,
  DiscordStringSelectMenu,
  DiscordStringSelectMenuData,
  type StringSelectMenuInteractionWithGuild
} from "hypixel-discord-chat-bridge/plugin-api";
import type BotStatusPlugin from "../../index.ts";

class DebugInfoViewPluginOverview extends DiscordStringSelectMenu<DiscordManagerWithPlugin<BotStatusPlugin>> {
  override readonly data = new DiscordStringSelectMenuData("debugInfoViewPluginOverview");
  override response: ButtonResponse = ButtonResponse.Ephemeral;

  override async execute(interaction: StringSelectMenuInteractionWithGuild) {
    await interaction.followUp(this.discord.plugin.getMessageDataPlugin(interaction.values[0]));
  }
}

export default DebugInfoViewPluginOverview;
