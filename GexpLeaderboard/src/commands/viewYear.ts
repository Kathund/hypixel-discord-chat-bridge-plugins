import { AttachmentBuilder } from "discord.js";
import {
  type ChatInputCommandInteractionWithGuild,
  CommandPermission,
  DiscordCommand,
  DiscordCommandDataBuilder,
  type DiscordManagerWithPlugin,
  HypixelDiscordChatBridgeError
} from "hypixel-discord-chat-bridge/plugin-api";
import { generateLeaderboardImage, getLeaderboardTitle } from "../utils/LeaderboardUtils.ts";
import type GexpLeaderboardPlugin from "../../index.ts";

class ViewYearCommand extends DiscordCommand<DiscordManagerWithPlugin<GexpLeaderboardPlugin>> {
  override readonly data = new DiscordCommandDataBuilder()
    .setName("gexp-year")
    .setDescription("View the guild GEXP leaderboard for a year")
    .addIntegerOption((option) => option.setName("year").setDescription("The year to view (defaults to this year)").setRequired(false));

  override readonly permission: CommandPermission = CommandPermission.Staff;

  override async execute(interaction: ChatInputCommandInteractionWithGuild): Promise<void> {
    const year = interaction.options.getInteger("year") ?? new Date().getUTCFullYear();
    if (year < 0 || year > new Date().getUTCFullYear()) {
      throw new HypixelDiscordChatBridgeError("Year must be a non-negative year no later than the current year");
    }

    const users = await this.discord.plugin.data.gexpUserManager.getLeaderboardPage("yearly", 0, 10, year);
    if (users.length === 0) throw new HypixelDiscordChatBridgeError(`No users found for ${year}`);

    const image = await generateLeaderboardImage(
      getLeaderboardTitle("yearly", year),
      users,
      (user) => user.getTotalGexpForYear(year),
      (text, username) => this.discord.application.minecraft.renderer.renderText(text, username, "modern")
    );
    await interaction.followUp({ files: [new AttachmentBuilder(image, { name: "leaderboard.png" })] });
  }
}

export default ViewYearCommand;
