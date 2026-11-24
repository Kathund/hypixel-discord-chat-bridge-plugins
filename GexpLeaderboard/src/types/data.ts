import zod from "zod";

export const GexpUserDataGexpSchema = zod.array(zod.object({ day: zod.string(), date: zod.coerce.date().optional(), exp: zod.number(), totalExp: zod.number() }));

export const GexpUserDataSchema = zod.object({ trackingId: zod.string(), uuid: zod.string(), gexp: GexpUserDataGexpSchema });
export type GexpUserData = zod.infer<typeof GexpUserDataSchema>;

export const GexpDataSchema = zod.array(GexpUserDataSchema);
export type GexpData = zod.infer<typeof GexpDataSchema>;

export interface BasicGexpUserData {
  trackingId?: string;
  uuid: string;
  gexp: GexpUserData["gexp"];
}
