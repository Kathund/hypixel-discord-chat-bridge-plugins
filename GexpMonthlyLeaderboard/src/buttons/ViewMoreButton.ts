import { type ButtonInteractionWithGuild, ButtonResponse, DiscordButton, DiscordButtonData, type DiscordManagerWithPlugin } from "hypixel-discord-chat-bridge/plugin-api";
import type GexpMonthlyLeaderboardPlugin from "../../index.ts";

class ViewMoreButton extends DiscordButton<DiscordManagerWithPlugin<GexpMonthlyLeaderboardPlugin>> {
  override readonly data = new DiscordButtonData("gexpMonthlyLeaderboardViewMore");
  override readonly response = ButtonResponse.Ephemeral;

  override async execute(interaction: ButtonInteractionWithGuild): Promise<void> {
    await interaction.followUp(await this.discord.plugin.data.gexpUserManager.getViewMoreResponse(0, interaction.user.id));
  }
}

export default ViewMoreButton;
