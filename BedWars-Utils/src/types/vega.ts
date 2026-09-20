export interface VegaPingItem {
  day: string;
  timestamp: number;
  min: number;
  avg: number;
  max: number;
}

export interface VegaPingResponse {
  success: boolean;
  data: VegaPingItem[];
}

export interface VegaBlacklistData {
  uuid: string;
  hex_uuid: string;
  icon: string;
  type: string;
  display: string;
  reason: string;
  added_on: string;
  added_by: string;
}

export interface VegaBlacklistResponseNoBlacklist {
  success: boolean;
  blacklisted: false;
}
export interface VegaBlacklistResponseBlacklisted {
  success: boolean;
  blacklisted: true;
  data: VegaBlacklistData;
}

export type VegaBlacklistResponse = VegaBlacklistResponseNoBlacklist | VegaBlacklistResponseBlacklisted;
