import GexpUser from "./GexpUser.js";
import { ActionRowBuilder, type BaseMessageOptions, ButtonBuilder, ButtonStyle, ComponentType, Message } from "discord.js";
import { type BasicGexpUserData, type GexpData, GexpDataSchema, type GexpUserData } from "../../../types.ts";
import { EmbedHelper, GenericManager, HypixelDiscordChatBridgeError, MowojangAPI, formatNumber } from "hypixel-discord-chat-bridge/plugin-api";
import { GuildMember, removeDashesFromUUID } from "hypixel-api-reborn";
import type DataManager from "../DataManager.js";

class GexpUserManager extends GenericManager<GexpUserData, GexpData, GexpUser, DataManager> {
  constructor(data: DataManager) {
    super(data, "data/plugins/lunaliaUtils/users.json", "users", [], GexpDataSchema);
  }

  override parseData(data: GexpData): GexpUser[] {
    return data.map((user) => new GexpUser(user, this));
  }

  protected override getId(data: GexpUser): string {
    return data.trackingId;
  }

  async writeUsersParsed(users: GexpUser[]): Promise<GexpUser[]> {
    return await this.writeData(users.map((user) => user.toJSON()));
  }

  async addUser(user: GexpUser): Promise<GexpUser> {
    const users = await this.mutateData((data) => {
      return data.some((item) => item.trackingId === user.trackingId)
        ? data.map((item) => (item.trackingId === user.trackingId ? user.toJSON() : item))
        : [...data, user.toJSON()];
    });

    return users.find((item) => item.trackingId === user.trackingId) ?? user;
  }

  async deleteUser(user: GexpUser): Promise<GexpUser[]> {
    return await this.mutateData((data) => data.filter((item) => item.trackingId !== user.trackingId));
  }

  async getUserByUsername(username: string): Promise<GexpUser | undefined> {
    let UUID = await MowojangAPI.getUUID(username);
    if (UUID === null) throw new HypixelDiscordChatBridgeError("User doesn't exist");
    UUID = removeDashesFromUUID(UUID);
    return this.getUserByUUID(UUID);
  }

  async getUserByUUID(UUID: string): Promise<GexpUser | undefined> {
    UUID = removeDashesFromUUID(UUID);
    const users = await this.getFullData();
    return users.find((user) => user.uuid === UUID);
  }

  async getUserByBlacklistID(ID: string): Promise<GexpUser | undefined> {
    const users = await this.getFullData();
    return users.find((user) => user.trackingId === ID);
  }

  async saveGuildMember(member: GuildMember): Promise<GexpUser> {
    const gexp: BasicGexpUserData["gexp"] = {};

    const currentData = await this.getUserByUUID(member.uuid);
    if (currentData) Object.entries(currentData.gexp).forEach(([key, value]) => (gexp[key] = value));
    member.expHistory
      .filter(({ date }) => date !== undefined)
      .forEach(
        ({ day, exp, date }) => (gexp[Math.floor((date?.getTime() ?? 0) / 1000)?.toString() || "UNKNOWN"] = { day, exp, unix: Math.floor((date?.getTime() ?? 0) / 1000) })
      );

    return await new GexpUser({ trackingId: currentData?.trackingId, uuid: member.uuid, gexp }, this).save();
  }

  async getPage(page: number = 0, limit: number = 10): Promise<GexpUser[]> {
    return await this.getFullData().then((users) =>
      users
        .filter((user) => user.totalGexp !== 0)
        .sort((a, b) => b.totalGexp - a.totalGexp)
        .slice(page * limit, (page + 1) * limit)
    );
  }

  async getMaxPageNumber(limit: number = 10): Promise<number> {
    const users = await this.getFullData().then((users) => users.filter((user) => user.totalGexp !== 0));
    return Math.max(1, Math.ceil(users.length / limit));
  }

  async getPageForUser(uuid: string, limit: number = 10): Promise<number | null> {
    const users = await this.getFullData().then((users) => users.filter((user) => user.totalGexp !== 0).sort((a, b) => b.totalGexp - a.totalGexp));
    const index = users.findIndex((user) => user.uuid === uuid);
    if (index === -1) return null;
    return Math.floor(index / limit);
  }

  getEmoji(pos: number): string {
    if (pos === 1) return "🥇";
    else if (pos === 2) return "🥈";
    else if (pos === 3) return "🥉";
    return "🌸";
  }

  async parseUser(user: GexpUser, pos: number, highlightUUID: string | undefined = undefined): Promise<string> {
    const username = (await user.getUsername()) ?? "UNKNOWN";
    const shouldHighlight = user.uuid === highlightUUID;
    return `${shouldHighlight ? "**__" : ""}${this.getEmoji(pos)} • ${pos}. ${username.replaceAll("_", "\\_")}: ${formatNumber(user.totalGexp)}${shouldHighlight ? "__**" : ""}`;
  }

  async getViewMoreResponse(page: number = 0, userId: string | null = null): Promise<BaseMessageOptions> {
    let highlightUUID: string | undefined;
    if (userId) {
      const linked = await this.data.plugin.application.data.linked.getUserByDiscordId(userId);
      highlightUUID = linked?.uuid;
    }

    const maxPages = await this.getMaxPageNumber(10);
    const users = await this.getPage(page, 10);
    const parsedUsers: string[] = [];
    for (const user of users) parsedUsers.push(await this.parseUser(user, users.indexOf(user) + 1 + page * 10, highlightUUID));
    return {
      embeds: [new EmbedHelper().setTitle("Gexp Leaderboard").setDescription(parsedUsers.join("\n")).setDevFooter("Kathund")],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel("Previous Page")
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("viewMoreGexpLeaderboardPrevious")
            .setDisabled(page === 0),
          new ButtonBuilder()
            .setLabel(`${page + 1} of ${maxPages} page(s)`)
            .setStyle(ButtonStyle.Secondary)
            .setCustomId(`${page}`)
            .setDisabled(true),
          new ButtonBuilder()
            .setLabel("Next Page")
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("viewMoreGexpLeaderboardNext")
            .setDisabled(page === maxPages)
        ),
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel("View Self")
            .setStyle(ButtonStyle.Primary)
            .setCustomId("viewMoreGexpLeaderboardSelf")
            .setDisabled(highlightUUID === undefined)
        )
      ]
    };
  }

  getPageFromMessage(message: Message): number {
    const component = message.components[0];
    if (!component || component.type !== ComponentType.ActionRow) return 0;
    const button = component.components[1];
    if (!button || button.type !== ComponentType.Button) return 0;
    return Number(button.customId);
  }
}

export default GexpUserManager;
