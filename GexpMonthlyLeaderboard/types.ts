import { z } from "zod";

export const GexpUserDataGexpSchema = z.array(z.object({ day: z.string(), date: z.coerce.date().optional(), exp: z.number(), totalExp: z.number() }));

export const GexpUserDataSchema = z.object({ trackingId: z.string(), uuid: z.string(), gexp: GexpUserDataGexpSchema });

export const GexpDataSchema = z.array(GexpUserDataSchema);

export type GexpData = z.infer<typeof GexpDataSchema>;
export type GexpUserData = z.infer<typeof GexpUserDataSchema>;

export interface BasicGexpUserData {
  trackingId?: string;
  uuid: string;
  gexp: GexpUserData["gexp"];
}
