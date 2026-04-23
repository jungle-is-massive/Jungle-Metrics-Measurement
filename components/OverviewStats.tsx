"use client";

import { useEffect, useState } from "react";
import { getSupabase, hasSupabaseConfig } from "@/lib/supabase";

type Counts = {
  lead_sources: number;
  lifecycle_stages: number;
  scoring_rules: number;
  movement_rules: number;
};

const initialCounts: Counts = {
  lead_sources: 0,
  lifecycle_stages: 0,
  scoring_rules: 0,
  movement_rules: 0
};

export function OverviewStats() {
  const [counts, setCounts] = useState<Counts>(initialCounts);

  useEffect(() => {
    async function loadCounts() {
      const supabase = getSupabase();
      if (!hasSupabaseConfig || !supabase) return;
      const entries = await Promise.all(
        Object.keys(initialCounts).map(async (table) => {
          const { count } = await supabase.from(table).select("id", { count: "exact", head: true });
          return [table, count ?? 0] as const;
        })
      );
      setCounts(Object.fromEntries(entries) as Counts);
    }
    void loadCounts();
  }, []);

  const stats = [
    { label: "Lead sources", value: counts.lead_sources, note: "managed source records" },
    { label: "Lifecycle stages", value: counts.lifecycle_stages, note: "funnel definitions" },
    { label: "Scoring rules", value: counts.scoring_rules, note: "positive and negative signals" },
    { label: "Movement rules", value: counts.movement_rules, note: "progression and regression logic" }
  ];

  return (
    <div className="grid grid4">
      {stats.map((stat) => (
        <div className="statCard" key={stat.label}>
          <div className="statLabel">{stat.label}</div>
          <div className="statValue">{stat.value}</div>
          <div className="statSub">{stat.note}</div>
        </div>
      ))}
    </div>
  );
}
