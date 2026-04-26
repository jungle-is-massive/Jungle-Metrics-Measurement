"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { getSupabase, hasSupabaseConfig, type ColumnConfig, type DbRecord, type FieldConfig, type SelectOption } from "@/lib/supabase";
import { asText } from "@/lib/format";

type EntityManagerProps = {
  title: string;
  description: string;
  table: string;
  fields: FieldConfig[];
  columns: ColumnConfig[];
  orderBy?: string;
  searchFields?: string[];
  filterField?: string;
  filterLabel?: string;
  archiveField?: "status" | "is_active";
  groupedBy?: string;
};

const defaultValues: Record<string, string | number | boolean | null> = {
  status: "active",
  is_active: true,
  display_order: 100,
  stage_order: 100,
  repeatable: false,
  automatic: false,
  can_create_mql: false,
  can_create_sql: false,
  score_alone_sufficient: false
};

export function EntityManager({
  title,
  description,
  table,
  fields,
  columns,
  orderBy = "display_order",
  searchFields = ["name", "description"],
  filterField,
  filterLabel = "Filter",
  archiveField = "status",
  groupedBy
}: EntityManagerProps) {
  const [records, setRecords] = useState<DbRecord[]>([]);
  const [lookups, setLookups] = useState<Record<string, SelectOption[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [editing, setEditing] = useState<DbRecord | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const relationFields = useMemo(() => fields.filter((field) => field.relation), [fields]);

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    const supabase = getSupabase();
    if (!hasSupabaseConfig || !supabase) {
      setLoading(false);
      setError("Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then run the SQL seed.");
      return;
    }

    setLoading(true);
    setError(null);

    const lookupEntries = await Promise.all(
      relationFields.map(async (field) => {
        const relation = field.relation!;
        let query = supabase.from(relation.table).select("*");
        if (relation.orderField) query = query.order(relation.orderField, { ascending: true });
        const { data, error: lookupError } = await query;
        if (lookupError) throw lookupError;
        const options =
          data?.map((row) => ({
            label: String(row[relation.labelField] ?? "Untitled"),
            value: String(row[relation.valueField ?? "id"])
          })) ?? [];
        return [field.name, options] as const;
      })
    );

    const sortField = fields.some((field) => field.name === orderBy) ? orderBy : "created_at";
    const { data, error: recordsError } = await supabase.from(table).select("*").order(sortField, { ascending: true });
    if (recordsError) {
      setError(recordsError.message);
      setLoading(false);
      return;
    }

    setLookups(Object.fromEntries(lookupEntries));
    setRecords((data ?? []) as DbRecord[]);
    setLoading(false);
  }

  const filterOptions = useMemo(() => {
    if (!filterField) return [];
    const field = fields.find((candidate) => candidate.name === filterField);
    if (field?.options) return field.options;
    if (lookups[filterField]) return lookups[filterField];
    return Array.from(new Set(records.map((record) => record[filterField]).filter(Boolean))).map((value) => ({
      label: String(value),
      value: String(value)
    }));
  }, [fields, filterField, lookups, records]);

  const visibleRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((record) => {
      const archiveMatch =
        showArchived ||
        (archiveField === "status"
          ? String(record.status ?? "active") !== "archived"
          : record.is_active !== false);

      const filterMatch = !filterField || filterValue === "all" || String(record[filterField]) === filterValue;
      const searchMatch =
        !query ||
        searchFields.some((field) =>
          String(record[field] ?? "")
            .toLowerCase()
            .includes(query)
        );

      return archiveMatch && filterMatch && searchMatch;
    });
  }, [archiveField, filterField, filterValue, records, search, searchFields, showArchived]);

  const groupedRecords = useMemo(() => {
    if (!groupedBy) return { "": visibleRecords };
    return visibleRecords.reduce<Record<string, DbRecord[]>>((groups, record) => {
      const label = lookups[groupedBy] ? lookups[groupedBy].find((option) => option.value === record[groupedBy])?.label : record[groupedBy];
      const key = String(label ?? "Ungrouped");
      groups[key] = [...(groups[key] ?? []), record];
      return groups;
    }, {});
  }, [groupedBy, lookups, visibleRecords]);

  const startCreate = () => {
    const record = fields.reduce<DbRecord>((draft, field) => {
      draft[field.name] = defaultValues[field.name] ?? (field.type === "boolean" ? false : "");
      return draft;
    }, {});
    setEditing(record);
    setIsCreating(true);
  };

  const startEdit = (record: DbRecord) => {
    setEditing({ ...record });
    setIsCreating(false);
  };

  const updateDraft = (field: FieldConfig, value: string | boolean) => {
    setEditing((current) => {
      if (!current) return current;
      const normalized = field.type === "number" ? (value === "" ? null : Number(value)) : value;
      return { ...current, [field.name]: normalized };
    });
  };

  async function saveRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabase();
    if (!editing || !supabase) return;

    for (const field of fields) {
      if (field.required && (editing[field.name] === "" || editing[field.name] === null || editing[field.name] === undefined)) {
        setError(`${field.label} is required.`);
        return;
      }
    }

    setSaving(true);
    setError(null);

    const payload = Object.fromEntries(fields.map((field) => [field.name, editing[field.name] ?? null]));
    const result = isCreating
      ? await supabase.from(table).insert(payload).select().single()
      : await supabase.from(table).update(payload).eq("id", editing.id).select().single();

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    setEditing(null);
    setIsCreating(false);
    setSaving(false);
    await loadData();
  }

  async function archiveRecord(record: DbRecord) {
    const supabase = getSupabase();
    if (!supabase) return;
    const confirmed = window.confirm(`Archive "${asText(record.name, "this record")}"?`);
    if (!confirmed) return;

    setSaving(true);
    const payload = archiveField === "status" ? { status: "archived" } : { is_active: false };
    const { error: archiveError } = await supabase.from(table).update(payload).eq("id", record.id);
    setSaving(false);
    if (archiveError) {
      setError(archiveError.message);
      return;
    }
    await loadData();
  }

  async function hardDelete(record: DbRecord) {
    const supabase = getSupabase();
    if (!supabase) return;
    const confirmed = window.confirm(`Permanently delete "${asText(record.name, "this record")}"? This cannot be undone.`);
    if (!confirmed) return;

    setSaving(true);
    const { error: deleteError } = await supabase.from(table).delete().eq("id", record.id);
    setSaving(false);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    await loadData();
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(visibleRecords, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${table}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section>
      <div className="sectionHeader">
        <div>
          <h2 className="sectionTitle">{title}</h2>
          <p className="sectionNote">{description}</p>
        </div>
        <button className="button" onClick={startCreate} disabled={!hasSupabaseConfig}>
          Add record
        </button>
      </div>

      <div className="toolbar">
        <div className="toolbarGroup">
          <input className="input" style={{ width: 240 }} placeholder="Search records" value={search} onChange={(event) => setSearch(event.target.value)} />
          {filterField && (
            <select className="select" style={{ width: 220 }} value={filterValue} onChange={(event) => setFilterValue(event.target.value)} aria-label={filterLabel}>
              <option value="all">All {filterLabel.toLowerCase()}</option>
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
          <button className="button buttonSecondary" onClick={() => setShowArchived((current) => !current)}>
            {showArchived ? "Hide archived" : "Show archived"}
          </button>
        </div>
        <button className="button buttonSecondary" onClick={exportJson} disabled={!visibleRecords.length}>
          Export JSON
        </button>
      </div>

      {error && <div className="errorState tableWrap">{error}</div>}
      {loading && <div className="loadingState tableWrap">Loading records...</div>}
      {!loading && !visibleRecords.length && !error && <div className="emptyState tableWrap">No records match this view yet.</div>}

      {!loading &&
        Object.entries(groupedRecords).map(([group, groupRecords]) => (
          <div key={group || "records"} style={{ marginBottom: 18 }}>
            {group && <div className="eyebrow" style={{ marginTop: 20 }}>{group}</div>}
            <div className="tableWrap">
              <table className="table">
                {columns.some((column) => column.width) && (
                  <colgroup>
                    {columns.map((column) => (
                      <col key={column.key} style={{ width: column.width }} />
                    ))}
                    <col style={{ width: "72px" }} />
                  </colgroup>
                )}
                <thead>
                  <tr>
                    {columns.map((column) => (
                      <th key={column.key}>{column.label}</th>
                    ))}
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {groupRecords.map((record) => (
                    <tr key={String(record.id)}>
                      {columns.map((column) => (
                        <td key={column.key}>{column.render ? column.render(record, lookups) : asText(record[column.key])}</td>
                      ))}
                      <td>
                        <div className="rowActions">
                          <button className="actionIconBtn" onClick={() => startEdit(record)} title="Edit" aria-label={`Edit ${asText(record.name, "record")}`}>
                            ✏️
                          </button>
                          <button className="actionIconBtn actionIconBtnDelete" onClick={() => archiveRecord(record)} disabled={saving} title="Archive" aria-label={`Archive ${asText(record.name, "record")}`}>
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

      {editing && (
        <div className="modalBackdrop" role="dialog" aria-modal="true">
          <form className="modalPanel" onSubmit={saveRecord}>
            <div className="modalHeader">
              <h2 className="modalTitle">{isCreating ? `Add ${title}` : `Edit ${asText(editing.name, title)}`}</h2>
              <button type="button" className="button buttonSecondary" onClick={() => setEditing(null)}>
                Close
              </button>
            </div>
            <div className="formGrid">
              {fields.map((field) => {
                const options = field.options ?? lookups[field.name] ?? [];
                return (
                  <label key={field.name} className={`field ${field.full ? "fieldFull" : ""}`}>
                    <span className="fieldLabel">{field.label}{field.required ? " *" : ""}</span>
                    {field.type === "textarea" ? (
                      <textarea className="textarea" value={String(editing[field.name] ?? "")} onChange={(event) => updateDraft(field, event.target.value)} />
                    ) : field.type === "select" ? (
                      <select className="select" value={String(editing[field.name] ?? "")} onChange={(event) => updateDraft(field, event.target.value)}>
                        <option value="">Select...</option>
                        {options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "boolean" ? (
                      <span className="checkboxRow">
                        <input type="checkbox" checked={Boolean(editing[field.name])} onChange={(event) => updateDraft(field, event.target.checked)} />
                        Enabled
                      </span>
                    ) : (
                      <input
                        className="input"
                        type={field.type === "number" ? "number" : "text"}
                        value={editing[field.name] === null || editing[field.name] === undefined ? "" : String(editing[field.name])}
                        onChange={(event) => updateDraft(field, event.target.value)}
                      />
                    )}
                  </label>
                );
              })}
            </div>
            <div className="formFooter">
              <button type="button" className="button buttonSecondary" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button type="submit" className="button" disabled={saving}>
                {saving ? "Saving..." : "Save record"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

