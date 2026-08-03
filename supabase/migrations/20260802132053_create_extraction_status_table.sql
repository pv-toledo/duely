create table extraction_status (
    key text primary key,
    paused_until timestamptz,
    updated_at timestamptz not null default now()
);

alter table extraction_status enable row level security;
create policy extraction_status_read_all
on extraction_status
for select
to authenticated
using (true);