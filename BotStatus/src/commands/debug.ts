import {
  type ChatInputCommandInteractionWithGuild,
  CommandPermission,
  DiscordCommand,
  DiscordCommandDataBuilder,
  type DiscordManagerWithPlugin
} from "hypixel-discord-chat-bridge/plugin-api";
import type BotStatusPlugin from "../../index.ts";

class DebugCommand extends DiscordCommand<DiscordManagerWithPlugin<BotStatusPlugin>> {
  override readonly data = new DiscordCommandDataBuilder().setName("debug").setDescription("View Debug Information");
  override readonly permission: CommandPermission = CommandPermission.Staff;

  override async execute(interaction: ChatInputCommandInteractionWithGuild): Promise<void> {
    await interaction.followUp(this.discord.plugin.getMessageData());
  }
}

export default DebugCommand;
