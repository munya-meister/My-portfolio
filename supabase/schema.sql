CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ABOUT
CREATE TABLE IF NOT EXISTS about (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_pic TEXT,
  heading TEXT NOT NULL,
  bio1 TEXT NOT NULL,
  bio2 TEXT,
  cv_url TEXT,
  socials JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PROJECTS
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Web Development',
  technologies TEXT[] DEFAULT ARRAY[]::TEXT[],
  demo TEXT,
  github TEXT,
  image_url TEXT,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CERTIFICATES
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  platform TEXT,
  category TEXT,
  date TEXT,
  skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  technologies TEXT[] DEFAULT ARRAY[]::TEXT[],
  demo TEXT,
  github TEXT,
  url TEXT,
  verify_url TEXT,
  image_url TEXT,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CONTACT MESSAGES
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'queued',
  source TEXT,
  error TEXT
);

-- UPDATED_AT FUNCTION
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGERS
DROP TRIGGER IF EXISTS update_about_updated_at ON about;
CREATE TRIGGER update_about_updated_at
BEFORE UPDATE ON about
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_certificates_updated_at ON certificates;
CREATE TRIGGER update_certificates_updated_at
BEFORE UPDATE ON certificates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ENABLE RLS
ALTER TABLE about ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ
DROP POLICY IF EXISTS "About public read" ON about;
CREATE POLICY "About public read"
ON about FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Projects public read" ON projects;
CREATE POLICY "Projects public read"
ON projects FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Certificates public read" ON certificates;
CREATE POLICY "Certificates public read"
ON certificates FOR SELECT
USING (true);

-- CONTACT INSERT
DROP POLICY IF EXISTS "Contact messages insert" ON contact_messages;
CREATE POLICY "Contact messages insert"
ON contact_messages FOR INSERT
WITH CHECK (true);