import {
  BasicScript,
  type ChannelVariableStats,
  HypixelDiscordChatBridgeError,
  type ScriptManagerWithPlugin,
  formatNumber,
  intervalSchedule,
  replaceVariables
} from "hypixel-discord-chat-bridge/plugin-api";
import type LunaliaPlugin from "../../index.js";
import type { GuildMember } from "hypixel-api-reborn";

interface StatsWithMembers {
  stats: ChannelVariableStats;
  members: GuildMember[];
}

class UpdateStatChannelsScriptNew extends BasicScript<ScriptManagerWithPlugin<LunaliaPlugin>> {
  constructor(scripts: ScriptManagerWithPlugin<LunaliaPlugin>) {
    super(scripts, { id: "updateStatChannelsNew", enabled: true, schedule: intervalSchedule(scripts.application.config.statsChannels.autoUpdater.interval) });
  }

  async getStats(): Promise<StatsWithMembers> {
    if (!this.scripts.application.discord.isGuildReady()) {
      await this.scripts.application.discord.loadGuild();
      throw new HypixelDiscordChatBridgeError("The discord server isn't ready. Please try again later");
    }

    const [hypixelGuild, channels, roles] = await Promise.all([
      this.scripts.application.discord.application.getBotGuild(),
      this.scripts.application.discord.guild.channels.fetch(),
      this.scripts.application.discord.guild.roles.fetch()
    ]);

    return {
      stats: {
        guildName: hypixelGuild.name,
        guildLevel: Number(Math.floor(hypixelGuild.level).toFixed(0)),
        guildLevelWithProgress: hypixelGuild.level,
        guildXP: hypixelGuild.experience,
        formattedGuildXP: formatNumber(hypixelGuild.experience),
        guildWeeklyXP: hypixelGuild.totalWeeklyGEXP,
        formattedGuildWeeklyXP: formatNumber(hypixelGuild.totalWeeklyGEXP),
        guildMembers: hypixelGuild.members.length,
        discordMembers: this.scripts.application.discord.guild.memberCount,
        formattedDiscordMembers: formatNumber(this.scripts.application.discord.guild.memberCount),
        discordChannels: channels.size,
        discordRoles: roles.size
      },
      members: hypixelGuild.members
    };
  }

  override async execute() {
    if (!this.scripts.application.discord.isGuildReady()) {
      await this.scripts.application.discord.loadGuild();
      throw new HypixelDiscordChatBridgeError("The discord server isn't ready. Please try again later");
    }
    const stats = await this.getStats();
    for (const channelInfo of this.scripts.application.discord.application.config.statsChannels.channels) {
      const channel = await this.scripts.application.discord.guild.channels.fetch(channelInfo.id);
      await channel?.setName(replaceVariables(channelInfo.name, stats.stats), "Updated Channels");
    }

    for (const member of stats.members) {
      const linked = await this.scripts.application.data.linked.getUserByUUID(member.uuid).catch(() => undefined);
      if (!linked) continue;
      await this.scripts.plugin.data.gexpUserManager.saveGuildMember(member);
    }
  }
}

export default UpdateStatChannelsScriptNew;
