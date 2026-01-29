# Testing Guide - All Improvements

## 🧪 Test Scenarios

### Test 1: Property Visibility (Non-Logged-In User)
**Objective:** Verify properties are visible without login

**Steps:**
1. Open browser in private/incognito mode
2. Navigate to: `http://localhost:5173/properties`
3. **Expected Results:**
   - ✅ Can see list of all properties
   - ✅ Properties are displayed in cards with images
   - ✅ Can click on a property to view details
   - ✅ Can see all amenities, units, pricing

**Verification:**
```
Property Card visible? ✓
Images loading? ✓
No login dialog on page load? ✓
Can see "Request Callback" button? ✓
```

---

### Test 2: Login Dialog on Enquiry Attempt (Without Login)
**Objective:** Verify login dialog appears when submitting enquiry without being logged in

**Steps:**
1. While in private mode, navigate to a property detail page
2. Click "Request Callback" button
3. **Expected Results:**
   - ✅ LoginDialog appears with message "Please sign in to enquire"
   - ✅ Form submission is blocked
   - ✅ User must login/signup to continue
   - ✅ After login, dialog closes and form is ready

**Verification:**
```
LoginDialog appears? ✓
Shows correct message? ✓
Has Sign In / Sign Up options? ✓
Can click outside to close? ✓
```

---

### Test 3: Premium Features Display
**Objective:** Verify new amenities layout looks modern and works responsively

**Steps:**
1. Open any property detail page (logged in or not)
2. Scroll to "Premium Features" section
3. Test on different screen sizes:
   - Desktop (1920px)
   - Tablet (768px)
   - Mobile (375px)

**Expected Results:**
```
Desktop:
- 3 columns of amenity cards ✓
- Large icons with glow effect ✓
- Hover animations smooth ✓
- Cards arranged in grid ✓

Tablet:
- 2 columns of amenity cards ✓
- Same styling, responsive sizing ✓

Mobile:
- 1 column, full width ✓
- Cards still readable ✓
- Responsive font sizes ✓
```

**Verification:**
```
Icons render correctly? ✓
Text is readable? ✓
Hover effects work? ✓
Layout responsive? ✓
No text overflow? ✓
Colors match design? ✓
```

---

### Test 4: Image Upload - Click Method
**Objective:** Verify single and multiple image uploads work

**Steps:**
1. Login as admin
2. Go to: `/admin/projects/add` (or edit existing)
3. Scroll to "Images" section
4. Click "Select Images from Device"
5. Select 2-3 images from your computer
6. **Expected Results:**
   - ✅ Images appear in preview grid below upload button
   - ✅ Each image shows in 4-column grid
   - ✅ Can see "Set Featured" button on each image
   - ✅ Can see X button to remove images

**Verification:**
```
File dialog opens? ✓
Can select multiple files? ✓
Images preview correctly? ✓
Grid layout correct? ✓
Buttons visible on hover? ✓
No errors in console? ✓
```

---

### Test 5: Image Upload - Drag & Drop Method
**Objective:** Verify drag-and-drop upload works

**Steps:**
1. Go to admin property image upload section
2. Open file explorer with 2-3 image files
3. Drag files from file explorer
4. Drop onto upload area
5. **Expected Results:**
   - ✅ Upload area highlights when dragging over
   - ✅ "Drop images here" visual feedback
   - ✅ Images upload automatically after drop
   - ✅ Preview appears in grid below

**Verification:**
```
Drag hover effect visible? ✓
Upload starts automatically? ✓
Progress indication shown? ✓
Images appear in grid? ✓
No JavaScript errors? ✓
```

---

### Test 6: Featured Image Selection
**Objective:** Verify featured image can be set and displays correctly

**Steps:**
1. After uploading 2+ images
2. Hover over second image in preview grid
3. Click "Set Featured" button
4. Save the property
5. **Expected Results:**
   - ✅ Image gets "Featured" badge
   - ✅ Only one image marked as featured at a time
   - ✅ Featured image displays as main image on property page
   - ✅ Featured image shows first in gallery

**Verification:**
```
Featured badge appears? ✓
Only one image featured? ✓
Can change featured image? ✓
Persists after save? ✓
Shows on public page? ✓
```

---

### Test 7: Image Deletion
**Objective:** Verify images can be deleted

**Steps:**
1. In image management section
2. Hover over an image
3. Click X/Delete button
4. Confirm deletion
5. **Expected Results:**
   - ✅ Image removed from preview
   - ✅ Confirmation dialog appears
   - ✅ Image deleted from storage
   - ✅ Metadata removed from database
   - ✅ No broken links in database

**Verification:**
```
Delete button visible? ✓
Confirmation dialog shows? ✓
Image removed from grid? ✓
No console errors? ✓
Database cleaned? ✓
```

---

### Test 8: File Validation
**Objective:** Verify file type and size validation

**Steps:**

**Test 8a: Invalid File Type**
1. Try uploading a .txt or .pdf file
2. **Expected Results:**
   - ✅ Upload rejected with error message
   - ✅ Message: "is not an image file"
   - ✅ Upload doesn't proceed

**Test 8b: File Too Large (>10MB)**
1. Try uploading image larger than 10MB
2. **Expected Results:**
   - ✅ Upload rejected with error message
   - ✅ Message: "exceeds 10MB limit"
   - ✅ Upload doesn't proceed

**Verification:**
```
Rejects invalid types? ✓
Rejects large files? ✓
Shows error messages? ✓
Doesn't crash app? ✓
```

---

### Test 9: Property Page Image Display
**Objective:** Verify uploaded images display correctly on public property page

**Steps:**
1. Upload images to a property (via admin)
2. Go to public property page: `/properties/{id}`
3. Check image display in hero section
4. Check if images are referenced in amenities
5. **Expected Results:**
   - ✅ Featured image displays as hero image
   - ✅ Image loads with correct aspect ratio
   - ✅ No broken image placeholders
   - ✅ Images are public URLs (accessible)

**Verification:**
```
Hero image displays? ✓
Image is correct? ✓
Loading time reasonable? ✓
No console errors? ✓
Public URL valid? ✓
```

---

### Test 10: Auth State Management
**Objective:** Verify auth context works correctly

**Steps:**
1. Login as user
2. Navigate to property page
3. Click "Request Callback"
4. **Expected Results:**
   - ✅ Form submits (no login dialog)
   - ✅ Enquiry saved with user ID
   - ✅ Success toast appears

**Steps (Logout test):**
1. Logout user
2. Try to submit enquiry
3. **Expected Results:**
   - ✅ LoginDialog appears immediately
   - ✅ Cannot submit without login

**Verification:**
```
Logged in user can submit? ✓
Non-logged user blocked? ✓
Dialog appears at right time? ✓
User ID saved with enquiry? ✓
```

---

## 🔄 Browser Compatibility

Test on:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

**Expected on all browsers:**
```
✓ All features work
✓ Animations smooth
✓ Forms submit correctly
✓ Images load properly
✓ No console errors
```

---

## 📊 Performance Checks

### Image Upload Performance
```
Single image upload: < 3 seconds
Multiple image upload (5 files): < 10 seconds
No timeout errors: ✓
Browser doesn't freeze: ✓
```

### Page Load Performance
```
Properties page: < 2 seconds
Property detail page: < 3 seconds
Admin page: < 2 seconds
Images lazy load: ✓
No blocking assets: ✓
```

### Database Queries
```
Property fetch: < 500ms
Images fetch: < 500ms
Enquiry submission: < 1 second
No N+1 queries: ✓
Proper indexes used: ✓
```

---

## 🐛 Error Handling Tests

### Bucket Missing
1. Delete `property-images` storage bucket
2. Try to upload image
3. **Expected:** Helpful error message suggesting bucket creation

### Database Table Missing
1. Skip migration (don't create properties_images table)
2. Try to upload image
3. **Expected:** Database error in console, user-friendly message in UI

### Network Failure
1. Disable network while uploading
2. **Expected:** Upload fails gracefully with error message

### Large File Batch
1. Try uploading 50+ large images
2. **Expected:** Uploads process one at a time, no app crash

---

## ✅ Final Checklist

Before going live:
- [ ] All properties visible to public
- [ ] Login dialog shows on enquiry attempt
- [ ] Premium features display looks modern
- [ ] Image upload works (click and drag)
- [ ] Featured image can be set
- [ ] Images display on public page
- [ ] File validation works
- [ ] Error messages are helpful
- [ ] No console errors
- [ ] Mobile responsive works
- [ ] Performance acceptable
- [ ] Database migration applied
- [ ] Storage bucket created (public)
- [ ] All image URLs accessible publicly

---

## 🚀 Deployment Verification

After deploying to production:

```bash
# Verify storage bucket
curl https://[project].supabase.co/storage/v1/object/public/property-images/test.jpg

# Verify database table
SELECT COUNT(*) FROM properties_images;

# Verify app loads
curl https://[your-domain]/properties
curl https://[your-domain]/admin/projects
```

---

**Test Date:** _______________  
**Tested By:** _______________  
**Status:** ☐ PASSED  ☐ FAILED  
**Notes:** _____________________

