import {
  type ButtonInteractionWithGuild,
  ButtonResponse,
  CommandFlags,
  DiscordButton,
  DiscordButtonData,
  type DiscordManagerWithPlugin,
  HypixelDiscordChatBridgeError
} from "hypixel-discord-chat-bridge/plugin-api";
import { type GexpLeaderboardPeriod, getLeaderboardButtonId } from "../types/leaderboard.ts";
import type GexpLeaderboardPlugin from "../../index.ts";

class GoToSelfButton extends DiscordButton<DiscordManagerWithPlugin<GexpLeaderboardPlugin>> {
  override readonly data: DiscordButtonData;
  override readonly response = ButtonResponse.Update;
  override flags: readonly CommandFlags[] = [CommandFlags.VerificationCommand];
  constructor(
    discord: DiscordManagerWithPlugin<GexpLeaderboardPlugin>,
    private readonly period: GexpLeaderboardPeriod
  ) {
    super(discord);
    this.data = new DiscordButtonData(getLeaderboardButtonId(period, "Self"));
  }

  override async execute(interaction: ButtonInteractionWithGuild): Promise<void> {
    const linked = await this.discord.plugin.application.data.linked.getUserByDiscordId(interaction.user.id);
    if (!linked) throw new HypixelDiscordChatBridgeError("You aren't verified");

    const page = (await this.discord.plugin.data.gexpUserManager.getPageForUser(linked.uuid, 10, this.period)) ?? 0;
    await interaction.editReply(await this.discord.plugin.data.gexpUserManager.getViewMoreResponse(page, interaction.user.id, this.period));
  }
}

export default GoToSelfButton;
