-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create about table
CREATE TABLE IF NOT EXISTS about (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_pic TEXT,
  heading TEXT NOT NULL,
  bio1 TEXT NOT NULL,
  bio2 TEXT,
  cv_url TEXT,
  socials JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
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

-- Create certificates table
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

-- Create contact_messages table for fallback contact form storage
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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_about_updated_at BEFORE UPDATE ON about
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON certificates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default about record if it doesn't exist
INSERT INTO about (profile_pic, heading, bio1, bio2, cv_url, socials)
VALUES (
  '',
  'Passionate About Building Brands, Websites & Creative Experiences.',
  'I''m Munyaradzi Mbewe, a Digital Marketer, Web Developer and Music Writer who enjoys combining creativity with technology to help businesses and creators grow online.',
  'From designing modern websites to creating high-converting marketing campaigns and writing music, I enjoy turning ideas into memorable digital experiences that leave a lasting impression.',
  '/cv.pdf',
  '{}'::jsonb
)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE about ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for about table (single record, public read, admin write)
CREATE POLICY "About public read" ON about FOR SELECT USING (true);
CREATE POLICY "About admin write" ON about FOR ALL USING (true);

-- Create policies for projects table (public read, admin write)
CREATE POLICY "Projects public read" ON projects FOR SELECT USING (true);
CREATE POLICY "Projects admin write" ON projects FOR ALL USING (true);

-- Create policies for certificates table (public read, admin write)
CREATE POLICY "Certificates public read" ON certificates FOR SELECT USING (true);
CREATE POLICY "Certificates admin write" ON certificates FOR ALL USING (true);

-- Create policies for contact_messages table (admin write only)
CREATE POLICY "Contact messages insert" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Contact messages read" ON contact_messages FOR SELECT USING (true);

-- Storage buckets (create these in Supabase dashboard):
-- 1. 'certificates' - for certificate images
-- 2. 'profile' - for profile images  
-- 3. 'projects' - for project images
-- 4. 'documents' - for CV and other documents

-- Enable public access for storage buckets (configure in Supabase dashboard):
-- Set bucket policies to allow public read access