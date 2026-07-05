-- Make media rows easier to audit and allow signed playback for approved listings.

alter table public.property_media
add column if not exists stored_filename text;

update public.property_media
set stored_filename = regexp_replace(storage_path, '^.*/', '')
where stored_filename is null;

alter table public.property_media
alter column stored_filename set not null;

create unique index if not exists property_media_storage_path_unique
on public.property_media(storage_bucket, storage_path);

drop policy if exists "property_videos_owner_or_admin_read" on storage.objects;
create policy "property_videos_owner_admin_or_approved_read"
on storage.objects
for select
using (
  bucket_id = 'property-videos'
  and (
    auth.uid()::text = (storage.foldername(name))[2]
    or public.current_user_is_admin()
    or exists (
      select 1
      from public.properties p
      where p.id::text = (storage.foldername(name))[3]
        and p.status = 'APPROVED'
    )
  )
);
