import type { ColumnConfig, FieldConfig } from "@/lib/supabase";
import { activePill, asText, getLookupLabel, scorePill, statusPill } from "@/lib/format";

export const categoryOptions = [
  "Owned",
  "Outbound",
  "Inbound",
  "Intermediaries",
  "Referrals / Network",
  "Paid",
  "Partnerships",
  "Events"
].map((value) => ({ label: value, value }));

export const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Archived", value: "archived" }
];

export const directionOptions = ["forward", "backward", "disqualify", "recycle"].map((value) => ({
  label: value,
  value
}));

export const sourceAreaOptions = [
  "email",
  "website",
  "event",
  "outbound",
  "intermediary",
  "referral",
  "deal activity",
  "manual"
].map((value) => ({ label: value, value }));

export const triggerTypeOptions = ["score", "activity", "inactivity", "manual", "workflow"].map((value) => ({
  label: value,
  value
}));

export const leadSourceFields: FieldConfig[] = [
  { name: "name", label: "Source name", required: true },
  {
    name: "category_id",
    label: "Category",
    type: "select",
    required: true,
    relation: { table: "lead_source_categories", labelField: "name", orderField: "display_order" }
  },
  { name: "description", label: "Description", type: "textarea", full: true },
  { name: "examples", label: "Examples", type: "textarea", full: true },
  { name: "expected_lead_type", label: "Expected lead type" },
  { name: "expected_entry_stage", label: "Expected entry stage" },
  { name: "can_create_mql", label: "Can generate MQLs directly", type: "boolean" },
  { name: "can_create_sql", label: "Can generate SQLs directly", type: "boolean" },
  { name: "notes", label: "Notes", type: "textarea", full: true },
  { name: "status", label: "Status", type: "select", options: statusOptions },
  { name: "display_order", label: "Display order", type: "number" }
];

export const leadSourceColumns: ColumnConfig[] = [
  {
    key: "name",
    label: "Source",
    width: "34%",
    render: (record) => (
      <>
        <div className="entityName">{asText(record.name)}</div>
        <div className="entityMeta">{asText(record.expected_lead_type)}</div>
      </>
    )
  },
  {
    key: "category_id",
    label: "Category",
    width: "16%",
    render: (record, lookups) => <span className="pill pillBlue">{getLookupLabel(lookups.category_id, record.category_id)}</span>
  },
  { key: "expected_entry_stage", label: "Entry stage", width: "20%" },
  {
    key: "can_create_mql",
    label: "MQL",
    width: "9%",
    render: (record) => (record.can_create_mql ? <span className="pill pillGreen">yes</span> : <span className="pill pillGrey">no</span>)
  },
  {
    key: "can_create_sql",
    label: "SQL",
    width: "9%",
    render: (record) => (record.can_create_sql ? <span className="pill pillAmber">yes</span> : <span className="pill pillGrey">no</span>)
  },
  { key: "status", label: "Status", width: "12%", render: (record) => statusPill(record.status) }
];

export const lifecycleFields: FieldConfig[] = [
  { name: "name", label: "Stage name", required: true },
  { name: "stage_order", label: "Stage order", type: "number", required: true },
  { name: "short_definition", label: "Short definition", required: true, full: true },
  { name: "full_definition", label: "Full definition", type: "textarea", full: true },
  { name: "expected_behaviour", label: "Expected behaviour", type: "textarea", full: true },
  { name: "entry_criteria", label: "Required criteria to enter", type: "textarea", full: true },
  { name: "support_criteria", label: "Supporting criteria", type: "textarea", full: true },
  { name: "regression_criteria", label: "Regression or disqualification criteria", type: "textarea", full: true },
  { name: "owner_team", label: "Owner / team" },
  { name: "status", label: "Status", type: "select", options: statusOptions }
];

export const scoringRuleFields: FieldConfig[] = [
  { name: "name", label: "Rule name", required: true },
  {
    name: "rule_group_id",
    label: "Rule type",
    type: "select",
    required: true,
    relation: { table: "scoring_rule_groups", labelField: "name", orderField: "display_order" }
  },
  { name: "source_area", label: "Source area", type: "select", options: sourceAreaOptions },
  { name: "behaviour_key", label: "Event / behaviour key" },
  { name: "description", label: "Description", type: "textarea", full: true },
  { name: "points", label: "Points value", type: "number", required: true },
  { name: "frequency_cap", label: "Frequency cap", type: "number" },
  { name: "recency_days", label: "Recency window days", type: "number" },
  { name: "repeatable", label: "Repeatable", type: "boolean" },
  { name: "is_active", label: "Active", type: "boolean" },
  { name: "notes", label: "Notes", type: "textarea", full: true },
  { name: "display_order", label: "Display order", type: "number" }
];

export const scoringRuleColumns: ColumnConfig[] = [
  {
    key: "name",
    label: "Rule",
    render: (record) => (
      <>
        <div className="entityName">{asText(record.name)}</div>
        <div className="entityMeta">{asText(record.behaviour_key)}</div>
      </>
    )
  },
  {
    key: "rule_group_id",
    label: "Type",
    render: (record, lookups) => {
      const label = getLookupLabel(lookups.rule_group_id, record.rule_group_id);
      return <span className={`pill ${label === "negative" ? "pillRed" : "pillGreen"}`}>{label}</span>;
    }
  },
  { key: "source_area", label: "Area" },
  { key: "points", label: "Points", render: (record) => scorePill(record.points) },
  { key: "frequency_cap", label: "Cap" },
  { key: "recency_days", label: "Recency" },
  { key: "is_active", label: "Status", render: (record) => activePill(record.is_active) }
];

export const thresholdFields: FieldConfig[] = [
  { name: "name", label: "Threshold name", required: true },
  { name: "score_min", label: "Score minimum", type: "number", required: true },
  { name: "score_max", label: "Score maximum", type: "number" },
  {
    name: "target_stage_id",
    label: "Target stage",
    type: "select",
    relation: { table: "lifecycle_stages", labelField: "name", orderField: "stage_order" }
  },
  { name: "description", label: "Description", type: "textarea", full: true },
  { name: "score_alone_sufficient", label: "Score alone is enough", type: "boolean" },
  { name: "required_trigger", label: "Required supporting trigger" },
  { name: "optional_trigger", label: "Optional supporting trigger" },
  { name: "is_active", label: "Active", type: "boolean" },
  { name: "display_order", label: "Display order", type: "number" }
];

export const thresholdColumns: ColumnConfig[] = [
  { key: "name", label: "Threshold", render: (record) => <div className="entityName">{asText(record.name)}</div> },
  {
    key: "score_min",
    label: "Score band",
    render: (record) => (
      <span className="pill pillBlack">
        {record.score_min}
        {record.score_max ? `-${record.score_max}` : "+"}
      </span>
    )
  },
  {
    key: "target_stage_id",
    label: "Target stage",
    render: (record, lookups) => <span className="pill pillBlue">{getLookupLabel(lookups.target_stage_id, record.target_stage_id)}</span>
  },
  { key: "required_trigger", label: "Required trigger" },
  { key: "score_alone_sufficient", label: "Score alone", render: (record) => (record.score_alone_sufficient ? "Yes" : "No") },
  { key: "is_active", label: "Status", render: (record) => activePill(record.is_active) }
];

export const movementFields: FieldConfig[] = [
  { name: "name", label: "Rule name", required: true },
  {
    name: "from_stage_id",
    label: "From stage",
    type: "select",
    relation: { table: "lifecycle_stages", labelField: "name", orderField: "stage_order" }
  },
  {
    name: "to_stage_id",
    label: "To stage",
    type: "select",
    relation: { table: "lifecycle_stages", labelField: "name", orderField: "stage_order" }
  },
  { name: "direction", label: "Direction", type: "select", options: directionOptions },
  { name: "trigger_type", label: "Trigger type", type: "select", options: triggerTypeOptions },
  { name: "trigger_condition", label: "Trigger condition", full: true },
  { name: "description", label: "Description", type: "textarea", full: true },
  { name: "automatic", label: "Automatic", type: "boolean" },
  { name: "sla_note", label: "SLA or timing note" },
  { name: "owner", label: "Owner" },
  { name: "is_active", label: "Active", type: "boolean" },
  { name: "display_order", label: "Display order", type: "number" }
];

export const movementColumns: ColumnConfig[] = [
  { key: "name", label: "Rule", render: (record) => <div className="entityName">{asText(record.name)}</div> },
  {
    key: "from_stage_id",
    label: "From",
    render: (record, lookups) => getLookupLabel(lookups.from_stage_id, record.from_stage_id)
  },
  {
    key: "to_stage_id",
    label: "To",
    render: (record, lookups) => getLookupLabel(lookups.to_stage_id, record.to_stage_id)
  },
  {
    key: "direction",
    label: "Direction",
    render: (record) => {
      const direction = String(record.direction ?? "");
      const klass = direction === "forward" ? "pillGreen" : direction === "backward" || direction === "recycle" ? "pillAmber" : "pillRed";
      return <span className={`pill ${klass}`}>{direction}</span>;
    }
  },
  { key: "trigger_type", label: "Trigger" },
  { key: "automatic", label: "Auto", render: (record) => (record.automatic ? "Yes" : "No") },
  { key: "is_active", label: "Status", render: (record) => activePill(record.is_active) }
];

