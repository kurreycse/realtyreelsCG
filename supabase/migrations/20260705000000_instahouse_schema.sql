-- InstaHouse core schema
-- Users are simple profiles. Seller identity is chosen per property post.
-- Listings need consent + video before review, and duplicate videos need admin resolution before approval.

create extension if not exists "pgcrypto";

do $$
begin
  create type public.property_purpose as enum ('BUY', 'RENT', 'COMMERCIAL', 'PG', 'PLOT', 'PROJECT');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.listing_type as enum ('RENT', 'SALE');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.seller_type as enum ('Owner', 'Broker', 'Builder');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.property_status as enum ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.property_possession as enum ('Immediate', 'Ready to Move', 'Under Construction', 'Within 3 Months');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.media_type as enum ('VIDEO', 'IMAGE');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.upload_status as enum ('REQUESTED', 'UPLOADING', 'UPLOADED', 'FAILED', 'DELETED');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.duplicate_status as enum ('NONE', 'POSSIBLE_DUPLICATE', 'CONFIRMED_DUPLICATE', 'CLEARED');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.duplicate_match_type as enum ('EXACT_SHA256', 'PERCEPTUAL_HASH');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.duplicate_resolution as enum ('OPEN', 'CONFIRMED_DUPLICATE', 'CLEARED');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.verification_document_type as enum ('OWNERSHIP_PROOF', 'BROKER_MANDATE', 'BUILDER_AUTHORIZATION', 'OTHER');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.review_decision as enum ('APPROVED', 'REJECTED');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.enquiry_status as enum ('NEW', 'CONTACTED', 'CLOSED');
exception
  when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  phone text unique,
  email text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_admin = true
  );
$$;

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,

  title text not null,
  project_name text,
  purpose public.property_purpose not null,
  listing_type public.listing_type not null,
  property_type text not null,
  price numeric(14,2) not null check (price >= 0),
  city text not null,
  locality text not null,
  bhk text,
  area numeric(12,2) check (area is null or area >= 0),
  area_unit text not null default 'Sq Ft',
  furnishing text,
  bedrooms integer not null default 0 check (bedrooms >= 0),
  bathrooms integer not null default 0 check (bathrooms >= 0),
  parking boolean not null default false,
  possession public.property_possession not null default 'Immediate',
  rera text,
  description text not null default '',
  image_url text,

  seller_type public.seller_type not null,
  instagram_handle text,
  instagram_video_url text,

  status public.property_status not null default 'DRAFT',
  review_note text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,

  verified boolean not null default false,
  no_brokerage boolean not null default false,
  featured boolean not null default false,
  views integer not null default 0 check (views >= 0),
  leads integer not null default 0 check (leads >= 0),
  price_trend text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint instagram_handle_format check (
    instagram_handle is null
    or instagram_handle ~ '^[A-Za-z0-9._]{1,30}$'
  ),
  constraint instagram_video_url_format check (
    instagram_video_url is null
    or instagram_video_url ~* '^https?://(www\.)?instagram\.com/'
  )
);

create trigger set_properties_updated_at
before update on public.properties
for each row execute function public.set_updated_at();

create table if not exists public.property_consents (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null unique references public.properties(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  seller_type public.seller_type not null,
  consent_version text not null default 'instahouse-property-consent-v1',
  consent_text text not null default 'I confirm this property belongs to me or I am authorized to list it, and the details and video I provide are accurate to the best of my knowledge.',
  accepted_at timestamptz not null default now(),
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.property_media (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  media_type public.media_type not null default 'VIDEO',
  storage_bucket text not null default 'property-videos',
  storage_path text not null,
  original_filename text not null,
  mime_type text not null,
  file_size_bytes bigint check (file_size_bytes is null or file_size_bytes > 0),
  duration_seconds numeric(10,2) check (duration_seconds is null or duration_seconds >= 0),
  upload_status public.upload_status not null default 'REQUESTED',
  is_primary boolean not null default true,
  file_sha256 text,
  perceptual_hash text,
  duplicate_status public.duplicate_status not null default 'NONE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint video_mime_type check (
    media_type <> 'VIDEO'
    or mime_type in ('video/mp4', 'video/webm', 'video/quicktime')
  ),
  constraint file_sha256_format check (
    file_sha256 is null
    or file_sha256 ~ '^[A-Fa-f0-9]{64}$'
  )
);

create trigger set_property_media_updated_at
before update on public.property_media
for each row execute function public.set_updated_at();

create unique index if not exists one_primary_active_video_per_property
on public.property_media(property_id)
where media_type = 'VIDEO'
  and is_primary = true
  and upload_status <> 'DELETED';

create table if not exists public.property_duplicate_reviews (
  id uuid primary key default gen_random_uuid(),
  original_media_id uuid not null references public.property_media(id) on delete cascade,
  conflicting_media_id uuid not null references public.property_media(id) on delete cascade,
  match_type public.duplicate_match_type not null,
  match_score numeric(6,3),
  resolution public.duplicate_resolution not null default 'OPEN',
  duplicate_media_id uuid references public.property_media(id) on delete set null,
  kept_media_id uuid references public.property_media(id) on delete set null,
  resolution_note text,
  resolved_by uuid references public.profiles(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint duplicate_review_not_self check (original_media_id <> conflicting_media_id),
  constraint duplicate_resolution_requires_duplicate_media check (
    resolution <> 'CONFIRMED_DUPLICATE'
    or duplicate_media_id is not null
  )
);

create trigger set_property_duplicate_reviews_updated_at
before update on public.property_duplicate_reviews
for each row execute function public.set_updated_at();

create unique index if not exists property_duplicate_reviews_pair_unique
on public.property_duplicate_reviews(original_media_id, conflicting_media_id);

create table if not exists public.property_verification_documents (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  document_type public.verification_document_type not null default 'OTHER',
  storage_bucket text not null default 'property-verification-documents',
  storage_path text not null,
  original_filename text not null,
  mime_type text not null,
  file_size_bytes bigint check (file_size_bytes is null or file_size_bytes > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.property_amenities (
  property_id uuid not null references public.properties(id) on delete cascade,
  amenity text not null,
  created_at timestamptz not null default now(),
  primary key (property_id, amenity)
);

create table if not exists public.property_nearby (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.saved_properties (
  user_id uuid not null references public.profiles(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, property_id)
);

create table if not exists public.property_enquiries (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  listing_owner_id uuid not null references public.profiles(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  contact_name text,
  contact_phone text not null,
  message text,
  status public.enquiry_status not null default 'NEW',
  created_at timestamptz not null default now()
);

create table if not exists public.property_reviews (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  admin_id uuid not null references public.profiles(id) on delete restrict,
  decision public.review_decision not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists properties_public_browse_idx
on public.properties(status, city, purpose, listing_type, price, created_at desc);

create index if not exists properties_owner_status_idx
on public.properties(owner_id, status, submitted_at desc);

create index if not exists properties_pending_review_idx
on public.properties(status, submitted_at asc)
where status = 'PENDING_REVIEW';

create index if not exists property_media_property_idx
on public.property_media(property_id);

create index if not exists property_media_sha_idx
on public.property_media(file_sha256)
where file_sha256 is not null;

create index if not exists property_media_perceptual_hash_idx
on public.property_media(perceptual_hash)
where perceptual_hash is not null;

create index if not exists property_duplicate_reviews_resolution_idx
on public.property_duplicate_reviews(resolution);

create index if not exists property_enquiries_property_idx
on public.property_enquiries(property_id, created_at desc);

create index if not exists property_reviews_property_idx
on public.property_reviews(property_id, created_at desc);

create or replace function public.property_has_consent(target_property_id uuid, target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.property_consents c
    where c.property_id = target_property_id
      and c.user_id = target_user_id
  );
$$;

create or replace function public.property_has_uploaded_video(target_property_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.property_media m
    where m.property_id = target_property_id
      and m.media_type = 'VIDEO'
      and m.upload_status = 'UPLOADED'
  );
$$;

create or replace function public.property_has_unresolved_duplicate(target_property_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  with property_videos as (
    select id
    from public.property_media
    where property_id = target_property_id
      and media_type = 'VIDEO'
      and upload_status <> 'DELETED'
  )
  select exists (
    select 1
    from public.property_media m
    where m.property_id = target_property_id
      and m.duplicate_status in ('POSSIBLE_DUPLICATE', 'CONFIRMED_DUPLICATE')
  )
  and (
    exists (
      select 1
      from public.property_media m
      where m.property_id = target_property_id
        and m.duplicate_status = 'CONFIRMED_DUPLICATE'
    )
    or exists (
      select 1
      from public.property_duplicate_reviews r
      where (r.original_media_id in (select id from property_videos)
          or r.conflicting_media_id in (select id from property_videos))
        and r.resolution = 'OPEN'
    )
    or not exists (
      select 1
      from public.property_duplicate_reviews r
      where (r.original_media_id in (select id from property_videos)
          or r.conflicting_media_id in (select id from property_videos))
    )
  );
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
      new.reviewed_by = coalesce(new.reviewed_by, auth.uid());
    end if;
  end if;

  if tg_op = 'INSERT' then
    if new.status in ('APPROVED', 'REJECTED') and not public.current_user_is_admin() then
      raise exception 'Only admins can create approved or rejected properties.';
    end if;

    if new.status = 'PENDING_REVIEW' and new.submitted_at is null then
      new.submitted_at = now();
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

create trigger enforce_property_review_rules_trigger
before insert or update on public.properties
for each row execute function public.enforce_property_review_rules();

create or replace function public.enforce_property_consent_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  property_owner uuid;
  property_seller_type public.seller_type;
begin
  select owner_id, seller_type
  into property_owner, property_seller_type
  from public.properties
  where id = new.property_id;

  if property_owner is null then
    raise exception 'Property % does not exist.', new.property_id;
  end if;

  if new.user_id <> property_owner then
    raise exception 'Consent must be accepted by the property owner user.';
  end if;

  if new.seller_type <> property_seller_type then
    raise exception 'Consent seller type must match the property seller type.';
  end if;

  return new;
end;
$$;

create trigger enforce_property_consent_rules_trigger
before insert or update on public.property_consents
for each row execute function public.enforce_property_consent_rules();

create or replace function public.enforce_property_media_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  property_owner uuid;
  existing_duplicate uuid;
begin
  select owner_id
  into property_owner
  from public.properties
  where id = new.property_id;

  if property_owner is null then
    raise exception 'Property % does not exist.', new.property_id;
  end if;

  if new.created_by <> property_owner then
    raise exception 'Media uploader must match the property owner user.';
  end if;

  if new.media_type = 'VIDEO' and not public.property_has_consent(new.property_id, new.created_by) then
    raise exception 'Consent agreement is required before uploading a property video.';
  end if;

  if new.media_type = 'VIDEO' and new.upload_status = 'UPLOADED' then
    select m.id
    into existing_duplicate
    from public.property_media m
    where m.id <> new.id
      and m.media_type = 'VIDEO'
      and m.upload_status = 'UPLOADED'
      and (
        (new.file_sha256 is not null and m.file_sha256 = new.file_sha256)
        or (new.perceptual_hash is not null and m.perceptual_hash = new.perceptual_hash)
      )
    limit 1;

    if existing_duplicate is not null then
      new.duplicate_status = 'POSSIBLE_DUPLICATE';
    end if;
  end if;

  return new;
end;
$$;

create trigger enforce_property_media_rules_trigger
before insert or update on public.property_media
for each row execute function public.enforce_property_media_rules();

create or replace function public.create_duplicate_reviews_for_media()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  duplicate_record record;
begin
  if new.media_type <> 'VIDEO' or new.upload_status <> 'UPLOADED' then
    return new;
  end if;

  for duplicate_record in
    select
      m.id,
      case
        when new.file_sha256 is not null and m.file_sha256 = new.file_sha256 then 'EXACT_SHA256'::public.duplicate_match_type
        else 'PERCEPTUAL_HASH'::public.duplicate_match_type
      end as match_type
    from public.property_media m
    where m.id <> new.id
      and m.media_type = 'VIDEO'
      and m.upload_status = 'UPLOADED'
      and (
        (new.file_sha256 is not null and m.file_sha256 = new.file_sha256)
        or (new.perceptual_hash is not null and m.perceptual_hash = new.perceptual_hash)
      )
  loop
    insert into public.property_duplicate_reviews (
      original_media_id,
      conflicting_media_id,
      match_type,
      match_score
    )
    values (
      duplicate_record.id,
      new.id,
      duplicate_record.match_type,
      case when duplicate_record.match_type = 'EXACT_SHA256' then 1 else null end
    )
    on conflict (original_media_id, conflicting_media_id) do nothing;

    update public.property_media
    set duplicate_status = 'POSSIBLE_DUPLICATE'
    where id in (duplicate_record.id, new.id)
      and duplicate_status = 'NONE';
  end loop;

  return new;
end;
$$;

create trigger create_duplicate_reviews_for_media_trigger
after insert or update of upload_status, file_sha256, perceptual_hash on public.property_media
for each row execute function public.create_duplicate_reviews_for_media();

create or replace function public.apply_duplicate_review_resolution()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.resolution = 'OPEN' then
    return new;
  end if;

  new.resolved_at = coalesce(new.resolved_at, now());
  new.resolved_by = coalesce(new.resolved_by, auth.uid());

  if new.resolution = 'CONFIRMED_DUPLICATE' and new.duplicate_media_id is not null then
    update public.property_media
    set duplicate_status = 'CONFIRMED_DUPLICATE'
    where id = new.duplicate_media_id;

    if new.kept_media_id is not null then
      update public.property_media
      set duplicate_status = 'CLEARED'
      where id = new.kept_media_id
        and not exists (
          select 1
          from public.property_duplicate_reviews r
          where r.id <> new.id
            and (r.original_media_id = new.kept_media_id or r.conflicting_media_id = new.kept_media_id)
            and r.resolution = 'OPEN'
        );
    end if;
  elsif new.resolution = 'CLEARED' then
    update public.property_media
    set duplicate_status = 'CLEARED'
    where id in (new.original_media_id, new.conflicting_media_id)
      and not exists (
        select 1
        from public.property_duplicate_reviews r
        where r.id <> new.id
          and (
            r.original_media_id = public.property_media.id
            or r.conflicting_media_id = public.property_media.id
          )
          and r.resolution = 'OPEN'
      );
  end if;

  return new;
end;
$$;

create trigger apply_duplicate_review_resolution_trigger
before update on public.property_duplicate_reviews
for each row
when (old.resolution is distinct from new.resolution)
execute function public.apply_duplicate_review_resolution();

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
      coalesce(new.reviewed_by, auth.uid()),
      new.status::text::public.review_decision,
      new.review_note
    );
  end if;

  return new;
end;
$$;

create trigger record_property_review_trigger
after update of status on public.properties
for each row execute function public.record_property_review();

create or replace function public.prepare_property_enquiry()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  property_owner uuid;
  property_status public.property_status;
begin
  select owner_id, status
  into property_owner, property_status
  from public.properties
  where id = new.property_id;

  if property_owner is null then
    raise exception 'Property % does not exist.', new.property_id;
  end if;

  if property_status <> 'APPROVED' then
    raise exception 'Enquiries can only be created for approved properties.';
  end if;

  new.listing_owner_id = property_owner;

  update public.properties
  set leads = leads + 1
  where id = new.property_id;

  return new;
end;
$$;

create trigger prepare_property_enquiry_trigger
before insert on public.property_enquiries
for each row execute function public.prepare_property_enquiry();

alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.property_consents enable row level security;
alter table public.property_media enable row level security;
alter table public.property_duplicate_reviews enable row level security;
alter table public.property_verification_documents enable row level security;
alter table public.property_amenities enable row level security;
alter table public.property_nearby enable row level security;
alter table public.saved_properties enable row level security;
alter table public.property_enquiries enable row level security;
alter table public.property_reviews enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles
for select
using (id = auth.uid() or public.current_user_is_admin());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (id = auth.uid());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
on public.profiles
for update
using (id = auth.uid() or public.current_user_is_admin())
with check (id = auth.uid() or public.current_user_is_admin());

drop policy if exists "properties_public_approved_read" on public.properties;
create policy "properties_public_approved_read"
on public.properties
for select
using (status = 'APPROVED');

drop policy if exists "properties_owner_read" on public.properties;
create policy "properties_owner_read"
on public.properties
for select
using (owner_id = auth.uid());

drop policy if exists "properties_admin_read" on public.properties;
create policy "properties_admin_read"
on public.properties
for select
using (public.current_user_is_admin());

drop policy if exists "properties_owner_insert" on public.properties;
create policy "properties_owner_insert"
on public.properties
for insert
with check (owner_id = auth.uid());

drop policy if exists "properties_owner_update_own_non_approved" on public.properties;
create policy "properties_owner_update_own_non_approved"
on public.properties
for update
using (owner_id = auth.uid() and status in ('DRAFT', 'PENDING_REVIEW', 'REJECTED'))
with check (owner_id = auth.uid() and status in ('DRAFT', 'PENDING_REVIEW', 'REJECTED'));

drop policy if exists "properties_admin_update" on public.properties;
create policy "properties_admin_update"
on public.properties
for update
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

drop policy if exists "property_consents_owner_read" on public.property_consents;
create policy "property_consents_owner_read"
on public.property_consents
for select
using (user_id = auth.uid() or public.current_user_is_admin());

drop policy if exists "property_consents_owner_insert" on public.property_consents;
create policy "property_consents_owner_insert"
on public.property_consents
for insert
with check (user_id = auth.uid());

drop policy if exists "property_media_owner_admin_read" on public.property_media;
create policy "property_media_owner_admin_read"
on public.property_media
for select
using (
  public.current_user_is_admin()
  or exists (
    select 1
    from public.properties p
    where p.id = property_media.property_id
      and p.owner_id = auth.uid()
  )
  or exists (
    select 1
    from public.properties p
    where p.id = property_media.property_id
      and p.status = 'APPROVED'
  )
);

drop policy if exists "property_media_owner_insert" on public.property_media;
create policy "property_media_owner_insert"
on public.property_media
for insert
with check (
  created_by = auth.uid()
  and exists (
    select 1
    from public.properties p
    where p.id = property_media.property_id
      and p.owner_id = auth.uid()
  )
);

drop policy if exists "property_media_owner_update" on public.property_media;
create policy "property_media_owner_update"
on public.property_media
for update
using (
  public.current_user_is_admin()
  or exists (
    select 1
    from public.properties p
    where p.id = property_media.property_id
      and p.owner_id = auth.uid()
      and p.status in ('DRAFT', 'PENDING_REVIEW', 'REJECTED')
  )
)
with check (
  public.current_user_is_admin()
  or exists (
    select 1
    from public.properties p
    where p.id = property_media.property_id
      and p.owner_id = auth.uid()
      and p.status in ('DRAFT', 'PENDING_REVIEW', 'REJECTED')
  )
);

drop policy if exists "property_duplicate_reviews_admin_read" on public.property_duplicate_reviews;
create policy "property_duplicate_reviews_admin_read"
on public.property_duplicate_reviews
for select
using (
  public.current_user_is_admin()
  or exists (
    select 1
    from public.property_media m
    join public.properties p on p.id = m.property_id
    where (m.id = property_duplicate_reviews.original_media_id or m.id = property_duplicate_reviews.conflicting_media_id)
      and p.owner_id = auth.uid()
  )
);

drop policy if exists "property_duplicate_reviews_admin_insert" on public.property_duplicate_reviews;
create policy "property_duplicate_reviews_admin_insert"
on public.property_duplicate_reviews
for insert
with check (public.current_user_is_admin());

drop policy if exists "property_duplicate_reviews_admin_update" on public.property_duplicate_reviews;
create policy "property_duplicate_reviews_admin_update"
on public.property_duplicate_reviews
for update
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

drop policy if exists "verification_documents_owner_admin_read" on public.property_verification_documents;
create policy "verification_documents_owner_admin_read"
on public.property_verification_documents
for select
using (user_id = auth.uid() or public.current_user_is_admin());

drop policy if exists "verification_documents_owner_insert" on public.property_verification_documents;
create policy "verification_documents_owner_insert"
on public.property_verification_documents
for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.properties p
    where p.id = property_verification_documents.property_id
      and p.owner_id = auth.uid()
  )
);

drop policy if exists "property_amenities_read" on public.property_amenities;
create policy "property_amenities_read"
on public.property_amenities
for select
using (
  exists (
    select 1
    from public.properties p
    where p.id = property_amenities.property_id
      and (p.status = 'APPROVED' or p.owner_id = auth.uid() or public.current_user_is_admin())
  )
);

drop policy if exists "property_amenities_owner_write" on public.property_amenities;
create policy "property_amenities_owner_write"
on public.property_amenities
for all
using (
  exists (
    select 1
    from public.properties p
    where p.id = property_amenities.property_id
      and (p.owner_id = auth.uid() or public.current_user_is_admin())
  )
)
with check (
  exists (
    select 1
    from public.properties p
    where p.id = property_amenities.property_id
      and (p.owner_id = auth.uid() or public.current_user_is_admin())
  )
);

drop policy if exists "property_nearby_read" on public.property_nearby;
create policy "property_nearby_read"
on public.property_nearby
for select
using (
  exists (
    select 1
    from public.properties p
    where p.id = property_nearby.property_id
      and (p.status = 'APPROVED' or p.owner_id = auth.uid() or public.current_user_is_admin())
  )
);

drop policy if exists "property_nearby_owner_write" on public.property_nearby;
create policy "property_nearby_owner_write"
on public.property_nearby
for all
using (
  exists (
    select 1
    from public.properties p
    where p.id = property_nearby.property_id
      and (p.owner_id = auth.uid() or public.current_user_is_admin())
  )
)
with check (
  exists (
    select 1
    from public.properties p
    where p.id = property_nearby.property_id
      and (p.owner_id = auth.uid() or public.current_user_is_admin())
  )
);

drop policy if exists "saved_properties_owner_read" on public.saved_properties;
create policy "saved_properties_owner_read"
on public.saved_properties
for select
using (user_id = auth.uid());

drop policy if exists "saved_properties_owner_insert" on public.saved_properties;
create policy "saved_properties_owner_insert"
on public.saved_properties
for insert
with check (user_id = auth.uid());

drop policy if exists "saved_properties_owner_delete" on public.saved_properties;
create policy "saved_properties_owner_delete"
on public.saved_properties
for delete
using (user_id = auth.uid());

drop policy if exists "property_enquiries_user_owner_admin_read" on public.property_enquiries;
create policy "property_enquiries_user_owner_admin_read"
on public.property_enquiries
for select
using (
  user_id = auth.uid()
  or listing_owner_id = auth.uid()
  or public.current_user_is_admin()
);

drop policy if exists "property_enquiries_authenticated_insert" on public.property_enquiries;
create policy "property_enquiries_authenticated_insert"
on public.property_enquiries
for insert
with check (auth.uid() is not null and (user_id is null or user_id = auth.uid()));

drop policy if exists "property_enquiries_owner_admin_update" on public.property_enquiries;
create policy "property_enquiries_owner_admin_update"
on public.property_enquiries
for update
using (listing_owner_id = auth.uid() or public.current_user_is_admin())
with check (listing_owner_id = auth.uid() or public.current_user_is_admin());

drop policy if exists "property_reviews_owner_admin_read" on public.property_reviews;
create policy "property_reviews_owner_admin_read"
on public.property_reviews
for select
using (
  public.current_user_is_admin()
  or exists (
    select 1
    from public.properties p
    where p.id = property_reviews.property_id
      and p.owner_id = auth.uid()
  )
);

drop policy if exists "property_reviews_admin_insert" on public.property_reviews;
create policy "property_reviews_admin_insert"
on public.property_reviews
for insert
with check (public.current_user_is_admin());

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'property-videos',
  'property-videos',
  false,
  104857600,
  array['video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'property-verification-documents',
  'property-verification-documents',
  false,
  20971520,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "property_videos_owner_upload_after_consent" on storage.objects;
create policy "property_videos_owner_upload_after_consent"
on storage.objects
for insert
with check (
  bucket_id = 'property-videos'
  and auth.uid()::text = (storage.foldername(name))[2]
  and (storage.foldername(name))[1] = 'pending'
  and exists (
    select 1
    from public.properties p
    where p.id::text = (storage.foldername(name))[3]
      and p.owner_id = auth.uid()
  )
  and exists (
    select 1
    from public.property_consents c
    where c.property_id::text = (storage.foldername(name))[3]
      and c.user_id = auth.uid()
  )
);

drop policy if exists "property_videos_owner_or_admin_read" on storage.objects;
create policy "property_videos_owner_or_admin_read"
on storage.objects
for select
using (
  bucket_id = 'property-videos'
  and (
    auth.uid()::text = (storage.foldername(name))[2]
    or public.current_user_is_admin()
  )
);

drop policy if exists "property_videos_owner_update_delete" on storage.objects;
create policy "property_videos_owner_update_delete"
on storage.objects
for update
using (
  bucket_id = 'property-videos'
  and auth.uid()::text = (storage.foldername(name))[2]
)
with check (
  bucket_id = 'property-videos'
  and auth.uid()::text = (storage.foldername(name))[2]
);

drop policy if exists "property_documents_owner_upload" on storage.objects;
create policy "property_documents_owner_upload"
on storage.objects
for insert
with check (
  bucket_id = 'property-verification-documents'
  and auth.uid()::text = (storage.foldername(name))[2]
  and (storage.foldername(name))[1] = 'proof'
  and exists (
    select 1
    from public.properties p
    where p.id::text = (storage.foldername(name))[3]
      and p.owner_id = auth.uid()
  )
);

drop policy if exists "property_documents_owner_or_admin_read" on storage.objects;
create policy "property_documents_owner_or_admin_read"
on storage.objects
for select
using (
  bucket_id = 'property-verification-documents'
  and (
    auth.uid()::text = (storage.foldername(name))[2]
    or public.current_user_is_admin()
  )
);
