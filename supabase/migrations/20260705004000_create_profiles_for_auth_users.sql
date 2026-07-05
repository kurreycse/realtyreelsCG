-- Keep public.profiles aligned with Supabase Auth users created from the app.

create or replace function public.create_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    first_name,
    last_name,
    phone,
    email,
    is_admin
  )
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'first_name', ''), ''),
    coalesce(nullif(new.raw_user_meta_data->>'last_name', ''), ''),
    nullif(coalesce(new.raw_user_meta_data->>'phone', new.phone), ''),
    coalesce(new.email, nullif(new.raw_user_meta_data->>'email', '')),
    false
  )
  on conflict (id) do update
  set first_name = coalesce(nullif(excluded.first_name, ''), public.profiles.first_name),
      last_name = coalesce(nullif(excluded.last_name, ''), public.profiles.last_name),
      phone = coalesce(excluded.phone, public.profiles.phone),
      email = coalesce(excluded.email, public.profiles.email),
      updated_at = now();

  return new;
end;
$$;

drop trigger if exists create_profile_for_auth_user_trigger on auth.users;
create trigger create_profile_for_auth_user_trigger
after insert or update of email, phone, raw_user_meta_data on auth.users
for each row execute function public.create_profile_for_auth_user();

insert into public.profiles (
  id,
  first_name,
  last_name,
  phone,
  email,
  is_admin
)
select
  auth_user.id,
  coalesce(nullif(auth_user.raw_user_meta_data->>'first_name', ''), existing_profile.first_name, ''),
  coalesce(nullif(auth_user.raw_user_meta_data->>'last_name', ''), existing_profile.last_name, ''),
  coalesce(nullif(auth_user.raw_user_meta_data->>'phone', ''), auth_user.phone, existing_profile.phone),
  coalesce(auth_user.email, existing_profile.email),
  coalesce(existing_profile.is_admin, false)
from auth.users as auth_user
left join public.profiles as existing_profile on existing_profile.id = auth_user.id
where auth_user.deleted_at is null
on conflict (id) do update
set first_name = coalesce(nullif(excluded.first_name, ''), public.profiles.first_name),
    last_name = coalesce(nullif(excluded.last_name, ''), public.profiles.last_name),
    phone = coalesce(excluded.phone, public.profiles.phone),
    email = coalesce(excluded.email, public.profiles.email),
    updated_at = now();
