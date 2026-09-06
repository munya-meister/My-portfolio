import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to handle file uploads to Supabase Storage
async function handleFileUpload(file, bucket, folder) {
  if (!file) return null;
  
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const storagePath = `${folder}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(storagePath, file, {
        upsert: false
      });
    
    if (error) {
      console.error('File upload error:', error);
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(storagePath);
    
    return publicUrl;
  } catch (error) {
    console.error('File processing error:', error);
    return null;
  }
}

function requireAdmin(event) {
  const auth = event.headers.authorization || event.headers.Authorization || "";
  const match = auth.match(/^Bearer\s+(.+)$/);
  const token = match ? match[1] : "";
  
  if (token !== process.env.ADMIN_PASSWORD) {
    return false;
  }
  return true;
}

// Main handler
export default async function handler(event, context) {
  const { path, httpMethod, headers, body } = event;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };
  
  // Handle preflight requests
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }
  
  try {
    const url = new URL(event.rawUrl, `http://${headers.host}`);
    const pathname = url.pathname;
    
    // Health check
    if (pathname === '/health' || pathname === '/.netlify/functions/api/health') {
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'ok',
          time: new Date().toISOString(),
          version: '2.0'
        })
      };
    }
    
    // Contact form
    if (pathname === '/api/contact' || pathname === '/.netlify/functions/api/contact') {
      if (httpMethod !== 'POST') {
        return {
          statusCode: 405,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Method not allowed' })
        };
      }
      
      const data = JSON.parse(body);
      const { name, email, subject, message } = data;
      
      if (!name || !email || !subject || !message) {
        return {
          statusCode: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            message: 'Please fill in all required fields correctly.'
          })
        };
      }
      
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        return {
          statusCode: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            message: 'Please enter a valid email address.'
          })
        };
      }
      
      // Try to send email using Resend
      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Portfolio Contact <onboarding@resend.dev>',
            to: [process.env.CONTACT_EMAIL || 'munyaradzi.mbewe01@gmail.com'],
            replyTo: email,
            subject: `Portfolio Contact: ${subject}`,
            text: `Name: ${name}\n\nEmail: ${email}\n\nSubject: ${subject}\n\nMessage:\n${message}`
          })
        });
        
        if (resendResponse.ok) {
          return {
            statusCode: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              success: true,
              message: 'Message sent successfully.'
            })
          };
        }
      } catch (emailError) {
        console.error('Email error:', emailError);
      }
      
      // Fallback: save message to database
      const { error: insertError } = await supabase
        .from('contact_messages')
        .insert({
          name,
          email,
          subject,
          message,
          received_at: new Date().toISOString(),
          status: 'queued'
        });
      
      if (insertError) {
        console.error('Contact message save error:', insertError);
      }
      
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          fallback: true,
          message: 'Your message was received and saved securely.'
        })
      };
    }
    
    // GET /api/about
    if ((pathname === '/api/about' || pathname === '/.netlify/functions/api/about') && httpMethod === 'GET') {
      const { data, error } = await supabase
        .from('about')
        .select('*')
        .limit(1)
        .single();
      
      if (error) {
        return {
          statusCode: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Error fetching about data' })
        };
      }
      
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(data || {})
      };
    }
    
    // PUT /api/about (admin only)
    if ((pathname === '/api/about' || pathname === '/.netlify/functions/api/about') && httpMethod === 'PUT') {
      if (!requireAdmin(event)) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Unauthorized' })
        };
      }
      
      const data = JSON.parse(body);
      
      const { data: existingAbout, error: fetchError } = await supabase
        .from('about')
        .select('id')
        .limit(1)
        .single();
      
      if (fetchError || !existingAbout) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'About record not found' })
        };
      }
      
      const updateData = {
        profile_pic: data.profilePic || undefined,
        heading: data.heading || undefined,
        bio1: data.bio1 || undefined,
        bio2: data.bio2 || undefined,
        cv_url: data.cvUrl || undefined,
        socials: data.socials ? (typeof data.socials === 'string' ? JSON.parse(data.socials) : data.socials) : undefined
      };
      
      const { error: updateError } = await supabase
        .from('about')
        .update(updateData)
        .eq('id', existingAbout.id)
        .select()
        .single();
      
      if (updateError) {
        return {
          statusCode: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Error updating about data' })
        };
      }
      
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(updateError ? {} : updateData)
      };
    }
    
    // GET /api/certificates
    if ((pathname === '/api/certificates' || pathname === '/.netlify/functions/api/certificates') && httpMethod === 'GET') {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        return {
          statusCode: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Error fetching certificates' })
        };
      }
      
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(data || [])
      };
    }
    
    // GET /api/projects
    if ((pathname === '/api/projects' || pathname === '/.netlify/functions/api/projects') && httpMethod === 'GET') {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        return {
          statusCode: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Error fetching projects' })
        };
      }
      
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(data || [])
      };
    }
    
    // POST /api/certificates (admin only)
    if ((pathname === '/api/certificates' || pathname === '/.netlify/functions/api/certificates') && httpMethod === 'POST') {
      if (!requireAdmin(event)) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Unauthorized' })
        };
      }
      
      const data = JSON.parse(body);
      
      const item = {
        title: data.title || "",
        description: data.description || "",
        platform: data.platform || "",
        category: data.category || "",
        date: data.date || "",
        skills: data.skills ? data.skills.split(',').map(s => s.trim()) : [],
        technologies: data.technologies ? data.technologies.split(',').map(t => t.trim()) : [],
        demo: data.demo || "",
        github: data.github || "",
        url: data.url || "",
        verify_url: data.verifyUrl || "",
        image_url: data.imageUrl || "",
        file_url: data.fileUrl || ""
      };
      
      const { data: inserted, error } = await supabase
        .from('certificates')
        .insert(item)
        .select()
        .single();
      
      if (error) {
        return {
          statusCode: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Error creating certificate' })
        };
      }
      
      return {
        statusCode: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(inserted)
      };
    }
    
    // POST /api/projects (admin only)
    if ((pathname === '/api/projects' || pathname === '/.netlify/functions/api/projects') && httpMethod === 'POST') {
      if (!requireAdmin(event)) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Unauthorized' })
        };
      }
      
      const data = JSON.parse(body);
      
      const item = {
        title: data.title || "",
        description: data.description || "",
        technologies: data.technologies ? data.technologies.split(',').map(t => t.trim()) : [],
        demo: data.demo || "",
        github: data.github || "",
        image_url: data.imageUrl || "",
        file_url: data.fileUrl || "",
        category: data.category || "Web Development"
      };
      
      const { data: inserted, error } = await supabase
        .from('projects')
        .insert(item)
        .select()
        .single();
      
      if (error) {
        return {
          statusCode: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Error creating project' })
        };
      }
      
      return {
        statusCode: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(inserted)
      };
    }
    
    // PUT /api/certificates/:id (admin only)
    if (pathname.match(/^\/api\/certificates\/[^\/]+$/) && httpMethod === 'PUT') {
      if (!requireAdmin(event)) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Unauthorized' })
        };
      }
      
      const id = pathname.split('/').pop();
      const data = JSON.parse(body);
      
      const updateData = {
        title: data.title,
        description: data.description,
        platform: data.platform,
        category: data.category,
        date: data.date,
        skills: data.skills ? data.skills.split(',').map(s => s.trim()) : undefined,
        url: data.url,
        verify_url: data.verifyUrl,
        image_url: data.imageUrl,
        file_url: data.fileUrl
      };
      
      const { data: updated, error } = await supabase
        .from('certificates')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Certificate not found' })
        };
      }
      
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      };
    }
    
    // PUT /api/projects/:id (admin only)
    if (pathname.match(/^\/api\/projects\/[^\/]+$/) && httpMethod === 'PUT') {
      if (!requireAdmin(event)) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Unauthorized' })
        };
      }
      
      const id = pathname.split('/').pop();
      const data = JSON.parse(body);
      
      const updateData = {
        title: data.title,
        description: data.description,
        technologies: data.technologies ? data.technologies.split(',').map(t => t.trim()) : undefined,
        demo: data.demo,
        github: data.github,
        image_url: data.imageUrl,
        file_url: data.fileUrl,
        category: data.category
      };
      
      const { data: updated, error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Project not found' })
        };
      }
      
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      };
    }
    
    // DELETE /api/certificates/:id (admin only)
    if (pathname.match(/^\/api\/certificates\/[^\/]+$/) && httpMethod === 'DELETE') {
      if (!requireAdmin(event)) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Unauthorized' })
        };
      }
      
      const id = pathname.split('/').pop();
      const { error } = await supabase
        .from('certificates')
        .delete()
        .eq('id', id);
      
      if (error) {
        return {
          statusCode: 500,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Error deleting certificate' })
        };
      }
      
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true })
      };
    }
    
    // DELETE /api/projects/:id (admin only)
    if (pathname.match(/^\/api\/projects\/[^\/]+$/) && httpMethod === 'DELETE') {
      if (!requireAdmin(event)) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Unauthorized' })
        };
      }
      
      const id = pathname.split('/').pop();
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      
      if (error) {
        return {
          statusCode: 500,
          headers: corsHeaders,
          body: JSON.stringify({ message: 'Error deleting project' })
        };
      }
      
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true })
      };
    }
    
    // 404 for unknown routes
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Endpoint not found' })
    };
    
  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message || 'Internal Server Error'
      })
    };
  }
}