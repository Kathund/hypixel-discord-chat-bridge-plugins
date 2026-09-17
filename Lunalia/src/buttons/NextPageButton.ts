import { type ButtonInteractionWithGuild, ButtonResponse, DiscordButton, DiscordButtonData, type DiscordManagerWithPlugin } from "hypixel-discord-chat-bridge/plugin-api";
import type LunaliaPlugin from "../../index.js";

class NextPageButton extends DiscordButton<DiscordManagerWithPlugin<LunaliaPlugin>> {
  override readonly data = new DiscordButtonData("viewMoreGexpLeaderboardNext");
  override readonly response = ButtonResponse.Update;

  override async execute(interaction: ButtonInteractionWithGuild): Promise<void> {
    await interaction.editReply(
      await this.discord.plugin.data.gexpUserManager.getViewMoreResponse(
        this.discord.plugin.data.gexpUserManager.getPageFromMessage(interaction.message) + 1,
        interaction.user.id
      )
    );
  }
}

export default NextPageButton;
