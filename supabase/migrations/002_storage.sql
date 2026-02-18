-- Create photos storage bucket (run in Supabase SQL Editor)
-- Note: If this fails, create bucket manually in Dashboard: Storage -> New bucket -> name: photos, public: true

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'photos',
  'photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Allow authenticated users to upload to photos bucket
create policy "photos: authenticated upload"
on storage.objects for insert
with check (
  bucket_id = 'photos' and auth.role() = 'authenticated'
);

-- Allow public read (bucket is public)
create policy "photos: public read"
on storage.objects for select
using (bucket_id = 'photos');
