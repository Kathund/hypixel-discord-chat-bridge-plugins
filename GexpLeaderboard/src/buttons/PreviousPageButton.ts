import { type ButtonInteractionWithGuild, ButtonResponse, DiscordButton, DiscordButtonData, type DiscordManagerWithPlugin } from "hypixel-discord-chat-bridge/plugin-api";
import { type GexpLeaderboardPeriod, getLeaderboardButtonId } from "../types/leaderboard.ts";
import type GexpLeaderboardPlugin from "../../index.ts";

class PreviousPageButton extends DiscordButton<DiscordManagerWithPlugin<GexpLeaderboardPlugin>> {
  override readonly data: DiscordButtonData;
  override readonly response = ButtonResponse.Update;
  constructor(
    discord: DiscordManagerWithPlugin<GexpLeaderboardPlugin>,
    private readonly period: GexpLeaderboardPeriod
  ) {
    super(discord);
    this.data = new DiscordButtonData(getLeaderboardButtonId(period, "Previous"));
  }

  override async execute(interaction: ButtonInteractionWithGuild): Promise<void> {
    const page = this.discord.plugin.data.gexpUserManager.getPageFromMessage(interaction.message) - 1;
    await interaction.editReply(await this.discord.plugin.data.gexpUserManager.getViewMoreResponse(page, interaction.user.id, this.period));
  }
}

export default PreviousPageButton;
