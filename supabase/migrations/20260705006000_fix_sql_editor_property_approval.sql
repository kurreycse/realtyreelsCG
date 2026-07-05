-- Allow Supabase SQL editor/service-role approvals to create review history.
-- In those contexts auth.uid() is null, so we resolve to an existing admin profile.

create or replace function public.resolve_review_admin_id(explicit_admin_id uuid default null)
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  resolved_admin_id uuid;
begin
  if explicit_admin_id is not null then
    select id
    into resolved_admin_id
    from public.profiles
    where id = explicit_admin_id
      and is_admin = true;

    if resolved_admin_id is not null then
      return resolved_admin_id;
    end if;

    raise exception 'Reviewer % is not an admin profile.', explicit_admin_id;
  end if;

  if auth.uid() is not null then
    select id
    into resolved_admin_id
    from public.profiles
    where id = auth.uid()
      and is_admin = true;

    if resolved_admin_id is not null then
      return resolved_admin_id;
    end if;
  end if;

  if current_user in ('postgres', 'service_role', 'supabase_admin') then
    select id
    into resolved_admin_id
    from public.profiles
    where is_admin = true
    order by created_at asc
    limit 1;

    if resolved_admin_id is not null then
      return resolved_admin_id;
    end if;
  end if;

  raise exception 'An admin profile is required to approve or reject properties.';
end;
$$;

create or replace function public.enforce_property_review_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status in ('PENDING_REVIEW', 'APPROVED') then
    if not public.property_has_consent(new.id, new.owner_id) then
      raise exception 'Consent agreement is required before submitting property % for review.', new.id;
    end if;

    if not public.property_has_uploaded_video(new.id) then
      raise exception 'A mandatory uploaded walkthrough video is required before submitting property % for review.', new.id;
    end if;
  end if;

  if tg_op = 'UPDATE' and old.status is distinct from new.status then
    if new.status in ('APPROVED', 'REJECTED') and not public.current_user_is_admin() then
      raise exception 'Only admins can approve or reject properties.';
    end if;

    if new.status = 'PENDING_REVIEW' and new.submitted_at is null then
      new.submitted_at = now();
    end if;

    if new.status in ('APPROVED', 'REJECTED') then
      new.reviewed_at = coalesce(new.reviewed_at, now());
      new.reviewed_by = public.resolve_review_admin_id(new.reviewed_by);
    end if;
  end if;

  if tg_op = 'INSERT' then
    if new.status in ('APPROVED', 'REJECTED') and not public.current_user_is_admin() then
      raise exception 'Only admins can create approved or rejected properties.';
    end if;

    if new.status = 'PENDING_REVIEW' and new.submitted_at is null then
      new.submitted_at = now();
    end if;

    if new.status in ('APPROVED', 'REJECTED') then
      new.reviewed_at = coalesce(new.reviewed_at, now());
      new.reviewed_by = public.resolve_review_admin_id(new.reviewed_by);
    end if;
  end if;

  if new.status = 'APPROVED' and public.property_has_unresolved_duplicate(new.id) then
    raise exception 'Duplicate video conflict must be resolved by admin before property % can be approved.', new.id;
  end if;

  if new.status = 'APPROVED' then
    new.verified = true;
  end if;

  return new;
end;
$$;

create or replace function public.record_property_review()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE'
    and old.status is distinct from new.status
    and new.status in ('APPROVED', 'REJECTED') then
    insert into public.property_reviews (
      property_id,
      admin_id,
      decision,
      note
    )
    values (
      new.id,
      public.resolve_review_admin_id(new.reviewed_by),
      new.status::text::public.review_decision,
      new.review_note
    );
  end if;

  return new;
end;
$$;
