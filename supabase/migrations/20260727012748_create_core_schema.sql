CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  original_filename text NOT NULL,
  mime_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CONSTRAINT documents_status_check
    CHECK (status IN ('pending', 'processing', 'needs_review', 'archived', 'failed')),
  category text
    CONSTRAINT documents_category_check
    CHECK (category IN ('vehicle', 'health', 'bills')),
  document_type text,
  subject_name text,
  issuer_name text,
  title text,
  searchable_text text,
  search_language text,
  search_vector tsvector,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT documents_archived_requires_category_check
    CHECK (status <> 'archived' OR category IS NOT NULL)
);

CREATE INDEX idx_documents_status_pending
  ON documents (status)
  WHERE status = 'pending';

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY documents_owner_access ON documents
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

--------------------------------------------------------

CREATE TABLE extractions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL UNIQUE REFERENCES documents (id) ON DELETE CASCADE,
  model text NOT NULL,
  raw_response jsonb NOT NULL,
  document_number text,
  plate text,
  document_date date,
  description text,
  reference_period text,
  error_message text,
  processed_at timestamptz
);

ALTER TABLE extractions ENABLE ROW LEVEL SECURITY;

CREATE POLICY extractions_owner_access ON extractions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = extractions.document_id
        AND documents.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = extractions.document_id
        AND documents.user_id = auth.uid()
    )
  );

  --------------------------------------------------------

CREATE TABLE deadlines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  document_id uuid REFERENCES documents (id) ON DELETE SET NULL,
  title text NOT NULL,
  due_date date NOT NULL,
  amount numeric,
  recurrence text NOT NULL DEFAULT 'none'
    CONSTRAINT deadlines_recurrence_check
    CHECK (recurrence IN ('none', 'monthly', 'yearly')),
  status text NOT NULL DEFAULT 'active'
    CONSTRAINT deadlines_status_check
    CHECK (status IN ('active', 'done', 'dismissed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_deadlines_user_due_active
  ON deadlines (user_id, due_date)
  WHERE status = 'active';

ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;

CREATE POLICY deadlines_owner_access ON deadlines
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

  ---------------------------------------------------------

CREATE TABLE notification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deadline_id uuid NOT NULL REFERENCES deadlines (id) ON DELETE CASCADE,
  channel text NOT NULL DEFAULT 'email',
  offset_days int NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (deadline_id, offset_days)
);

ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY notification_log_owner_access ON notification_log
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deadlines
      WHERE deadlines.id = notification_log.deadline_id
        AND deadlines.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM deadlines
      WHERE deadlines.id = notification_log.deadline_id
        AND deadlines.user_id = auth.uid()
    )
  );