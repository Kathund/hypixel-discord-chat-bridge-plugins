import { z } from "zod";

export const GexpUserDataGexpEntrySchema = z.object({ day: z.string(), exp: z.number(), unix: z.number() });
export const GexpUserDataSchema = z.object({ trackingId: z.string(), uuid: z.string(), gexp: z.record(z.string(), GexpUserDataGexpEntrySchema) });
export const GexpDataSchema = z.array(GexpUserDataSchema);

export type GexpData = GexpUserData[];

export interface BasicGexpUserDataGexpEntry {
  day: string;
  exp: number;
  unix: number;
}

export interface BasicGexpUserData {
  trackingId?: string;
  uuid: string;
  gexp: Record<string, BasicGexpUserDataGexpEntry>;
}

export interface GexpUserData extends BasicGexpUserData {
  trackingId: string;
}
