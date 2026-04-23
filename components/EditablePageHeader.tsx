"use client";

import { FormEvent, useEffect, useState } from "react";
import { getSupabase, hasSupabaseConfig, type DbRecord } from "@/lib/supabase";
import { PageHeader } from "@/components/PageHeader";

type EditablePageHeaderProps = {
  slug: string;
  label: string;
  fallbackTitle: string;
  fallbackIntro: string;
};

export function EditablePageHeader({ slug, label, fallbackTitle, fallbackIntro }: EditablePageHeaderProps) {
  const [page, setPage] = useState<DbRecord | null>(null);
  const [draft, setDraft] = useState({ title: fallbackTitle, intro: fallbackIntro });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const title = String(page?.title ?? fallbackTitle);
  const intro = String(page?.intro ?? fallbackIntro);

  useEffect(() => {
    async function loadPage() {
      const supabase = getSupabase();
      if (!supabase) return;
      const { data } = await supabase.from("hub_pages").select("*").eq("slug", slug).maybeSingle();
      if (data) {
        setPage(data as DbRecord);
        setDraft({ title: String(data.title ?? fallbackTitle), intro: String(data.intro ?? fallbackIntro) });
      }
    }
    void loadPage();
  }, [fallbackIntro, fallbackTitle, slug]);

  async function savePage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabase();
    if (!supabase) return;
    setSaving(true);
    const payload = {
      slug,
      title: draft.title,
      intro: draft.intro,
      status: "active"
    };
    const { data, error } = await supabase.from("hub_pages").upsert(payload, { onConflict: "slug" }).select().single();
    setSaving(false);
    if (!error && data) {
      setPage(data as DbRecord);
      setEditing(false);
    }
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
        <PageHeader label={label} title={title} intro={intro} />
        <button className="button buttonSecondary" style={{ flex: "0 0 auto", marginTop: 8 }} onClick={() => setEditing(true)} disabled={!hasSupabaseConfig}>
          Edit intro
        </button>
      </div>
      {editing && (
        <div className="modalBackdrop" role="dialog" aria-modal="true">
          <form className="modalPanel" onSubmit={savePage}>
            <div className="modalHeader">
              <h2 className="modalTitle">Edit page intro</h2>
              <button type="button" className="button buttonSecondary" onClick={() => setEditing(false)}>
                Close
              </button>
            </div>
            <div className="formGrid">
              <label className="field fieldFull">
                <span className="fieldLabel">Title</span>
                <input className="input" value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} />
              </label>
              <label className="field fieldFull">
                <span className="fieldLabel">Intro</span>
                <textarea className="textarea" value={draft.intro} onChange={(event) => setDraft((current) => ({ ...current, intro: event.target.value }))} />
              </label>
            </div>
            <div className="formFooter">
              <button type="button" className="button buttonSecondary" onClick={() => setEditing(false)}>
                Cancel
              </button>
              <button className="button" disabled={saving}>
                {saving ? "Saving..." : "Save intro"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
