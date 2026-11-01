import { AttachmentBuilder } from "discord.js";
import {
  type ChatInputCommandInteractionWithGuild,
  CommandPermission,
  DiscordCommand,
  DiscordCommandDataBuilder,
  type DiscordManagerWithPlugin,
  HypixelDiscordChatBridgeError
} from "hypixel-discord-chat-bridge/plugin-api";
import type LunaliaPlugin from "../../index.ts";
import type UpdateGexpLeaderboardScript from "../scripts/UpdateGexpLeaderboard.ts";

class ViewMonthCommand extends DiscordCommand<DiscordManagerWithPlugin<LunaliaPlugin>> {
  override readonly data = new DiscordCommandDataBuilder()
    .setName("view-month")
    .setDescription("view month")
    .addStringOption((option) =>
      option
        .setName("month")
        .setDescription("the month")
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
    const script = this.discord.application.scripts.getScript("updateGexpLeaderboard") as UpdateGexpLeaderboardScript | undefined;
    if (!script) throw new HypixelDiscordChatBridgeError("Could not fine the updateGexpLeaderboard script");
    const month = Number(interaction.options.getString("month", true));
    const users = await this.discord.plugin.data.gexpUserManager.getPage(0, 10, month);
    if (users.length === 0) throw new HypixelDiscordChatBridgeError("No user's found");
    const leaderboardImage = await script.generateLeaderboardImage(this.discord.plugin.getMonthName(month), users, month, new Date().getUTCFullYear());
    await interaction.followUp({ files: [new AttachmentBuilder(leaderboardImage, { name: "leaderboard.png" })] });
  }
}

export default ViewMonthCommand;
