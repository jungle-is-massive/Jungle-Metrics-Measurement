"use client";

import { EntityManager } from "@/components/EntityManager";
import { lifecycleFields } from "@/lib/config";
import type { ColumnConfig } from "@/lib/supabase";
import { asText, statusPill } from "@/lib/format";

const lifecycleColumns: ColumnConfig[] = [
  {
    key: "stage_order",
    label: "Order",
    render: (record) => <span className="stageNumber" style={{ width: 34, height: 34 }}>{String(record.stage_order ?? "-")}</span>
  },
  {
    key: "name",
    label: "Stage",
    render: (record) => (
      <>
        <div className="entityName">{asText(record.name)}</div>
        <div className="entityMeta">{asText(record.short_definition)}</div>
      </>
    )
  },
  { key: "owner_team", label: "Owner" },
  { key: "entry_criteria", label: "Entry criteria" },
  { key: "status", label: "Status", render: (record) => statusPill(record.status) }
];

export function LifecycleStageManager() {
  return (
    <>
      <div className="callout">
        Use the order field to control the stage flow. Each record carries the operational definition, entry criteria, supporting signals,
        regression criteria, and owner so the funnel can be governed without changing code.
      </div>
      <EntityManager
        title="Lifecycle stage records"
        description="Edit the vertical funnel flow and the rules that make each stage meaningful."
        table="lifecycle_stages"
        fields={lifecycleFields}
        columns={lifecycleColumns}
        orderBy="stage_order"
        filterField="status"
        filterLabel="Status"
        searchFields={["name", "short_definition", "full_definition", "entry_criteria", "owner_team"]}
      />
    </>
  );
}
