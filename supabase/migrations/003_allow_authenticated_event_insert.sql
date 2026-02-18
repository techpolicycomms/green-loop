-- Allow any authenticated user to create events (organizer dashboard)
-- Previously only organizer/admin could insert; new users default to volunteer.
drop policy if exists "events: organizer/admin can insert" on public.events;
create policy "events: authenticated can insert"
  on public.events for insert
  with check (auth.uid() is not null);
