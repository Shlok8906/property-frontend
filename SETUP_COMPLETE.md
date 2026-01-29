# Property Canvas - Complete Setup Guide

## Project Configuration
- **Project ID**: gnsgtnunohgnyslxmerq
- **Status**: Ready for manual Supabase configuration

## What's Completed ✅
- ✅ PropertyDetail component with separated amenity boxes
- ✅ ImageManager with drag-drop upload functionality
- ✅ Database migration file created
- ✅ All UI text styling updated (italic removed)
- ✅ LoginDialog integration for enquiries
- ✅ Property visibility for all users

## What Needs Manual Setup in Supabase

### Step 1: Create Storage Bucket
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: **gnsgtnunohgnyslxmerq**
3. Navigate to **Storage** (left sidebar)
4. Click **Create a new bucket**
5. Fill in:
   - **Bucket name**: `property-images`
   - **Privacy**: Select **Public** (so images are accessible)
6. Click **Create bucket**

### Step 2: Run Database Migration
1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Paste this SQL:

```sql
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
CREATE INDEX idx_properties_images_property_uuid ON properties_images(property_uuid);
CREATE INDEX idx_properties_images_is_featured ON properties_images(is_featured);
CREATE INDEX idx_properties_images_order ON properties_images("order");

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
```

4. Click **Run** to execute the migration
5. You should see "Success" message

## Testing the Setup

### Test Image Upload:
1. Log in as admin
2. Go to Admin panel
3. Navigate to Image Manager
4. Try uploading an image via drag-drop or file picker
5. Image should upload successfully and appear in the Properties table

### Test Property Display:
1. Go to Properties page (no login required)
2. Click on a property to view details
3. Images should display if uploaded
4. Amenities should show in separate boxes

## Files Modified
- **src/components/PropertyDetail.tsx** - Amenity display, styling updates
- **src/components/admin/ImageManager.tsx** - Complete rewrite with drag-drop
- **supabase/migrations/** - Database migration file added

## Important Notes
- Storage bucket must be PUBLIC for images to display
- Database migration creates table and RLS policies
- Admin users can upload images
- All users can view properties and images
- Images are stored in `property-images` bucket with public access

## Troubleshooting

**Images not showing:**
- Verify storage bucket exists and is PUBLIC
- Check browser console for errors
- Ensure property_uuid matches in database

**Upload fails:**
- Check admin authentication
- Verify storage bucket is PUBLIC
- Check file size (should be < 5MB)
- Check file type (must be image: jpg, png, webp, gif)

**Database errors:**
- Run migration SQL in Supabase SQL Editor
- Verify all tables exist: `projects`, `units`, `properties`, `properties_images`

---

**Setup time**: ~5 minutes
**Status**: Ready for deployment once manual steps completed
