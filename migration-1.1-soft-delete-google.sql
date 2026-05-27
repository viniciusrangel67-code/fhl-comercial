alter table users add column if not exists google_subject text unique;
alter table users add column if not exists google_picture text;
alter table users add column if not exists google_domain text;
alter table users add column if not exists last_login_at timestamptz;
alter table users alter column password_hash drop not null;
alter table users add column if not exists deleted_at timestamptz;
alter table users add column if not exists deleted_by uuid references users(id);
alter table users add column if not exists deleted_reason text;

alter table clients add column if not exists deleted_at timestamptz;
alter table clients add column if not exists deleted_by uuid references users(id);
alter table clients add column if not exists deleted_reason text;

alter table processes add column if not exists deleted_at timestamptz;
alter table processes add column if not exists deleted_by uuid references users(id);
alter table processes add column if not exists deleted_reason text;

alter table tasks add column if not exists deleted_at timestamptz;
alter table tasks add column if not exists deleted_by uuid references users(id);
alter table tasks add column if not exists deleted_reason text;

alter table finance_entries add column if not exists deleted_at timestamptz;
alter table finance_entries add column if not exists deleted_by uuid references users(id);
alter table finance_entries add column if not exists deleted_reason text;

alter table documents add column if not exists deleted_at timestamptz;
alter table documents add column if not exists deleted_by uuid references users(id);
alter table documents add column if not exists deleted_reason text;

alter table lgpd_records add column if not exists deleted_at timestamptz;
alter table lgpd_records add column if not exists deleted_by uuid references users(id);
alter table lgpd_records add column if not exists deleted_reason text;

create index if not exists idx_users_email on users(lower(email));
create index if not exists idx_users_google_subject on users(google_subject);
