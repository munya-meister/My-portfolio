import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const dotenv = await import('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role for migrations

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Read existing db.json
const dbPath = path.resolve(__dirname, '../server/data/db.json');
let existingData = { certificates: [], projects: [], about: {} };

try {
  if (fs.existsSync(dbPath)) {
    const dbContent = fs.readFileSync(dbPath, 'utf8');
    existingData = JSON.parse(dbContent);
    console.log('✅ Loaded existing data from db.json');
  } else {
    console.log('⚠️  db.json not found, will use empty data');
  }
} catch (error) {
  console.error('❌ Error reading db.json:', error.message);
  process.exit(1);
}

// Helper function to upload file to Supabase Storage
async function uploadFileToStorage(filePath, bucket, folder) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return null;
    }

    const fileName = path.basename(filePath);
    const fileBuffer = fs.readFileSync(filePath);
    const fileExt = path.extname(fileName);
    const contentType = getContentType(fileExt);

    const storagePath = `${folder}/${crypto.randomUUID()}${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(storagePath, fileBuffer, {
        contentType,
        upsert: false
      });

    if (error) {
      console.error(`❌ Error uploading ${fileName}:`, error.message);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(storagePath);

    console.log(`✅ Uploaded ${fileName} -> ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error(`❌ Error processing file ${filePath}:`, error.message);
    return null;
  }
}

function getContentType(extension) {
  const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
    '.gif': 'image/gif'
  };
  return contentTypes[extension.toLowerCase()] || 'application/octet-stream';
}

// Migrate certificates
async function migrateCertificates() {
  console.log('\n📋 Migrating certificates...');
  
  const { data: existingCerts, error: fetchError } = await supabase
    .from('certificates')
    .select('id');
  
  if (fetchError) {
    console.error('❌ Error fetching existing certificates:', fetchError.message);
    return;
  }
  
  const existingIds = new Set(existingCerts?.map(c => c.id) || []);
  let migratedCount = 0;
  let skippedCount = 0;
  
  for (const cert of existingData.certificates) {
    if (existingIds.has(cert.id)) {
      console.log(`⏭️  Skipping certificate (already exists): ${cert.title}`);
      skippedCount++;
      continue;
    }
    
    // Handle file upload if there's a local file
    let fileUrl = cert.fileUrl || cert.imageUrl;
    
    if (cert.fileUrl && cert.fileUrl.startsWith('/uploads/certificates/')) {
      const fileName = cert.fileUrl.split('/').pop();
      const localPath = path.resolve(__dirname, '../server/uploads/certificates', fileName);
      
      const uploadedUrl = await uploadFileToStorage(localPath, 'certificates', 'certificate-images');
      if (uploadedUrl) {
        fileUrl = uploadedUrl;
      }
    }
    
    const { error: insertError } = await supabase
      .from('certificates')
      .insert({
        id: cert.id,
        title: cert.title,
        description: cert.description || '',
        platform: cert.platform || '',
        category: cert.category || '',
        date: cert.date || '',
        skills: cert.skills || [],
        technologies: cert.technologies || [],
        demo: cert.demo || '',
        github: cert.github || '',
        url: cert.url || '',
        verify_url: cert.verifyUrl || '',
        image_url: cert.imageUrl || '',
        file_url: fileUrl,
        created_at: cert.createdAt || new Date().toISOString()
      });
    
    if (insertError) {
      console.error(`❌ Error inserting certificate "${cert.title}":`, insertError.message);
    } else {
      console.log(`✅ Migrated certificate: ${cert.title}`);
      migratedCount++;
    }
  }
  
  console.log(`📊 Certificates: ${migratedCount} migrated, ${skippedCount} skipped`);
}

// Migrate projects
async function migrateProjects() {
  console.log('\n📋 Migrating projects...');
  
  const { data: existingProjects, error: fetchError } = await supabase
    .from('projects')
    .select('id');
  
  if (fetchError) {
    console.error('❌ Error fetching existing projects:', fetchError.message);
    return;
  }
  
  const existingIds = new Set(existingProjects?.map(p => p.id) || []);
  let migratedCount = 0;
  let skippedCount = 0;
  
  for (const project of existingData.projects) {
    if (existingIds.has(project.id)) {
      console.log(`⏭️  Skipping project (already exists): ${project.title}`);
      skippedCount++;
      continue;
    }
    
    // Handle file upload if there's a local file
    let fileUrl = project.fileUrl || project.imageUrl;
    
    if (project.fileUrl && project.fileUrl.startsWith('/uploads/projects/')) {
      const fileName = project.fileUrl.split('/').pop();
      const localPath = path.resolve(__dirname, '../server/uploads/projects', fileName);
      
      const uploadedUrl = await uploadFileToStorage(localPath, 'projects', 'project-images');
      if (uploadedUrl) {
        fileUrl = uploadedUrl;
      }
    }
    
    const { error: insertError } = await supabase
      .from('projects')
      .insert({
        id: project.id,
        title: project.title,
        description: project.description || '',
        category: project.category || 'Web Development',
        technologies: project.technologies || [],
        demo: project.demo || '',
        github: project.github || '',
        image_url: project.imageUrl || '',
        file_url: fileUrl,
        created_at: project.createdAt || new Date().toISOString()
      });
    
    if (insertError) {
      console.error(`❌ Error inserting project "${project.title}":`, insertError.message);
    } else {
      console.log(`✅ Migrated project: ${project.title}`);
      migratedCount++;
    }
  }
  
  console.log(`📊 Projects: ${migratedCount} migrated, ${skippedCount} skipped`);
}

// Migrate about information
async function migrateAbout() {
  console.log('\n📋 Migrating about information...');
  
  const { data: existingAbout, error: fetchError } = await supabase
    .from('about')
    .select('id')
    .limit(1);
  
  if (fetchError) {
    console.error('❌ Error fetching existing about:', fetchError.message);
    return;
  }
  
  if (existingAbout && existingAbout.length > 0) {
    console.log('⏭️  About record already exists, updating...');
    
    // Handle profile picture upload
    let profilePic = existingData.about.profilePic || '';
    
    if (existingData.about.profilePic && existingData.about.profilePic.startsWith('/uploads/about/')) {
      const fileName = existingData.about.profilePic.split('/').pop();
      const localPath = path.resolve(__dirname, '../server/uploads/about', fileName);
      
      const uploadedUrl = await uploadFileToStorage(localPath, 'profile', 'profile-images');
      if (uploadedUrl) {
        profilePic = uploadedUrl;
      }
    }
    
    const { error: updateError } = await supabase
      .from('about')
      .update({
        profile_pic: profilePic,
        heading: existingData.about.heading || '',
        bio1: existingData.about.bio1 || '',
        bio2: existingData.about.bio2 || '',
        cv_url: existingData.about.cvUrl || '',
        socials: existingData.about.socials || {}
      })
      .eq('id', existingAbout[0].id);
    
    if (updateError) {
      console.error('❌ Error updating about:', updateError.message);
    } else {
      console.log('✅ Updated about information');
    }
  } else {
    console.log('Creating new about record...');
    
    // Handle profile picture upload
    let profilePic = existingData.about.profilePic || '';
    
    if (existingData.about.profilePic && existingData.about.profilePic.startsWith('/uploads/about/')) {
      const fileName = existingData.about.profilePic.split('/').pop();
      const localPath = path.resolve(__dirname, '../server/uploads/about', fileName);
      
      const uploadedUrl = await uploadFileToStorage(localPath, 'profile', 'profile-images');
      if (uploadedUrl) {
        profilePic = uploadedUrl;
      }
    }
    
    const { error: insertError } = await supabase
      .from('about')
      .insert({
        profile_pic: profilePic,
        heading: existingData.about.heading || '',
        bio1: existingData.about.bio1 || '',
        bio2: existingData.about.bio2 || '',
        cv_url: existingData.about.cvUrl || '',
        socials: existingData.about.socials || {}
      });
    
    if (insertError) {
      console.error('❌ Error inserting about:', insertError.message);
    } else {
      console.log('✅ Created about information');
    }
  }
}

// Main migration function
async function runMigration() {
  console.log('🚀 Starting Supabase migration...\n');
  
  try {
    await migrateCertificates();
    await migrateProjects();
    await migrateAbout();
    
    console.log('\n✅ Migration completed successfully!');
    console.log('⚠️  Original db.json and files preserved at server/data/db.json and server/uploads/');
    console.log('⚠️  Verify the migrated data before deleting original files');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();