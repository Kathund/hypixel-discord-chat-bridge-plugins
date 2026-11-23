import prettyMilliseconds from "pretty-ms";
import { ChannelType } from "discord.js";
import {
  type ChatInputCommandInteractionWithGuild,
  CommandPermission,
  DiscordCommand,
  DiscordCommandDataBuilder,
  type DiscordManagerWithPlugin,
  EmbedHelper,
  HypixelDiscordChatBridgeError,
  SuccessEmbed
} from "hypixel-discord-chat-bridge/plugin-api";
import { writeFile } from "node:fs/promises";
import type GexpMonthlyLeaderboardPlugin from "../../index.ts";

class SetupCommand extends DiscordCommand<DiscordManagerWithPlugin<GexpMonthlyLeaderboardPlugin>> {
  override readonly data = new DiscordCommandDataBuilder()
    .setName("setup-gexp-leaderboard")
    .setDescription("Setup the gexp leaderboard")
    .addChannelOption((option) => option.setName("channel").setDescription("Channel").addChannelTypes(ChannelType.GuildText).setRequired(true));

  override readonly permission: CommandPermission = CommandPermission.Staff;

  override async execute(interaction: ChatInputCommandInteractionWithGuild): Promise<void> {
    if (!this.discord.plugin.isFullyLoaded()) throw new HypixelDiscordChatBridgeError("Config isn't loaded for some reason");
    const baseChannel = interaction.options.getChannel("channel", true);
    if (baseChannel.type !== ChannelType.GuildText) throw new HypixelDiscordChatBridgeError("Invalid channel type inputed");
    const channel = await interaction.guild.channels.fetch(baseChannel.id);
    if (channel === null || channel.type !== ChannelType.GuildText) throw new HypixelDiscordChatBridgeError("Invalid channel type inputed");
    const leaderboardMessage = await channel.send({ content: "Setting up leaderboard message" });
    const leaderboardInfoMessage = await channel.send({ content: "Setting up leaderboard info message" });
    this.discord.plugin.config.discord = { channelId: channel.id, leaderboardMessageId: leaderboardMessage.id, leaderboardInfoMessageId: leaderboardInfoMessage.id };
    await writeFile("data/plugins/gexpMonthlyLeaderboard/config.json", JSON.stringify(this.discord.plugin.config, null, 2), "utf-8");
    await interaction.followUp({ embeds: [new SuccessEmbed().setDescription(`Setup <#${channel.id}> to be the gexp monthly leaderboard`)] });

    const script = this.discord.application.scripts.getScript("updateGexpMonthlyLeaderboard");
    if (!script) throw new HypixelDiscordChatBridgeError("Could not find that script?");
    await interaction.followUp({ embeds: [new EmbedHelper().setDescription(`Executing \`${script.id}\` script`).setDevFooter("Amber")] });
    const duration = await script.setUser(interaction.user).runNow();
    await interaction.followUp({
      embeds: [
        new SuccessEmbed()
          .setDescription(`Finished executing \`${script.id}\` script`)
          .addFields({ name: "Duration", value: `${duration.toFixed(2)}ms (${prettyMilliseconds(duration)})` })
          .setDevFooter("Amber")
      ]
    });
  }
}

export default SetupCommand;
