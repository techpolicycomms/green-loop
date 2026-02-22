-- Migration 008: Add event_date to events table
-- Run this in Supabase SQL Editor

alter table public.events
  add column if not exists event_date date;
