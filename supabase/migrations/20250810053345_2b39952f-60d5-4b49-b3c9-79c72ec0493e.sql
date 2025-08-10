-- Update blog_notes admin policies with enum cast

drop policy if exists "blog_notes_admin_update" on public.blog_notes;
create policy "blog_notes_admin_update" on public.blog_notes
for update to authenticated
using (public.has_role(auth.uid(), 'admin'::public.app_role) or public.has_role(auth.uid(), 'management'::public.app_role))
with check (public.has_role(auth.uid(), 'admin'::public.app_role) or public.has_role(auth.uid(), 'management'::public.app_role));

drop policy if exists "blog_notes_admin_delete" on public.blog_notes;
create policy "blog_notes_admin_delete" on public.blog_notes
for delete to authenticated
using (public.has_role(auth.uid(), 'admin'::public.app_role) or public.has_role(auth.uid(), 'management'::public.app_role));