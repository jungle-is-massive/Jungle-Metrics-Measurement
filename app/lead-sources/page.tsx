"use client";

import { EditablePageHeader } from "@/components/EditablePageHeader";
import { EntityManager } from "@/components/EntityManager";
import { leadSourceColumns, leadSourceFields } from "@/lib/config";

export default function LeadSourcesPage() {
  return (
    <main className="page">
      <EditablePageHeader
        slug="lead-sources"
        label="Source governance"
        fallbackTitle="Lead Sources"
        fallbackIntro="Document where leads and opportunities come from, how each source behaves, and which funnel entry points are allowed."
      />
      <EntityManager
        title="Lead source records"
        description="Filter by category, manage status, and keep expected lead type and entry-stage decisions current."
        table="lead_sources"
        fields={leadSourceFields}
        columns={leadSourceColumns}
        filterField="category_id"
        filterLabel="Category"
        groupedBy="category_id"
        searchFields={["name", "description", "examples", "notes"]}
      />
    </main>
  );
}
