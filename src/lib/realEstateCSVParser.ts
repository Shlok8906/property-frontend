/**
 * CSV Data Parser for Real Estate Projects
 * Handles complex data with multiple values, ranges, and project-config relationships
 */

import {
  CSVRowData,
  RealEstateProject,
  UnitConfiguration,
  ParsedCSVData,
  ParseError,
  NormalizedPrice,
  ContactInfo,
} from '@/types/realEstateData';

export class RealEstateCSVParser {
  private errors: ParseError[] = [];
  private projectMap: Map<string, RealEstateProject> = new Map();

  /**
   * Parse CSV text and return structured project + configuration data
   * Handles continuation rows where builder/project fields are empty
   */
  parseCSV(csvText: string): ParsedCSVData {
    this.errors = [];
    this.projectMap = new Map();

    const lines = csvText.trim().split('\n');
    const headers = this.parseHeaders(lines[0]);
    
    const configurations: UnitConfiguration[] = [];
    let lastValidProject: RealEstateProject | null = null;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip completely empty lines
      if (!line) continue;
      
      // Skip lines that are just commas
      if (/^[,\s]*$/.test(line)) continue;

      try {
        const csvRow = this.parseRow(lines[i], headers);
        
        // Skip rows with no specification (empty data rows)
        if (!csvRow.specification || !csvRow.specification.trim()) {
          continue;
        }

        // Skip note rows (e.g., "(Aura heights / Iris Riverside / PWC hillside)")
        if (csvRow.specification.startsWith('(') && csvRow.specification.endsWith(')')) {
          continue;
        }

        // Handle continuation rows (empty builder/project means continue previous project)
        if ((!csvRow.builder || !csvRow.builder.trim()) && 
            (!csvRow.projectName || !csvRow.projectName.trim())) {
          if (lastValidProject) {
            // Use previous project info
            csvRow.builder = lastValidProject.builder;
            csvRow.projectName = lastValidProject.projectName;
            csvRow.salesPerson = csvRow.salesPerson || lastValidProject.salesPersonName;
            csvRow.location = csvRow.location || lastValidProject.location;
            csvRow.landParcel = csvRow.landParcel || lastValidProject.landParcel;
            csvRow.launchDate = csvRow.launchDate || lastValidProject.launchDate;
          } else {
            // Skip if no previous project to inherit from
            continue;
          }
        }

        // Validate we have required fields
        if (!csvRow.builder || !csvRow.projectName || !csvRow.location) {
          continue;
        }

        // Get or create project
        const projectKey = `${csvRow.builder}|${csvRow.projectName}`;
        let project = this.projectMap.get(projectKey);
        
        if (!project) {
          project = this.createProjectFromRow(csvRow);
          this.projectMap.set(projectKey, project);
          lastValidProject = project;
        }

        // Create configuration
        const config = this.createConfigurationFromRow(csvRow, project.projectId);
        configurations.push(config);
      } catch (error) {
        this.errors.push({
          rowNumber: i + 1,
          field: 'general',
          value: lines[i],
          reason: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const projects = Array.from(this.projectMap.values());

    return {
      projects,
      configurations,
      errors: this.errors,
      stats: {
        totalRows: lines.length - 1,
        projectsCreated: projects.length,
        configurationsCreated: configurations.length,
        errorCount: this.errors.length,
      },
    };
  }

  /**
   * Parse CSV header row
   */
  private parseHeaders(headerLine: string): Record<number, string> {
    const headers: Record<number, string> = {};
    const cols = this.splitCSVLine(headerLine);

    cols.forEach((col, index) => {
      headers[index] = col.toLowerCase().trim();
    });

    return headers;
  }

  /**
   * Parse a single CSV row
   */
  private parseRow(line: string, headers: Record<number, string>): CSVRowData {
    const values = this.splitCSVLine(line);
    const row: CSVRowData = {
      builder: '',
      salesPerson: '',
      projectName: '',
      specification: '',
      location: '',
      possession: '',
    };

    Object.entries(headers).forEach(([indexStr, header]) => {
      const index = parseInt(indexStr);
      const value = values[index]?.trim() || '';

      switch (header) {
        case 'sr nos':
        case 'sr no':
          row.srNo = value;
          break;
        case 'builder':
          row.builder = value;
          break;
        case 'sales person':
        case 'sales personnel':
          row.salesPerson = value;
          break;
        case 'project name':
          row.projectName = value;
          break;
        case 'land parcel':
          row.landParcel = value;
          break;
        case 'tower':
          row.tower = value;
          break;
        case 'floor':
          row.floor = value;
          break;
        case 'specification':
          row.specification = value;
          break;
        case 'carpet':
          row.carpet = value;
          break;
        case 'price':
          row.price = value;
          break;
        case 'flat/floor':
        case 'flats/floor':
          row.flats = value;
          break;
        case 'total units':
          row.totalUnits = value;
          break;
        case 'possession':
          row.possession = value;
          break;
        case 'parking':
          row.parking = value;
          break;
        case 'construction':
          row.construction = value;
          break;
        case 'amenities':
          row.amenities = value;
          break;
        case 'location':
          row.location = value;
          break;
        case 'launch date':
          row.launchDate = value;
          break;
        case 'floor rise':
          row.floorRise = value;
          break;
        case 'details':
        case 'remarks':
          row.details = value;
          break;
      }
    });

    return row;
  }

  /**
   * Split CSV line respecting quoted fields
   */
  private splitCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if ((char === ',' || char === '\t') && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current);
    return result;
  }

  /**
   * Create Project from CSV row
   */
  private createProjectFromRow(row: CSVRowData): RealEstateProject {
    const contact = this.parseContact(row.salesPerson);

    return {
      projectId: this.generateProjectId(row.builder, row.projectName),
      projectName: row.projectName,
      builder: row.builder,
      location: row.location,
      landParcel: row.landParcel || '',
      towerCount: row.tower || '',
      launchDate: row.launchDate || '',
      expectedPossession: row.possession || '',
      salesPersonName: contact.name,
      salesPersonPhone: contact.phone || '',
      details: row.details,
    };
  }

  /**
   * Create Configuration from CSV row
   */
  private createConfigurationFromRow(
    row: CSVRowData,
    projectId: string
  ): UnitConfiguration {
    const carpetAreas = this.parseCarpetAreas(row.carpet || '');
    const priceRange = this.parsePriceRange(row.price || '');
    const amenities = this.parseAmenities(row.amenities || '');
    const totalUnits = parseInt(row.totalUnits || '0') || 0;

    // Determine status from details
    let status: 'available' | 'sold-out' | 'launching-soon' | 'future-phase' = 'available';
    if (row.details?.toLowerCase().includes('sold out')) {
      status = 'sold-out';
    } else if (row.details?.toLowerCase().includes('launching')) {
      status = 'launching-soon';
    } else if (row.details?.toLowerCase().includes('future')) {
      status = 'future-phase';
    }

    return {
      projectId,
      configId: this.generateConfigId(projectId, row.specification, row.tower),
      specification: row.specification,
      tower: row.tower,
      floor: row.floor,
      carpetAreas,
      priceRange,
      flatsPerFloor: row.flats,
      totalUnits,
      construction: row.construction,
      parking: row.parking,
      amenities,
      possession: row.possession,
      status,
      furnitureType: 'unfurnished',
      details: row.details,
      rawCsvRow: row as Record<string, string>,
    };
  }

  /**
   * Parse contact info from sales person field
   * Format: "Name - Phone" or "Name, Phone" or just "Name"
   */
  private parseContact(salesPerson: string): ContactInfo {
    if (!salesPerson) {
      return { name: '', phone: undefined, raw: '' };
    }

    let name = salesPerson;
    let phone: string | undefined;

    // Try to extract phone
    const phoneMatch = salesPerson.match(/([0-9\-\+\(\)\s]{7,})/);
    if (phoneMatch) {
      phone = phoneMatch[0].trim();
      name = salesPerson.replace(phoneMatch[0], '').replace(/[-,]/g, '').trim();
    }

    return { name, phone, raw: salesPerson };
  }

  /**
   * Parse carpet areas from string
   * Handles: "1100", "1100, 1200", "1100-1200", etc.
   */
  private parseCarpetAreas(carpetStr: string): number[] {
    const areas: number[] = [];

    // Split by comma first
    const segments = carpetStr.split(',').map(s => s.trim());

    segments.forEach(segment => {
      // Extract numbers
      const match = segment.match(/(\d+(?:\.\d+)?)/g);
      if (match) {
        match.forEach(num => {
          const area = parseFloat(num);
          if (area > 0 && !areas.includes(area)) {
            areas.push(area);
          }
        });
      }
    });

    return areas.sort((a, b) => a - b);
  }

  /**
   * Parse price range from string
   * Handles: "90L", "1.12cr", "90L-95L", "1.10 to 1.16 cr", ranges, etc.
   */
  private parsePriceRange(priceStr: string): NormalizedPrice {
    const originalFormat = priceStr;

    // Extract all numbers and their units
    const numbers = this.extractPriceNumbers(priceStr);

    if (numbers.length === 0) {
      return {
        minLakhs: 0,
        maxLakhs: 0,
        originalFormat,
        isRange: false,
      };
    }

    // Normalize to lakhs
    const normalized = numbers.map(n => this.convertToLakhs(n.value, n.unit));

    return {
      minLakhs: Math.min(...normalized),
      maxLakhs: Math.max(...normalized),
      originalFormat,
      isRange: normalized.length > 1 || priceStr.includes('to'),
    };
  }

  /**
   * Extract price numbers from string
   * e.g., "90L", "1.12cr", "90-95L"
   */
  private extractPriceNumbers(
    priceStr: string
  ): Array<{ value: number; unit: string }> {
    const result: Array<{ value: number; unit: string }> = [];

    // Regex to find number + unit patterns
    const pattern = /(\d+(?:\.\d+)?)\s*([lL]?cr|[lL]?akh)?/gi;
    let match;

    while ((match = pattern.exec(priceStr)) !== null) {
      const value = parseFloat(match[1]);
      const unit = (match[2] || 'L').toLowerCase();

      if (value > 0) {
        result.push({ value, unit });
      }
    }

    return result;
  }

  /**
   * Convert price to lakhs
   */
  private convertToLakhs(value: number, unit: string): number {
    const unitLower = unit.toLowerCase();

    if (unitLower.includes('cr')) {
      return value * 100;
    }
    // Default to lakhs
    return value;
  }

  /**
   * Parse amenities from string
   * Handles: comma-separated, "All Amenities", etc.
   */
  private parseAmenities(amenitiesStr: string): string[] {
    if (!amenitiesStr) return [];

    // Handle special cases
    if (amenitiesStr.toLowerCase() === 'all amenities') {
      return ['All Amenities'];
    }

    // Split by comma and clean
    return amenitiesStr
      .split(',')
      .map(a => a.trim())
      .filter(a => a.length > 0);
  }

  /**
   * Generate unique project ID
   */
  private generateProjectId(builder: string, projectName: string): string {
    return `proj_${builder.toLowerCase().replace(/\s+/g, '_')}_${projectName
      .toLowerCase()
      .replace(/\s+/g, '_')}`;
  }

  /**
   * Generate unique config ID
   */
  private generateConfigId(
    projectId: string,
    specification: string,
    tower?: string
  ): string {
    const spec = specification.toLowerCase().replace(/\s+/g, '_');
    const twr = tower ? tower.toLowerCase().replace(/\s+/g, '_') : 'default';
    return `${projectId}_${spec}_${twr}`;
  }
}

/**
 * Convenience function to parse CSV text
 */
export function parseRealEstateCSV(csvText: string): ParsedCSVData {
  const parser = new RealEstateCSVParser();
  return parser.parseCSV(csvText);
}
