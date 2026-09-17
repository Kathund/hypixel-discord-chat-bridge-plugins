import { type ButtonInteractionWithGuild, ButtonResponse, DiscordButton, DiscordButtonData, type DiscordManagerWithPlugin } from "hypixel-discord-chat-bridge/plugin-api";
import type LunaliaPlugin from "../../index.js";

class ViewMoreButton extends DiscordButton<DiscordManagerWithPlugin<LunaliaPlugin>> {
  override readonly data = new DiscordButtonData("viewMoreGexpLeaderboard");
  override readonly response = ButtonResponse.Ephemeral;

  override async execute(interaction: ButtonInteractionWithGuild): Promise<void> {
    await interaction.followUp(await this.discord.plugin.data.gexpUserManager.getViewMoreResponse(0, interaction.user.id));
  }
}

export default ViewMoreButton;
