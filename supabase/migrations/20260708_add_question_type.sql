-- Migration: Add question_type column to cards table
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New query)

ALTER TABLE cards ADD COLUMN question_type text NOT NULL DEFAULT 'recall';

-- Add a check constraint to ensure only valid types are stored
ALTER TABLE cards ADD CONSTRAINT cards_question_type_check
  CHECK (question_type IN ('recall', 'comparison', 'causal', 'socratic', 'practical'));

-- Add an index for filtering by question_type in study sessions
CREATE INDEX idx_cards_question_type ON cards (question_type);
