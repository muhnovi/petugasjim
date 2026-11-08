alter table public.weekly_schedules
  drop constraint if exists weekly_schedules_day_of_week_key;

alter table public.weekly_schedules
  drop constraint if exists weekly_schedules_day_officer_key;

alter table public.weekly_schedules
  add constraint weekly_schedules_day_officer_key unique (day_of_week, officer_id);
