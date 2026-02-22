-- Migration 007: Add expected_lanyards to events table
-- Run this in Supabase SQL Editor

alter table public.events
  add column if not exists expected_lanyards int check (expected_lanyards > 0);
