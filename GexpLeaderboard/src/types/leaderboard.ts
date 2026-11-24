export type GexpLeaderboardPeriod = "monthly" | "yearly";
export type GexpLeaderboardAction = "ViewMore" | "Previous" | "Next" | "Self";

export function getLeaderboardButtonId(period: GexpLeaderboardPeriod, action: GexpLeaderboardAction): string {
  const periodName = period === "monthly" ? "Monthly" : "Yearly";
  return `gexp${periodName}Leaderboard${action}`;
}
