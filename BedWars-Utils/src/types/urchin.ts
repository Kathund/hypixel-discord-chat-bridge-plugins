export interface UrchinTag {
  added_on: number | bigint; // int64
  hide_username: boolean;
  reason: string;
  tag_type: string;
  added_by?: number | bigint | null; // int64
  added_by_username?: string | null;
  expires_at?: number | bigint | null; // int64
}

export interface UrchinTagsResponse {
  uuid: string;
  displayname?: string | null;
  tags: UrchinTag[];
}

export interface UrchinWinstreakMode {
  approximate: boolean;
  readable: string;
  timestamp: number;
  value: number;
}

export interface ParsedUrchinWinstreaks {
  "overall": number;
  "core": number;
  "solos": number;
  "doubles": number;
  "threes": number;
  "fours": number;
  "4v4": number;
}

export interface UrchinWinstreakModes {
  "overall": UrchinWinstreakMode[];
  "core": UrchinWinstreakMode[];
  "solos": UrchinWinstreakMode[];
  "doubles": UrchinWinstreakMode[];
  "threes": UrchinWinstreakMode[];
  "fours": UrchinWinstreakMode[];
  "4v4": UrchinWinstreakMode[];
}

export interface UrchinWinstreakResopnse {
  uuid: string;
  displayname?: string | null;
  modes: UrchinWinstreakModes;
}

export interface UrchinSessionResponse {
  delta: Record<string, any>;
  from: number;
  from_readable: string;
  uuid: string;
  displayname?: string | null;
}

export const SessionTypes = ["daily", "weekly", "monthly", "yearly"] as const;
export type SessionType = (typeof SessionTypes)[number];
export function isSessionTypeName(value: string): value is SessionType {
  return (SessionTypes as readonly string[]).includes(value);
}
