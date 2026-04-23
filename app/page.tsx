import Link from "next/link";
import { EditablePageHeader } from "@/components/EditablePageHeader";
import { OverviewStats } from "@/components/OverviewStats";

const quickLinks = [
  {
    href: "/lead-sources",
    title: "Lead Sources",
    body: "Manage where leads originate, what type of demand they create, and which stages they can enter directly."
  },
  {
    href: "/lifecycle-stages",
    title: "Lifecycle Stages",
    body: "Define each funnel stage, the expected behaviour, entry criteria, owners, and regression logic."
  },
  {
    href: "/lead-scoring",
    title: "Lead Scoring Model",
    body: "Maintain scoring signals, qualification thresholds, trigger conditions, and movement rules."
  }
];

export default function OverviewPage() {
  return (
    <main className="page">
      <EditablePageHeader
        slug="overview"
        label="Operating manual"
        fallbackTitle="Metrics & Measurement hub"
        fallbackIntro="A central source of truth for how Jungle leads enter, qualify, move, stall, recycle, and become opportunities."
      />

      <OverviewStats />

      <section className="sectionHeader">
        <div>
          <h2 className="sectionTitle">What this hub governs</h2>
          <p className="sectionNote">The rules that keep marketing, sales, and intermediary workflows speaking the same language.</p>
        </div>
      </section>

      <div className="grid grid2">
        <div className="card">
          <h3>Documentation</h3>
          <p>Definitions, decisions, and qualification rules are held in Supabase-backed records so the hub can evolve without code changes.</p>
        </div>
        <div className="card">
          <h3>Management</h3>
          <p>Admins can add, edit, archive, reorder, filter, and export the operating logic behind sources, stages, scores, and movements.</p>
        </div>
      </div>

      <section className="sectionHeader">
        <div>
          <h2 className="sectionTitle">Quick links</h2>
          <p className="sectionNote">Jump straight into the main managed sections.</p>
        </div>
      </section>

      <div className="grid grid3">
        {quickLinks.map((link) => (
          <Link className="quickCard" href={link.href} key={link.href}>
            <h3>{link.title}</h3>
            <p>{link.body}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
