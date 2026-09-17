import GexpUser from "./GexpUser.js";
import { type BasicGexpUserData, type GexpData, GexpDataSchema, type GexpUserData } from "../../../types.ts";
import { GenericManager, HypixelDiscordChatBridgeError, MowojangAPI } from "hypixel-discord-chat-bridge/plugin-api";
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
}

export default GexpUserManager;
