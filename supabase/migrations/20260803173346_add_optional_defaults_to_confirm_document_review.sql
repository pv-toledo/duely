CREATE OR REPLACE FUNCTION public.confirm_document_review(
  p_document_id uuid,
  p_category text DEFAULT NULL,
  p_document_type text DEFAULT NULL,
  p_subject_name text DEFAULT NULL,
  p_issuer_name text DEFAULT NULL,
  p_title text DEFAULT NULL,
  p_due_date date DEFAULT NULL,
  p_amount numeric DEFAULT NULL,
  p_document_number text DEFAULT NULL,
  p_plate text DEFAULT NULL,
  p_document_date date DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_reference_period text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.documents
  SET
    category = p_category,
    document_type = p_document_type,
    subject_name = p_subject_name,
    issuer_name = p_issuer_name,
    title = p_title,
    status = 'archived'
  WHERE id = p_document_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Document not found or access denied';
  END IF;

  UPDATE public.extractions
  SET
    document_number = p_document_number,
    plate = p_plate,
    document_date = p_document_date,
    description = p_description,
    reference_period = p_reference_period
  WHERE document_id = p_document_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Extraction record not found for document';
  END IF;

  IF p_due_date IS NOT NULL THEN
    INSERT INTO public.deadlines (user_id, document_id, title, due_date, amount, recurrence)
    VALUES (auth.uid(), p_document_id, p_title, p_due_date, p_amount, 'none');
  END IF;
END;
$$;