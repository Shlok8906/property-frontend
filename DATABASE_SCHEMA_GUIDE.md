# Database Schema for Real Estate CSV Import

## Overview

This guide covers the database schema needed to store imported real estate project data with proper relationships.

## Supabase Database Tables

### 1. `projects` Table

Stores project-level information.

```sql
CREATE TABLE projects (
  -- Identifiers
  project_id TEXT PRIMARY KEY UNIQUE,
  project_name TEXT NOT NULL,
  
  -- Basic Info
  builder TEXT NOT NULL,
  location TEXT NOT NULL,
  
  -- Land & Infrastructure
  land_parcel TEXT,
  tower_count TEXT,
  
  -- Timeline
  launch_date TEXT,
  expected_possession TEXT,
  
  -- Contact
  sales_person_name TEXT,
  sales_person_phone TEXT,
  
  -- Notes
  details TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT project_builder_name_unique UNIQUE(builder, project_name)
);

-- Indexes for performance
CREATE INDEX idx_projects_builder ON projects(builder);
CREATE INDEX idx_projects_location ON projects(location);
CREATE INDEX idx_projects_project_name ON projects(project_name);
```

### 2. `unit_configurations` Table

Stores configuration/unit type information.

```sql
CREATE TABLE unit_configurations (
  -- Identifiers
  config_id TEXT PRIMARY KEY UNIQUE,
  project_id TEXT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  
  -- Unit Specification
  specification TEXT NOT NULL,
  
  -- Tower/Phase Information
  tower TEXT,
  floor TEXT,
  
  -- Area & Pricing
  carpet_areas NUMERIC[], -- Array of carpet areas
  price_min NUMERIC NOT NULL,  -- Minimum price in lakhs
  price_max NUMERIC NOT NULL,  -- Maximum price in lakhs
  price_original_format TEXT,  -- Original format
  is_price_range BOOLEAN,
  
  -- Availability & Units
  flats_per_floor TEXT,
  total_units INTEGER NOT NULL,
  units_available INTEGER,
  
  -- Construction & Amenities
  construction TEXT,
  parking TEXT,
  amenities TEXT[], -- Array of amenity strings
  
  -- Status & Details
  possession TEXT NOT NULL,
  status TEXT DEFAULT 'available' CHECK (
    status IN ('available', 'sold-out', 'launching-soon', 'future-phase')
  ),
  furniture_type TEXT DEFAULT 'unfurnished' CHECK (
    furniture_type IN ('unfurnished', 'semi-furnished', 'fully-furnished')
  ),
  details TEXT,
  
  -- Raw Data (for reference)
  raw_csv_row JSONB,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_config_per_project UNIQUE(project_id, specification, tower)
);

-- Indexes for performance
CREATE INDEX idx_configs_project_id ON unit_configurations(project_id);
CREATE INDEX idx_configs_specification ON unit_configurations(specification);
CREATE INDEX idx_configs_status ON unit_configurations(status);
CREATE INDEX idx_configs_location ON unit_configurations 
  USING (project_id, specification);
```

### 3. `project_amenities` Table (Normalized)

Optional: For better amenities management.

```sql
CREATE TABLE project_amenities (
  id SERIAL PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  amenity_name TEXT NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_project_amenity UNIQUE(project_id, amenity_name)
);

CREATE INDEX idx_amenities_project ON project_amenities(project_id);
```

### 4. `csv_import_logs` Table

Track all imports for audit trail.

```sql
CREATE TABLE csv_import_logs (
  id SERIAL PRIMARY KEY,
  imported_by TEXT NOT NULL,
  import_date TIMESTAMP DEFAULT NOW(),
  
  -- Import details
  file_name TEXT,
  total_rows INTEGER,
  projects_created INTEGER,
  configurations_created INTEGER,
  errors_count INTEGER,
  
  -- Data
  parsed_data JSONB,
  errors JSONB,
  
  -- Status
  status TEXT DEFAULT 'completed' CHECK (
    status IN ('completed', 'failed', 'partial')
  ),
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_import_logs_date ON csv_import_logs(import_date);
CREATE INDEX idx_import_logs_user ON csv_import_logs(imported_by);
```

## TypeScript Interfaces for Database

```typescript
// projects table
export interface DBProject {
  project_id: string;
  project_name: string;
  builder: string;
  location: string;
  land_parcel?: string;
  tower_count?: string;
  launch_date?: string;
  expected_possession?: string;
  sales_person_name?: string;
  sales_person_phone?: string;
  details?: string;
  created_at: string;
  updated_at: string;
}

// unit_configurations table
export interface DBUnitConfiguration {
  config_id: string;
  project_id: string;
  specification: string;
  tower?: string;
  floor?: string;
  carpet_areas?: number[];
  price_min: number;
  price_max: number;
  price_original_format?: string;
  is_price_range: boolean;
  flats_per_floor?: string;
  total_units: number;
  units_available?: number;
  construction?: string;
  parking?: string;
  amenities?: string[];
  possession: string;
  status: 'available' | 'sold-out' | 'launching-soon' | 'future-phase';
  furniture_type: 'unfurnished' | 'semi-furnished' | 'fully-furnished';
  details?: string;
  raw_csv_row?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// csv_import_logs table
export interface DBCSVImportLog {
  id: number;
  imported_by: string;
  import_date: string;
  file_name?: string;
  total_rows: number;
  projects_created: number;
  configurations_created: number;
  errors_count: number;
  parsed_data?: Record<string, any>;
  errors?: Record<string, any>;
  status: 'completed' | 'failed' | 'partial';
  created_at: string;
}
```

## Supabase Setup Steps

### 1. Create Tables

Run the SQL scripts above in Supabase SQL Editor:

```bash
# Go to: Supabase Dashboard → Project → SQL Editor
# Create new query and paste table creation SQL
```

### 2. Enable Row Level Security (RLS)

```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE csv_import_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read, admins can write
CREATE POLICY "Allow authenticated read" ON projects
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin write" ON projects
  FOR INSERT WITH CHECK (auth.role() = 'admin');

-- Similar for other tables...
```

### 3. Create Indexes

Already included in table creation scripts above.

## Data Migration Helper

```typescript
// lib/databaseMigrations.ts

import { supabase } from '@/integrations/supabase/supabaseClient';
import type { ParsedCSVData } from '@/types/realEstateData';
import type { DBProject, DBUnitConfiguration } from '@/types/database';

/**
 * Migrate parsed CSV data to Supabase
 */
export async function migrateCSVDataToDatabase(
  data: ParsedCSVData,
  importedBy: string
) {
  const startTime = Date.now();
  let projectsInserted = 0;
  let configurationsInserted = 0;

  try {
    // 1. Insert projects
    if (data.projects.length > 0) {
      const { data: inserted, error: projectError } = await supabase
        .from('projects')
        .upsert(
          data.projects.map(p => ({
            project_id: p.projectId,
            project_name: p.projectName,
            builder: p.builder,
            location: p.location,
            land_parcel: p.landParcel,
            tower_count: p.towerCount,
            launch_date: p.launchDate,
            expected_possession: p.expectedPossession,
            sales_person_name: p.salesPersonName,
            sales_person_phone: p.salesPersonPhone,
            details: p.details,
          })),
          { onConflict: 'project_id' }
        );

      if (projectError) throw projectError;
      projectsInserted = inserted?.length || 0;
    }

    // 2. Insert configurations
    if (data.configurations.length > 0) {
      const { data: inserted, error: configError } = await supabase
        .from('unit_configurations')
        .upsert(
          data.configurations.map(c => ({
            config_id: c.configId,
            project_id: c.projectId,
            specification: c.specification,
            tower: c.tower,
            floor: c.floor,
            carpet_areas: c.carpetAreas,
            price_min: c.priceRange.min,
            price_max: c.priceRange.max,
            price_original_format: c.priceRange.originalFormat,
            is_price_range: c.priceRange.min !== c.priceRange.max,
            flats_per_floor: c.flatsPerFloor,
            total_units: c.totalUnits,
            construction: c.construction,
            parking: c.parking,
            amenities: c.amenities,
            possession: c.possession,
            status: c.status,
            furniture_type: c.furnitureType,
            details: c.details,
            raw_csv_row: c.rawCsvRow,
          })),
          { onConflict: 'config_id' }
        );

      if (configError) throw configError;
      configurationsInserted = inserted?.length || 0;
    }

    // 3. Log the import
    await supabase.from('csv_import_logs').insert({
      imported_by: importedBy,
      total_rows: data.stats.totalRows,
      projects_created: projectsInserted,
      configurations_created: configurationsInserted,
      errors_count: data.errors.length,
      parsed_data: {
        projects: data.projects,
        configurations: data.configurations,
      },
      errors: data.errors.length > 0 ? data.errors : null,
      status: data.errors.length === 0 ? 'completed' : 'partial',
    });

    const duration = Date.now() - startTime;
    return {
      success: true,
      projectsInserted,
      configurationsInserted,
      duration,
      message: `Imported ${projectsInserted} projects and ${configurationsInserted} configurations in ${duration}ms`,
    };
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

/**
 * Get all projects with their configurations
 */
export async function getProjectsWithConfigurations() {
  const { data: projects, error: projectError } = await supabase
    .from('projects')
    .select('*');

  if (projectError) throw projectError;

  const { data: configurations, error: configError } = await supabase
    .from('unit_configurations')
    .select('*');

  if (configError) throw configError;

  // Combine data
  return projects.map(project => ({
    ...project,
    configurations: configurations.filter(
      c => c.project_id === project.project_id
    ),
  }));
}

/**
 * Search projects and configurations
 */
export async function searchProjects(query: string) {
  const { data, error } = await supabase
    .from('projects')
    .select(
      `
      *,
      unit_configurations(*)
    `
    )
    .or(
      `project_name.ilike.%${query}%,builder.ilike.%${query}%,location.ilike.%${query}%`
    );

  if (error) throw error;
  return data;
}
```

## Usage in Component

```typescript
import { migrateCSVDataToDatabase } from '@/lib/databaseMigrations';
import { parseRealEstateCSV } from '@/lib/realEstateCSVParser';

// In your CSVImporterAdvanced component:
const handleImport = async () => {
  try {
    // Parse CSV
    const result = parseRealEstateCSV(csvText);

    // Migrate to database
    const migrationResult = await migrateCSVDataToDatabase(
      result,
      currentUser.id
    );

    toast({
      description: migrationResult.message,
    });
  } catch (error) {
    toast({
      description: `Import failed: ${error.message}`,
      variant: 'destructive',
    });
  }
};
```

## Verification Queries

After import, verify data with these queries:

```sql
-- Count imported projects
SELECT COUNT(*) FROM projects;

-- Count configurations
SELECT COUNT(*) FROM unit_configurations;

-- View projects by builder
SELECT builder, COUNT(*) as project_count
FROM projects
GROUP BY builder;

-- View configurations by specification
SELECT specification, COUNT(*) as count
FROM unit_configurations
GROUP BY specification;

-- View import logs
SELECT * FROM csv_import_logs ORDER BY import_date DESC;

-- Find configurations for a specific project
SELECT * FROM unit_configurations
WHERE project_id = 'proj_skyi_developer_songbirds';

-- Get price range for a specification
SELECT
  specification,
  MIN(price_min) as min_price,
  MAX(price_max) as max_price,
  COUNT(*) as count
FROM unit_configurations
GROUP BY specification;
```

## Backup & Restore

```bash
# Backup database
pg_dump -h db.supabase.co -U postgres dbname > backup.sql

# Restore from backup
psql -h db.supabase.co -U postgres dbname < backup.sql
```

## Best Practices

1. **Always test with sample data first** before importing large datasets
2. **Enable RLS policies** for security
3. **Create indexes** on frequently searched columns
4. **Log all imports** for audit trail
5. **Implement soft deletes** instead of hard deletes
6. **Use transactions** for batch operations
7. **Monitor disk space** before large imports
8. **Regular backups** before major data operations
