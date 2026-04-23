import { LeadScoringTabs } from "@/components/LeadScoringTabs";
import { EditablePageHeader } from "@/components/EditablePageHeader";

export default function LeadScoringPage() {
  return (
    <main className="page">
      <EditablePageHeader
        slug="lead-scoring"
        label="Qualification logic"
        fallbackTitle="Lead Scoring Model"
        fallbackIntro="Manage the point model, qualification thresholds, trigger conditions, and funnel movement rules from one place."
      />
      <LeadScoringTabs />
    </main>
  );
}
