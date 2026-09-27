import {
  type ChatInputCommandInteractionWithGuild,
  CommandPermission,
  DiscordCommand,
  DiscordCommandDataBuilder,
  type DiscordManagerWithPlugin,
  HypixelDiscordChatBridgeError,
  SuccessEmbed,
  getGuild
} from "hypixel-discord-chat-bridge/plugin-api";
import type LunaliaPlugin from "../../index.js";

class LoadGuildCommand extends DiscordCommand<DiscordManagerWithPlugin<LunaliaPlugin>> {
  override readonly data = new DiscordCommandDataBuilder()
    .setName("load-guild")
    .setDescription("load guild")
    .addStringOption((option) => option.setName("name").setDescription("name").setRequired(true));
  override readonly permission: CommandPermission = CommandPermission.Staff;

  override async execute(interaction: ChatInputCommandInteractionWithGuild): Promise<void> {
    const guild = await getGuild("name", interaction.options.getString("name", true));
    if (!guild) throw new HypixelDiscordChatBridgeError("Invalid guild");
    for (const member of guild.members) await this.discord.plugin.data.gexpUserManager.saveGuildMember(member);
    await interaction.followUp({ embeds: [new SuccessEmbed().setDevFooter("Kathund").setDescription(`Loaded ${guild.members.length} idiot(s) from ${guild.name}`)] });
  }
}

export default LoadGuildCommand;
