import { type ButtonInteractionWithGuild, ButtonResponse, DiscordButton, DiscordButtonData, type DiscordManagerWithPlugin } from "hypixel-discord-chat-bridge/plugin-api";
import type BotStatusPlugin from "../../index.ts";

class RefreshDataButton extends DiscordButton<DiscordManagerWithPlugin<BotStatusPlugin>> {
  override readonly data = new DiscordButtonData("botStatusRefreshData");
  override readonly response = ButtonResponse.Update;

  override async execute(interaction: ButtonInteractionWithGuild): Promise<void> {
    await interaction.editReply(this.discord.plugin.getMessageData());
  }
}

export default RefreshDataButton;
