/**
 * AI-Powered CSV Cleaner for Real Estate Data
 * Automatically fixes common issues in uploaded CSVs
 */

export interface CleanedCSVResult {
  cleanedText: string;
  originalRows: number;
  cleanedRows: number;
  issues: string[];
  changes: string[];
}

export function cleanRealEstateCSV(csvText: string): CleanedCSVResult {
  const issues: string[] = [];
  const changes: string[] = [];
  
  // Split into lines
  const lines = csvText.split('\n');
  const originalRows = lines.length;
  
  // Clean header row - remove trailing spaces and normalize
  let headers = lines[0];
  if (headers.includes('  ')) {
    headers = headers.replace(/\s+/g, ' ').trim();
    changes.push('Normalized column header spacing');
  }
  
  const cleanedLines: string[] = [headers];
  let lastValidRow: string[] | null = null;
  
  // Process data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip completely empty lines
    if (!line || /^[,\s]*$/.test(line)) {
      issues.push(`Row ${i + 1}: Empty row - skipped`);
      continue;
    }
    
    // Parse CSV row (handle quoted fields)
    const cells = parseCSVLine(line);
    
    // Skip rows that are just notes (starting with parenthesis)
    if (cells[7] && cells[7].startsWith('(') && cells[7].endsWith(')')) {
      issues.push(`Row ${i + 1}: Note row "${cells[7]}" - skipped`);
      continue;
    }
    
    // Check if this is a continuation row (empty builder/project)
    const isContainuation = !cells[1]?.trim() && !cells[3]?.trim();
    
    if (isContainuation && lastValidRow) {
      // Inherit project info from previous row
      cells[1] = cells[1] || lastValidRow[1]; // Builder
      cells[2] = cells[2] || lastValidRow[2]; // Sales Person
      cells[3] = cells[3] || lastValidRow[3]; // Project name
      cells[4] = cells[4] || lastValidRow[4]; // Land Parcel
      cells[16] = cells[16] || lastValidRow[16]; // Location (critical!)
      cells[17] = cells[17] || lastValidRow[17]; // Launch Date
      
      changes.push(`Row ${i + 1}: Inherited project info from previous row`);
    }
    
    // Check if row has specification (required for valid config)
    if (cells[7]?.trim()) {
      // This is a valid configuration row
      const reconstructedLine = cells.map(cell => {
        // Quote cells that contain commas
        if (cell && cell.includes(',')) {
          return `"${cell}"`;
        }
        return cell || '';
      }).join(',');
      
      cleanedLines.push(reconstructedLine);
      
      // Save as last valid row if it has builder/project
      if (cells[1]?.trim() && cells[3]?.trim()) {
        lastValidRow = cells;
      }
    } else {
      issues.push(`Row ${i + 1}: No specification - skipped`);
    }
  }
  
  const cleanedText = cleanedLines.join('\n');
  
  return {
    cleanedText,
    originalRows,
    cleanedRows: cleanedLines.length - 1, // Exclude header
    issues,
    changes,
  };
}

/**
 * Parse a CSV line handling quoted fields properly
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * Normalize price formats
 */
export function normalizePrice(price: string): string {
  if (!price) return '';
  
  // Handle ranges: "1.10 to 1.16 cr" → "1.10-1.16cr"
  price = price.replace(/\s+to\s+/gi, '-');
  
  // Remove extra spaces: "79 to 84L" → "79-84L"
  price = price.replace(/\s+/g, '');
  
  return price;
}

/**
 * Normalize tower info
 */
export function normalizeTower(tower: string): string {
  if (!tower) return '';
  
  // "18 Soldout" → "18 Tower (Soldout)"
  // "3Launched" → "3 Tower (Launched)"
  tower = tower.replace(/(\d+)\s*(Soldout|Launched|Future)/gi, '$1 Tower ($2)');
  
  return tower;
}
