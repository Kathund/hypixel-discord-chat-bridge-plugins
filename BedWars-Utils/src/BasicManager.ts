import axios, { AxiosError, HttpStatusCode } from "axios";
import ms, { type StringValue } from "ms";
import { HypixelDiscordChatBridgeError } from "hypixel-discord-chat-bridge/plugin-api";
import type BedWarsUtilsPlugin from "../index.js";

class BasicManager {
  protected cacheDuration: number = ms("5m");
  constructor(
    protected readonly plugin: BedWarsUtilsPlugin,
    protected readonly BASE_URL: string,
    protected readonly name: string,
    protected readonly requestHeaders: Record<string, string> = {}
  ) {
    this.cacheDuration = ms((this.plugin.config?.other.CACHE_DURATION ?? "5m") as StringValue);
  }

  protected async request<T>(endpoint: string): Promise<T | undefined> {
    endpoint = `${this.BASE_URL}/${endpoint}`;
    const cached = this.plugin.cache.get(endpoint);
    if (cached) {
      if (cached.expiresAt > Date.now()) return cached.data as T;
      this.plugin.cache.delete(endpoint);
    }

    try {
      const { data } = await axios.get(endpoint, { headers: this.requestHeaders });
      this.plugin.cache.set(endpoint, { data, expiresAt: Date.now() + this.cacheDuration });
      return data;
    } catch (error: unknown) {
      if (!(error instanceof AxiosError)) throw error;
      switch (error.status) {
        case HttpStatusCode.TooManyRequests:
          throw new HypixelDiscordChatBridgeError(`${this.name} API is Ratelimited. Please try again later`);
        case HttpStatusCode.NotFound:
          return undefined;
        case HttpStatusCode.Unauthorized:
        case HttpStatusCode.Forbidden:
          throw new HypixelDiscordChatBridgeError(`${this.name} API Key is invalid`);
        default:
          throw error;
      }
    }
  }
}

export default BasicManager;
