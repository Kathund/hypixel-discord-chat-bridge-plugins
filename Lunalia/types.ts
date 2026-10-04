import { z } from "zod";
import type { ExpHistory } from "hypixel-api-reborn";

export const GexpUserDataGexpEntrySchema = z
  .object({ day: z.string(), date: z.coerce.date().optional(), exp: z.number(), totalExp: z.number() })
  .transform((entry) => ({ ...entry, date: entry.date }));

export const GexpUserDataGexpSchema = z.preprocess((data: unknown) => {
  if (Array.isArray(data) || typeof data !== "object" || data === null) return data;
  return Object.entries(data).map(([, value]) => {
    if (typeof value !== "object" || value === null) return value;
    const entry = value as { day?: unknown; exp?: unknown; unix?: unknown };
    return { day: entry.day, date: typeof entry.unix === "number" ? new Date(entry.unix * 1000) : undefined, exp: entry.exp, totalExp: entry.exp };
  });
}, z.array(GexpUserDataGexpEntrySchema));

export const GexpUserDataSchema = z.object({ trackingId: z.string(), uuid: z.string(), gexp: GexpUserDataGexpSchema });
export const GexpDataSchema = z.array(GexpUserDataSchema);

export type GexpData = GexpUserData[];

export type BasicGexpUserDataGexpEntry = ExpHistory;

export interface BasicGexpUserData {
  trackingId?: string;
  uuid: string;
  gexp: BasicGexpUserDataGexpEntry[];
}

export interface GexpUserData extends BasicGexpUserData {
  trackingId: string;
}
