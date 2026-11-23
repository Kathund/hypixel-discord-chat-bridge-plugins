import GexpUser from "./GexpUser.ts";
import { ActionRowBuilder, type BaseMessageOptions, ButtonBuilder, ButtonStyle, ComponentType, Message } from "discord.js";
import { EmbedHelper, GenericManager, HypixelDiscordChatBridgeError, MowojangAPI, formatNumber } from "hypixel-discord-chat-bridge/plugin-api";
import { type GexpData, GexpDataSchema, type GexpUserData } from "../../../types.ts";
import { type GuildMember, removeDashesFromUUID } from "hypixel-api-reborn";
import type DataManager from "../DataManager.ts";

class GexpUserManager extends GenericManager<GexpUserData, GexpData, GexpUser, DataManager> {
  constructor(data: DataManager) {
    super(data, "data/plugins/gexpMonthlyLeaderboard/users.json", "users", [], GexpDataSchema);
  }

  override parseData(data: GexpData): GexpUser[] {
    return data.map((user) => new GexpUser(user, this));
  }

  protected override getId(data: GexpUser): string {
    return data.trackingId;
  }

  async addUser(user: GexpUser): Promise<GexpUser> {
    const users = await this.mutateData((data) => {
      if (data.some((item) => item.trackingId === user.trackingId)) {
        return data.map((item) => (item.trackingId === user.trackingId ? user.toJSON() : item));
      }
      return [...data, user.toJSON()];
    });
    return users.find((item) => item.trackingId === user.trackingId) ?? user;
  }

  async deleteUser(user: GexpUser): Promise<GexpUser[]> {
    return await this.mutateData((data) => data.filter((item) => item.trackingId !== user.trackingId));
  }

  async getUserByUUID(uuid: string): Promise<GexpUser | undefined> {
    const normalizedUUID = removeDashesFromUUID(uuid);
    const users = await this.getFullData();
    return users.find((user) => user.uuid === normalizedUUID);
  }

  async saveGuildMember(member: GuildMember): Promise<GexpUser> {
    const currentData = await this.getUserByUUID(member.uuid);
    const currentGexp = new Map((currentData?.gexp ?? []).map((entry) => [entry.day, entry]));
    for (const entry of member.expHistory) currentGexp.set(entry.day, entry);
    return await new GexpUser({ trackingId: currentData?.trackingId, uuid: member.uuid, gexp: [...currentGexp.values()] }, this).save();
  }

  async getPage(page = 0, limit = 10, month = new Date().getUTCMonth(), year = new Date().getUTCFullYear()): Promise<GexpUser[]> {
    return await this.getFullData().then((users) =>
      users
        .filter((user) => user.getTotalGexpForMonth(month, year) !== 0)
        .sort((a, b) => b.getTotalGexpForMonth(month, year) - a.getTotalGexpForMonth(month, year))
        .slice(page * limit, (page + 1) * limit)
    );
  }

  async getMaxPageNumber(limit = 10): Promise<number> {
    const month = new Date().getUTCMonth();
    const users = await this.getFullData().then((data) => data.filter((user) => user.getTotalGexpForMonth(month) !== 0));
    return Math.max(1, Math.ceil(users.length / limit));
  }

  async getPageForUser(uuid: string, limit = 10): Promise<number | null> {
    const users = await this.getFullData().then((data) =>
      data
        .filter((user) => user.getTotalGexpForMonth(new Date().getUTCMonth()) !== 0)
        .sort((a, b) => b.getTotalGexpForMonth(new Date().getUTCMonth()) - a.getTotalGexpForMonth(new Date().getUTCMonth()))
    );
    const index = users.findIndex((user) => user.uuid === removeDashesFromUUID(uuid));
    if (index === -1) return null;
    return Math.floor(index / limit);
  }

  getEmoji(position: number): string {
    if (position === 1) return "🥇";
    if (position === 2) return "🥈";
    if (position === 3) return "🥉";
    return "🌸";
  }

  async parseUser(user: GexpUser, position: number, highlightUUID?: string): Promise<string> {
    const username = (await user.getUsername()) ?? "UNKNOWN";
    const shouldHighlight = user.uuid === highlightUUID;
    const monthlyGexp = formatNumber(user.getTotalGexpForMonth(new Date().getUTCMonth()));
    return `${shouldHighlight ? "**__" : ""}${this.getEmoji(position)} • ${position}. ${username.replaceAll("_", "\\_")}: ${monthlyGexp}${shouldHighlight ? "__**" : ""}`;
  }

  async getViewMoreResponse(page = 0, userId: string | null = null): Promise<BaseMessageOptions> {
    let highlightUUID: string | undefined;
    if (userId) {
      const linked = await this.data.plugin.application.data.linked.getUserByDiscordId(userId);
      highlightUUID = linked?.uuid;
    }

    const maxPages = await this.getMaxPageNumber(10);
    const currentPage = Math.min(Math.max(page, 0), maxPages - 1);
    const users = await this.getPage(currentPage, 10);
    const parsedUsers: string[] = [];
    for (const [index, user] of users.entries()) {
      parsedUsers.push(await this.parseUser(user, index + 1 + currentPage * 10, highlightUUID));
    }

    return {
      embeds: [new EmbedHelper().setTitle("Monthly GEXP Leaderboard").setDescription(parsedUsers.join("\n") || "No users found this month.")],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel("Previous Page")
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("gexpMonthlyLeaderboardPrevious")
            .setDisabled(currentPage === 0),
          new ButtonBuilder()
            .setLabel(`${currentPage + 1} of ${maxPages} page(s)`)
            .setStyle(ButtonStyle.Secondary)
            .setCustomId(`${currentPage}`)
            .setDisabled(true),
          new ButtonBuilder()
            .setLabel("Next Page")
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("gexpMonthlyLeaderboardNext")
            .setDisabled(currentPage >= maxPages - 1)
        ),
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel("View Self")
            .setStyle(ButtonStyle.Primary)
            .setCustomId("gexpMonthlyLeaderboardSelf")
            .setDisabled(highlightUUID === undefined)
        )
      ]
    };
  }

  getPageFromMessage(message: Message): number {
    const row = message.components[0];
    if (!row || row.type !== ComponentType.ActionRow) return 0;
    const button = row.components[1];
    if (!button || button.type !== ComponentType.Button) return 0;
    const page = Number(button.customId);
    return Number.isInteger(page) && page >= 0 ? page : 0;
  }

  async getUserByUsername(username: string): Promise<GexpUser | undefined> {
    const uuid = await MowojangAPI.getUUID(username);
    if (uuid === null) throw new HypixelDiscordChatBridgeError("User doesn't exist");
    return await this.getUserByUUID(uuid);
  }
}

export default GexpUserManager;
