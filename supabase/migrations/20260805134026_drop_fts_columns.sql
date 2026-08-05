ALTER TABLE documents
  DROP column search_vector,
  DROP column searchable_text,
  ADD CONSTRAINT documents_search_language_check
    CHECK (search_language IN ('pt', 'en'));