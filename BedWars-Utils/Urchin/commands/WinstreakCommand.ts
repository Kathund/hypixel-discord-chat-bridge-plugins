import {
  MinecraftCommand,
  MinecraftCommandData,
  MinecraftCommandDataOption,
  type MinecraftManagerWithPlugin,
  MowojangAPI,
  getMostRecent
} from "hypixel-discord-chat-bridge/plugin-api";
import type BedWarsUtilsPlugin from "../../index.js";
import type { ParsedUrchinWinstreaks, UrchinWinstreakMode, UrchinWinstreakModes } from "../types.js";

class WinstreakCommand extends MinecraftCommand<MinecraftManagerWithPlugin<BedWarsUtilsPlugin>> {
  override readonly data = new MinecraftCommandData()
    .setName("winstreaks")
    .setAliases(["winstreak", "ws"])
    .setDescription("Fetch winstreaks via urchin")
    .setOptions([new MinecraftCommandDataOption().setName("username").setDescription("Minecraft Username")]);

  override async execute(player: string, message: string): Promise<void> {
    if (!this.minecraft.plugin.urchin) return await this.send("Urchin data wasn't loadded correctly");
    player = this.getArgs(message)[0] || player;
    const profile = await MowojangAPI.getProfile(player);
    if (profile.data === null) return await this.send(`${player} does not exist!`);
    const data = await this.minecraft.plugin.urchin.getWinstreaks(profile.data.UUID);
    if (!data) return await this.send(`${profile.data.username} has no Urchin winstreaks.`);
    const { overall, core, solos, doubles, threes, fours, "4v4": fourVfour } = this.parseWinstreaks(data.modes);
    await this.send(
      `[Urchin] ${profile.data.username}'s overall winstreak: ${overall}, Core: ${core}, Solos: ${solos}, Doubles: ${doubles}, Threes: ${threes}, Fours: ${fours}, 4v4: ${fourVfour}`
    );
  }

  parseWinstreaks({ overall, core, solos, doubles, threes, fours, "4v4": fourVfour }: UrchinWinstreakModes): ParsedUrchinWinstreaks {
    return {
      "overall": getMostRecent<UrchinWinstreakMode>(overall)?.value ?? 0,
      "core": getMostRecent<UrchinWinstreakMode>(core)?.value ?? 0,
      "solos": getMostRecent<UrchinWinstreakMode>(solos)?.value ?? 0,
      "doubles": getMostRecent<UrchinWinstreakMode>(doubles)?.value ?? 0,
      "threes": getMostRecent<UrchinWinstreakMode>(threes)?.value ?? 0,
      "fours": getMostRecent<UrchinWinstreakMode>(fours)?.value ?? 0,
      "4v4": getMostRecent<UrchinWinstreakMode>(fourVfour)?.value ?? 0
    };
  }
}

export default WinstreakCommand;
