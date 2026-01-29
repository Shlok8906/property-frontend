// Migration script to add status='active' to all existing properties
require('dotenvx').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/property-canvas';

async function migrate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const Property = mongoose.model('Property', new mongoose.Schema({}, { strict: false }));
    
    const result = await Property.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'active' } }
    );
    
    console.log(`✅ Migration completed: ${result.modifiedCount} properties updated`);
    
    // Verify
    const count = await Property.countDocuments({ status: 'active' });
    console.log(`✅ Total active properties: ${count}`);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
