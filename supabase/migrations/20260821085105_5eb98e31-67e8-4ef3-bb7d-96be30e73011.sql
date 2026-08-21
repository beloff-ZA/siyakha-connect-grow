ALTER TABLE public.portal_documents
  ADD COLUMN IF NOT EXISTS phase_id uuid REFERENCES public.portal_phases(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reference text;

CREATE INDEX IF NOT EXISTS portal_documents_phase_idx ON public.portal_documents(phase_id);

UPDATE public.portal_documents
SET version = COALESCE(version, 'Concept'),
    reference = COALESCE(reference, 'LTK_207'),
    phase_id = COALESCE(phase_id, 'b301998f-3e50-4106-a740-f6644ea95690')
WHERE id = 'c1a11e00-0000-4000-8000-0000000000d1';

INSERT INTO public.portal_documents
  (id, project_id, phase_id, title, category, version, reference, document_date, storage_path, file_size, mime_type, notes)
VALUES (
  'c1a11e00-0000-4000-8000-0000000000d2',
  'c1a11e00-0000-4000-8000-0000000000a1',
  'b301998f-3e50-4106-a740-f6644ea95690',
  '353 Anton Lembede Street – Council Submission',
  'Council Submission',
  'Council Submission 2026-08-12',
  'LTK_207 / LTK 207_353',
  '2026-08-12',
  'c1a11e00-0000-4000-8000-0000000000a1/353-anton-lembede-st-council-submission-2026-08-12.pdf',
  1542988,
  'application/pdf',
  'Second drawing set issued for council submission, dated 12 August 2026. Four A0 sheets: LA-100 floor plans; LA-101 north and west elevations; LA-102 east and south elevations; LA-103 sections and window schedule. Student accommodation on Portion 2 of Erf 10658 Durban at 353 Anton Lembede Street, for E. Ally. Occupancy: Boarding House. Architect: Laila Tickley / LTK Architects. Status on drawings: For Information Only / Council Submission. Issued in addition to the approved concept plans, which remain current.'
)
ON CONFLICT (id) DO UPDATE SET
  phase_id = EXCLUDED.phase_id,
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  version = EXCLUDED.version,
  reference = EXCLUDED.reference,
  document_date = EXCLUDED.document_date,
  storage_path = EXCLUDED.storage_path,
  file_size = EXCLUDED.file_size,
  mime_type = EXCLUDED.mime_type,
  notes = EXCLUDED.notes;