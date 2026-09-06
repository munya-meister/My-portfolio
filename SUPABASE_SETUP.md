# Supabase Setup Instructions

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/login and create a new project
3. Choose a region close to your target audience
4. Wait for the project to be provisioned

## 2. Set Up Database Schema

1. Go to the SQL Editor in your Supabase project
2. Copy the contents of `supabase/schema.sql`
3. Paste and run the SQL script
4. This will create the required tables:
   - `about`
   - `projects`
   - `certificates`
   - `contact_messages`

## 3. Create Storage Buckets

In your Supabase project:

1. Go to Storage → Create a new bucket
2. Create the following buckets:
   - `certificates` - for certificate images
   - `profile` - for profile images
   - `projects` - for project images
   - `documents` - for CV and other documents

3. For each bucket:
   - Make it public (for read access)
   - Enable file uploads
   - Set appropriate file size limits

## 4. Get Supabase Credentials

1. Go to Project Settings → API
2. Copy your Project URL
3. Copy your service_role key (anon key is not enough for admin operations)
4. Save these securely

## 5. Configure Environment Variables

Add the following to your Netlify environment variables:

```
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
ADMIN_PASSWORD=your-secure-admin-password
RESEND_API_KEY=your-resend-api-key
CONTACT_EMAIL=your-email@example.com
```

## 6. Run Migration Script

After setting up Supabase:

1. Add your Supabase credentials to local `.env` file
2. Run: `npm run migrate`
3. This will:
   - Migrate existing certificates from db.json
   - Migrate existing projects from db.json
   - Migrate About information from db.json
   - Upload existing files to Supabase Storage
   - Update database records with new storage URLs

## 7. Verify Migration

1. Check Supabase database tables for data
2. Check Supabase Storage for uploaded files
3. Test your portfolio frontend
4. Verify certificates display correctly
5. Verify profile picture displays correctly

## 8. Deploy to Netlify

After migration is verified:

1. Push your code to Git
2. Connect your repository to Netlify
3. Add environment variables in Netlify dashboard
4. Deploy
5. Test all functionality in production