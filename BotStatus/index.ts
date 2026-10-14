import ConfigManager from "./src/ConfigManager.ts";
import DebugCommand from "./src/commands/debug.ts";
import DebugInfoViewPlugin from "./src/stringSelectMenus/debugInfoViewPlugin.ts";
import DebugInfoViewPluginOverview from "./src/stringSelectMenus/debugInfoViewPluginOverview.ts";
import RefreshDataButton from "./src/buttons/RefreshDataButton.ts";
import RestartApplicationButton from "./src/buttons/RestartApplicationButton.ts";
import UpdateBotStatusMessageScript from "./src/scripts/UpdateBotStatusMessageScript.ts";
import { ActionRowBuilder, type BaseMessageOptions, ButtonBuilder, ButtonStyle, Message, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import {
  Application,
  BridgePlugin,
  type BridgePluginContext,
  type BridgePluginMetadata,
  EmbedHelper,
  HypixelDiscordChatBridgeError,
  toCamelCase
} from "hypixel-discord-chat-bridge/plugin-api";
import { access, writeFile } from "node:fs/promises";
import type { BotStatusConfig } from "./src/types/config.ts";
import type { BotStatusPluginWithData, BridgePluginMetadataWithId } from "./src/types/misc.ts";

class BotStatusPlugin extends BridgePlugin<BotStatusPlugin> {
  override readonly metadata = {
    name: "Bot Status",
    description: "Puts a little status embed in the logs channel with some actions",
    version: "1.1.0",
    author: "Amber",
    link: "https://github.com/Kathund/hypixel-discord-chat-bridge-plugins/tree/main/BotStatus"
  } as const;
  #started: boolean = false;
  private enabled: boolean = false;
  config?: BotStatusConfig;
  constructor(context: BridgePluginContext<BotStatusPlugin>, application: Application) {
    super(context, application);
    this.enabled = this.application.config.bridge.channels.logging.enabled && this.application.config.bridge.channels.logging.channel !== null;
  }

  override registerExtensions(): Promise<void> {
    if (!this.enabled) return Promise.resolve();
    this.context.registerButton((discord) => new RefreshDataButton(discord));
    this.context.registerDiscordCommand((discord) => new DebugCommand(discord));
    this.context.registerButton((discord) => new RestartApplicationButton(discord));
    this.context.registerScript((scripts) => new UpdateBotStatusMessageScript(scripts));
    this.context.registerStringSelectMenu((discord) => new DebugInfoViewPlugin(discord));
    this.context.registerStringSelectMenu((discord) => new DebugInfoViewPluginOverview(discord));
    return Promise.resolve();
  }

  override async start(): Promise<void> {
    if (!this.enabled) return Promise.resolve();
    if (this.#started) return Promise.resolve();
    const configLoad = await this.loadData();
    if (!configLoad) return Promise.resolve();
    this.#started = true;
    this.context.logger.info(`${this.metadata.name} plugin started.`);
    return Promise.resolve();
  }

  private async loadData(): Promise<boolean> {
    const configManager = new ConfigManager();
    try {
      await access("data/plugins/botStatus/config.json");
    } catch {
      await writeFile("data/plugins/botStatus/config.json", JSON.stringify({ configVersion: 1, discord: { messageId: null } }, null, 2), "utf-8");
    }

    this.config = await configManager.init();
    return true;
  }

  override stop(): Promise<void> {
    if (!this.enabled) return Promise.resolve();
    if (!this.#started) return Promise.resolve();
    this.#started = false;
    this.context.logger.info(`${this.metadata.name} plugin stopped.`);
    return Promise.resolve();
  }

  async getMessage(): Promise<Message | null> {
    if (!this.isFullyLoaded()) return null;
    if (!this.application.discord.isClientOnline()) return null;
    if (!this.application.config.bridge.channels.logging.enabled) return null;
    if (this.application.config.bridge.channels.logging.channel === null) return null;
    const channel = await this.application.discord.client.channels.fetch(this.application.config.bridge.channels.logging.channel);
    if (channel === null || !channel.isSendable()) return null;

    if (this.config.discord.messageId === null) {
      const message = await channel.send({ content: "Loading Bot Status Data..." });
      this.config.discord.messageId = message.id;
      await writeFile("data/plugins/botStatus/config.json", JSON.stringify(this.config, null, 2), "utf-8");
      return await this.getMessage();
    }

    if (this.config.discord.messageId === null) return null;
    const message = await channel.messages.fetch(this.config.discord.messageId).catch(() => null);
    if (message === null) return null;
    return message;
  }

  private get plugins(): BridgePluginMetadataWithId[] {
    return this.application.plugins.plugins.map((plugin) => BotStatusPlugin.convertPluginMetaData(plugin.metadata)).sort((a, b) => a.name.localeCompare(b.name));
  }

  private getPluginsStringSelectMenu(active?: BridgePluginMetadataWithId["id"]): StringSelectMenuBuilder {
    return new StringSelectMenuBuilder()
      .setCustomId("debugInfoViewPlugin")
      .setPlaceholder("View information of a plugin")
      .setDisabled(this.plugins.length === 0)
      .setOptions(
        new StringSelectMenuOptionBuilder()
          .setValue("debugInfoViewPluginOverview")
          .setLabel("Debug Information Overview")
          .setDefault(active === undefined),
        ...this.plugins.map((plugin) =>
          new StringSelectMenuOptionBuilder()
            .setValue(plugin.id)
            .setLabel(plugin.name)
            .setDescription(plugin.description)
            .setDefault(plugin.id === active)
        )
      );
  }

  getMessageData(): BaseMessageOptions {
    if (!this.application.discord.isClientOnline()) throw new HypixelDiscordChatBridgeError("The discord bot doesn't seam to be online? Please restart the application");
    const runtimeInformation = this.application.getRuntimeInformation();
    return {
      content: "",
      embeds: [
        new EmbedHelper()
          .setTitle("Debug Information")
          .setThumbnail(`${this.application.config.API.nmsr.baseURL}/face/${this.application.minecraft.bot?.username ?? "kathund"}`)
          .setFields(
            { name: "Bot Connected To Hypixel", value: this.application.minecraft.isBotOnline() ? ":white_check_mark: Yes" : ":x: No" },
            { name: "Bot username", value: this.application.minecraft.bot?.username ?? "UNKNOWN", blockValue: true },
            { name: "Bot uuid", value: this.application.minecraft.bot?.uuid ?? "UNKNOWN", blockValue: true },
            { name: "Bot Version", value: this.application.minecraft.bot?.version ?? "UNKNOWN", blockValue: true },
            { name: "Online Since", value: Math.floor((Date.now() - this.application.discord.client.uptime) / 1000).toString(), formatTimestamp: true },
            { name: "Is Inside of Docker Container", value: runtimeInformation.docker ? ":white_check_mark: Yes" : ":x: No" },
            { name: "Git Hash", value: runtimeInformation.commit, blockValue: true },
            { name: "Is Git Dirty", value: runtimeInformation.dirty ? ":white_check_mark: Yes" : ":x: No" },
            { name: "Plugins", value: this.plugins.length === 0 ? "None" : this.plugins.map((plugin) => `- ${plugin.name}`).join("\n") }
          )
          .setDevFooter("Amber", "Last Updated")
          .setTimestamp()
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setCustomId("botStatusRefreshData").setLabel("Refresh").setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId("botStatusRestartApplication").setLabel("Restart Application").setStyle(ButtonStyle.Danger)
        ),
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(this.getPluginsStringSelectMenu().setCustomId("debugInfoViewPluginOverview"))
      ]
    };
  }

  getMessageDataPlugin(id: BridgePluginMetadataWithId["id"] | "debugInfoViewPluginOverview" | undefined): BaseMessageOptions {
    if (id === "debugInfoViewPluginOverview") return this.getMessageData();
    const plugin = this.plugins.find((plugin) => plugin.id === id);
    if (!plugin) throw new HypixelDiscordChatBridgeError(`Could not find the plugin with an id of \`${id}\``);
    return {
      content: "",
      embeds: [
        new EmbedHelper()
          .setTitle("Plugin Debug Information")
          .setFields(
            { name: "Name", value: plugin.name, blockValue: true },
            { name: "Description", value: plugin.description, blockValue: true },
            { name: "Version", value: plugin.version, blockValue: true },
            { name: "Author", value: plugin.author, blockValue: true },
            { name: "ID", value: plugin.id, blockValue: true }
          )
          .setDevFooter("Amber", "Last Updated")
          .setTimestamp()
      ],
      components: [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(this.getPluginsStringSelectMenu(plugin.id)),
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel("View Source")
            .setStyle(ButtonStyle.Link)
            .setURL(plugin.link ?? "https://amber.rip")
            .setDisabled(plugin.link === undefined)
        )
      ]
    };
  }

  isFullyLoaded(): this is BotStatusPluginWithData {
    if (this.config === undefined) return false;
    return true;
  }

  static convertPluginMetaData(plugin: BridgePluginMetadata): BridgePluginMetadataWithId {
    return { ...plugin, id: toCamelCase(plugin.name) };
  }
}

export default BotStatusPlugin;
