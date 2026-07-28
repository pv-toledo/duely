INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON conflict(id) do nothing;

CREATE POLICY documents_bucket_select_own
ON storage.objects for SELECT
TO authenticated
USING (
    bucket_id='documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY documents_bucket_insert_own
ON storage.objects for INSERT
TO authenticated
WITH CHECK (
    bucket_id='documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY documents_bucket_delete_own
ON storage.objects for DELETE
TO authenticated
USING (
    bucket_id='documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
);