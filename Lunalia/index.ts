import { Application, BridgePlugin, type BridgePluginContext, safeListener, toError } from "hypixel-discord-chat-bridge/plugin-api";
import { Events, GuildMember, type PartialGuildMember } from "discord.js";

class LunaliaPlugin extends BridgePlugin<LunaliaPlugin> {
  override readonly metadata = {
    name: "Lunalia",
    description: "Plugin for the Lunalia Guild",
    version: "1.0.0",
    author: "Amber",
    link: "https://github.com/Kathund/hypixel-discord-chat-bridge-plugins/tree/main/Lunalia"
  } as const;
  #started = false;
  private enabled: boolean = false;
  constructor(context: BridgePluginContext<LunaliaPlugin>, application: Application) {
    super(context, application);
    this.enabled = this.application.config.discord.serverId === "1456428206230999075";
  }

  override registerExtensions(): Promise<void> {
    if (!this.enabled) return Promise.resolve();
    return Promise.resolve();
  }

  override start(): Promise<void> {
    if (!this.enabled) return Promise.resolve();
    if (this.#started) return Promise.resolve();
    this.#started = true;
    this.context.logger.info(`${this.metadata.name} plugin started.`);
    if (this.application.discord.hasClient()) {
      this.application.discord.client.on(
        Events.GuildMemberAdd,
        safeListener((member) => this.onGuildMemberAdd(member), this.reportError)
      );
    }
    return Promise.resolve();
  }

  override stop(): Promise<void> {
    if (!this.enabled) return Promise.resolve();
    if (!this.#started) return Promise.resolve();
    this.#started = false;
    this.context.logger.info(`${this.metadata.name} plugin stopped.`);
    return Promise.resolve();
  }

  private async onGuildMemberAdd(member: GuildMember | PartialGuildMember) {
    if (!this.application.config.blacklist.enabled) return;
    const blacklistUser = await this.application.data.blacklist.getUserByDiscordId(member.user.id);
    if (blacklistUser === undefined) return;
    await member.roles.add("1536394089988100106");
  }

  private readonly reportError = (error: unknown): Promise<void> => this.application.discord.handleError(toError(error));
}

export default LunaliaPlugin;
