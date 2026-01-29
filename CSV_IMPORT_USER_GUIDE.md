# Advanced CSV Import System - User Guide

## Quick Start

### 1. Access the CSV Import Page

```
URL: http://localhost:8080/admin/csv-import
Navigation: Admin Dashboard → CSV Import
Requirements: Admin role authentication
```

### 2. Prepare Your CSV File

Your CSV file should have these columns (in any order):

| Column | Required | Example |
|--------|----------|---------|
| Builder | Yes | "Skyi Developer" |
| Project name | Yes | "Songbirds" |
| Specification | Yes | "2BHK", "3BHK" |
| Location | Yes | "Bhugaon" |
| Sales Person | No | "Rahul - 9876543210" |
| Tower | No | "27", "Tower 1" |
| Floor | No | "16 Floor", "B+G+7" |
| Carpet | No | "1100", "950-1100" |
| Price | No | "90L", "1.12cr", "85L-92L" |
| Flat/Floor | No | "4", "A-4, B-4" |
| Total Units | No | "108" |
| Possession | No | "Mar 2025" |
| Parking | No | "2=1", "Single" |
| Construction | No | "Mivan", "RCC" |
| Amenities | No | "Gym, Pool, Parking" |
| Launch Date | No | "2014", "Jan 2025" |
| Land Parcel | No | "55 Acre" |
| Details | No | "Sold out", "Future Phase" |

**Note:** Column names are case-insensitive. "Specification" = "specification" = "SPECIFICATION"

### 3. Upload Your CSV

1. Click "Choose File" button
2. Select your CSV/TSV/TXT file
3. System automatically detects format
4. Preview dialog opens showing parsed data

### 4. Review Preview

The preview dialog shows:

#### Configuration Preview Table
Shows all unit configurations that will be imported:
- Project name and Builder
- BHK specification
- Tower and floor info
- Price range (normalized to lakhs)
- Carpet area (sqft)
- Total units
- Location

**Columns are sortable** - Click header to sort

#### Select Configurations
- **Select All**: Click to toggle all
- **Individual rows**: Click checkbox for specific configs
- **Status**: Shows "X of Y selected"

#### Projects Summary
Shows all unique projects that will be created:
- Project name
- Builder and location
- Land area
- Launch date
- Contact person

#### Parsing Errors (if any)
- Lists rows that couldn't be parsed
- Shows reason for each error
- First 10 errors displayed, rest summarized

### 5. Import Data

1. Review the preview
2. Select configurations to import (or Select All)
3. Click "Import X Configurations" button
4. Success message confirms import

## Data Structure Explained

### Projects vs Configurations

**Project**: The overall real estate development
- One project = one builder + project name
- Contains basic info: location, builders, contact
- Created once even if appears in multiple rows

**Configuration**: A specific unit type or tower variant
- Each row = one configuration
- Links to a project
- Example: "Songbirds 2BHK", "Songbirds 3BHK" = 2 configs for same project

```
Songbirds Project (Created once)
├── Songbirds 2BHK Configuration (Row 1)
├── Songbirds 3BHK Configuration (Row 2)
└── Songbirds 4BHK Configuration (Row 3)
```

### Smart Data Parsing

The system automatically processes your data:

#### Price Parsing
```
Your CSV → Normalized Format
90L → ₹90 Lakhs
1.12cr → ₹112 Lakhs
85L-92L → ₹85L - ₹92L
1.10 to 1.16 cr → ₹110L - ₹116L
```

#### Carpet Area
```
1100 → 1100 sqft
950-1100 → 950-1100 sqft range
900, 1000, 1100 → Multiple options
```

#### Amenities
```
Gym, Pool, Parking → ["Gym", "Pool", "Parking"]
All Amenities → ["All Amenities"]
```

#### Contact Information
```
Rahul - 9876543210 → Name: Rahul, Phone: 9876543210
Priya, 8765432109 → Name: Priya, Phone: 8765432109
John Doe (9654321098) → Name: John Doe, Phone: 9654321098
```

#### Status Detection
- Contains "sold out" → Status: **Sold Out**
- Contains "launching" → Status: **Launching Soon**
- Contains "future" → Status: **Future Phase**
- Otherwise → Status: **Available**

## Sample CSV Format

Download and edit the sample file: `sample_properties_real_estate.csv`

### Example Data Structure

```csv
Sr Nos	Builder	Sales Person	Project name	Tower	Specification	Carpet	Price	Total Units	Location	Possession	Details
1	Skyi Developer	Rahul - 9876543210	Songbirds	27	2BHK	1100	90L	108	Bhugaon	Mar 2025	Launched
1	Skyi Developer	Rahul - 9876543210	Songbirds	27	3BHK	1400	115L	54	Bhugaon	Mar 2025	Launched
2	Kohinoor Developer	Priya - 8765432109	Kohinoor Woodshire	2	2BHK	1100	85L-92L	80	Bhugaon	Jun 2025	Launching Soon
```

### Key Points

1. **Same builder + project name in multiple rows** = Multiple configurations of same project
2. **Tab or comma separated** = Both supported
3. **Quoted fields** = Use for fields containing commas
4. **Empty fields** = Allowed, will be NULL in database
5. **Whitespace** = Automatically trimmed

## Error Handling

### Common Errors & Solutions

#### Error: "Invalid price format"
**Cause:** Price format not recognized
**Solution:** Use formats like "90L", "1.12cr", "85L-92L"
**Valid formats:** 
- Single: "90L", "1.50cr"
- Range: "90L-95L", "1.10 to 1.16 cr"

#### Error: "Invalid carpet area"
**Cause:** Carpet area not a number
**Solution:** Enter numeric values: "1100", "950-1100"

#### Error: "Missing required field"
**Cause:** Builder, Project, Specification, or Location missing
**Solution:** Fill all 4 required fields for each row

#### Error: "Phone number not found"
**Cause:** Sales person field missing phone number
**Solution:** Format like "Name - 9876543210"

### Parsing with Errors

If import has errors:
1. Errors are shown in preview dialog
2. **Only valid rows are imported** - errors skipped
3. **Log contains error details** for review
4. You can fix CSV and re-import

## File Format Options

### Tab-Separated (.TSV)
```
Builder	Project name	Specification
Skyi Developer	Songbirds	2BHK
```
**Pros:** Handles commas in data automatically
**Use for:** Complex data with commas

### Comma-Separated (.CSV)
```
Builder,Project name,Specification
Skyi Developer,Songbirds,2BHK
```
**Use for:** Standard format
**Important:** Quote fields with commas: `"Gym, Pool, Parking"`

### Text (.TXT)
Either format supported - system auto-detects

## Import Process Flow

```
1. Upload File
   ↓
2. Parse CSV
   ↓
3. Extract Projects & Configurations
   ↓
4. Validate Data
   ↓
5. Show Preview Dialog
   ↓
6. User Reviews & Selects Rows
   ↓
7. Click Import
   ↓
8. Data Saved to Database
   ↓
9. Success Message + Import Logs
```

## Database Integration

After import:

### Data Stored
- Projects table: Unique projects with builder info
- Configurations table: All unit configurations
- Import logs: Audit trail of imports

### Query Examples

```sql
-- Find all 2BHK units in Bhugaon
SELECT p.project_name, c.specification, c.price_min, c.price_max
FROM configurations c
JOIN projects p ON c.project_id = p.project_id
WHERE p.location = 'Bhugaon' AND c.specification = '2BHK';

-- Get price range by builder
SELECT p.builder, MIN(c.price_min) as min_price, MAX(c.price_max) as max_price
FROM configurations c
JOIN projects p ON c.project_id = p.project_id
GROUP BY p.builder;

-- Find all available projects
SELECT DISTINCT p.project_name, p.builder, COUNT(c.config_id) as unit_types
FROM configurations c
JOIN projects p ON c.project_id = p.project_id
WHERE c.status = 'available'
GROUP BY p.project_id, p.project_name, p.builder;
```

## Advanced Features

### Multi-Row Edit

For projects appearing in multiple rows:

**CSV Data:**
```
Songbirds	2BHK	1100	90L
Songbirds	3BHK	1400	115L
Songbirds	4BHK	1800	145L
```

**Result:** 
- 1 Project created
- 3 Configurations created
- All linked to same project

### Price Range Handling

**Variations supported:**
- Single price: "90L"
- Range: "85L-92L"
- Complex: "1.10 to 1.16 cr"

**Database stores:**
- `price_min`: Lowest value
- `price_max`: Highest value
- `original_format`: Display format
- `is_price_range`: Boolean flag

### Amenities Array

Amenities stored as searchable array:
```json
["Gym", "Swimming Pool", "Parking", "24/7 Security"]
```

Enables:
- Filter by amenity
- Search "has gym"
- Multi-select filters

## Tips & Best Practices

### Before Importing

1. **Test with sample data first**
   - Use provided sample file
   - Verify format and parsing
   - Check database insertion

2. **Clean your data**
   - No leading/trailing spaces
   - Consistent format (all L or all cr for prices)
   - Remove duplicates

3. **Backup database**
   - In case of issues
   - Can rollback if needed

### During Import

1. **Review preview carefully**
   - Check all 18 configurations listed
   - Verify prices parsed correctly
   - Confirm projects recognized

2. **Don't close browser during import**
   - Wait for success message
   - Check import logs

### After Import

1. **Verify in properties list**
   - Go to Manage Properties
   - Search for new projects
   - Verify configuration details

2. **Check database logs**
   - CSV Import Logs table
   - Shows all imports with timestamps
   - Error details for troubleshooting

## Performance

- **18 rows (sample):** ~500ms import
- **100 rows:** ~1-2 seconds
- **1000+ rows:** ~10-20 seconds

For large datasets (10,000+ rows):
- Import in batches
- Monitor server performance
- Check disk space

## Troubleshooting

### Issue: Import dialog doesn't show

**Solution:**
- Check if file format is correct (CSV/TSV/TXT)
- Verify columns exist
- Check browser console for errors
- Try smaller file first

### Issue: All data empty in preview

**Solution:**
- Column names don't match expected names
- File encoding is UTF-8 (not UTF-16)
- No data rows (only headers)

### Issue: Prices showing as ₹0

**Solution:**
- Price format not recognized
- Use "90L" instead of "90 Lakhs"
- Check for extra spaces

### Issue: Configuration not appearing

**Solution:**
- Missing required field (Specification)
- Row skipped due to error
- Check error list in preview

## Support & Help

For issues:
1. Check error messages in preview
2. Review CSV_IMPORT_DATA_MODEL.md for formats
3. Check DATABASE_SCHEMA_GUIDE.md for DB structure
4. Check import logs for detailed errors

## Next Steps

After successful import:

1. **Verify data** in Manage Properties
2. **Create property listings** from configurations
3. **Set images** for projects using Image Manager
4. **Generate reports** from imported data
5. **Bulk edit** if needed using properties management

## Example Workflow

```
1. Prepare CSV (18 properties from 6 builders)
   ↓
2. Upload file to /admin/csv-import
   ↓
3. Review preview (shows all 18 configs from 6 projects)
   ↓
4. Select all configurations
   ↓
5. Click "Import 18 Configurations"
   ↓
6. Success! Navigate to Manage Properties
   ↓
7. See all 18 configurations listed
   ↓
8. Edit, add images, publish listings
```

## CSV Template Download

Click "Download Template" button to get:
- `properties_template.csv`
- Pre-formatted with correct columns
- Ready to fill with your data
- Can use directly in Manage Properties

---

**Version:** 2.0 (Advanced Data Model)
**Last Updated:** January 2025
**Status:** Production Ready ✅
