
-- Create a new public storage bucket for audio files
insert into storage.buckets
  (id, name, public)
values
  ('audio_files', 'audio_files', true);

-- Set up RLS policies for the audio_files bucket
-- Allow all users to view files in the bucket
create policy "Public read access for audio_files"
on storage.objects for select
using ( bucket_id = 'audio_files' );

-- Allow authenticated users to upload files
create policy "Authenticated users can upload audio"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'audio_files' );

-- Allow file owners to update their own files
create policy "Owners can update their own audio files"
on storage.objects for update
using ( auth.uid() = owner and bucket_id = 'audio_files' );

-- Allow file owners to delete their own files
create policy "Owners can delete their own audio files"
on storage.objects for delete
using ( auth.uid() = owner and bucket_id = 'audio_files' );
