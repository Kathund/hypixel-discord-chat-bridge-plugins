import {
  type ButtonInteractionWithGuild,
  ButtonResponse,
  CommandFlags,
  DiscordButton,
  DiscordButtonData,
  type DiscordManagerWithPlugin,
  HypixelDiscordChatBridgeError
} from "hypixel-discord-chat-bridge/plugin-api";
import type LunaliaPlugin from "../../index.js";

class GoToSelfButton extends DiscordButton<DiscordManagerWithPlugin<LunaliaPlugin>> {
  override readonly data = new DiscordButtonData("viewMoreGexpLeaderboardSelf");
  override readonly response = ButtonResponse.Update;
  override flags: readonly CommandFlags[] = [CommandFlags.VerificationCommand];

  override async execute(interaction: ButtonInteractionWithGuild): Promise<void> {
    const linked = await this.discord.plugin.application.data.linked.getUserByDiscordId(interaction.user.id);
    if (linked === undefined) throw new HypixelDiscordChatBridgeError("You aren't verified");
    await interaction.editReply(
      await this.discord.plugin.data.gexpUserManager.getViewMoreResponse(
        (await this.discord.plugin.data.gexpUserManager.getPageForUser(linked.uuid)) ?? 0,
        interaction.user.id
      )
    );
  }
}

export default GoToSelfButton;
