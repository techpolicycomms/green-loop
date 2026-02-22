-- 008_fix_photo_upload.sql
-- Idempotent: creates photos bucket, storage RLS, photos + lanyard_grades table RLS

-- STEP 1: Create photos storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('photos','photos',true,5242880,ARRAY['image/jpeg','image/png','image/webp','image/gif','image/jpg'])
ON CONFLICT (id) DO UPDATE SET public=true,file_size_limit=5242880,
  allowed_mime_types=ARRAY['image/jpeg','image/png','image/webp','image/gif','image/jpg'];

-- STEP 2: Storage RLS - clean up old policies
DROP POLICY IF EXISTS "photos_insert" ON storage.objects;
DROP POLICY IF EXISTS "photos_select" ON storage.objects;
DROP POLICY IF EXISTS "photos_delete" ON storage.objects;
DROP POLICY IF EXISTS "volunteer can upload own photos" ON storage.objects;
DROP POLICY IF EXISTS "authenticated can upload own photos" ON storage.objects;
DROP POLICY IF EXISTS "users can view own photos" ON storage.objects;
DROP POLICY IF EXISTS "photos public read" ON storage.objects;
DROP POLICY IF EXISTS "users can delete own photos" ON storage.objects;

CREATE POLICY "photos_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id='photos' AND auth.uid()::text=(storage.foldername(name))[1]);

CREATE POLICY "photos_select" ON storage.objects
  FOR SELECT USING (bucket_id='photos');

CREATE POLICY "photos_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id='photos' AND auth.uid()::text=(storage.foldername(name))[1]);

-- STEP 3: photos table
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  event_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "photos_insert_own" ON photos;
DROP POLICY IF EXISTS "photos_select_own" ON photos;
DROP POLICY IF EXISTS "photos_admin_select" ON photos;

CREATE POLICY "photos_insert_own" ON photos
  FOR INSERT TO authenticated WITH CHECK (auth.uid()=user_id);

CREATE POLICY "photos_select_own" ON photos
  FOR SELECT TO authenticated USING (auth.uid()=user_id);

CREATE POLICY "photos_admin_select" ON photos
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id=auth.uid() AND profiles.role IN ('admin','organizer')));

-- STEP 4: lanyard_grades table
CREATE TABLE IF NOT EXISTS lanyard_grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID,
  photo_id UUID REFERENCES photos(id) ON DELETE SET NULL,
  check_in_id UUID,
  quantity INT NOT NULL DEFAULT 1,
  grade TEXT NOT NULL CHECK (grade IN ('A','B','C')),
  material TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lanyard_grades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lanyard_insert_own" ON lanyard_grades;
DROP POLICY IF EXISTS "lanyard_select_own" ON lanyard_grades;
DROP POLICY IF EXISTS "lanyard_admin_select" ON lanyard_grades;

CREATE POLICY "lanyard_insert_own" ON lanyard_grades
  FOR INSERT TO authenticated WITH CHECK (auth.uid()=user_id);

CREATE POLICY "lanyard_select_own" ON lanyard_grades
  FOR SELECT TO authenticated USING (auth.uid()=user_id);

CREATE POLICY "lanyard_admin_select" ON lanyard_grades
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id=auth.uid() AND profiles.role IN ('admin','organizer')));
