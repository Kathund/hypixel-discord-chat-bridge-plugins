import ms from "ms";
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, Message } from "discord.js";
import { BasicScript, type ScriptManagerWithPlugin, intervalSchedule } from "hypixel-discord-chat-bridge/plugin-api";
import { type GexpLeaderboardPeriod, getLeaderboardButtonId } from "../types/leaderboard.ts";
import { generateLeaderboardImage, getLeaderboardTitle } from "../utils/LeaderboardUtils.ts";
import type GexpLeaderboardPlugin from "../../index.ts";
import type GexpUser from "../data/GexpUser/GexpUser.ts";

class UpdateGexpLeaderboardScript extends BasicScript<ScriptManagerWithPlugin<GexpLeaderboardPlugin>> {
  constructor(scripts: ScriptManagerWithPlugin<GexpLeaderboardPlugin>) {
    super(scripts, { id: "updateGexpLeaderboard", enabled: true, schedule: intervalSchedule("1h") });
  }

  private async syncGuildData(): Promise<void> {
    const guild = await this.scripts.application.getBotGuild();
    for (const member of guild.members) {
      const linked = await this.scripts.application.data.linked.getUserByUUID(member.uuid);
      if (linked) await this.scripts.plugin.data.gexpUserManager.saveGuildMember(member);
    }

    const guildMemberUUIDs = new Set(guild.members.map((member) => member.uuid));
    const users = await this.scripts.plugin.data.gexpUserManager.getFullData();
    for (const user of users) {
      if (!guildMemberUUIDs.has(user.uuid)) await this.scripts.plugin.data.gexpUserManager.deleteUser(user);
    }
  }

  private async getBoard(period: GexpLeaderboardPeriod): Promise<{ leaderboardMessage: Message; infoMessage: Message } | null> {
    if (!this.scripts.plugin.isFullyLoaded()) return null;
    const config = this.scripts.plugin.config.discord[period];
    if (config.channelId === null || config.leaderboardMessageId === null || config.leaderboardInfoMessageId === null) return null;
    if (!this.scripts.application.discord.isClientOnline()) return null;
    const channel = await this.scripts.application.discord.client.channels.fetch(config.channelId);
    if (!channel || !channel.isSendable()) return null;
    const [leaderboardMessage, infoMessage] = await Promise.all([
      channel.messages.fetch(config.leaderboardMessageId).catch(() => null),
      channel.messages.fetch(config.leaderboardInfoMessageId).catch(() => null)
    ]);
    if (!leaderboardMessage || !infoMessage) return null;
    return { leaderboardMessage, infoMessage };
  }

  override async execute(): Promise<void> {
    if (!this.scripts.application.discord.isClientOnline()) return;
    await this.syncGuildData();

    await this.updateLeaderboard("monthly");
    await this.updateLeaderboard("yearly");
  }

  private async updateLeaderboard(period: GexpLeaderboardPeriod): Promise<void> {
    const board = await this.getBoard(period);
    if (!board) return;

    const unix = Math.floor(Date.now() / 1000);
    const nextUnix = unix + Math.floor(ms("1h") / 1000);
    const year = new Date().getUTCFullYear();
    const month = new Date().getUTCMonth();
    const users = await this.scripts.plugin.data.gexpUserManager.getLeaderboardPage(period, 0, 10, year, month);
    if (users.length === 0) {
      await board.leaderboardMessage.edit({ content: "No users found", files: [], components: [] });
      await board.infoMessage.edit({
        content: `**Last Updated:** <t:${unix}:F> (<t:${unix}:R>)\n**Next Update:** <t:${nextUnix}:F> (<t:${nextUnix}:R>)`,
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setLabel("Go To Top").setStyle(ButtonStyle.Link).setURL(board.leaderboardMessage.url))
        ]
      });
      return;
    }

    const title = getLeaderboardTitle(period, year, this.scripts.plugin.getMonthName(month));
    const image = await generateLeaderboardImage(
      title,
      users,
      (user: GexpUser) => (period === "monthly" ? user.getTotalGexpForMonth(month, year) : user.getTotalGexpForYear(year)),
      (text, username) => this.scripts.application.minecraft.renderer.renderText(text, username, "modern")
    );
    await board.leaderboardMessage.edit({ content: null, files: [new AttachmentBuilder(image, { name: "leaderboard.png" })], components: [] });
    await board.infoMessage.edit({
      content: `**Last Updated:** <t:${unix}:F> (<t:${unix}:R>)\n**Next Update:** <t:${nextUnix}:F> (<t:${nextUnix}:R>)`,
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setLabel("View More").setStyle(ButtonStyle.Secondary).setCustomId(getLeaderboardButtonId(period, "ViewMore"))
        )
      ]
    });
  }
}

export default UpdateGexpLeaderboardScript;
