import ms from "ms";
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, Message, type SendableChannels } from "discord.js";
import { BasicScript, type ScriptManagerWithPlugin, formatNumber, intervalSchedule } from "hypixel-discord-chat-bridge/plugin-api";
import { createCanvas, loadImage } from "canvas";
import type GexpMonthlyLeaderboardPlugin from "../../index.ts";
import type GexpUser from "../data/GexpUser/GexpUser.ts";
import type { Player } from "hypixel-api-reborn";

class UpdateGexpLeaderboardScript extends BasicScript<ScriptManagerWithPlugin<GexpMonthlyLeaderboardPlugin>> {
  constructor(scripts: ScriptManagerWithPlugin<GexpMonthlyLeaderboardPlugin>) {
    super(scripts, { id: "updateGexpMonthlyLeaderboard", enabled: true, schedule: intervalSchedule("1h") });
  }

  private parseUsername(player: Player): string {
    const rankPlusColor = player.cosmetics.rankPlusColor?.toInGameCode() ?? "§c";
    const monthlyRankColor = player.cosmetics.monthlyRankColor?.toInGameCode() ?? "§6";

    if (player.rank === "VIP") return `§a[VIP] ${player.nickname}`;
    if (player.rank === "VIP+") return `§a[VIP§6+§a] ${player.nickname}`;
    if (player.rank === "MVP") return `§b[MVP] ${player.nickname}`;
    if (player.rank === "MVP+") return `§b[MVP${rankPlusColor}+§b] ${player.nickname}`;
    if (player.rank === "MVP++") return `${monthlyRankColor}[MVP${rankPlusColor}++${monthlyRankColor}] ${player.nickname}`;
    return `§7${player.nickname}`;
  }

  private async parseUser(user: GexpUser, position: number, month: number, year: number): Promise<Buffer<ArrayBufferLike> | null> {
    const player = await user.getHypixelPlayer();
    if (!player) return null;
    return await this.scripts.application.minecraft.renderer.renderText(
      `§e${position}. {skin} ${this.parseUsername(player)}§r§f: ${formatNumber(user.getTotalGexpForMonth(month, year))}`,
      player.nickname,
      "modern"
    );
  }

  async generateLeaderboardImage(monthName: string, users: GexpUser[], month = new Date().getUTCMonth(), year = new Date().getUTCFullYear()): Promise<Buffer> {
    const playerImages: Buffer[] = [await this.scripts.application.minecraft.renderer.renderText(`§l§eMonthly §fGEXP Leaderboard for §l${monthName}`, null, "modern")];

    for (const [index, user] of users.entries()) {
      const parsed = await this.parseUser(user, index + 1, month, year);
      if (parsed) playerImages.push(parsed);
    }

    const images = await Promise.all(playerImages.map((image) => loadImage(image)));
    const width = images[0]?.width ?? 1000;
    const height = images[0]?.height ?? 50;
    const canvas = createCanvas(width, height * images.length);
    const context = canvas.getContext("2d");
    for (const [index, image] of images.entries()) context.drawImage(image, 0, index * height, width, height);
    return canvas.toBuffer("image/png");
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

  private async getChannel(): Promise<SendableChannels | null> {
    if (!this.scripts.plugin.isFullyLoaded()) return null;
    if (
      this.scripts.plugin.config.discord.channelId === null ||
      this.scripts.plugin.config.discord.leaderboardMessageId === null ||
      this.scripts.plugin.config.discord.leaderboardInfoMessageId === null
    ) {
      return null;
    }
    if (!this.scripts.application.discord.isClientOnline()) return null;
    const channel = await this.scripts.application.discord.client.channels.fetch(this.scripts.plugin.config.discord.channelId);
    if (!channel || !channel.isSendable()) return null;
    return channel;
  }

  private async getLeaderboardMessage(): Promise<Message | null> {
    if (!this.scripts.plugin.isFullyLoaded()) return null;
    if (
      this.scripts.plugin.config.discord.channelId === null ||
      this.scripts.plugin.config.discord.leaderboardMessageId === null ||
      this.scripts.plugin.config.discord.leaderboardInfoMessageId === null
    ) {
      return null;
    }
    if (!this.scripts.application.discord.isClientOnline()) return null;
    const channel = await this.getChannel();
    if (channel === null) return null;
    return await channel.messages.fetch(this.scripts.plugin.config.discord.leaderboardMessageId).catch(() => null);
  }

  private async getLeaderboardInfoMessage(): Promise<Message | null> {
    if (!this.scripts.plugin.isFullyLoaded()) return null;
    if (
      this.scripts.plugin.config.discord.channelId === null ||
      this.scripts.plugin.config.discord.leaderboardMessageId === null ||
      this.scripts.plugin.config.discord.leaderboardInfoMessageId === null
    ) {
      return null;
    }
    if (!this.scripts.application.discord.isClientOnline()) return null;
    const channel = await this.getChannel();
    if (channel === null) return null;
    return await channel.messages.fetch(this.scripts.plugin.config.discord.leaderboardInfoMessageId).catch(() => null);
  }

  override async execute(): Promise<void> {
    if (!this.scripts.application.discord.isClientOnline()) return;
    await this.syncGuildData();

    const leaderboardMessage = await this.getLeaderboardMessage();
    if (!leaderboardMessage) return;
    const leaderboardInfoMessage = await this.getLeaderboardInfoMessage();
    if (!leaderboardInfoMessage) return;

    const unix = Math.floor(Date.now() / 1000);
    const nextUnix = unix + Math.floor(ms("1h") / 1000);
    const users = await this.scripts.plugin.data.gexpUserManager.getPage();
    if (users.length === 0) {
      await leaderboardMessage.edit({ content: "No users found", files: [], components: [] });
      await leaderboardInfoMessage.edit({
        content: `**Last Updated:** <t:${unix}:F> (<t:${unix}:R>)\n**Next Update:** <t:${nextUnix}:F> (<t:${nextUnix}:R>)`,
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setLabel("Go To Top").setStyle(ButtonStyle.Link).setURL(leaderboardMessage.url))
        ]
      });
      return;
    }

    const image = await this.generateLeaderboardImage(this.scripts.plugin.getMonthName(), users);
    await leaderboardMessage.edit({ content: null, files: [new AttachmentBuilder(image, { name: "leaderboard.png" })], components: [] });
    await leaderboardInfoMessage.edit({
      content: `**Last Updated:** <t:${unix}:F> (<t:${unix}:R>)\n**Next Update:** <t:${nextUnix}:F> (<t:${nextUnix}:R>)`,
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setLabel("View More").setStyle(ButtonStyle.Secondary).setCustomId("gexpMonthlyLeaderboardViewMore")
        )
      ]
    });
  }
}

export default UpdateGexpLeaderboardScript;
