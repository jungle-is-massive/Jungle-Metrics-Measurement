import type { DbRecord, SelectOption } from "@/lib/supabase";

export function asText(value: unknown, fallback = "Not set") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

export function getLookupLabel(options: SelectOption[] | undefined, value: unknown) {
  return options?.find((option) => option.value === value)?.label ?? asText(value);
}

export function statusPill(status: unknown) {
  const value = String(status ?? "active").toLowerCase();
  const className = value === "active" || value === "true" ? "pill pillGreen" : "pill pillGrey";
  return <span className={className}>{value}</span>;
}

export function activePill(active: unknown) {
  return <span className={`pill ${active ? "pillGreen" : "pillGrey"}`}>{active ? "active" : "inactive"}</span>;
}

export function scorePill(points: unknown) {
  const value = Number(points ?? 0);
  const className = value < 0 ? "pill pillRed" : value >= 10 ? "pill pillGreen" : "pill pillBlue";
  return <span className={className}>{value > 0 ? `+${value}` : value} pts</span>;
}

export function updatedStamp(record?: DbRecord | null) {
  if (!record?.updated_at) return null;
  const date = new Date(String(record.updated_at));
  if (Number.isNaN(date.getTime())) return null;
  return <span className="mutedMono">Updated {date.toLocaleDateString("en-GB")}</span>;
}
