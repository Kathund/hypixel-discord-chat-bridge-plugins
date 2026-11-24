import { type ButtonInteractionWithGuild, ButtonResponse, DiscordButton, DiscordButtonData, type DiscordManagerWithPlugin } from "hypixel-discord-chat-bridge/plugin-api";
import { type GexpLeaderboardPeriod, getLeaderboardButtonId } from "../types/leaderboard.ts";
import type GexpLeaderboardPlugin from "../../index.ts";

class ViewMoreButton extends DiscordButton<DiscordManagerWithPlugin<GexpLeaderboardPlugin>> {
  override readonly data: DiscordButtonData;
  override readonly response = ButtonResponse.Ephemeral;
  constructor(
    discord: DiscordManagerWithPlugin<GexpLeaderboardPlugin>,
    private readonly period: GexpLeaderboardPeriod
  ) {
    super(discord);
    this.data = new DiscordButtonData(getLeaderboardButtonId(period, "ViewMore"));
  }

  override async execute(interaction: ButtonInteractionWithGuild): Promise<void> {
    await interaction.followUp(await this.discord.plugin.data.gexpUserManager.getViewMoreResponse(0, interaction.user.id, this.period));
  }
}

export default ViewMoreButton;
