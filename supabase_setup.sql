
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the tags enum type if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ckdt_tag_type') THEN
        CREATE TYPE ckdt_tag_type AS ENUM (
          'Original', 
          'Físico', 
          'Digital', 
          'Digital ou Físico', 
          'Original e Cópia'
        );
    END IF;
END $$;

-- Create the category enum type if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ckdt_service_category') THEN
        CREATE TYPE ckdt_service_category AS ENUM (
          'Veículo', 
          'Habilitação', 
          'Infrações', 
          'Outros'
        );
    END IF;
END $$;

-- Create the services table if it doesn't exist
CREATE TABLE IF NOT EXISTS ckdt_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category ckdt_service_category NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create the checklists table if it doesn't exist
CREATE TABLE IF NOT EXISTS ckdt_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES ckdt_services(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_optional BOOLEAN NOT NULL DEFAULT FALSE,
  is_alternative BOOLEAN NOT NULL DEFAULT FALSE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create the checklist_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS ckdt_checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checklist_id UUID NOT NULL REFERENCES ckdt_checklists(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  observation TEXT,
  tags ckdt_tag_type[] DEFAULT NULL,
  is_optional BOOLEAN NOT NULL DEFAULT FALSE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create a user_progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS ckdt_user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checklist_item_id UUID NOT NULL REFERENCES ckdt_checklist_items(id) ON DELETE CASCADE,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, checklist_item_id)
);

-- Create indexes for better query performance if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ckdt_checklists_service_id') THEN
        CREATE INDEX idx_ckdt_checklists_service_id ON ckdt_checklists(service_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ckdt_checklist_items_checklist_id') THEN
        CREATE INDEX idx_ckdt_checklist_items_checklist_id ON ckdt_checklist_items(checklist_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ckdt_user_progress_user_id') THEN
        CREATE INDEX idx_ckdt_user_progress_user_id ON ckdt_user_progress(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ckdt_user_progress_checklist_item_id') THEN
        CREATE INDEX idx_ckdt_user_progress_checklist_item_id ON ckdt_user_progress(checklist_item_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ckdt_checklists_position') THEN
        CREATE INDEX idx_ckdt_checklists_position ON ckdt_checklists(position);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ckdt_checklist_items_position') THEN
        CREATE INDEX idx_ckdt_checklist_items_position ON ckdt_checklist_items(position);
    END IF;
END $$;

-- Create updated_at triggers if they don't exist
CREATE OR REPLACE FUNCTION ckdt_trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the updated_at trigger to all tables
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_ckdt_services') THEN
        CREATE TRIGGER set_timestamp_ckdt_services
        BEFORE UPDATE ON ckdt_services
        FOR EACH ROW
        EXECUTE FUNCTION ckdt_trigger_set_timestamp();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_ckdt_checklists') THEN
        CREATE TRIGGER set_timestamp_ckdt_checklists
        BEFORE UPDATE ON ckdt_checklists
        FOR EACH ROW
        EXECUTE FUNCTION ckdt_trigger_set_timestamp();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_ckdt_checklist_items') THEN
        CREATE TRIGGER set_timestamp_ckdt_checklist_items
        BEFORE UPDATE ON ckdt_checklist_items
        FOR EACH ROW
        EXECUTE FUNCTION ckdt_trigger_set_timestamp();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_ckdt_user_progress') THEN
        CREATE TRIGGER set_timestamp_ckdt_user_progress
        BEFORE UPDATE ON ckdt_user_progress
        FOR EACH ROW
        EXECUTE FUNCTION ckdt_trigger_set_timestamp();
    END IF;
END $$;

-- Enable Row Level Security (RLS)
ALTER TABLE ckdt_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE ckdt_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE ckdt_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ckdt_user_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DO $$
BEGIN
    -- Services policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ckdt_services' AND policyname = 'Anyone can read ckdt_services') THEN
        CREATE POLICY "Anyone can read ckdt_services" ON ckdt_services FOR SELECT USING (true);
    END IF;
    
    -- Checklists policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ckdt_checklists' AND policyname = 'Anyone can read ckdt_checklists') THEN
        CREATE POLICY "Anyone can read ckdt_checklists" ON ckdt_checklists FOR SELECT USING (true);
    END IF;
    
    -- Checklist items policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ckdt_checklist_items' AND policyname = 'Anyone can read ckdt_checklist_items') THEN
        CREATE POLICY "Anyone can read ckdt_checklist_items" ON ckdt_checklist_items FOR SELECT USING (true);
    END IF;
    
    -- User progress policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ckdt_user_progress' AND policyname = 'Users can read their own ckdt_progress') THEN
        CREATE POLICY "Users can read their own ckdt_progress" ON ckdt_user_progress 
        FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ckdt_user_progress' AND policyname = 'Users can update their own ckdt_progress') THEN
        CREATE POLICY "Users can update their own ckdt_progress" ON ckdt_user_progress 
        FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ckdt_user_progress' AND policyname = 'Users can insert their own ckdt_progress') THEN
        CREATE POLICY "Users can insert their own ckdt_progress" ON ckdt_user_progress 
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ckdt_user_progress' AND policyname = 'Users can delete their own ckdt_progress') THEN
        CREATE POLICY "Users can delete their own ckdt_progress" ON ckdt_user_progress 
        FOR DELETE USING (auth.uid() = user_id);
    END IF;
    
    -- Admin policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ckdt_services' AND policyname = 'Admins can manage ckdt_services') THEN
        CREATE POLICY "Admins can manage ckdt_services" ON ckdt_services 
        FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ckdt_checklists' AND policyname = 'Admins can manage ckdt_checklists') THEN
        CREATE POLICY "Admins can manage ckdt_checklists" ON ckdt_checklists 
        FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ckdt_checklist_items' AND policyname = 'Admins can manage ckdt_checklist_items') THEN
        CREATE POLICY "Admins can manage ckdt_checklist_items" ON ckdt_checklist_items 
        FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
    END IF;
END $$;

-- Migration: The position columns are already defined in the table creation statements above,
-- so we don't need this migration anymore
