ALTER TABLE public.deadlines
  ADD column reminder_offset_days INTEGER;

ALTER TABLE public.deadlines
  ADD CONSTRAINT deadlines_reminder_offset_days_check
  check (reminder_offset_days IS NULL OR reminder_offset_days >= 0);

ALTER TABLE public.deadlines
  ALTER column reminder_offset_days SET DEFAULT 3;