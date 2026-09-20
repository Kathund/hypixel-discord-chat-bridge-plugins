export interface SeraphBlacklistDataItemWithData {
  tagged: true;
  timestamp: number;
  reason?: string;
  report_type: string;
  tooltip: string;
  verified: boolean;
}

export interface SeraphBlacklistDataItemNoData {
  tagged: false;
}

export type SeraphBlacklistDataItem = SeraphBlacklistDataItemNoData | SeraphBlacklistDataItemWithData;

export interface SeraphBlacklistData {
  uuid: string;
  key_type: string;
  member: SeraphBlacklistDataItem;
  bot: SeraphBlacklistDataItem;
  blacklist: SeraphBlacklistDataItem;
  safelist: SeraphBlacklistDataItem;
  annoylist: SeraphBlacklistDataItem;
  name_change: SeraphBlacklistDataItem;
}

export interface SeraphBlacklistResponse {
  success: boolean;
  code: number;
  data: SeraphBlacklistData;
  msTime: number;
}
