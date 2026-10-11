import {
  type ButtonInteractionWithGuild,
  ButtonResponse,
  DiscordButton,
  DiscordButtonData,
  type DiscordManagerWithPlugin,
  EmbedHelper
} from "hypixel-discord-chat-bridge/plugin-api";
import type BotStatusPlugin from "../../index.ts";

class RestartApplicationButton extends DiscordButton<DiscordManagerWithPlugin<BotStatusPlugin>> {
  override readonly data = new DiscordButtonData("botStatusRestartApplication");
  override readonly response = ButtonResponse.Ephemeral;

  override async execute(interaction: ButtonInteractionWithGuild): Promise<void> {
    await interaction.followUp({
      embeds: [new EmbedHelper().setAuthor({ name: "Restarting..." }).setDescription("The bot is restarting. This might take few seconds.").setDevFooter("GeorgeFilos")]
    });
    await this.discord.application.stop();
    await this.discord.application.start();
    console.discord(`The application restart requested by ${interaction.user.username} completed successfully.`);
  }
}

export default RestartApplicationButton;
