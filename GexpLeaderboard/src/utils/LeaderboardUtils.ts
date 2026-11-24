import { createCanvas, loadImage } from "canvas";
import { formatNumber } from "hypixel-discord-chat-bridge/plugin-api";
import type GexpUser from "../data/GexpUser/GexpUser.ts";
import type { GexpLeaderboardPeriod } from "../types/leaderboard.ts";
import type { Player } from "hypixel-api-reborn";

function parseUsername(player: Player): string {
  const rankPlusColor = player.cosmetics.rankPlusColor?.toInGameCode() ?? "§c";
  const monthlyRankColor = player.cosmetics.monthlyRankColor?.toInGameCode() ?? "§6";

  if (player.rank === "VIP") return `§a[VIP] ${player.nickname}`;
  if (player.rank === "VIP+") return `§a[VIP§6+§a] ${player.nickname}`;
  if (player.rank === "MVP") return `§b[MVP] ${player.nickname}`;
  if (player.rank === "MVP+") return `§b[MVP${rankPlusColor}+§b] ${player.nickname}`;
  if (player.rank === "MVP++") return `${monthlyRankColor}[MVP${rankPlusColor}++${monthlyRankColor}] ${player.nickname}`;
  return `§7${player.nickname}`;
}

export async function generateLeaderboardImage(
  title: string,
  users: GexpUser[],
  getTotalGexp: (user: GexpUser) => number,
  renderText: (text: string, username: string | null) => Promise<Buffer<ArrayBufferLike>>
): Promise<Buffer> {
  const playerImages: Buffer<ArrayBufferLike>[] = [await renderText(title, null)];

  for (const [index, user] of users.entries()) {
    const player = await user.getHypixelPlayer();
    if (!player) continue;

    playerImages.push(await renderText(`§e${index + 1}. {skin} ${parseUsername(player)}§r§f: ${formatNumber(getTotalGexp(user))}`, player.nickname));
  }

  const images = await Promise.all(playerImages.map((image) => loadImage(image)));
  const width = images[0]?.width ?? 1000;
  const height = images[0]?.height ?? 50;
  const canvas = createCanvas(width, height * images.length);
  const context = canvas.getContext("2d");
  for (const [index, image] of images.entries()) context.drawImage(image, 0, index * height, width, height);
  return canvas.toBuffer("image/png");
}

export function getLeaderboardTitle(period: GexpLeaderboardPeriod, year: number, monthName?: string): string {
  return period === "monthly" ? `§l§eMonthly §fGEXP Leaderboard for §l${monthName ?? ""}` : `§l§eYearly §fGEXP Leaderboard for §l${year}`;
}
