import { AttachmentBuilder } from "discord.js";
import {
  type ChatInputCommandInteractionWithGuild,
  CommandPermission,
  DiscordCommand,
  DiscordCommandDataBuilder,
  type DiscordManagerWithPlugin,
  HypixelDiscordChatBridgeError
} from "hypixel-discord-chat-bridge/plugin-api";
import type GexpMonthlyLeaderboardPlugin from "../../index.ts";
import type UpdateGexpLeaderboardScript from "../scripts/UpdateGexpLeaderboard.ts";

class ViewMonthCommand extends DiscordCommand<DiscordManagerWithPlugin<GexpMonthlyLeaderboardPlugin>> {
  override readonly data = new DiscordCommandDataBuilder()
    .setName("gexp-month")
    .setDescription("View the guild GEXP leaderboard for a month")
    .addStringOption((option) =>
      option
        .setName("month")
        .setDescription("The month to view")
        .setRequired(true)
        .addChoices(
          { name: "January", value: "0" },
          { name: "February", value: "1" },
          { name: "March", value: "2" },
          { name: "April", value: "3" },
          { name: "May", value: "4" },
          { name: "June", value: "5" },
          { name: "July", value: "6" },
          { name: "August", value: "7" },
          { name: "September", value: "8" },
          { name: "October", value: "9" },
          { name: "November", value: "10" },
          { name: "December", value: "11" }
        )
    );

  override readonly permission: CommandPermission = CommandPermission.Staff;

  override async execute(interaction: ChatInputCommandInteractionWithGuild): Promise<void> {
    const script = this.discord.application.scripts.getScript("updateGexpMonthlyLeaderboard") as UpdateGexpLeaderboardScript | undefined;
    if (!script) throw new HypixelDiscordChatBridgeError("Could not find the monthly GEXP leaderboard script");

    const month = Number(interaction.options.getString("month", true));
    const users = await this.discord.plugin.data.gexpUserManager.getPage(0, 10, month, new Date().getUTCFullYear());
    if (users.length === 0) throw new HypixelDiscordChatBridgeError("No users found for that month");

    const image = await script.generateLeaderboardImage(this.discord.plugin.getMonthName(month), users, month, new Date().getUTCFullYear());
    await interaction.followUp({ files: [new AttachmentBuilder(image, { name: "leaderboard.png" })] });
  }
}

export default ViewMonthCommand;
