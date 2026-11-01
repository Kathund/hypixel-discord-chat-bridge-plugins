import ms from "ms";
import prettyMilliseconds from "pretty-ms";
import {
  type ChatInputCommandInteractionWithGuild,
  CommandFlags,
  CommandPermission,
  DiscordCommand,
  DiscordCommandDataBuilder,
  type DiscordManagerWithPlugin,
  EmbedHelper,
  HypixelDiscordChatBridgeError,
  SuccessEmbed,
  delay
} from "hypixel-discord-chat-bridge/plugin-api";
import type BotStatusPlugin from "../../index.ts";

class BetterExecuteCommand extends DiscordCommand<DiscordManagerWithPlugin<BotStatusPlugin>> {
  override readonly data = new DiscordCommandDataBuilder()
    .setName("better-execute")
    .setDescription("Execute as the bot")
    .addStringOption((option) => option.setName("commands").setDescription("commands").setRequired(true));
  override readonly permission: CommandPermission = CommandPermission.Admin;
  override flags: readonly CommandFlags[] = [CommandFlags.RequiresMinecraftBot];

  override async execute(interaction: ChatInputCommandInteractionWithGuild): Promise<void> {
    if (!this.discord.application.minecraft.isBotOnline()) throw new HypixelDiscordChatBridgeError(this.discord.application.messages.minecraftBotOffline);
    const rawCommands = interaction.options.getString("commands", true);
    const commands = rawCommands
      .split("\n")
      .map((command) => command.replace(/^\//, ""))
      .filter((command) => command.length !== 0)
      .map((command) => `/${command}`);
    const delayDuration = ms("3s");
    await interaction.followUp({
      embeds: [
        new EmbedHelper()
          .setDescription(`Executing ${commands.length} command(s)`)
          .addFields({ name: "Estimated Duration", value: `${commands.length * delayDuration}ms (${prettyMilliseconds(commands.length * delayDuration)})` })
          .setDevFooter("Amber")
      ]
    });
    const start = performance.now();
    try {
      for (const command of commands) {
        this.discord.application.minecraft.bot.chat(command);
        await delay(delayDuration);
      }
    } finally {
      const durationMs = performance.now() - start;
      await interaction.followUp({
        embeds: [
          new SuccessEmbed()
            .setDescription(`Executed ${commands.length} command(s)`)
            .addFields({ name: "Duration", value: `${durationMs}ms (${prettyMilliseconds(durationMs)})` })
            .setDevFooter("Amber")
        ]
      });
    }
  }
}

export default BetterExecuteCommand;
