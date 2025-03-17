
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the tags enum type
CREATE TYPE tag_type AS ENUM (
  'Original', 
  'Físico', 
  'Digital', 
  'Digital ou Físico', 
  'Original e Cópia'
);

-- Create the category enum type
CREATE TYPE service_category AS ENUM (
  'Veículo', 
  'Habilitação', 
  'Infrações', 
  'Outros'
);

-- Create the services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category service_category NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create the checklists table
CREATE TABLE checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_optional BOOLEAN NOT NULL DEFAULT FALSE,
  is_alternative BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create the checklist_items table
CREATE TABLE checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checklist_id UUID NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  observation TEXT,
  tags tag_type[] DEFAULT NULL,
  is_optional BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create a user_progress table to track which items have been completed by users
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checklist_item_id UUID NOT NULL REFERENCES checklist_items(id) ON DELETE CASCADE,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, checklist_item_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_checklists_service_id ON checklists(service_id);
CREATE INDEX idx_checklist_items_checklist_id ON checklist_items(checklist_id);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_checklist_item_id ON user_progress(checklist_item_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the updated_at trigger to all tables
CREATE TRIGGER set_timestamp_services
BEFORE UPDATE ON services
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_checklists
BEFORE UPDATE ON checklists
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_checklist_items
BEFORE UPDATE ON checklist_items
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_user_progress
BEFORE UPDATE ON user_progress
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Enable Row Level Security (RLS)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Anyone can read services, checklists and checklist_items
CREATE POLICY "Anyone can read services" ON services FOR SELECT USING (true);
CREATE POLICY "Anyone can read checklists" ON checklists FOR SELECT USING (true);
CREATE POLICY "Anyone can read checklist_items" ON checklist_items FOR SELECT USING (true);

-- Only authenticated users can read their own progress
CREATE POLICY "Users can read their own progress" ON user_progress 
FOR SELECT USING (auth.uid() = user_id);

-- Only authenticated users can update their own progress
CREATE POLICY "Users can update their own progress" ON user_progress 
FOR UPDATE USING (auth.uid() = user_id);

-- Only authenticated users can insert their own progress
CREATE POLICY "Users can insert their own progress" ON user_progress 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only authenticated users can delete their own progress
CREATE POLICY "Users can delete their own progress" ON user_progress 
FOR DELETE USING (auth.uid() = user_id);

-- Only admins can manage services, checklists, and checklist_items
CREATE POLICY "Admins can manage services" ON services 
FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage checklists" ON checklists 
FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage checklist_items" ON checklist_items 
FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Insert initial data from our existing services
-- This can be generated with a script based on your existing services data
