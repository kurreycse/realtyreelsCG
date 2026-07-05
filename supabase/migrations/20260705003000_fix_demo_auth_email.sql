-- Move the demo auth account off a rejected .local email domain.

do $$
declare
  demo_owner uuid := '2030f801-eb58-4e71-a519-68706a506917';
  demo_email text := 'demo@example.com';
begin
  update auth.users
  set email = demo_email,
      raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('email', demo_email),
      updated_at = now()
  where id = demo_owner;

  update auth.identities
  set provider_id = demo_email,
      identity_data = coalesce(identity_data, '{}'::jsonb) || jsonb_build_object('email', demo_email, 'sub', demo_owner::text),
      updated_at = now()
  where user_id = demo_owner
    and provider = 'email';

  update public.profiles
  set email = demo_email,
      updated_at = now()
  where id = demo_owner;
end $$;
