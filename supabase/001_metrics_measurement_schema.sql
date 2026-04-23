create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.hub_pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  intro text not null,
  body jsonb,
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lead_source_categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text,
  display_order int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lead_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_id uuid references public.lead_source_categories(id) on delete set null,
  description text,
  examples text,
  expected_lead_type text,
  expected_entry_stage text,
  can_create_mql boolean not null default false,
  can_create_sql boolean not null default false,
  notes text,
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  display_order int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lifecycle_stages (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  stage_order int not null,
  short_definition text not null,
  full_definition text,
  expected_behaviour text,
  entry_criteria text,
  support_criteria text,
  regression_criteria text,
  owner_team text,
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scoring_rule_groups (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text,
  display_order int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scoring_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rule_group_id uuid references public.scoring_rule_groups(id) on delete set null,
  source_area text,
  behaviour_key text,
  description text,
  points int not null default 0,
  frequency_cap int,
  recency_days int,
  repeatable boolean not null default false,
  is_active boolean not null default true,
  notes text,
  display_order int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.threshold_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  score_min int not null,
  score_max int,
  target_stage_id uuid references public.lifecycle_stages(id) on delete set null,
  description text,
  score_alone_sufficient boolean not null default false,
  required_trigger text,
  optional_trigger text,
  is_active boolean not null default true,
  display_order int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.movement_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  from_stage_id uuid references public.lifecycle_stages(id) on delete set null,
  to_stage_id uuid references public.lifecycle_stages(id) on delete set null,
  direction text not null check (direction in ('forward', 'backward', 'disqualify', 'recycle')),
  trigger_type text not null check (trigger_type in ('score', 'activity', 'inactivity', 'manual', 'workflow')),
  trigger_condition text not null,
  description text,
  automatic boolean not null default false,
  sla_note text,
  owner text,
  is_active boolean not null default true,
  display_order int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists lead_sources_name_unique on public.lead_sources (name);
create unique index if not exists scoring_rules_behaviour_key_unique on public.scoring_rules (behaviour_key);
create unique index if not exists threshold_rules_name_unique on public.threshold_rules (name);
create unique index if not exists movement_rules_name_unique on public.movement_rules (name);

drop trigger if exists set_hub_pages_updated_at on public.hub_pages;
create trigger set_hub_pages_updated_at before update on public.hub_pages for each row execute function public.set_updated_at();
drop trigger if exists set_lead_source_categories_updated_at on public.lead_source_categories;
create trigger set_lead_source_categories_updated_at before update on public.lead_source_categories for each row execute function public.set_updated_at();
drop trigger if exists set_lead_sources_updated_at on public.lead_sources;
create trigger set_lead_sources_updated_at before update on public.lead_sources for each row execute function public.set_updated_at();
drop trigger if exists set_lifecycle_stages_updated_at on public.lifecycle_stages;
create trigger set_lifecycle_stages_updated_at before update on public.lifecycle_stages for each row execute function public.set_updated_at();
drop trigger if exists set_scoring_rule_groups_updated_at on public.scoring_rule_groups;
create trigger set_scoring_rule_groups_updated_at before update on public.scoring_rule_groups for each row execute function public.set_updated_at();
drop trigger if exists set_scoring_rules_updated_at on public.scoring_rules;
create trigger set_scoring_rules_updated_at before update on public.scoring_rules for each row execute function public.set_updated_at();
drop trigger if exists set_threshold_rules_updated_at on public.threshold_rules;
create trigger set_threshold_rules_updated_at before update on public.threshold_rules for each row execute function public.set_updated_at();
drop trigger if exists set_movement_rules_updated_at on public.movement_rules;
create trigger set_movement_rules_updated_at before update on public.movement_rules for each row execute function public.set_updated_at();

alter table public.hub_pages enable row level security;
alter table public.lead_source_categories enable row level security;
alter table public.lead_sources enable row level security;
alter table public.lifecycle_stages enable row level security;
alter table public.scoring_rule_groups enable row level security;
alter table public.scoring_rules enable row level security;
alter table public.threshold_rules enable row level security;
alter table public.movement_rules enable row level security;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'hub_pages',
    'lead_source_categories',
    'lead_sources',
    'lifecycle_stages',
    'scoring_rule_groups',
    'scoring_rules',
    'threshold_rules',
    'movement_rules'
  ]
  loop
    execute format('drop policy if exists "Public read %1$s" on public.%1$I', table_name);
    execute format('drop policy if exists "Public insert %1$s" on public.%1$I', table_name);
    execute format('drop policy if exists "Public update %1$s" on public.%1$I', table_name);
    execute format('drop policy if exists "Public delete %1$s" on public.%1$I', table_name);
    execute format('create policy "Public read %1$s" on public.%1$I for select using (true)', table_name);
    execute format('create policy "Public insert %1$s" on public.%1$I for insert with check (true)', table_name);
    execute format('create policy "Public update %1$s" on public.%1$I for update using (true) with check (true)', table_name);
    execute format('create policy "Public delete %1$s" on public.%1$I for delete using (true)', table_name);
  end loop;
end;
$$;

insert into public.hub_pages (slug, title, intro, body, status) values
  ('overview', 'Metrics & Measurement hub', 'A central source of truth for how Jungle leads enter, qualify, move, stall, recycle, and become opportunities.', '{"governs":["lead sources","lifecycle stages","lead scoring","thresholds","movement rules"]}', 'active'),
  ('lead-sources', 'Lead Sources', 'Document where leads and opportunities come from, how each source behaves, and which funnel entry points are allowed.', null, 'active'),
  ('lifecycle-stages', 'Lifecycle Stages', 'Define the stages of the funnel, what behaviour is expected in each one, and what qualifies or regresses a lead.', null, 'active'),
  ('lead-scoring', 'Lead Scoring Model', 'Manage the point model, qualification thresholds, trigger conditions, and funnel movement rules from one place.', null, 'active')
on conflict (slug) do update set
  title = excluded.title,
  intro = excluded.intro,
  body = excluded.body,
  status = excluded.status;

insert into public.lead_source_categories (name, description, display_order) values
  ('Owned', 'Channels Jungle directly owns and operates.', 10),
  ('Outbound', 'Proactive sales or growth outreach.', 20),
  ('Inbound', 'Demand that arrives via forms, content, or direct enquiry.', 30),
  ('Intermediaries', 'Introductions or opportunities managed through intermediary partners.', 40),
  ('Referrals / Network', 'Introductions from Jungle relationships and existing network.', 50),
  ('Paid', 'Paid acquisition and campaign-led sources.', 60),
  ('Partnerships', 'Joint activity with partners and complementary businesses.', 70),
  ('Events', 'In-person or virtual events, webinars, roundtables, and launches.', 80)
on conflict (name) do update set description = excluded.description, display_order = excluded.display_order;

insert into public.lifecycle_stages (name, stage_order, short_definition, full_definition, expected_behaviour, entry_criteria, support_criteria, regression_criteria, owner_team, status) values
  ('Subscriber', 10, 'Known contact with permission to receive communications.', 'A person who has opted into owned communications but has not yet shown enough buying intent to become a qualified lead.', 'Receive relevant nurture, content, and event invitations.', 'Opted into a list, subscribed, registered interest, or imported with valid permission.', 'Engagement with newsletters, content, or events.', 'Unsubscribe, invalid email, or explicit opt-out.', 'Marketing', 'active'),
  ('Lead', 20, 'Known contact with identifiable interest or source context.', 'A lead has entered Jungle systems through a known source and has enough context to be nurtured, scored, or routed.', 'Be scored, enriched, segmented, and moved toward MQL when intent increases.', 'Known source, contact record, and at least one meaningful interaction or origin.', 'ICP fit, content engagement, event attendance, or referral source quality.', 'No engagement, poor fit, invalid data, or explicit not interested.', 'Marketing', 'active'),
  ('MQL', 30, 'Marketing-qualified lead with enough fit or intent for closer review.', 'An MQL has reached a meaningful score or trigger threshold and should be validated for sales readiness.', 'Receive timely sales review, qualification, or tailored nurture.', 'Score threshold, strong intent trigger, or manual marketing validation.', 'Multiple high-intent behaviours, relevant company fit, or intermediary intro.', 'Inactivity, negative signal, no ICP fit, or sales rejection.', 'Marketing + Sales', 'active'),
  ('SQL', 40, 'Sales-qualified lead ready for active sales engagement.', 'An SQL has been validated by sales or has completed a trigger that justifies direct commercial follow-up.', 'Be worked by sales with a clear next action and SLA.', 'Meeting booked, reply received, manual sales validation, or high score plus trigger.', 'Budget/timing signals, senior stakeholder, or active problem statement.', 'No engagement after SLA, no need, no authority, or poor fit.', 'Sales', 'active'),
  ('Opportunity', 50, 'Qualified commercial opportunity with a deal record.', 'An opportunity exists when there is a clear commercial motion, deal record, and expected path to close.', 'Progress through pipeline stages with defined owner, value, and next step.', 'Deal created or opportunity manually confirmed by sales.', 'Clear scope, timing, decision process, or proposal requested.', 'Deal lost, unqualified, no decision, or stalled beyond pipeline rules.', 'Sales', 'active'),
  ('Customer', 60, 'Closed-won organisation or contact relationship.', 'A customer has converted through a won deal and should be retained, expanded, and measured separately from prospecting flows.', 'Move into customer lifecycle, onboarding, account management, and expansion tracking.', 'Closed-won deal or manually confirmed customer status.', 'Signed agreement, payment, onboarding, or active delivery.', 'Churn, account closure, or incorrect classification.', 'Client Services', 'active'),
  ('Disqualified', 90, 'Record should not progress through the active funnel.', 'A contact or company is disqualified when it is not a fit, not contactable, opted out, or should not be worked commercially.', 'Remain visible for governance but excluded from active qualification workflows.', 'Manual disqualification, not ICP, explicit no, invalid contact, competitor, or compliance reason.', 'Reason code, owner note, or supporting evidence.', 'Can be recycled only through explicit manual review.', 'Marketing Ops', 'active')
on conflict (name) do update set
  stage_order = excluded.stage_order,
  short_definition = excluded.short_definition,
  full_definition = excluded.full_definition,
  expected_behaviour = excluded.expected_behaviour,
  entry_criteria = excluded.entry_criteria,
  support_criteria = excluded.support_criteria,
  regression_criteria = excluded.regression_criteria,
  owner_team = excluded.owner_team,
  status = excluded.status;

insert into public.scoring_rule_groups (name, description, display_order) values
  ('positive', 'Signals that increase lead score and indicate fit or intent.', 10),
  ('negative', 'Signals that reduce lead score or indicate poor fit, inactivity, or opt-out.', 20)
on conflict (name) do update set description = excluded.description, display_order = excluded.display_order;

insert into public.lead_sources (name, category_id, description, examples, expected_lead_type, expected_entry_stage, can_create_mql, can_create_sql, notes, status, display_order) values
  ('Social Maturity Index Event', (select id from public.lead_source_categories where name = 'Events'), 'Contacts generated through Jungle social maturity events and related follow-up.', 'Attendee list, post-event meeting request, event content download.', 'Brand or marketing leader with event context.', 'Lead', true, false, 'Can become MQL directly when attendance is paired with a high-fit company.', 'active', 10),
  ('Webinar', (select id from public.lead_source_categories where name = 'Events'), 'Virtual event registrations and attendees.', 'Registration, attendance, question asked, replay watched.', 'Engaged contact with topic-level interest.', 'Subscriber', true, false, 'Attendance should score higher than registration alone.', 'active', 20),
  ('Website Contact Form', (select id from public.lead_source_categories where name = 'Inbound'), 'Direct inbound enquiries via the Jungle website.', 'Contact us, talk to sales, proposal enquiry.', 'High-intent inbound lead.', 'MQL', true, true, 'Route quickly when message suggests a commercial need.', 'active', 30),
  ('Downloadable Report', (select id from public.lead_source_categories where name = 'Owned'), 'Report, guide, or index downloads from owned content.', 'PDF report download, gated insight request.', 'Content-engaged lead.', 'Lead', false, false, 'Use recency and repeat behaviour before qualifying.', 'active', 40),
  ('LinkedIn Outreach', (select id from public.lead_source_categories where name = 'Outbound'), 'Sales-led prospecting through LinkedIn.', 'Connection accepted, reply, booked call.', 'Target account prospect.', 'Lead', false, true, 'A booked meeting can qualify directly to SQL.', 'active', 50),
  ('Cold Email', (select id from public.lead_source_categories where name = 'Outbound'), 'Outbound email sequences and replies.', 'Opened sequence, clicked case study, replied.', 'Target account prospect.', 'Lead', false, true, 'Reply quality determines qualification.', 'active', 60),
  ('Referral', (select id from public.lead_source_categories where name = 'Referrals / Network'), 'Introductions from trusted people in Jungle network.', 'Founder referral, client intro, partner recommendation.', 'Warm referred lead.', 'MQL', true, true, 'Strong referrals may bypass MQL after sales validation.', 'active', 70),
  ('AAR', (select id from public.lead_source_categories where name = 'Intermediaries'), 'Intermediary opportunities from AAR.', 'Agency review intro, chemistry meeting, brief alert.', 'Intermediary-led opportunity.', 'SQL', true, true, 'Typically requires immediate owner assignment.', 'active', 80),
  ('Ingenuity', (select id from public.lead_source_categories where name = 'Intermediaries'), 'Intermediary opportunities from Ingenuity.', 'Brand intro, intermediary briefing, shortlist.', 'Intermediary-led opportunity.', 'SQL', true, true, 'Track source quality separately from direct inbound.', 'active', 90),
  ('Creativebrief', (select id from public.lead_source_categories where name = 'Intermediaries'), 'Intermediary or platform-led briefs from Creativebrief.', 'Pitch brief, chemistry invite, capability request.', 'Brief-led opportunity.', 'SQL', true, true, 'Often enters close to opportunity stage.', 'active', 100),
  ('Paid Social', (select id from public.lead_source_categories where name = 'Paid'), 'Paid campaigns driving traffic, registrations, or content downloads.', 'LinkedIn lead gen form, paid report campaign.', 'Campaign-sourced lead.', 'Subscriber', false, false, 'Needs source campaign metadata for later scoring.', 'active', 110),
  ('Partner Intro', (select id from public.lead_source_categories where name = 'Partnerships'), 'Introductions through partner organisations or joint activity.', 'Partner referral, co-hosted event intro, alliance lead.', 'Partner-sourced lead.', 'Lead', true, false, 'Qualification depends on partner context and ICP fit.', 'active', 120)
on conflict do nothing;

insert into public.scoring_rules (name, rule_group_id, source_area, behaviour_key, description, points, frequency_cap, recency_days, repeatable, is_active, notes, display_order) values
  ('Email open', (select id from public.scoring_rule_groups where name = 'positive'), 'email', 'email_open', 'Contact opens a marketing or sales email.', 2, 3, 14, true, true, 'Low-intent signal; cap to avoid inflated scores.', 10),
  ('Email click', (select id from public.scoring_rule_groups where name = 'positive'), 'email', 'email_click', 'Contact clicks a link in a marketing or sales email.', 5, 4, 30, true, true, 'Higher intent than open.', 20),
  ('Form submission', (select id from public.scoring_rule_groups where name = 'positive'), 'website', 'form_submission', 'Contact submits a non-sales form.', 10, 2, 45, true, true, 'Use higher values for direct enquiry forms.', 30),
  ('Webinar registration', (select id from public.scoring_rule_groups where name = 'positive'), 'event', 'webinar_registration', 'Contact registers for a webinar or virtual event.', 8, 2, 45, true, true, null, 40),
  ('Webinar attendance', (select id from public.scoring_rule_groups where name = 'positive'), 'event', 'webinar_attendance', 'Contact attends a webinar or event.', 15, 2, 60, true, true, 'Attendance indicates stronger topic engagement.', 50),
  ('Report download', (select id from public.scoring_rule_groups where name = 'positive'), 'website', 'report_download', 'Contact downloads a report or gated content.', 12, 3, 60, true, true, null, 60),
  ('Contact form submission', (select id from public.scoring_rule_groups where name = 'positive'), 'website', 'contact_form_submission', 'Contact submits a direct commercial enquiry.', 30, 1, 90, false, true, 'Can be a supporting trigger for SQL readiness.', 70),
  ('Reply to outreach', (select id from public.scoring_rule_groups where name = 'positive'), 'outbound', 'outreach_reply', 'Contact replies to outbound sales outreach.', 20, 2, 60, true, true, 'Qualify reply intent before moving stage.', 80),
  ('Meeting booked', (select id from public.scoring_rule_groups where name = 'positive'), 'deal activity', 'meeting_booked', 'A meeting is booked with sales or growth.', 35, 1, 90, false, true, 'Primary SQL trigger.', 90),
  ('Intermediary introduction', (select id from public.scoring_rule_groups where name = 'positive'), 'intermediary', 'intermediary_intro', 'Contact or company is introduced by an intermediary.', 30, 1, 90, false, true, 'Often bypasses normal nurture when brief quality is high.', 100),
  ('No engagement for 30 days', (select id from public.scoring_rule_groups where name = 'negative'), 'manual', 'no_engagement_30_days', 'No meaningful engagement for 30 days.', -10, 1, 30, true, true, 'May trigger nurture or recycle depending on stage.', 200),
  ('Unsubscribe', (select id from public.scoring_rule_groups where name = 'negative'), 'email', 'unsubscribe', 'Contact unsubscribes from communications.', -50, 1, null, false, true, 'Should also update communication eligibility.', 210),
  ('Explicit not interested', (select id from public.scoring_rule_groups where name = 'negative'), 'manual', 'not_interested', 'Contact explicitly says they are not interested.', -40, 1, null, false, true, 'May disqualify or recycle based on reason.', 220)
on conflict do nothing;

insert into public.threshold_rules (name, score_min, score_max, target_stage_id, description, score_alone_sufficient, required_trigger, optional_trigger, is_active, display_order) values
  ('Lead: 0-39', 0, 39, (select id from public.lifecycle_stages where name = 'Lead'), 'Record should remain a lead while score indicates light engagement or early-stage interest.', true, null, 'ICP fit or recent engagement can prioritise nurture.', true, 10),
  ('MQL: 40-69', 40, 69, (select id from public.lifecycle_stages where name = 'MQL'), 'Record becomes marketing-qualified when score demonstrates meaningful fit or intent.', true, null, 'Content cluster engagement, event attendance, or referral context.', true, 20),
  ('SQL-ready: 70+ plus trigger', 70, null, (select id from public.lifecycle_stages where name = 'SQL'), 'Record is ready for sales when score is high and a sales-validating trigger exists.', false, 'meeting booked, reply received, form completed, intermediary intro, deal created, or manual sales validation', 'ICP fit and seniority strengthen priority.', true, 30)
on conflict do nothing;

insert into public.movement_rules (name, from_stage_id, to_stage_id, direction, trigger_type, trigger_condition, description, automatic, sla_note, owner, is_active, display_order) values
  ('Lead to MQL', (select id from public.lifecycle_stages where name = 'Lead'), (select id from public.lifecycle_stages where name = 'MQL'), 'forward', 'score', 'score >= 40', 'Move a lead to MQL once the score reaches the first qualification threshold.', true, 'Review daily.', 'Marketing Ops', true, 10),
  ('MQL to SQL', (select id from public.lifecycle_stages where name = 'MQL'), (select id from public.lifecycle_stages where name = 'SQL'), 'forward', 'activity', 'score >= 70 and meeting booked or reply received', 'Move to SQL when a high score is paired with a sales-validating trigger.', true, 'Sales review within 1 working day.', 'Sales', true, 20),
  ('SQL to Opportunity', (select id from public.lifecycle_stages where name = 'SQL'), (select id from public.lifecycle_stages where name = 'Opportunity'), 'forward', 'workflow', 'deal record exists', 'Create or confirm opportunity status when a deal record exists.', true, 'Confirm owner and next step immediately.', 'Sales', true, 30),
  ('MQL to Lead on inactivity', (select id from public.lifecycle_stages where name = 'MQL'), (select id from public.lifecycle_stages where name = 'Lead'), 'backward', 'inactivity', 'no meaningful engagement in 45 days', 'Regress MQLs that stall without sales-validating activity.', true, 'Run weekly.', 'Marketing Ops', true, 40),
  ('SQL to Lead on inactivity', (select id from public.lifecycle_stages where name = 'SQL'), (select id from public.lifecycle_stages where name = 'Lead'), 'backward', 'inactivity', 'no engagement in 60 days and no open deal', 'Return inactive SQLs to lead nurture when there is no active opportunity.', false, 'Sales owner review before regression.', 'Sales', true, 50),
  ('Any to Disqualified when not ICP', null, (select id from public.lifecycle_stages where name = 'Disqualified'), 'disqualify', 'manual', 'not ICP, invalid contact, competitor, explicit no, or compliance reason', 'Disqualify records that should not continue in active funnel workflows.', false, 'Require reason note.', 'Marketing Ops', true, 60)
on conflict do nothing;
