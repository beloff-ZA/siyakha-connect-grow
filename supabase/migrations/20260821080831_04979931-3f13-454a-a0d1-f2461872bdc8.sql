INSERT INTO public.portal_clients (id, display_name, contact_name, contact_email, status, notes)
VALUES ('c1a11e00-0000-4000-8000-000000000001', 'E. Ally', 'Ebrahim Ally', 'ebrahim@goldkeys.co.za', 'active',
        'First client onboarded to the Siyakha Client Portal.');

INSERT INTO public.portal_projects (id, client_id, title, status, address, reference, consultant, description, site_context, objectives, stakeholders, risks_notes, planning_narrative)
VALUES (
  'c1a11e00-0000-4000-8000-0000000000a1',
  'c1a11e00-0000-4000-8000-000000000001',
  '353 Anton Lembede Street – Proposed Conversion of Offices into Residential',
  'planning',
  '353 Anton Lembede Street',
  'LTK_207',
  'LTK Architects',
  'Proposed conversion of offices into residential at 353 Anton Lembede Street. Approved concept plans have been issued by LTK Architects (reference LTK_207, drawing date 20 July 2026). The approved plan set covers the ground storey, the typical 1st to 9th storeys, and the roof plan.',
  'Existing multi-storey office building at 353 Anton Lembede Street, to be converted to residential use. Site-specific survey information is still to be captured.',
  'Deliver the technology infrastructure required to support the conversion of the existing office storeys into residential accommodation. Detailed objectives to be confirmed with the client and consultant team.',
  'Client: E. Ally (Ebrahim Ally). Consultant: LTK Architects. Delivery: Siyakha Interlink.',
  'No risks logged yet. Risks and constraints will be recorded here as the survey and design stages progress.',
  'Planning is based on the approved concept plan set: ground storey, typical 1st–9th storeys, and roof plan (LTK Architects, LTK_207, 20 July 2026). Programme dates, quantities and budget are TBC pending survey and design sign-off.'
);

INSERT INTO public.portal_client_users (id, client_id, email, full_name, portal_role, status)
VALUES ('c1a11e00-0000-4000-8000-0000000000b1', 'c1a11e00-0000-4000-8000-000000000001',
        'ebrahim@goldkeys.co.za', 'Ebrahim Ally', 'client_admin', 'pending');

INSERT INTO public.portal_project_assignments (project_id, client_user_id)
VALUES ('c1a11e00-0000-4000-8000-0000000000a1', 'c1a11e00-0000-4000-8000-0000000000b1');

INSERT INTO public.portal_phases (project_id, name, sort_order, status)
VALUES
  ('c1a11e00-0000-4000-8000-0000000000a1', 'Site Survey', 1, 'not_started'),
  ('c1a11e00-0000-4000-8000-0000000000a1', 'Design & Planning', 2, 'not_started'),
  ('c1a11e00-0000-4000-8000-0000000000a1', 'Quotation & Approval', 3, 'not_started'),
  ('c1a11e00-0000-4000-8000-0000000000a1', 'Procurement', 4, 'not_started'),
  ('c1a11e00-0000-4000-8000-0000000000a1', 'Installation', 5, 'not_started'),
  ('c1a11e00-0000-4000-8000-0000000000a1', 'Testing & Handover', 6, 'not_started');

INSERT INTO public.portal_documents (id, project_id, title, category, document_date, storage_path, file_size, mime_type, notes)
VALUES ('c1a11e00-0000-4000-8000-0000000000d1', 'c1a11e00-0000-4000-8000-0000000000a1',
        '353 Anton Lembede St – Approved Concept Plans', 'Approved Plans', '2026-07-20',
        'c1a11e00-0000-4000-8000-0000000000a1/353-anton-lembede-st-approved-concept-plans.pdf',
        2967642, 'application/pdf',
        'LTK Architects, reference LTK_207. Includes ground storey, typical 1st–9th storeys and roof plan.');