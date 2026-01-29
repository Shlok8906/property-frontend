# Admin Quick Reference - Image Management & Property Listing

## 📸 Uploading Images to Property

### Method 1: During Property Creation
1. Go to: `/admin/projects/add`
2. Scroll to **"Images"** section
3. Click **"Select Images from Device"**
4. Choose 1 or more images from your computer
5. Images appear in grid below
6. Click **"Set Featured"** on one image (this is the main property image)
7. Click **"X"** to remove unwanted images
8. Click **"Save Property"** to complete

### Method 2: Edit Existing Property
1. Go to: `/admin/projects`
2. Find your property in the table
3. Click the **external link icon** to open property
4. OR scroll down on edit page to **"Property Images"** section
5. Follow same process as above

### Method 3: Drag & Drop (Fastest!)
1. Go to Images section
2. **Drag multiple image files** directly into the upload area
3. Release to upload
4. System will upload all at once
5. Set featured image
6. Save

---

## ✨ Premium Features (Amenities) Display

### How it appears to customers:
- Modern card layout with icons
- Large icons with gradient backgrounds
- Contextual descriptions (e.g., "Fitness & Wellness")
- Smooth hover animations
- Mobile responsive

### Examples of Amenities:
- ✓ Gym / Fitness Center
- ✓ Swimming Pool
- ✓ Parking (Covered/Open)
- ✓ Garden / Green Space
- ✓ 24/7 Security
- ✓ CCTV
- ✓ Jogging Track
- ✓ Kids Play Area

---

## 🔓 Public Property Access

### What non-logged-in users CAN see:
✓ All active properties listed
✓ Property images and gallery
✓ Premium features/amenities
✓ Available units with pricing
✓ Builder information
✓ Complete property details

### What requires login:
✗ Submitting an enquiry/Request Callback
✗ Viewing contact information (shows login dialog)

---

## 🔧 Database Setup - IMPORTANT!

### Step 1: Create Storage Bucket
1. Go to: **Supabase Dashboard**
2. Click: **Storage** (left sidebar)
3. Click: **New bucket**
4. Name it: `property-images`
5. Make it: **Public**
6. Click: **Create bucket**

### Step 2: Run Migration
Run this SQL in Supabase SQL Editor:
```sql
-- Create properties_images table for storing property gallery images
CREATE TABLE IF NOT EXISTS public.properties_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_uuid UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_properties_images_property_uuid 
  ON public.properties_images(property_uuid);
CREATE INDEX IF NOT EXISTS idx_properties_images_is_featured 
  ON public.properties_images(property_uuid, is_featured);
CREATE INDEX IF NOT EXISTS idx_properties_images_order 
  ON public.properties_images(property_uuid, order_index);

-- Enable Row Level Security
ALTER TABLE public.properties_images ENABLE ROW LEVEL SECURITY;

-- Allow public to view images
CREATE POLICY "Allow public to view properties_images" ON public.properties_images
  FOR SELECT USING (TRUE);

-- Allow admins to manage images
CREATE POLICY "Allow admins to manage properties_images" ON public.properties_images
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'::app_role
    )
  );
```

---

## 🖼️ Image Upload Tips

### File Requirements:
- Format: JPG, PNG, GIF, WebP
- Max Size: 10MB per image
- Recommended: At least 2-3 images per property

### Best Practices:
1. **Featured Image:** Choose your best property photo
2. **High Quality:** Use clear, bright photos
3. **Multiple Angles:** Show entrance, living area, bedrooms, facilities
4. **Optimized Size:** Compress large files before uploading

### Upload Status:
- 🟢 Green checkmark = Successfully uploaded
- 🟡 Yellow badge = Featured image
- 🔴 Red error = Failed, try again

---

## 🎯 Common Issues & Solutions

### "Bucket not found" Error?
**Solution:**
1. Go to Supabase Storage
2. Check if `property-images` bucket exists
3. If not, create it (see Database Setup above)
4. Refresh the page and try uploading again

### Images not showing after upload?
**Solution:**
1. Check if bucket is set to **Public**
2. Verify image was uploaded (check storage bucket)
3. Refresh property page
4. Clear browser cache and reload

### Upload button disabled?
**Solution:**
1. Make sure you're logged in as admin
2. Check your user role is set to 'admin'
3. Refresh the page
4. Try another property

### Can't find the Images section?
**Solution:**
1. Make sure you're on the **Edit Property** page
2. Scroll down to bottom of form
3. Look for **"Property Images"** card section
4. If still not visible, check if page fully loaded

---

## 📊 Admin Dashboard Flow

```
Admin Login
    ↓
Go to /admin/projects
    ↓
Select Property
    ↓
Edit/View Property
    ↓
Scroll to Images Section
    ↓
Upload/Manage Images
    ↓
Save Changes
```

---

## ✅ Verification Checklist

- [ ] Storage bucket `property-images` created and public
- [ ] Database migration run successfully
- [ ] Can upload single image
- [ ] Can upload multiple images at once
- [ ] Can drag and drop images
- [ ] Featured image can be set
- [ ] Images appear on public property page
- [ ] Login dialog shows when user tries to enquire
- [ ] Non-logged-in users can see all properties

---

## 🚀 Quick Start Command

If you have access to Supabase CLI:
```bash
# Create the bucket
supabase storage create property-images --public

# Run migrations
supabase migration up
```

---

**Last Updated:** January 27, 2026  
**Status:** ✅ All Systems Ready
