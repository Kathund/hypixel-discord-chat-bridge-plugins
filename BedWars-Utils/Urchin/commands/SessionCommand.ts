import {
  type BedWarsInternalName,
  type BedWarsModeName,
  MinecraftCommand,
  MinecraftCommandData,
  MinecraftCommandDataOption,
  type MinecraftManagerWithPlugin,
  MowojangAPI,
  formatNumber,
  isBedWarsModeName,
  titleCase
} from "hypixel-discord-chat-bridge/plugin-api";
import { SessionTypes, isSessionTypeName } from "../types.js";
import type BedWarsUtilsPlugin from "../../index.js";
import type { BedWars, BedWarsMode } from "hypixel-api-reborn";

class SessionsCommand extends MinecraftCommand<MinecraftManagerWithPlugin<BedWarsUtilsPlugin>> {
  override readonly data = new MinecraftCommandData()
    .setName("sessions")
    .setAliases([...SessionTypes])
    .setDescription("Fetch BedWars sessions from urchin")
    .setOptions([new MinecraftCommandDataOption().setName("username").setDescription("Minecraft Username")]);

  convertMode(mode: BedWarsModeName): BedWarsInternalName {
    switch (mode) {
      case "solo":
        return "eightOne";
      case "doubles":
        return "eightTwo";
      case "threes":
        return "fourThree";
      case "fours":
        return "fourFour";
      case "4v4":
        return "twoFour";
      default:
        return "eightOne";
    }
  }

  getStats(BedWars: BedWars, mode: BedWarsModeName) {
    let stats: BedWarsMode;
    if (mode === "overall") stats = BedWars;
    else stats = BedWars[this.convertMode(mode)];
    const { finals, wins, gamesPlayed } = stats;
    const { broken, ratio } = stats.beds;
    return { level: BedWars.level, finalKills: finals.total.kills, FKDR: finals.total.ratio, wins, broken, BLRatio: ratio, gamesPlayed };
  }

  override async execute(player: string, message: string): Promise<void> {
    const type = `${message.slice(1).trim()} `.split(" ")[0] || "daily";
    if (!isSessionTypeName(type)) return await this.send("Invalid Session Type");
    if (!this.minecraft.plugin.urchin) return await this.send("Urchin data wasn't loadded correctly");
    player = this.getArgs(message)[0] || player;
    const profile = await MowojangAPI.getProfile(player);
    if (profile.data === null) return await this.send(`${player} does not exist!`);

    const msg = this.getArgs(message).map((arg) => arg.replaceAll("/", ""));

    const arg0 = msg[0];
    const arg1 = msg[1];

    let mode: BedWarsModeName = "overall";

    if (arg0 && isBedWarsModeName(arg0)) {
      mode = arg0;
      if (arg1) player = arg1;
    } else if (arg0) {
      player = arg0;
    }

    const data = await this.minecraft.plugin.urchin.getBedWarsSession(player, type);
    if (!data) return await this.send(`${profile.data.username} doesn't have any daily session data`);
    const { level, gamesPlayed, finalKills, FKDR, wins, broken, BLRatio } = this.getStats(data, mode);

    await this.send(
      `[Urchin] [${Math.floor(level)}✫] ${profile.data.username}'s ${titleCase(type)} ${titleCase(mode)} FK: ${formatNumber(
        finalKills
      )} FKDR: ${FKDR} W: ${formatNumber(wins)} BB: ${formatNumber(broken)} BLR: ${BLRatio} Games Played: ${formatNumber(gamesPlayed)}`
    );
  }
}

export default SessionsCommand;
