"use client";

import { useState } from "react";
import { EntityManager } from "@/components/EntityManager";
import {
  movementColumns,
  movementFields,
  scoringRuleColumns,
  scoringRuleFields,
  thresholdColumns,
  thresholdFields
} from "@/lib/config";

const tabs = [
  {
    id: "scoring",
    label: "Lead Scoring",
    intro: "Define positive and negative point rules for activities, behaviour, source signals, and manual inputs."
  },
  {
    id: "thresholds",
    label: "Thresholds & Triggers",
    intro: "Define score bands, supporting trigger conditions, and the target lifecycle stage they qualify into."
  },
  {
    id: "movement",
    label: "Movement Rules",
    intro: "Define the rules that move leads forward, backward, into nurture/recycle, or out as disqualified."
  }
];

export function LeadScoringTabs() {
  const [activeTab, setActiveTab] = useState("scoring");
  const active = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <section>
      <div className="tabs" role="tablist" aria-label="Lead scoring model sections">
        {tabs.map((tab) => (
          <button
            className={`tab ${activeTab === tab.id ? "tabActive" : ""}`}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="callout" style={{ marginBottom: 18 }}>{active.intro}</div>

      {activeTab === "scoring" && (
        <EntityManager
          title="Scoring rules"
          description="Group positive and negative signals, edit points inline through the form, and toggle active state."
          table="scoring_rules"
          fields={scoringRuleFields}
          columns={scoringRuleColumns}
          filterField="rule_group_id"
          filterLabel="Rule type"
          groupedBy="rule_group_id"
          archiveField="is_active"
          searchFields={["name", "source_area", "behaviour_key", "description", "notes"]}
        />
      )}

      {activeTab === "thresholds" && (
        <EntityManager
          title="Threshold and trigger rules"
          description="Maintain score bands, supporting triggers, and the resulting lifecycle stage."
          table="threshold_rules"
          fields={thresholdFields}
          columns={thresholdColumns}
          filterField="target_stage_id"
          filterLabel="Target stage"
          archiveField="is_active"
          searchFields={["name", "description", "required_trigger", "optional_trigger"]}
        />
      )}

      {activeTab === "movement" && (
        <EntityManager
          title="Movement rules"
          description="Manage automatic and manual progression, regression, recycle, and disqualification logic."
          table="movement_rules"
          fields={movementFields}
          columns={movementColumns}
          filterField="direction"
          filterLabel="Direction"
          groupedBy="direction"
          archiveField="is_active"
          searchFields={["name", "direction", "trigger_type", "trigger_condition", "description", "owner"]}
        />
      )}
    </section>
  );
}
