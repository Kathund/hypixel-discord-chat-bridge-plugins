import { type AnyThreadChannel, GuildMember, type PartialGuildMember } from "discord.js";
import type LunaliaPlugin from "../index.ts";

class EventHandler {
  constructor(private readonly plugin: LunaliaPlugin) {}

  async onThreadCreate(thread: AnyThreadChannel) {
    if (!this.plugin.isCorrectGuild(thread.guild)) return;
    if (!thread.parent) return;
    if (thread.parent.id !== "1575127517277454341") return;
    const starterMessage = await thread.fetchStarterMessage();
    if (!starterMessage) return;
    await starterMessage.react("❤️");
    await starterMessage.react("👎");
  }

  async onGuildMemberAdd(member: GuildMember | PartialGuildMember) {
    if (!this.plugin.application.config.blacklist.enabled) return;
    const blacklistUser = await this.plugin.application.data.blacklist.getUserByDiscordId(member.user.id);
    if (blacklistUser === undefined) return;
    await member.roles.add("1536394089988100106");
  }
}

export default EventHandler;
