import zod from "zod";

export const BedWarsUtilsConfigAPI = zod.object({ baseUrl: zod.url() });
export const BedWarsUtilsConfigAPIWithKey = BedWarsUtilsConfigAPI.extend({ apiKey: zod.string() });

export const BedWarsUtilsConfigOther = zod.object({ CACHE_DURATION: zod.string().meta({ description: "How long things should be cached" }) });

export const BedWarsUtilsConfig = zod.object({
  configVersion: zod.number().int().positive().meta({ description: "!IMPORTANT DO NOT TOUCH\nConfig format version number" }),
  urchin: BedWarsUtilsConfigAPIWithKey,
  seraph: BedWarsUtilsConfigAPIWithKey,
  vega: BedWarsUtilsConfigAPI,
  other: BedWarsUtilsConfigOther
});
export type BedWarsUtilsConfig = zod.infer<typeof BedWarsUtilsConfig>;
