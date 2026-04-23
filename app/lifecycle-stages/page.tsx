import { EditablePageHeader } from "@/components/EditablePageHeader";
import { LifecycleStageManager } from "@/components/LifecycleStageManager";

export default function LifecycleStagesPage() {
  return (
    <main className="page">
      <EditablePageHeader
        slug="lifecycle-stages"
        label="Funnel definitions"
        fallbackTitle="Lifecycle Stages"
        fallbackIntro="Define the stages of the funnel, what behaviour is expected in each one, and what qualifies or regresses a lead."
      />
      <LifecycleStageManager />
    </main>
  );
}
