import { type BridgeEventMap, BridgePlugin } from "hypixel-discord-chat-bridge/plugin-api";

class AutoFriendPlugin extends BridgePlugin<AutoFriendPlugin> {
  override readonly metadata = {
    id: "autofriend",
    name: "AutoFriend",
    version: "1.0.0",
    author: "kathund",
    link: "https://github.com/Kathund/hypixel-discord-chat-bridge-plugins/tree/main/AutoFriend"
  } as const;
  #started: boolean = false;
  readonly #disposers: Array<() => void> = [];

  override registerExtensions(): Promise<void> {
    return Promise.resolve();
  }

  override start(): Promise<void> {
    if (this.#started) return Promise.resolve();
    this.#started = true;
    this.#disposers.push(this.context.events.on("minecraft-message", (event) => this.onMinecraftMessage(event)));
    this.context.logger.info("AutoFriend plugin started.");
    return Promise.resolve();
  }

  override stop(): Promise<void> {
    if (!this.#started) return Promise.resolve();
    this.#started = false;
    for (const dispose of this.#disposers.splice(0)) dispose();
    this.context.logger.info("AutoFriend plugin stopped.");
    return Promise.resolve();
  }

  private onMinecraftMessage(event: BridgeEventMap["minecraft-message"]): void {
    if (!this.application.minecraft.isBotOnline()) return;
    if (event.chatType !== "Debug") return;
    const incoming = this.isIncomingFriendRequest(event.message);
    if (incoming) {
      this.application.minecraft.bot.chat(`/friend accept ${incoming}`);
      this.context.logger.info(`Accepting friend from ${incoming}`);
    }
    const friendAccept = this.isFriendAccept(event.message);
    if (friendAccept) this.context.logger.info(`Accepted friend request from ${friendAccept}`);
  }

  private isIncomingFriendRequest(message: string): string | null {
    const regex = /Friend request from (?:\[(?<rank>[^\]]+)\] )?(?<username>.+)\n\[ACCEPT\] - \[DENY\] - \[BLOCK\].*/;
    const match = regex.exec(message);
    if (!match || !match.groups) return null;
    return match.groups.username ?? null;
  }

  private isFriendAccept(message: string): string | null {
    const regex = /You are now friends with (?:\[(?<rank>[^\]]+)\] )?(?<username>.+)/;
    const match = regex.exec(message);
    if (!match || !match.groups) return null;
    return match.groups.username ?? null;
  }
}

export default AutoFriendPlugin;
