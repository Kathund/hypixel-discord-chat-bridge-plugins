import { GenericData, HypixelDiscordChatBridgeError, MowojangAPI, getPlayer } from "hypixel-discord-chat-bridge/plugin-api";
import { type Guild, type GuildMember, type Player, removeDashesFromUUID } from "hypixel-api-reborn";
import type GexpUserManager from "./GexpUserManager.js";
import type { BasicGexpUserData, GexpUserData } from "../../../types.js";

class GexpUser extends GenericData<GexpUserData> {
  readonly trackingId: GexpUserData["trackingId"];
  readonly uuid: BasicGexpUserData["uuid"];
  readonly gexp: BasicGexpUserData["gexp"];
  constructor(
    data: BasicGexpUserData,
    private readonly manager: GexpUserManager
  ) {
    super();
    this.trackingId = data.trackingId ?? crypto.randomUUID();
    this.uuid = removeDashesFromUUID(data.uuid);
    this.gexp = Object.fromEntries(Object.entries(data.gexp).sort(([a], [b]) => Number(a) - Number(b)));
  }

  async save(): Promise<GexpUser> {
    return await this.manager.addUser(this);
  }

  async getUsername(): Promise<string | null> {
    if (!this.uuid) return null;
    const username = await MowojangAPI.getUsername(this.uuid);
    if (username === null) throw new HypixelDiscordChatBridgeError("User doesn't exist");
    return username;
  }

  async getHypixelPlayer(): Promise<Player | null> {
    if (!this.uuid) return null;
    return await getPlayer(this.uuid);
  }

  async isUserInHypixelGuild(hypixelGuild: Guild | null = null): Promise<GuildMember | undefined> {
    if (!this.uuid) return undefined;
    const guild = hypixelGuild ?? (await this.manager.data.plugin.application.getBotGuild());
    return guild.members.find((member) => member.uuid === this.uuid);
  }

  override toJSON(): GexpUserData {
    return { trackingId: this.trackingId, uuid: this.uuid, gexp: this.gexp };
  }

  get totalGexp(): number {
    return Object.values(this.gexp).reduce((sum, entry) => sum + Number(entry.exp), 0);
  }
}

export default GexpUser;
