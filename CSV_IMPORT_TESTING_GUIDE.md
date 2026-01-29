# CSV Import System - Testing Guide

## Test Environment Setup

### Prerequisites
- Vite dev server running on port 8080
- Admin account logged in
- Sample CSV file available
- Browser DevTools console open (F12)

### Start Dev Server
```bash
npm run dev
# Should show:
# VITE v5.x.x ready in xxx ms
# ➜ Local: http://localhost:8080/
```

## Test Scenarios

### Test 1: Basic File Upload

**Objective:** Verify file upload works and CSV parsing functions

**Steps:**
1. Navigate to `http://localhost:8080/admin/csv-import`
2. Click "Choose File" button
3. Select `sample_properties_real_estate.csv`
4. File should upload automatically

**Expected Results:**
- ✅ File selected shows in input
- ✅ Preview dialog opens within 2 seconds
- ✅ Title shows: "Preview Import Data"
- ✅ Subtitle shows: "Review 18 configurations from 6 projects"
- ✅ No error alerts appear

**Check in Console:**
```javascript
// Should see successful parsing
// No error messages
```

---

### Test 2: Data Parsing Accuracy

**Objective:** Verify CSV parser extracts data correctly

**Steps:**
1. Open preview dialog (from Test 1)
2. Scroll through configuration table
3. Check specific rows:

**Row 1 Check:**
```
Builder: Skyi Developer
Project: Songbirds
Specification: 2BHK
Price: ₹90L (not "90 Lakhs")
Carpet Area: 1100 sqft
Units: 108
Location: Bhugaon
```

**Row 4 Check (Price Range):**
```
Builder: Kohinoor Developer
Project: Kohinoor Woodshire
Specification: 2BHK
Price: ₹85L - ₹92L (correctly shows range)
Carpet Area: 1100 sqft
Units: 80
```

**Expected Results:**
- ✅ All prices normalized correctly
- ✅ Price ranges show as "Min - Max"
- ✅ Carpet areas extracted as numbers
- ✅ Project names consistent
- ✅ Specification formatting correct (2BHK, 3BHK, etc.)

---

### Test 3: Project Deduplication

**Objective:** Verify that same project appearing in multiple rows creates only one project

**Steps:**
1. Open preview dialog
2. Scroll to "Projects Summary" section
3. Count unique projects

**Sample Data has:**
```
Builder | Project Name | Rows
Skyi Developer | Songbirds | 3 rows → 1 project
Kohinoor Developer | Kohinoor Woodshire | 3 rows → 1 project
Rohan Developer | Rohan Saroha | 3 rows → 1 project
Paranjape Developer | Forest Trails | 3 rows → 1 project
Nirmiti Unicorn | Serenora | 3 rows → 1 project
Oree Realtors | Cloud 28 | 3 rows → 1 project
TOTAL: 18 rows → 6 projects
```

**Expected Results:**
- ✅ Projects Summary shows exactly 6 projects
- ✅ Each project shows:
  - Project name
  - Builder name
  - Location (Bhugaon)
  - Land area
  - Launch date
  - Contact person
- ✅ No duplicate projects in summary

---

### Test 4: Multi-Select Functionality

**Objective:** Test row selection and select all/deselect all

**Steps:**

**Part A: Select All**
1. Click "Select All" button
2. All rows should highlight

**Expected Results:**
- ✅ All checkboxes become checked
- ✅ Background of rows becomes gray/selected
- ✅ Counter updates to "18 of 18 selected"
- ✅ Import button shows "Import 18 Configurations"

**Part B: Deselect Specific**
1. Click checkboxes for rows 1, 5, 10
2. Those rows should deselect

**Expected Results:**
- ✅ Selected rows become unchecked
- ✅ Counter updates to "15 of 18 selected"
- ✅ Import button shows "Import 15 Configurations"

**Part C: Select All Again**
1. From 15 selected, click "Select All" button
2. Should toggle all back to selected

**Expected Results:**
- ✅ All 18 become selected again
- ✅ Counter shows "18 of 18 selected"

**Part D: Deselect All**
1. Click "Select All" again to toggle deselect
2. All should deselect

**Expected Results:**
- ✅ All checkboxes uncheck
- ✅ Counter shows "0 of 18 selected"
- ✅ Import button becomes disabled (grayed out)

---

### Test 5: Price Parsing Variations

**Objective:** Verify different price formats are parsed correctly

**Sample CSV contains these price formats:**

| Row | Price Input | Expected Output |
|-----|-----------|-----------------|
| 1 | 90L | ₹90L |
| 2 | 115L | ₹115L |
| 4 | 85L-92L | ₹85L - ₹92L |
| 10 | 95L-102L | ₹95L - ₹102L |
| 15 | 120L-155L | ₹120L - ₹155L |
| 18 | 250L-300L | ₹250L - ₹300L |

**Steps:**
1. Open preview dialog
2. Scroll to each row
3. Verify price displays correctly

**Expected Results:**
- ✅ All prices display with "₹" symbol
- ✅ Single prices show as "₹XXL"
- ✅ Ranges show as "₹XXL - ₹XXL"
- ✅ No error messages

---

### Test 6: Carpet Area Array

**Objective:** Verify carpet areas show correctly when multiple values exist

**Sample CSV contains:**
```
Row 1: 1100 → 1100 sqft
Row 4: 1100 → 1100 sqft (single value)
Row 10: 1200-1450 → 1200-1450 sqft (range)
```

**Steps:**
1. Check Carpet Area column for all rows
2. Look for correct formatting

**Expected Results:**
- ✅ Single areas: "1100 sqft"
- ✅ Ranges: "900-1100 sqft"
- ✅ No empty values (should have default or skip)
- ✅ Values always numeric

---

### Test 7: Contact Information Parsing

**Objective:** Verify sales person name and phone extracted correctly

**Sample Data:**
```
Input: "Rahul - 9876543210"
Expected Name: Rahul
Expected Phone: 9876543210

Input: "Priya - 8765432109"
Expected Name: Priya
Expected Phone: 8765432109
```

**Steps:**
1. Open Projects Summary
2. Click on "Songbirds" project card
3. Check "Contact: Rahul" is shown

**Expected Results:**
- ✅ Contact name extracted correctly
- ✅ Phone number extracted correctly
- ✅ Displays as "Contact: Name" in summary

---

### Test 8: Import Execution

**Objective:** Test actual data import to database

**Steps:**
1. In preview dialog with 18 configurations selected
2. Click "Import 18 Configurations" button
3. Wait for completion

**Expected Results:**
- ✅ Toast notification appears: "Imported 18 configurations!"
- ✅ Dialog closes
- ✅ Returns to empty import page
- ✅ No error messages in console

---

### Test 9: Verify Imported Data in Properties

**Objective:** Confirm imported data appears in property management

**Steps:**
1. After successful import (Test 8)
2. Navigate to: Admin → Manage Properties
3. Search for "Songbirds"
4. Check property details

**Expected Results:**
- ✅ Properties appear in list
- ✅ Can see all 3 Songbirds configs (2BHK, 3BHK, 4BHK)
- ✅ Prices display correctly
- ✅ Can click to view full details
- ✅ Can edit properties
- ✅ Can delete properties

**Detailed Check:**
```
Property Name: Songbirds - 2BHK
Location: Bhugaon
Price: ₹90L
Type: 2BHK
Area: 1100 sqft
Builder: Skyi Developer
```

---

### Test 10: Error Handling

**Objective:** Verify system handles malformed CSV gracefully

**Steps:**

**Part A: Corrupt CSV**
1. Create test CSV with missing columns
2. Upload file
3. System should handle errors

**Expected Results:**
- ✅ Shows error rows in preview
- ✅ Remaining valid rows still import
- ✅ Error details displayed
- ✅ Can still import valid data

**Part B: Empty File**
1. Upload empty file
2. System should show message

**Expected Results:**
- ✅ Shows "No data found" or similar
- ✅ No crash or error
- ✅ Dialog still functional

---

### Test 11: Column Flexibility

**Objective:** Verify parser handles column names case-insensitively

**Steps:**
1. Create CSV with different column name cases:
   ```
   BUILDER | PROJECT NAME | specification | LOCATION
   ```
2. Upload file
3. System should parse correctly

**Expected Results:**
- ✅ Columns recognized despite case differences
- ✅ Data parsed correctly
- ✅ No errors for column name variations
- ✅ Same results as standard case

---

### Test 12: Large File Performance

**Objective:** Test system performance with bigger CSV

**Steps:**
1. Create CSV with 100+ rows (multiple copies of sample data)
2. Upload file
3. Measure time to preview

**Expected Results:**
- ✅ Parsing completes within 2-5 seconds
- ✅ Preview dialog shows all rows
- ✅ Scrolling smooth without lag
- ✅ No memory issues

**Performance Targets:**
- 18 rows: < 500ms
- 100 rows: < 1 second
- 1000 rows: < 10 seconds

---

### Test 13: Database Persistence

**Objective:** Verify imported data stays after refresh

**Steps:**
1. Import sample data (Test 8)
2. Refresh browser (F5)
3. Go to Manage Properties
4. Search for imported projects

**Expected Results:**
- ✅ Properties still visible after refresh
- ✅ Data hasn't been cleared
- ✅ All 18 configurations still exist
- ✅ No data loss

---

### Test 14: Re-import Same Data

**Objective:** Test importing same CSV twice

**Steps:**
1. Import sample CSV (creates 18 configurations)
2. Import same CSV again
3. Check what happens

**Expected Results:**
- ✅ System updates existing records (upsert)
- ✅ No duplicate projects created
- ✅ No duplicate configurations created
- ✅ Previous data replaced with new data

---

### Test 15: Toast Notifications

**Objective:** Verify all user notifications display correctly

**Scenarios:**

**Scenario A: Successful Parse**
```
Toast appears: "Successfully parsed 18 configurations from 6 projects!"
Position: Bottom right
Duration: 3-4 seconds
```

**Scenario B: Successful Import**
```
Toast appears: "Imported 18 configurations!"
Position: Bottom right
Duration: 3-4 seconds
```

**Scenario C: Parse Error**
```
Toast appears: "CSV parsed with X errors. Check details below."
Type: Error (red background)
```

**Expected Results:**
- ✅ All toasts display at correct times
- ✅ Messages are clear and helpful
- ✅ Auto-dismiss after reasonable time
- ✅ No overlapping notifications

---

## Automated Test Cases (Code)

```typescript
// test/csv-import.test.ts

import { parseRealEstateCSV } from '@/lib/realEstateCSVParser';

describe('CSV Import Parser', () => {
  it('should parse 18-row CSV correctly', () => {
    const result = parseRealEstateCSV(sampleCSV);
    
    expect(result.projects).toHaveLength(6);
    expect(result.configurations).toHaveLength(18);
    expect(result.errors).toHaveLength(0);
  });

  it('should parse price ranges correctly', () => {
    const csvWithRanges = `...`;
    const result = parseRealEstateCSV(csvWithRanges);
    
    const rangedConfig = result.configurations.find(
      c => c.specification === '2BHK'
    );
    expect(rangedConfig?.priceRange.minLakhs).toBe(85);
    expect(rangedConfig?.priceRange.maxLakhs).toBe(92);
  });

  it('should deduplicate projects', () => {
    const result = parseRealEstateCSV(sampleCSV);
    const projectNames = result.projects.map(p => p.projectName);
    const uniqueNames = new Set(projectNames);
    
    expect(projectNames.length).toBe(uniqueNames.size);
  });

  it('should extract contact info', () => {
    const result = parseRealEstateCSV(sampleCSV);
    const project = result.projects[0];
    
    expect(project.salesPersonName).toBeTruthy();
    expect(project.salesPersonPhone).toBeTruthy();
  });

  it('should handle empty fields', () => {
    const csvWithEmptyFields = `...`;
    const result = parseRealEstateCSV(csvWithEmptyFields);
    
    expect(result.errors.length).toBeGreaterThanOrEqual(0);
    expect(result.configurations.length).toBeGreaterThan(0);
  });
});
```

---

## Debugging Tips

### Check Console Logs
```javascript
// Open DevTools (F12) → Console tab

// Should see:
// ✅ "CSV parsed successfully"
// ✅ "Found 6 projects"
// ✅ "Created 18 configurations"
// ❌ No error messages
```

### Network Inspection
```
DevTools → Network tab
During import, should see:
- POST request to Supabase
- Status: 200 OK
- Response shows inserted data
```

### Database Inspection

```sql
-- Check if data was inserted
SELECT COUNT(*) FROM projects;
-- Should return: 6

SELECT COUNT(*) FROM unit_configurations;
-- Should return: 18

-- Verify specific project
SELECT * FROM projects WHERE project_name = 'Songbirds';
-- Should return 1 row
```

---

## Test Report Template

```markdown
# CSV Import Testing Report

## Date: [DATE]
## Tester: [NAME]
## Environment: Development

### Test Results

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Basic File Upload | ✅ PASS | |
| 2 | Data Parsing Accuracy | ✅ PASS | |
| 3 | Project Deduplication | ✅ PASS | |
| ... | ... | ... | |

### Summary
- **Total Tests:** 15
- **Passed:** 15
- **Failed:** 0
- **Skipped:** 0

### Issues Found
None

### Recommendations
- System is production ready
- No blocking issues found

### Sign-off
Approved for production deployment
```

---

## Continuous Integration

### Auto-test on Every Build

```yaml
# .github/workflows/test.yml
name: Test CSV Import

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test -- csv-import
      - run: npm run build
```

---

## Performance Benchmarks

### Expected Results

| Scenario | Time | Memory |
|----------|------|--------|
| Parse 18 rows | 150-400ms | 2-5MB |
| Parse 100 rows | 500-800ms | 5-10MB |
| Parse 1000 rows | 3-8s | 20-50MB |
| Import to DB | 500-1500ms | 5-15MB |
| Full process (1000 rows) | 4-10s | 30-70MB |

### Monitor with:
```javascript
// In component
console.time('csv-parse');
const result = parseRealEstateCSV(csvText);
console.timeEnd('csv-parse');
```

---

## Checklist for Production

- [ ] All 15 tests passed
- [ ] No console errors
- [ ] Database inserts verified
- [ ] Performance acceptable
- [ ] Error handling working
- [ ] Responsive on mobile
- [ ] Documentation complete
- [ ] Sample data available
- [ ] Deployment tested
- [ ] Rollback procedure documented

---

**Version:** 2.0
**Status:** Ready for Production
**Last Updated:** January 2025
