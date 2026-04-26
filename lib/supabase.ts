import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ReactNode } from "react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let browserClient: SupabaseClient<any, "public", any> | null = null;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

export function getSupabase() {
  if (!hasSupabaseConfig) return null;
  if (!browserClient) {
    browserClient = createClient<any, "public", any>(supabaseUrl as string, supabaseAnonKey as string);
  }
  return browserClient;
}

export type DbRecord = Record<string, string | number | boolean | null>;

export type SelectOption = {
  label: string;
  value: string;
};

export type FieldConfig = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "boolean" | "select";
  required?: boolean;
  full?: boolean;
  options?: SelectOption[];
  relation?: {
    table: string;
    labelField: string;
    valueField?: string;
    orderField?: string;
  };
};

export type ColumnConfig = {
  key: string;
  label: string;
  width?: string;
  render?: (record: DbRecord, lookups: Record<string, SelectOption[]>) => ReactNode;
};
