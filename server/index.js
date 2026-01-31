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
  conversionPotential: { type: Number, default: 50, min: 0, max: 100 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const Lead = mongoose.model('Lead', leadSchema);

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

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
