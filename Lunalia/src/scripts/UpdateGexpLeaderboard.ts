import ms from "ms";
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { BasicScript, type ScriptManagerWithPlugin, formatNumber, intervalSchedule, messageToImage } from "hypixel-discord-chat-bridge/plugin-api";
import { createCanvas, loadImage } from "canvas";
import type GexpUser from "../data/GexpUser/GexpUser.ts";
import type LunaliaPlugin from "../../index.js";
import type { Player } from "hypixel-api-reborn";

class UpdateGexpLeaderboardScript extends BasicScript<ScriptManagerWithPlugin<LunaliaPlugin>> {
  private channel: string = "1550039991327916114";
  private leaderboardMessage: string = "1550040037507338322";
  private leaderboardInfoMessage: string = "1550040039528865803";
  constructor(scripts: ScriptManagerWithPlugin<LunaliaPlugin>) {
    super(scripts, { id: "updateGexpLeaderboard", enabled: true, schedule: intervalSchedule("1h") });
  }

  private parseUsername(player: Player): string {
    const rankPlusColor = player.cosmetics.rankPlusColor?.toInGameCode() ?? "§c";
    const monthlyRankColor = player.cosmetics.monthlyRankColor?.toInGameCode() ?? "§6";

    if (player.rank === "VIP") {
      return `§a[VIP] ${player.nickname}`;
    } else if (player.rank === "VIP+") {
      return `§a[VIP§6+§a] ${player.nickname}`;
    } else if (player.rank === "MVP") {
      return `§b[MVP] ${player.nickname}`;
    } else if (player.rank === "MVP+") {
      return `§b[MVP${rankPlusColor}+§b] ${player.nickname}`;
    } else if (player.rank === "MVP++") {
      return `${monthlyRankColor}[MVP${rankPlusColor}++${monthlyRankColor}] ${player.nickname}`;
    }

    return `§7${player.nickname}`;
  }

  private async parseUser(user: GexpUser, pos: number): Promise<Buffer<ArrayBufferLike> | null> {
    const player = await user.getHypixelPlayer();
    if (!player) return null;
    return await messageToImage(`§e${pos}. {skin} ${this.parseUsername(player)}§r§f: ${formatNumber(user.totalGexp)}`, player.nickname);
  }

  override async execute() {
    if (!this.scripts.application.discord.isClientOnline()) return;
    const channel = await this.scripts.application.discord.client.channels.fetch(this.channel);
    if (!channel || !channel.isSendable()) return;

    const leaderboardMessage = await channel.messages.fetch(this.leaderboardMessage).catch(() => null);
    const leaderboardInfoMessage = await channel.messages.fetch(this.leaderboardInfoMessage).catch(() => null);
    if (!leaderboardMessage || !leaderboardInfoMessage) return;
    const unix = Math.floor(Date.now() / 1000);
    const nextUnix = unix + Math.floor(ms("1h") / 1000);

    const users = await this.scripts.plugin.data.gexpUserManager.getFullData().then((users) =>
      users
        .filter((user) => user.totalGexp !== 0)
        .sort((a, b) => b.totalGexp - a.totalGexp)
        .slice(0, 100)
    );

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

    const playerImages: Buffer[] = [];

    for (const user of users) {
      const parsed = await this.parseUser(user, users.indexOf(user) + 1);
      if (parsed) playerImages.push(parsed);
    }

    const files: AttachmentBuilder[] = [];

    for (let page = 0; page < playerImages.length; page += 10) {
      const pageImages = playerImages.slice(page, page + 10);
      const pageImage = pageImages[0];
      if (!pageImage) continue;
      const firstImage = await loadImage(pageImage);
      const width = firstImage.width;
      const height = firstImage.height;

      const canvas = createCanvas(width, height * pageImages.length);
      const ctx = canvas.getContext("2d");
      for (let i = 0; i < pageImages.length; i++) {
        const imagePage = pageImages[i];
        if (!imagePage) continue;
        const image = await loadImage(imagePage);
        ctx.drawImage(image, 0, i * height, width, height);
      }
      files.push(new AttachmentBuilder(canvas.toBuffer("image/png"), { name: `leaderboard_${Math.floor(page / 10) + 1}.png` }));
    }

    await leaderboardMessage.edit({ content: null, files, components: [] });
    await leaderboardInfoMessage.edit({
      content: `**Last Updated:** <t:${unix}:F> (<t:${unix}:R>)\n**Next Update:** <t:${nextUnix}:F> (<t:${nextUnix}:R>)`,
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setLabel("Go To Top").setStyle(ButtonStyle.Link).setURL(leaderboardMessage.url))
      ]
    });
  }
}

export default UpdateGexpLeaderboardScript;
