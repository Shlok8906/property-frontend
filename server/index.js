import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase environment variables. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const TABLES = {
  properties: 'legacy_properties',
  enquiries: 'legacy_enquiries',
  leads: 'legacy_leads',
  contactMessages: 'contact_messages',
  users: 'user_tracking'
};

const pickDefined = (obj) => Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));

const normalizeImages = (images, imageUrl) => {
  const normalizedImages = Array.isArray(images) ? images : (images ? [images] : []);
  const normalizedImageUrl = typeof imageUrl === 'string' ? imageUrl : (normalizedImages[0] || null);
  return { normalizedImages, normalizedImageUrl };
};

const mapPropertyFromDb = (row) => ({
  _id: row.id,
  id: row.id,
  title: row.title,
  location: row.location,
  bhk: row.bhk,
  price: row.price,
  type: row.type,
  category: row.category,
  purpose: row.purpose,
  builder: row.builder,
  specification: row.specification,
  tower: row.tower,
  carpetArea: row.carpet_area,
  units: row.units,
  possession: row.possession,
  amenities: row.amenities,
  projectName: row.project_name,
  salesPerson: row.sales_person,
  image_url: row.image_url,
  images: row.images,
  status: row.status,
  created_at: row.created_at,
  updated_at: row.updated_at
});

const mapPropertyToDb = (property) => {
  const { normalizedImages, normalizedImageUrl } = normalizeImages(property.images, property.image_url);
  return pickDefined({
    title: property.title,
    location: property.location,
    bhk: property.bhk,
    price: property.price,
    type: property.type,
    category: property.category,
    purpose: property.purpose,
    builder: property.builder,
    specification: property.specification,
    tower: property.tower,
    carpet_area: property.carpetArea ?? property.carpet_area,
    units: property.units,
    possession: property.possession,
    amenities: property.amenities,
    project_name: property.projectName ?? property.project_name,
    sales_person: property.salesPerson ?? property.sales_person,
    image_url: normalizedImageUrl,
    images: normalizedImages,
    status: property.status
  });
};

const mapEnquiryFromDb = (row) => ({
  _id: row.id,
  id: row.id,
  propertyId: row.property_id,
  propertyTitle: row.property_title,
  name: row.name,
  email: row.email,
  phone: row.phone,
  message: row.message,
  status: row.status,
  created_at: row.created_at,
  updated_at: row.updated_at
});

const mapEnquiryToDb = (enquiry) => pickDefined({
  property_id: enquiry.propertyId ?? enquiry.property_id,
  property_title: enquiry.propertyTitle ?? enquiry.property_title,
  name: enquiry.name,
  email: enquiry.email,
  phone: enquiry.phone,
  message: enquiry.message,
  status: enquiry.status
});

const mapLeadFromDb = (row) => ({
  _id: row.id,
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  propertyType: row.property_type,
  budget: row.budget,
  location: row.location,
  priority: row.priority,
  source: row.source,
  notes: row.notes,
  status: row.status,
  notesHistory: row.notes_history,
  conversionPotential: row.conversion_potential,
  created_at: row.created_at,
  updated_at: row.updated_at
});

const mapLeadToDb = (lead) => pickDefined({
  name: lead.name,
  email: lead.email,
  phone: lead.phone,
  property_type: lead.propertyType ?? lead.property_type,
  budget: lead.budget,
  location: lead.location,
  priority: lead.priority,
  source: lead.source,
  notes: lead.notes,
  status: lead.status,
  notes_history: lead.notesHistory ?? lead.notes_history,
  conversion_potential: lead.conversionPotential ?? lead.conversion_potential
});

const mapContactMessageFromDb = (row) => ({
  _id: row.id,
  id: row.id,
  name: row.name,
  phone: row.phone,
  email: row.email,
  message: row.message,
  status: row.status,
  created_at: row.created_at,
  updated_at: row.updated_at
});

const mapUserFromDb = (row) => ({
  id: row.id,
  supabaseId: row.supabase_id,
  email: row.email,
  fullName: row.full_name,
  phone: row.phone,
  accountCreatedAt: row.account_created_at,
  lastLogin: row.last_login,
  loginCount: row.login_count,
  loginHistory: row.login_history,
  role: row.role,
  isActive: row.is_active,
  metadata: row.metadata,
  created_at: row.created_at,
  updated_at: row.updated_at
});

const countRows = async (table, filter = (query) => query) => {
  const { count, error } = await filter(
    supabase.from(table).select('id', { count: 'exact', head: true })
  );
  if (error) throw error;
  return count || 0;
};

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080',
  'https://nivaas-tau.vercel.app',
  process.env.FRONTEND_URL || null,
  process.env.FRONTEND_URL ? `https://${process.env.FRONTEND_URL}` : null
].filter(Boolean);

const isVercelOrigin = (origin) => {
  if (!origin) return false;
  return /^https:\/\/.*\.vercel\.app$/.test(origin);
};

// CORS Configuration
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || isVercelOrigin(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API Routes

// Get all properties
app.get('/api/properties', async (req, res) => {
  try {
    const includeHidden = req.query.includeHidden === 'true';

    let query = supabase.from(TABLES.properties).select('*').order('created_at', { ascending: false });
    if (!includeHidden) {
      query = query.eq('status', 'active');
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json((data || []).map(mapPropertyFromDb));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete all properties (for testing/admin cleanup)
app.delete('/api/properties', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.properties)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
      .select('id');

    if (error) throw error;

    const deletedCount = data?.length || 0;
    res.json({
      success: true,
      deletedCount,
      message: `All ${deletedCount} properties deleted`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single property
app.get('/api/properties/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.properties)
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json(mapPropertyFromDb(data));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create property
app.post('/api/properties', async (req, res) => {
  try {
    const payload = {
      ...mapPropertyToDb(req.body),
      status: req.body.status || 'active'
    };

    const { data, error } = await supabase
      .from(TABLES.properties)
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;
    res.status(201).json(mapPropertyFromDb(data));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create multiple properties (bulk import) - with batching for large imports
app.post('/api/properties/bulk', async (req, res) => {
  try {
    const properties = req.body;

    if (!Array.isArray(properties)) {
      return res.status(400).json({ error: 'Expected an array of properties' });
    }

    const propertiesWithStatus = properties.map((property) => ({
      ...property,
      status: property.status || 'active'
    }));

    const BATCH_SIZE = 100;
    const results = [];

    for (let i = 0; i < propertiesWithStatus.length; i += BATCH_SIZE) {
      const batch = propertiesWithStatus.slice(i, i + BATCH_SIZE).map(mapPropertyToDb);
      const { data, error } = await supabase
        .from(TABLES.properties)
        .insert(batch)
        .select('*');

      if (error) throw error;

      if (data?.length) {
        results.push(...data.map(mapPropertyFromDb));
      }
    }

    res.status(201).json({
      success: true,
      count: results.length,
      properties: results
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update property
app.put('/api/properties/:id', async (req, res) => {
  try {
    const payload = {
      ...mapPropertyToDb(req.body),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from(TABLES.properties)
      .update(payload)
      .eq('id', req.params.id)
      .select('*')
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json(mapPropertyFromDb(data));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete property
app.delete('/api/properties/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.properties)
      .delete()
      .eq('id', req.params.id)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json({ success: true, message: 'Property deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const { error } = await supabase.from(TABLES.properties).select('id').limit(1);
    res.json({ status: 'OK', supabase: !error });
  } catch (error) {
    res.json({ status: 'OK', supabase: false, error: error.message });
  }
});

// Get all enquiries
app.get('/api/enquiries', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.enquiries)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json((data || []).map(mapEnquiryFromDb));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create enquiry
app.post('/api/enquiries', async (req, res) => {
  try {
    const payload = {
      ...mapEnquiryToDb(req.body),
      status: req.body.status || 'new'
    };

    const { data, error } = await supabase
      .from(TABLES.enquiries)
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;
    res.status(201).json(mapEnquiryFromDb(data));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update enquiry status
app.put('/api/enquiries/:id', async (req, res) => {
  try {
    const payload = {
      ...mapEnquiryToDb(req.body),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from(TABLES.enquiries)
      .update(payload)
      .eq('id', req.params.id)
      .select('*')
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }

    res.json(mapEnquiryFromDb(data));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete enquiry
app.delete('/api/enquiries/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.enquiries)
      .delete()
      .eq('id', req.params.id)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }

    res.json({ success: true, message: 'Enquiry deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== LEAD ENDPOINTS =====

// Get all leads
app.get('/api/leads', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.leads)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json((data || []).map(mapLeadFromDb));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create lead
app.post('/api/leads', async (req, res) => {
  try {
    const payload = {
      ...mapLeadToDb(req.body),
      priority: req.body.priority || 'warm',
      conversion_potential: req.body.conversionPotential ?? req.body.conversion_potential ?? 50
    };

    const { data, error } = await supabase
      .from(TABLES.leads)
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;
    res.status(201).json(mapLeadFromDb(data));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update lead
app.put('/api/leads/:id', async (req, res) => {
  try {
    const payload = {
      ...mapLeadToDb(req.body),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from(TABLES.leads)
      .update(payload)
      .eq('id', req.params.id)
      .select('*')
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json(mapLeadFromDb(data));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete lead
app.delete('/api/leads/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.leads)
      .delete()
      .eq('id', req.params.id)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({ success: true, message: 'Lead deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== CONTACT MESSAGES API =====
// Get all contact messages
app.get('/api/contact-messages', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.contactMessages)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json((data || []).map(mapContactMessageFromDb));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create contact message
app.post('/api/contact', async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;

    const { data, error } = await supabase
      .from(TABLES.contactMessages)
      .insert({
        name,
        phone,
        email,
        message,
        status: 'new'
      })
      .select('*')
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, message: 'Message sent successfully', data: mapContactMessageFromDb(data) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update contact message status
app.put('/api/contact-messages/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const { data, error } = await supabase
      .from(TABLES.contactMessages)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select('*')
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json(mapContactMessageFromDb(data));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete contact message
app.delete('/api/contact-messages/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.contactMessages)
      .delete()
      .eq('id', req.params.id)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard stats
app.get('/api/stats', async (req, res) => {
  try {
    const totalProperties = await countRows(TABLES.properties);
    const totalEnquiries = await countRows(TABLES.enquiries);
    const newEnquiries = await countRows(TABLES.enquiries, (query) => query.eq('status', 'new'));
    const activeListings = await countRows(TABLES.properties, (query) => query.eq('purpose', 'sale'));

    res.json({
      totalProperties,
      totalEnquiries,
      newEnquiries,
      activeListings
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Migration endpoint - Add status field to all existing properties (run once)
app.post('/api/migrate/add-status', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.properties)
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .is('status', null)
      .select('id');

    if (error) throw error;
    res.json({
      success: true,
      message: 'Migration completed',
      modifiedCount: data?.length || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== USER ENDPOINTS =====

// Track user login - Called after Supabase authentication
app.post('/api/users/track-login', async (req, res) => {
  try {
    const { supabaseId, email, fullName } = req.body;

    if (!supabaseId || !email) {
      return res.status(400).json({ error: 'supabaseId and email are required' });
    }

    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const { data: existingUser, error: existingError } = await supabase
      .from(TABLES.users)
      .select('*')
      .eq('supabase_id', supabaseId)
      .maybeSingle();

    if (existingError) throw existingError;

    const loginHistory = Array.isArray(existingUser?.login_history) ? existingUser.login_history : [];
    const newEntry = {
      timestamp: new Date().toISOString(),
      ipAddress,
      userAgent,
      deviceInfo: req.body.deviceInfo || 'Web'
    };

    const updatedHistory = [newEntry, ...loginHistory].slice(0, 200);
    const metadata = existingUser?.metadata || { totalPropertiesViewed: 0, totalEnquiriesMade: 0 };

    const payload = {
      supabase_id: supabaseId,
      email: email.toLowerCase(),
      full_name: fullName || 'User',
      last_login: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      login_count: (existingUser?.login_count || 0) + 1,
      login_history: updatedHistory,
      role: existingUser?.role || 'customer',
      is_active: existingUser?.is_active ?? true,
      metadata,
      account_created_at: existingUser?.account_created_at || new Date().toISOString()
    };

    const { data, error } = await supabase
      .from(TABLES.users)
      .upsert(payload, { onConflict: 'supabase_id' })
      .select('*')
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Login tracked successfully',
      user: {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        loginCount: data.login_count,
        lastLogin: data.last_login
      }
    });
  } catch (error) {
    console.error('Error tracking login:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user by Supabase ID
app.get('/api/users/:supabaseId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.users)
      .select('*')
      .eq('supabase_id', req.params.supabaseId)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(mapUserFromDb(data));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users (admin only)
app.get('/api/users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.users)
      .select('id,supabase_id,email,full_name,phone,account_created_at,last_login,login_count,role,is_active,metadata,created_at,updated_at')
      .order('last_login', { ascending: false });

    if (error) throw error;

    const users = (data || []).map(mapUserFromDb);
    res.json({
      totalUsers: users.length,
      activeUsers: users.filter((user) => user.isActive).length,
      users
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user login statistics
app.get('/api/users/stats/overview', async (req, res) => {
  try {
    const totalUsers = await countRows(TABLES.users);
    const activeUsers = await countRows(TABLES.users, (query) => query.eq('is_active', true));
    const activeToday = await countRows(TABLES.users, (query) => query.gte('last_login', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()));
    const activeThisWeek = await countRows(TABLES.users, (query) => query.gte('last_login', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()));

    res.json({
      totalUsers,
      activeUsers,
      activeToday,
      activeThisWeek
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
app.put('/api/users/:supabaseId', async (req, res) => {
  try {
    const { phone, searchInterests, preferredLocations } = req.body;

    const { data: existingUser, error: existingError } = await supabase
      .from(TABLES.users)
      .select('*')
      .eq('supabase_id', req.params.supabaseId)
      .maybeSingle();

    if (existingError) throw existingError;
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const metadata = {
      ...(existingUser.metadata || {}),
      ...(searchInterests ? { searchInterests } : {}),
      ...(preferredLocations ? { preferredLocations } : {})
    };

    const { data, error } = await supabase
      .from(TABLES.users)
      .update({
        phone: phone || existingUser.phone,
        metadata,
        updated_at: new Date().toISOString()
      })
      .eq('supabase_id', req.params.supabaseId)
      .select('*')
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'User profile updated',
      user: mapUserFromDb(data)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deactivate user account
app.post('/api/users/:supabaseId/deactivate', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.users)
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('supabase_id', req.params.supabaseId)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User account deactivated'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user login history
app.get('/api/users/:supabaseId/login-history', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.users)
      .select('supabase_id,email,login_count,last_login,login_history')
      .eq('supabase_id', req.params.supabaseId)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'User not found' });
    }

    const loginHistory = Array.isArray(data.login_history) ? data.login_history : [];
    res.json({
      supabaseId: data.supabase_id,
      email: data.email,
      loginCount: data.login_count,
      lastLogin: data.last_login,
      loginHistory: loginHistory.slice(0, 50)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Increment property view count for user
app.post('/api/users/:supabaseId/track-property-view', async (req, res) => {
  try {
    const { data: existingUser, error: existingError } = await supabase
      .from(TABLES.users)
      .select('metadata')
      .eq('supabase_id', req.params.supabaseId)
      .maybeSingle();

    if (existingError) throw existingError;
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const metadata = {
      ...(existingUser.metadata || {}),
      totalPropertiesViewed: (existingUser.metadata?.totalPropertiesViewed || 0) + 1
    };

    const { error } = await supabase
      .from(TABLES.users)
      .update({ metadata, updated_at: new Date().toISOString() })
      .eq('supabase_id', req.params.supabaseId);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Increment enquiry count for user
app.post('/api/users/:supabaseId/track-enquiry', async (req, res) => {
  try {
    const { data: existingUser, error: existingError } = await supabase
      .from(TABLES.users)
      .select('metadata')
      .eq('supabase_id', req.params.supabaseId)
      .maybeSingle();

    if (existingError) throw existingError;
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const metadata = {
      ...(existingUser.metadata || {}),
      totalEnquiriesMade: (existingUser.metadata?.totalEnquiriesMade || 0) + 1
    };

    const { error } = await supabase
      .from(TABLES.users)
      .update({ metadata, updated_at: new Date().toISOString() })
      .eq('supabase_id', req.params.supabaseId);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
