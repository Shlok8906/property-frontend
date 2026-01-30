// Real Estate Project Data Models
// Represents the structured data from CSV import

/**
 * Project-level information (Builder, Location, General Details)
 * Multiple configurations can belong to the same project
 */
export interface RealEstateProject {
  // Project Identity
  projectId: string; // Unique identifier
  projectName: string;
  builder: string;
  location: string;
  
  // Land & Infrastructure
  landParcel: string; // e.g., "55 Acre", "3.5 Acre"
  towerCount: string; // e.g., "27", "5 Tower", "Township"
  
  // Timeline
  launchDate: string; // e.g., "2014", "2024", "Feb 2025"
  expectedPossession: string; // General possession timeline
  
  // Contact
  salesPersonName: string;
  salesPersonPhone: string;
  
  // Notes
  details?: string; // Project-level remarks
}

/**
 * Configuration-level information (Unit Type, Price, Amenities)
 * Each configuration represents a specific BHK/Tower/Phase combo
 */
export interface UnitConfiguration {
  // Link to Project
  projectId: string;
  configId: string; // Unique identifier for this config
  
  // Unit Specification
  specification: string; // e.g., "2BHK", "3BHK", "4BHK", "Villa"
  
  // Tower/Phase Information
  tower?: string; // e.g., "Tower 1", "Phase 1", "27tower"
  floor?: string; // e.g., "16 Floor", "B+G+7", "3P+15"
  
  // Area & Pricing
  carpetAreas: number[]; // Array of carpet areas in sq.ft
  priceRange: {
    min: number; // In lakhs (normalized)
    max: number; // In lakhs (normalized)
    originalFormat: string; // Original format for display (e.g., "90L", "1.12cr")
  };
  
  // Availability & Units
  flatsPerFloor?: string; // e.g., "4", "A-4 / B-6"
  totalUnits: number; // Total flats in this configuration
  unitsAvailable?: number; // May differ from totalUnits if some sold
  
  // Construction & Amenities
  construction?: string; // e.g., "Mivan", "RCC", "RCC Brickwork"
  parking?: string; // e.g., "2=1 / 3=2", "Single parking"
  amenities: string[]; // Array of amenities
  
  // Status & Details
  possession: string; // Possession timeline for this config
  status: 'available' | 'sold-out' | 'launching-soon' | 'future-phase';
  furnitureType: 'unfurnished' | 'semi-furnished' | 'fully-furnished';
  
  // Metadata
  details?: string; // Config-specific notes
  imageUrls?: string[]; // Array of image URLs from CSV
  rawCsvRow?: Record<string, string>; // Original CSV row data
}

/**
 * Parsed CSV Row (Direct from CSV)
 * Intermediate structure before normalization
 */
export interface CSVRowData {
  srNo?: string;
  builder: string;
  salesPerson: string; // May contain "Name - Phone"
  projectName: string;
  landParcel?: string;
  tower?: string;
  floor?: string;
  specification: string;
  carpet?: string; // May be comma-separated
  price?: string; // May be range or multiple values
  flats?: string;
  totalUnits?: string;
  possession: string;
  parking?: string;
  construction?: string;
  amenities?: string;
  location: string;
  launchDate?: string;
  floorRise?: string;
  details?: string;
  imageUrl?: string; // Image URLs (comma/pipe/semicolon separated)
}

/**
 * Parser result with both projects and configurations
 */
export interface ParsedCSVData {
  projects: RealEstateProject[];
  configurations: UnitConfiguration[];
  errors: ParseError[];
  stats: {
    totalRows: number;
    projectsCreated: number;
    configurationsCreated: number;
    errorCount: number;
  };
}

export interface ParseError {
  rowNumber: number;
  field: string;
  value: string;
  reason: string;
}

/**
 * Normalized Price Structure
 */
export interface NormalizedPrice {
  minLakhs: number;
  maxLakhs: number;
  originalFormat: string;
  isRange: boolean;
}

/**
 * Contact Information extracted from Sales Person field
 */
export interface ContactInfo {
  name: string;
  phone?: string;
  raw: string;
}
