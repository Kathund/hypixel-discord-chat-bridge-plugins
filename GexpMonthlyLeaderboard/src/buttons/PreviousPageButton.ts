import { type ButtonInteractionWithGuild, ButtonResponse, DiscordButton, DiscordButtonData, type DiscordManagerWithPlugin } from "hypixel-discord-chat-bridge/plugin-api";
import type GexpMonthlyLeaderboardPlugin from "../../index.ts";

class PreviousPageButton extends DiscordButton<DiscordManagerWithPlugin<GexpMonthlyLeaderboardPlugin>> {
  override readonly data = new DiscordButtonData("gexpMonthlyLeaderboardPrevious");
  override readonly response = ButtonResponse.Update;

  override async execute(interaction: ButtonInteractionWithGuild): Promise<void> {
    const page = this.discord.plugin.data.gexpUserManager.getPageFromMessage(interaction.message) - 1;
    await interaction.editReply(await this.discord.plugin.data.gexpUserManager.getViewMoreResponse(page, interaction.user.id));
  }
}

export default PreviousPageButton;
