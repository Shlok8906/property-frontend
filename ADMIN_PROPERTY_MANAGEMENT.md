# Admin Property Management System - Implementation Plan

## 📋 Overview
Build a real admin-controlled real estate inventory system with full CRUD operations on property listings and image management.

---

## 🗂️ Database Schema Requirements

### 1. **properties_images** Table (NEW)
```sql
CREATE TABLE properties_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_uuid TEXT NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  is_featured BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  file_size INTEGER,
  uploaded_by UUID,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  FOREIGN KEY (property_uuid) REFERENCES projects(id),
  FOREIGN KEY (uploaded_by) REFERENCES auth.users(id)
);

CREATE INDEX idx_properties_images_property ON properties_images(property_uuid);
CREATE INDEX idx_properties_images_featured ON properties_images(property_uuid, is_featured);
```

### 2. **properties_audit_log** Table (NEW)
```sql
CREATE TABLE properties_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_uuid TEXT NOT NULL,
  action TEXT NOT NULL, -- UPDATE, DELETE, IMAGE_ADD, IMAGE_DELETE, etc.
  changed_by UUID NOT NULL,
  changes JSONB, -- Previous values for rollback
  reason TEXT,
  created_at TIMESTAMP DEFAULT now(),
  
  FOREIGN KEY (property_uuid) REFERENCES projects(id),
  FOREIGN KEY (changed_by) REFERENCES auth.users(id)
);
```

### 3. **Update projects Table**
```sql
ALTER TABLE projects ADD COLUMN (
  status TEXT DEFAULT 'active', -- active, inactive, archived
  updated_by UUID,
  updated_at TIMESTAMP DEFAULT now(),
  soft_deleted_at TIMESTAMP,
  
  FOREIGN KEY (updated_by) REFERENCES auth.users(id)
);
```

---

## 🛠️ Features to Implement

### Feature 1: Property Update (Edit After Listing)
**Editable Fields:**
- Property purpose (Rent / Sell / PG / Co-Living)
- Property type (Apartment / Villa / Townhouse / etc)
- BHK type
- Carpet area / Built-up area
- Rent / Price
- Furnishing
- Amenities
- Parking
- Availability
- Tenant preference
- Brokerage terms
- Description
- Status (Active / Inactive)

**Rules:**
- ✅ Changes reflect instantly on customer site
- ✅ No duplicate listings created
- ✅ Updates don't break existing leads
- ✅ Audit trail for all changes
- ✅ Admin authentication required

### Feature 2: Delete Listing
**Soft Delete (Default):**
- Mark as inactive
- Hide from customer site
- Keep all leads & history
- Reversible

**Hard Delete (Advanced):**
- Only if no leads exist
- Remove listing, units, images
- Irreversible
- Require confirmation modal

### Feature 3: Image Management (CORE)
**Upload:**
- Multiple images anytime
- Drag & drop upload
- Preview before save
- Max configurable images per listing

**Update/Replace:**
- Replace specific image
- Change order (drag-to-reorder)
- Set featured image
- Update alt text (SEO)

**Delete:**
- Delete individual images
- Confirm before delete
- Auto-remove from storage
- Don't break listing (always have fallback)

**Rules:**
- Image changes don't require re-uploading listing
- Changes reflect instantly
- Broken images fallback gracefully
- No duplication

### Feature 4: Image Data Model
```typescript
interface PropertyImage {
  id: string;           // UUID
  property_uuid: string;
  image_url: string;
  alt_text?: string;
  is_featured: boolean;
  order_index: number;
  file_size: number;
  uploaded_by: string;  // Admin user ID
  created_at: string;
  updated_at: string;
}
```

---

## 📁 Files to Create/Modify

### New Components to Create:
1. **ImageManager.tsx** - Image gallery with drag-to-reorder
2. **ImageUploader.tsx** - Drag & drop upload component
3. **PropertyEditForm.tsx** - Main edit form for all fields
4. **DeletePropertyDialog.tsx** - Soft/Hard delete options
5. **PropertyAuditLog.tsx** - Show change history

### New Pages to Create:
1. **admin/EditProperty.tsx** - Full property editor with images
2. **admin/PropertyImages.tsx** - Dedicated image management page (optional)

### Files to Modify:
1. **admin/Dashboard.tsx** - Add edit/delete actions
2. **admin/Projects.tsx** - Add edit/delete buttons

---

## 🔐 Security Rules (MANDATORY)

1. **Authentication**
   - Only authenticated admins can edit/delete
   - Check role == "admin"

2. **Authorization**
   - Verify admin owns the property/tenant
   - Only allow certain updates

3. **Image Security**
   - Validate file type (image only)
   - Validate file size (<10MB)
   - Scan for malicious content
   - Store securely in cloud

4. **Soft Delete**
   - Don't actually delete from DB
   - Use `soft_deleted_at` timestamp
   - Exclude from queries automatically

5. **Audit Trail**
   - Log every change
   - Store old values for rollback
   - Record who changed what and when

---

## 📊 Implementation Phases

### Phase 1: Core Update Functionality
- [ ] Create EditProperty page
- [ ] Form with all editable fields
- [ ] Save to database
- [ ] Audit logging
- [ ] Validation

### Phase 2: Delete Functionality
- [ ] Soft delete (mark inactive)
- [ ] Confirm dialog
- [ ] Hard delete (if no leads)
- [ ] Verification checks

### Phase 3: Image Management (CORE)
- [ ] Create images_properties table
- [ ] Image upload component
- [ ] Image gallery with reorder
- [ ] Set featured image
- [ ] Delete image
- [ ] Storage integration

### Phase 4: Admin UI
- [ ] Add edit button to property list
- [ ] Add delete button
- [ ] Edit property page with image manager
- [ ] Audit log viewer

---

## 🎯 Success Criteria

✅ Admin can edit property after listing
✅ All 13 editable fields work correctly
✅ Changes instant on customer site
✅ No duplicates created
✅ Leads not broken
✅ Admin can delete (soft/hard)
✅ Admin can manage images post-listing
✅ Drag-to-reorder works
✅ Featured image selectable
✅ All changes logged
✅ Soft deletes are reversible
✅ Hard deletes only if no leads
✅ Images fallback gracefully
✅ Security checks in place
✅ Admin-only access enforced

---

## 💾 Database Migrations
Will be created as part of Phase 1.

---

## 🚀 Tech Stack
- React + TypeScript
- Shadcn/UI components
- Supabase (database & auth)
- Date-fns (date formatting)
- React Beautiful DnD (drag-to-reorder)

---

**Status**: Ready for implementation
**Priority**: HIGH - Core admin feature
**Timeline**: 2-3 hours for full implementation
