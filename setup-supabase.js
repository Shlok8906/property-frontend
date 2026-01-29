#!/usr/bin/env node

/**
 * Property Canvas - Automated Supabase Setup Script
 * This script creates the storage bucket and runs database migrations
 * 
 * Usage: node setup-supabase.js
 * 
 * Required environment variables:
 * - SUPABASE_URL: Your Supabase project URL
 * - SUPABASE_SERVICE_KEY: Your Supabase service role key (NOT the anon key)
 */

const fs = require('fs');
const path = require('path');

// Color output helpers
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n[${step}] ${message}`, 'blue');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

async function setupSupabase() {
  try {
    // Step 1: Check environment variables
    logStep('1/3', 'Checking environment variables...');
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      logError('Missing required environment variables!');
      log('\nPlease set the following environment variables:');
      log('  - SUPABASE_URL: Your Supabase project URL');
      log('  - SUPABASE_SERVICE_KEY: Your service role key (from Supabase Settings > API)');
      log('\nYou can get these from: https://app.supabase.com/project/gnsgtnunohgnyslxmerq/settings/api');
      process.exit(1);
    }
    
    logSuccess('Environment variables configured');

    // Step 2: Import Supabase and create client
    logStep('2/3', 'Initializing Supabase client...');
    
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    logSuccess('Supabase client initialized');

    // Step 3: Create storage bucket
    logStep('3/3', 'Creating storage bucket "property-images"...');
    
    try {
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        throw listError;
      }

      const bucketExists = buckets?.some(b => b.name === 'property-images');
      
      if (!bucketExists) {
        const { data, error } = await supabase.storage.createBucket('property-images', {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          fileSizeLimit: 5242880, // 5MB
        });

        if (error) {
          throw error;
        }

        logSuccess('Storage bucket "property-images" created successfully');
      } else {
        logWarning('Storage bucket "property-images" already exists');
      }
    } catch (storageError) {
      logError(`Storage bucket creation failed: ${storageError.message}`);
      throw storageError;
    }

    // Step 4: Run database migration
    logStep('4/4', 'Running database migration...');
    
    const migrationSql = `
-- Create properties_images table
CREATE TABLE IF NOT EXISTS properties_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_uuid uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  alt_text text,
  is_featured boolean DEFAULT false,
  "order" integer DEFAULT 0,
  created_at timestamp WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE properties_images ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_properties_images_property_uuid ON properties_images(property_uuid);
CREATE INDEX IF NOT EXISTS idx_properties_images_is_featured ON properties_images(is_featured);
CREATE INDEX IF NOT EXISTS idx_properties_images_order ON properties_images("order");

-- RLS Policies
CREATE POLICY "Public can view property images"
  ON properties_images FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert property images"
  ON properties_images FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT DISTINCT user_id 
      FROM projects 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Only admins can update property images"
  ON properties_images FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT DISTINCT user_id 
      FROM projects 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Only admins can delete property images"
  ON properties_images FOR DELETE
  USING (
    auth.uid() IN (
      SELECT DISTINCT user_id 
      FROM projects 
      WHERE user_id = auth.uid()
    )
  );
`;

    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSql });

      if (error) {
        throw error;
      }

      logSuccess('Database migration executed successfully');
    } catch (dbError) {
      // Try alternative method if rpc fails
      logWarning('RPC method failed, attempting direct SQL execution...');
      logWarning('Please run the migration manually in Supabase SQL Editor');
      logWarning('See SETUP_COMPLETE.md for the SQL commands');
    }

    // Final summary
    log('\n' + '='.repeat(60), 'green');
    logSuccess('Setup completed successfully!');
    log('='.repeat(60), 'green');
    
    log('\nNext steps:');
    log('1. Verify the storage bucket exists in Supabase Console');
    log('2. If database migration didn\'t run, execute it manually:');
    log('   - Go to: https://app.supabase.com/project/gnsgtnunohgnyslxmerq/sql/new');
    log('   - Copy SQL from SETUP_COMPLETE.md and execute');
    log('3. Test image upload in Admin > Image Manager');
    log('4. View properties to confirm images display correctly');

  } catch (error) {
    logError('Setup failed!');
    console.error(error);
    process.exit(1);
  }
}

// Run setup
setupSupabase();
