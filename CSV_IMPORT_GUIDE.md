# CSV Bulk Import Feature - Complete Guide

## Overview
The CSV Bulk Import feature allows you to import multiple properties at once from a CSV or TSV file. This is perfect for adding large datasets like your client's property information.

## How to Access
1. Go to **Admin Panel** → **CSV Import** (`http://localhost:8080/admin/csv-import`)
2. Or use the sidebar menu: "CSV Import" option

## Features

### ✅ File Upload
- **Supported Formats**: CSV, TSV (Tab-Separated Values), TXT
- **Maximum Records**: Unlimited
- **Auto-parsing**: Automatically detects Tab or Comma separators

### ✅ Data Preview
- View all imported records before importing
- See how the system maps your data
- Select/deselect individual properties
- Bulk select/deselect all properties

### ✅ Smart Data Mapping
The system automatically maps your columns to property fields:

| Your CSV Field | Maps To | Purpose |
|---|---|---|
| Builder | builder | Developer/Builder name |
| Sales Person | salesPerson | Contact person |
| Project name | title | Property project name |
| Specification | bhk | 1BHK, 2BHK, 3BHK, etc. |
| Price | price | Property price (L or Cr) |
| Location | location | City/Area location |
| Possession | possession | Possession date/status |
| Carpet | area | Carpet area in sq.ft |
| Tower | tower | Tower/Block name |
| Floor | floor | Floor details |
| Parking | parking | Parking information |
| Construction | construction | Mivan, RCC, etc. |
| Amenities | amenities | Comma-separated list |
| Launch Date | launchDate | Project launch date |

## Step-by-Step Guide

### Step 1: Prepare Your CSV File
Your file should have these columns (in this order):

```
Sr Nos | Builder | Sales Person | Project name | Land Parcel | Tower | Floor | Specification | Carpet | Price | Flat/Floor | Total Units | Possession | Parking | Construction | Amenities | Location | Launch Date | Floor Rise | Details
```

**Example:**
```
1	Skyi Developer	Rohidas Shinde - 9881238552	Songbirds	55 Acre	27tower	16 Floor	3BHK	863, 887	90L	4Flats	64 Flats	Dec 26	3=1 / 4=2	Mivan	All Amenities	Bhugaon	2014
2	Kohinoor Developer	Ajay Gupta - 9860873550	Kohinoor woodshire	3.5 Acre	5 Tower	21 Floor	2BHK	794,895	84,94L	A-4 / B-7	600 Unit	Dec 29	2,3=1	Mivan	All ground amenities	Bhugaon
```

### Step 2: Upload the File
1. Click "Upload CSV File" button
2. Select your CSV/TSV/TXT file
3. System will parse and validate the data

### Step 3: Review Preview
1. See all imported properties in the preview dialog
2. Properties are sorted by relevance
3. **Statistics**: Total properties, selected count, remaining count
4. **Table View**: Shows project, builder, specs, price, location, possession

### Step 4: Select Properties
- Click checkboxes to select individual properties
- Use "Select All" checkbox to select/deselect all at once
- Status shows how many are selected

### Step 5: Import
1. Click "Import X Properties" button
2. System validates and imports the data
3. Properties appear in the "Imported Properties" list
4. They're ready to be saved to the database

## Data Format Rules

### Price Format
- Use "L" for Lakhs: `90L`, `84L`
- Use "Cr" for Crores: `1.12cr`, `1.65cr`
- **Example**: `90L` = 90 lakhs, `1.12cr` = 1.12 crores

### Carpet Area
- Single value: `863`
- Multiple values (comma-separated): `863, 887` or `794,895`
- The system accepts the first value as the default area

### Amenities
- Comma-separated list: `All Amenities`
- Each amenity becomes a selectable tag
- **Example**: `Gym, Swimming Pool, Parking, Security`

### Specification (BHK)
- Format: `1BHK`, `2BHK`, `3BHK`, `4BHK`, `5BHK`
- The system extracts this automatically
- **Examples**: `3BHK`, `2.5BHK` (with decimal)

### Possession Date
- Any format accepted: `Dec 26`, `Dec 2028`, `RERA-Dec 29`, `February 2025`
- Stored as-is for display

### Tower/Floor
- Can be complex: `3P + 15`, `2B+2G+ 15 Floor`, `B+G+7`
- Multiple towers: `27tower`, `5 Tower`, `Township`
- All formats are preserved

### Construction Type
- **Examples**: `Mivan`, `RCC`, `RCC Brickwork`, `Inner+Outer`
- Stored as provided in CSV

### Contact Format
- **Sales Person**: `Name - Phone Number`
- **Example**: `Rohidas Shinde - 9881238552`
- System extracts name and phone separately

## Example: Your Client's Data

Your client's dataset from Bhugaon includes:

| Builder | Project | BHK Options | Price Range | Location |
|---------|---------|------------|------------|----------|
| Skyi Developer | Songbirds | 3BHK, 4BHK | 90L - 1.60Cr | Bhugaon |
| Kohinoor Developer | Kohinoor woodshire | 2BHK - 4BHK | 84L - 1.65Cr | Bhugaon |
| Rohan Developer | Rohan Saroha | 2BHK - 4BHK | 87L - 1.65Cr | Bhugaon |
| Paranjape Developer | Forest Trails | 1BHK - 5BHK | 45L - 5.8Cr | Bhugaon |
| Nirmiti Unicorn | Serenora | 2BHK, 3BHK | 76L - 1.23Cr | Bhugaon |
| Oree Realtors | Cloud 28 | 2BHK | 79L - 84L | Bhugaon |

**Total Properties**: 18 property variations

## Tips & Best Practices

✅ **DO:**
- Keep column order consistent
- Use tab or comma separators consistently
- Include all required fields (Builder, Project, Price, Location, Specification)
- Use clear location names
- Include amenities when available

❌ **DON'T:**
- Mix separators (use all tabs or all commas)
- Leave price or location fields empty
- Use special characters in project names
- Include header row twice
- Use inconsistent BHK format (use "3BHK" not "3-BHK")

## Troubleshooting

### Issue: "No valid data found in CSV"
**Solution**: 
- Check if file has data rows
- Ensure separators are consistent
- Remove empty rows
- Verify builder column is filled

### Issue: Price not importing correctly
**Solution**:
- Use format: `90L` or `1.12cr` (no spaces)
- Don't use: `₹90L` or `Rs 1.12 cr`
- Ensure numbers are before L or Cr

### Issue: Some properties not showing
**Solution**:
- Check if builder column is filled
- Verify project name isn't empty
- Look for empty rows in middle of data
- System skips rows with missing critical fields

## Import Status

After import, properties show status: **Ready**

This means:
- ✓ Data validated
- ✓ Fields mapped correctly
- ✓ Ready for database save
- ✓ Will appear on website once saved

## Next Steps

1. **Import Your Data**: Use the CSV import feature to load your client's data
2. **Review**: Check the preview to ensure data looks correct
3. **Save**: Click Import to save to database
4. **Verify**: Go to "Manage Properties" to see imported listings
5. **Publish**: Properties are now live on your website!

## File Location

Sample data file location:
```
/root/project/sample_properties_import.txt
```

Use this file to test the import feature before importing your actual client data.

## Support

For issues or questions about the CSV import feature:
1. Check the format guide above
2. Download the template from the import page
3. Use the sample data file as reference
4. Review error messages in the preview dialog

---

**Feature Status**: ✅ Active and Ready for Use
**Last Updated**: January 27, 2026
**Version**: 1.0
