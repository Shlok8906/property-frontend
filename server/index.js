import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/property-canvas';

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080',
  'https://nivaas-tau.vercel.app',
  process.env.FRONTEND_URL ? `https://${process.env.FRONTEND_URL}` : null
].filter(Boolean);

// CORS Configuration
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Connection (removed deprecated options)
mongoose.connect(MONGODB_URI)
.then(() => console.log('✅ MongoDB connected successfully'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Property Schema
const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, required: true },
  bhk: String,
  price: Number,
  type: String,
  category: String,
  purpose: String,
  builder: String,
  specification: String,
  tower: String,
  carpetArea: String,
  units: Number,
  possession: String,
  amenities: [String],
  projectName: String,
  salesPerson: String,
  image_url: String,  // Single image URL for backward compatibility
  images: [String],   // Array of image URLs for multiple images
  status: { type: String, default: 'active', enum: ['active', 'hidden'] },  // Property visibility status
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const Property = mongoose.model('Property', propertySchema);

// Enquiry Schema
const enquirySchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  propertyTitle: String,
  name: { type: String, required: true },
  email: String,
  phone: { type: String, required: true },
  message: String,
  status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const Enquiry = mongoose.model('Enquiry', enquirySchema);

// Lead Schema
const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  propertyType: String,
  budget: String,
  location: String,
  priority: { type: String, enum: ['hot', 'warm', 'cold'], default: 'warm' },
  source: String,
  notes: String,
  status: String,
  notesHistory: [
    {
      content: String,
      timestamp: String,
    }
  ],
  conversionPotential: { type: Number, default: 50, min: 0, max: 100 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const Lead = mongoose.model('Lead', leadSchema);

// Contact Message Schema
const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['new', 'responded', 'closed'], default: 'new' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);

// ===== USER SCHEMA =====
// Stores user login information and profile data
const userSchema = new mongoose.Schema({
  supabaseId: { type: String, unique: true, sparse: true, required: true },  // Supabase user ID
  email: { type: String, required: true, lowercase: true },
  fullName: String,
  phone: String,
  accountCreatedAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
  loginCount: { type: Number, default: 1 },
  loginHistory: [
    {
      timestamp: { type: Date, default: Date.now },
      ipAddress: String,
      userAgent: String,
      deviceInfo: String,
    }
  ],
  role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
  isActive: { type: Boolean, default: true },
  metadata: {
    searchInterests: [String],
    preferredLocations: [String],
    totalPropertiesViewed: { type: Number, default: 0 },
    totalEnquiriesMade: { type: Number, default: 0 },
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// API Routes

// Get all properties
app.get('/api/properties', async (req, res) => {
  try {
    // For admin panel, include all properties. For customer site, only show active ones.
    // Check if request is from admin panel (you can add auth header check here)
    const includeHidden = req.query.includeHidden === 'true';
    
    // Show properties that are either explicitly 'active' or don't have a status field (backward compatibility)
    const query = includeHidden ? {} : { $or: [{ status: 'active' }, { status: { $exists: false } }] };
    const properties = await Property.find(query).sort({ created_at: -1 });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete all properties (for testing/admin cleanup)
app.delete('/api/properties', async (req, res) => {
  try {
    const result = await Property.deleteMany({});
    console.log(`🗑️ Deleted ${result.deletedCount} properties`);
    res.json({ 
      success: true, 
      deletedCount: result.deletedCount,
      message: `All ${result.deletedCount} properties deleted` 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single property
app.get('/api/properties/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create property
app.post('/api/properties', async (req, res) => {
  try {
    const property = new Property(req.body);
    await property.save();
    res.status(201).json(property);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create multiple properties (bulk import) - with batching for large imports
app.post('/api/properties/bulk', async (req, res) => {
  try {
    const properties = req.body;
    
    console.log('📥 Received bulk import request with', properties.length, 'properties');
    console.log('📥 First property received:', JSON.stringify(properties[0], null, 2));
    
    if (!Array.isArray(properties)) {
      return res.status(400).json({ error: 'Expected an array of properties' });
    }

    // Set default status='active' and ENSURE images is an array for all imported properties
    const propertiesWithStatus = properties.map(p => {
      const processed = {
        ...p,
        status: p.status || 'active',
        // CRITICAL: Ensure images is always an array
        images: Array.isArray(p.images) ? p.images : (p.images ? [p.images] : []),
        // Ensure image_url is a string or undefined
        image_url: typeof p.image_url === 'string' ? p.image_url : undefined,
      };
      return processed;
    });

    console.log('📤 First property after processing:', JSON.stringify(propertiesWithStatus[0], null, 2));
    console.log('🖼️ First property images detail:', {
      images: propertiesWithStatus[0]?.images,
      imagesType: typeof propertiesWithStatus[0]?.images,
      imagesIsArray: Array.isArray(propertiesWithStatus[0]?.images),
      imagesLength: propertiesWithStatus[0]?.images?.length,
      image_url: propertiesWithStatus[0]?.image_url,
    });

    // Process in batches of 100 to avoid memory issues
    const BATCH_SIZE = 100;
    const results = [];
    
    for (let i = 0; i < propertiesWithStatus.length; i += BATCH_SIZE) {
      const batch = propertiesWithStatus.slice(i, i + BATCH_SIZE);
      const inserted = await Property.insertMany(batch, { ordered: false });
      results.push(...inserted);
      console.log(`✅ Batch ${i / BATCH_SIZE + 1}: Inserted ${inserted.length} properties`);
      if (inserted[0]) {
        console.log('📸 First inserted property has images:', inserted[0].images);
        console.log('📸 First inserted property image_url:', inserted[0].image_url);
      }
    }

    res.status(201).json({ 
      success: true, 
      count: results.length, 
      properties: results 
    });
  } catch (error) {
    console.error('❌ Bulk import error:', error);
    // Handle duplicate key errors gracefully
    if (error.code === 11000) {
      res.status(207).json({ 
        success: true, 
        count: error.insertedDocs?.length || 0,
        message: 'Some properties were duplicates and skipped'
      });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

// Update property
app.put('/api/properties/:id', async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updated_at: new Date() },
      { new: true, runValidators: true }
    );
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete property
app.delete('/api/properties/:id', async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json({ success: true, message: 'Property deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', mongodb: mongoose.connection.readyState === 1 });
});

// Get all enquiries
app.get('/api/enquiries', async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ created_at: -1 }).populate('propertyId');
    res.json(enquiries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create enquiry
app.post('/api/enquiries', async (req, res) => {
  try {
    const enquiry = new Enquiry(req.body);
    await enquiry.save();
    res.status(201).json(enquiry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update enquiry status
app.put('/api/enquiries/:id', async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updated_at: new Date() },
      { new: true }
    );
    if (!enquiry) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }
    res.json(enquiry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete enquiry
app.delete('/api/enquiries/:id', async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) {
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
    const leads = await Lead.find().sort({ created_at: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create lead
app.post('/api/leads', async (req, res) => {
  try {
    const lead = new Lead(req.body);
    await lead.save();
    res.status(201).json(lead);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update lead
app.put('/api/leads/:id', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updated_at: Date.now() },
      { new: true }
    );
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(lead);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete lead
app.delete('/api/leads/:id', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
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
    const messages = await ContactMessage.find().sort({ created_at: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create contact message
app.post('/api/contact', async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;
    
    const contactMessage = new ContactMessage({
      name,
      phone,
      email,
      message,
      status: 'new',
    });
    
    await contactMessage.save();
    res.status(201).json({ success: true, message: 'Message sent successfully', data: contactMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update contact message status
app.put('/api/contact-messages/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status, updated_at: Date.now() },
      { new: true }
    );
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete contact message
app.delete('/api/contact-messages/:id', async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!message) {
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
    const totalProperties = await Property.countDocuments();
    const totalEnquiries = await Enquiry.countDocuments();
    const newEnquiries = await Enquiry.countDocuments({ status: 'new' });
    
    res.json({
      totalProperties,
      totalEnquiries,
      newEnquiries,
      activeListings: await Property.countDocuments({ purpose: 'sale' })
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Migration endpoint - Add status field to all existing properties (run once)
app.post('/api/migrate/add-status', async (req, res) => {
  try {
    const result = await Property.updateMany(
      { status: { $exists: false } },  // Only update properties without status field
      { $set: { status: 'active' } }
    );
    
    res.json({
      success: true,
      message: 'Migration completed',
      modifiedCount: result.modifiedCount
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

    // Get client IP and user agent
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // Find or create user
    const user = await User.findOneAndUpdate(
      { supabaseId },
      {
        $set: {
          email: email.toLowerCase(),
          fullName: fullName || 'User',
          lastLogin: new Date(),
          updated_at: new Date(),
        },
        $inc: { loginCount: 1 },
        $push: {
          loginHistory: {
            timestamp: new Date(),
            ipAddress,
            userAgent,
            deviceInfo: req.body.deviceInfo || 'Web',
          }
        }
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Login tracked successfully',
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        loginCount: user.loginCount,
        lastLogin: user.lastLogin,
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
    const user = await User.findOne({ supabaseId: req.params.supabaseId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users (admin only)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-loginHistory') // Exclude detailed login history for list view
      .sort({ lastLogin: -1 });
    
    res.json({
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      users
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user login statistics
app.get('/api/users/stats/overview', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const activeToday = await User.countDocuments({
      lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    const activeThisWeek = await User.countDocuments({
      lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      totalUsers,
      activeUsers,
      activeToday,
      activeThisWeek,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
app.put('/api/users/:supabaseId', async (req, res) => {
  try {
    const { phone, searchInterests, preferredLocations } = req.body;
    
    const user = await User.findOneAndUpdate(
      { supabaseId: req.params.supabaseId },
      {
        $set: {
          phone: phone || undefined,
          'metadata.searchInterests': searchInterests || undefined,
          'metadata.preferredLocations': preferredLocations || undefined,
          updated_at: new Date(),
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User profile updated',
      user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deactivate user account
app.post('/api/users/:supabaseId/deactivate', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { supabaseId: req.params.supabaseId },
      { $set: { isActive: false, updated_at: new Date() } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User account deactivated',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user login history
app.get('/api/users/:supabaseId/login-history', async (req, res) => {
  try {
    const user = await User.findOne({ supabaseId: req.params.supabaseId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      supabaseId: user.supabaseId,
      email: user.email,
      loginCount: user.loginCount,
      lastLogin: user.lastLogin,
      loginHistory: user.loginHistory.sort((a, b) => b.timestamp - a.timestamp).slice(0, 50), // Last 50 logins
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Increment property view count for user
app.post('/api/users/:supabaseId/track-property-view', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { supabaseId: req.params.supabaseId },
      { $inc: { 'metadata.totalPropertiesViewed': 1 } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Increment enquiry count for user
app.post('/api/users/:supabaseId/track-enquiry', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { supabaseId: req.params.supabaseId },
      { $inc: { 'metadata.totalEnquiriesMade': 1 } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
