import {
  type ButtonInteractionWithGuild,
  ButtonResponse,
  CommandFlags,
  DiscordButton,
  DiscordButtonData,
  type DiscordManagerWithPlugin,
  HypixelDiscordChatBridgeError
} from "hypixel-discord-chat-bridge/plugin-api";
import type GexpMonthlyLeaderboardPlugin from "../../index.ts";

class GoToSelfButton extends DiscordButton<DiscordManagerWithPlugin<GexpMonthlyLeaderboardPlugin>> {
  override readonly data = new DiscordButtonData("gexpMonthlyLeaderboardSelf");
  override readonly response = ButtonResponse.Update;
  override flags: readonly CommandFlags[] = [CommandFlags.VerificationCommand];

  override async execute(interaction: ButtonInteractionWithGuild): Promise<void> {
    const linked = await this.discord.plugin.application.data.linked.getUserByDiscordId(interaction.user.id);
    if (!linked) throw new HypixelDiscordChatBridgeError("You aren't verified");

    const page = (await this.discord.plugin.data.gexpUserManager.getPageForUser(linked.uuid)) ?? 0;
    await interaction.editReply(await this.discord.plugin.data.gexpUserManager.getViewMoreResponse(page, interaction.user.id));
  }
}

export default GoToSelfButton;
