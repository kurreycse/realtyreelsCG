-- Centralized duplicate checks for app account signup.

create or replace function public.normalize_account_phone(value text)
returns text
language sql
immutable
as $$
  select case
    when length(cleaned.digits) > 10 then right(cleaned.digits, 10)
    else cleaned.digits
  end
  from (
    select regexp_replace(coalesce(value, ''), '[^0-9]', '', 'g') as digits
  ) as cleaned;
$$;

create or replace function public.find_account_duplicates(check_email text, check_phone text)
returns table(email_exists boolean, phone_exists boolean)
language sql
stable
security definer
set search_path = public, auth
as $$
  with normalized as (
    select
      lower(trim(coalesce(check_email, ''))) as email,
      public.normalize_account_phone(check_phone) as phone
  )
  select
    exists (
      select 1
      from public.profiles p, normalized n
      where n.email <> ''
        and lower(trim(coalesce(p.email, ''))) = n.email
    )
    or exists (
      select 1
      from auth.users u, normalized n
      where n.email <> ''
        and u.deleted_at is null
        and lower(trim(coalesce(u.email, ''))) = n.email
    ) as email_exists,
    exists (
      select 1
      from public.profiles p, normalized n
      where n.phone <> ''
        and public.normalize_account_phone(p.phone) = n.phone
    )
    or exists (
      select 1
      from auth.users u, normalized n
      where n.phone <> ''
        and u.deleted_at is null
        and public.normalize_account_phone(u.phone) = n.phone
    ) as phone_exists;
$$;

revoke all on function public.find_account_duplicates(text, text) from public;
grant execute on function public.find_account_duplicates(text, text) to service_role;
