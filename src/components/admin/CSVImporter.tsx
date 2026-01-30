import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Upload, Download, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CSVProperty {
  srNo?: string;
  builder: string;
  salesPerson: string;
  projectName: string;
  landParcel?: string;
  tower?: string;
  floor?: string;
  specification: string;
  carpet: string;
  price: string;
  flats?: string;
  totalUnits?: string;
  possession: string;
  parking?: string;
  construction?: string;
  amenities: string;
  location: string;
  launchDate?: string;
  details?: string;
  imageUrl?: string;
}

interface MappedProperty {
  title: string;
  description: string;
  location: string;
  price: number;
  type: string;
  category: string;
  purpose: string;
  bhk: string;
  area: string;
  carpetArea?: string;
  furnishing: string;
  builder: string;
  possession: string;
  parking: string;
  construction: string;
  amenities: string[];
  restrictions: string[];
  projectName?: string;
  specification?: string;
  tower?: string;
  units?: number;
  salesPerson?: string;
  status?: 'active' | 'hidden';
  image_url?: string;
  images?: string[];
  rawData: CSVProperty;
}

export function CSVImporter({ onImport }: { onImport: (properties: MappedProperty[]) => void }) {
  const [csvData, setCSVData] = useState<CSVProperty[]>([]);
  const [mappedData, setMappedData] = useState<MappedProperty[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showColumnMapping, setShowColumnMapping] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [selectedFileName, setSelectedFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  const [columnMapping, setColumnMapping] = useState({
    projectId: 'projectId',
    builder: 'builder',
    salesPerson: 'salesPerson',
    projectName: 'projectName',
    landParcel: 'landParcel',
    tower: 'tower',
    construction: 'construction',
    amenities: 'amenities',
    location: 'location',
    possession: 'possession',
    launchDate: 'launchDate',
    bhkType: 'bhkType',
    carpet: 'carpet',
    price: 'price',
    floor: 'floor',
    flatPerFloor: 'flatPerFloor',
    totalUnits: 'totalUnits',
    parking: 'parking',
    details: 'details',
    imageUrl: 'imageUrl',
  });

  // Comprehensive header mapping with intelligent learning
  const FIELD_ALIASES: Record<string, string[]> = {
    // Builder
    builder: ['builder', 'developer', 'developername', 'company', 'entity'],
    
    // Project
    projectName: [
      'projectname', 'projectnam', 'projecttitle', 'projectn', 'project',
      'projectid', 'name', 'title', 'projectcname', 'projname'
    ],
    
    // Sales Person
    salesPerson: [
      'salesperson', 'sales', 'salesman', 'salesmanname', 'agent', 'agentname',
      'channelpartner', 'partner', 'contact', 'salespersc'
    ],
    
    // Specification/BHK
    specification: [
      'bhktype', 'bhk', 'specification', 'type', 'unittype', 'flattype',
      'bhkconfig', 'configuration', 'roomtype', 'propertytype', 'specification',
      'bhktyp'
    ],
    
    // Carpet Area
    carpet: [
      'carpet', 'carpetarea', 'carpetareainqft', 'area', 'builtuparea', 
      'totalarea', 'areainqft', 'sqft', 'sqm', 'carpet', 'carpetareainsqft'
    ],
    
    // Price
    price: [
      'price', 'cost', 'priceincr', 'priceinl', 'priceininr', 'rate', 'amount',
      'totalcost', 'baseprice'
    ],
    
    // Location
    location: [
      'location', 'locality', 'area', 'areaname', 'city', 'place', 'locationname',
      'locationnam', 'region'
    ],
    
    // Possession
    possession: [
      'possession', 'possessiondate', 'possessionstatus', 'readyto', 'readytocomplete',
      'deliverydate', 'handoverdate'
    ],
    
    // Tower/Block
    tower: [
      'tower', 'block', 'buildingname', 'wingname', 'section', 'phase',
      'towername', 'blocka', 'blockname'
    ],
    
    // Construction Status
    construction: [
      'construction', 'constructionstatus', 'status', 'progressstatus', 'phase',
      'developmentphase'
    ],
    
    // Amenities
    amenities: [
      'amenities', 'amenity', 'facilities', 'amenitieslist', 'features',
      'benefits'
    ],
    
    // Floor
    floor: [
      'floor', 'floorno', 'floornum', 'floorlevel', 'story', 'flornumber'
    ],
    
    // Flats Per Floor
    flats: [
      'flatperfloor', 'flatsperfloor', 'unitsperfloor', 'flatsperflo',
      'flatsperflo', 'unitsperflo'
    ],
    
    // Total Units
    totalUnits: [
      'totalunits', 'units', 'totalunit', 'unitcount', 'totalflats', 
      'flatstotal', 'noofunits'
    ],
    
    // Parking
    parking: [
      'parking', 'parkingslot', 'parkingspace', 'parkingtype',
      'coveredparking', 'openparking'
    ],
    
    // Land Parcel
    landParcel: [
      'landparcel', 'landparcelid', 'parcelid', 'parcel', 'lotnum', 'plotnum'
    ],
    
    // Launch Date
    launchDate: [
      'launchdate', 'launchda', 'releasedate', 'projectlaunch', 'announcementdate'
    ],
    
    // Details/Description
    details: [
      'details', 'description', 'remarks', 'notes', 'additionalinfo',
      'description', 'otherdetails'
    ],
    
    // Image URLs
    imageUrl: [
      'imageurl', 'imageUrls', 'image', 'images', 'imagelink', 'imageurlscoma',
      'imageurl', 'imageurlsc', 'photo', 'photos', 'pictures', 'imagepaths'
    ],
  };

  const normalizeHeader = (header: string): string => {
    return header
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '')      // Remove all whitespace
      .replace(/_/g, '')        // Remove underscores
      .replace(/-/g, '')        // Remove hyphens
      .replace(/\//g, '')       // Remove slashes
      .replace(/\./g, '')       // Remove dots
      .replace(/[()]/g, '');    // Remove parentheses
  };

  // Intelligent field mapping - learns which normalized header maps to which field
  const mapHeaderToField = (normalizedHeader: string): string | null => {
    for (const [fieldName, aliases] of Object.entries(FIELD_ALIASES)) {
      for (const alias of aliases) {
        if (normalizeHeader(alias) === normalizedHeader) {
          return fieldName;
        }
      }
    }
    return null;
  };

  const detectDelimiter = (headerLine: string): string => {
    if (headerLine.includes('\t')) return '\t';
    if (headerLine.includes(';')) return ';';
    return ',';
  };

  const getValue = (row: Record<string, string>, fieldAliases: string[]): string => {
    // Try to find the field using our comprehensive alias list
    for (const alias of fieldAliases) {
      const normalized = normalizeHeader(alias);
      if (row[normalized]) {
        return row[normalized];
      }
    }
    return '';
  };

  const parseCSV = (text: string): CSVProperty[] => {
    const lines = text.split(/\r?\n/);
    if (!lines[0]) return [];

    const delimiter = detectDelimiter(lines[0]);
    
    // Parse headers and map them to field names
    const rawHeaders = lines[0].split(delimiter).map(h => h.trim());
    const headerMapping: Record<string, string> = {}; // normalized header -> field name
    
    console.log('📋 Raw Headers:', rawHeaders);
    
    rawHeaders.forEach(rawHeader => {
      const normalized = normalizeHeader(rawHeader);
      const fieldName = mapHeaderToField(normalized);
      console.log(`Header: "${rawHeader}" → Normalized: "${normalized}" → Field: "${fieldName}"`);
      if (fieldName) {
        headerMapping[normalized] = fieldName;
      }
    });

    console.log('🎯 Final Header Mapping:', headerMapping);

    const data: CSVProperty[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split(delimiter).map(v => v.trim());
      
      // Map values by their field names
      const row: Record<string, string> = {};
      rawHeaders.forEach((rawHeader, index) => {
        const normalized = normalizeHeader(rawHeader);
        const fieldName = headerMapping[normalized];
        if (fieldName) {
          row[fieldName] = values[index] || '';
        }
      });

      console.log(`📝 Row ${i} Extracted Data:`, row);

      const csvRow: CSVProperty = {
        srNo: row['projectName'] || row['landParcel'] || '', // Use project or parcel as identifier
        builder: row['builder'] || '',
        salesPerson: row['salesPerson'] || '',
        projectName: row['projectName'] || '',
        landParcel: row['landParcel'] || '',
        tower: row['tower'] || '',
        floor: row['floor'] || '',
        specification: row['specification'] || '',
        carpet: row['carpet'] || '',
        price: row['price'] || '',
        flats: row['flats'] || '',
        totalUnits: row['totalUnits'] || '',
        possession: row['possession'] || '',
        parking: row['parking'] || '',
        construction: row['construction'] || '',
        amenities: row['amenities'] || '',
        location: row['location'] || '',
        launchDate: row['launchDate'] || '',
        details: row['details'] || '',
        imageUrl: row['imageUrl'] || '',
      };

      // Validate that row has required data - all must be non-empty
      const builderOk = csvRow.builder?.trim();
      const projectNameOk = csvRow.projectName?.trim();
      const specOk = csvRow.specification?.trim();
      const locationOk = csvRow.location?.trim();

      console.log(`✅ Validation Row ${i}:`, {
        builder: builderOk ? '✓' : '✗',
        projectName: projectNameOk ? '✓' : '✗',
        specification: specOk ? '✓' : '✗',
        location: locationOk ? '✓' : '✗',
        values: { builder: csvRow.builder, projectName: csvRow.projectName, specification: csvRow.specification, location: csvRow.location }
      });

      if (builderOk && projectNameOk && specOk && locationOk) {
        data.push(csvRow);
      }
    }

    console.log(`📊 Total Valid Rows: ${data.length} out of ${lines.length - 1}`);
    return data;
  };

  const mapToProperty = (csv: CSVProperty): MappedProperty => {
    // Extract BHK from specification (e.g., "3BHK" -> "3BHK", "2 BHK" -> "2BHK")
    const bhkMatch = csv.specification.match(/(\d+\.?\d*)\s*(BHK|bhk)?/i);
    const bhk = bhkMatch ? `${bhkMatch[1]}BHK` : csv.specification || '2BHK';

    // Parse price
    let priceNum = 0;
    if (csv.price) {
      const priceStr = csv.price.toString().toLowerCase();
      if (priceStr.includes('cr')) {
        priceNum = parseFloat(priceStr.replace(/[^\d.]/g, '')) * 10000000;
      } else if (priceStr.includes('l')) {
        priceNum = parseFloat(priceStr.replace(/[^\d.]/g, '')) * 100000;
      } else {
        priceNum = parseFloat(priceStr.replace(/[^\d.]/g, ''));
      }
    }

    // Extract area/carpet size
    const carpetArea = csv.carpet || '';

    // Extract amenities array
    const amenitiesArray = csv.amenities
      ? csv.amenities.split(',').map(a => a.trim()).filter(Boolean)
      : [];

    const description = csv.details
      ? csv.details
      : `${csv.specification} property in ${csv.projectName}. ${csv.construction ? `Construction: ${csv.construction}. ` : ''}Located at ${csv.location}.`;

    const images = csv.imageUrl
      ? csv.imageUrl.split(/[,|;]/).map(u => u.trim()).filter(Boolean)
      : [];

    return {
      title: `${csv.specification} at ${csv.projectName}${csv.tower ? ', ' + csv.tower : ''}`,
      description,
      location: csv.location,
      price: priceNum,
      type: 'apartment',
      category: 'residential',
      purpose: 'sell',
      bhk,
      area: carpetArea,
      carpetArea: carpetArea,
      furnishing: 'unfurnished',
      builder: csv.builder,
      possession: csv.possession,
      parking: csv.parking,
      construction: csv.construction,
      amenities: amenitiesArray,
      restrictions: [],
      projectName: csv.projectName,
      specification: csv.specification,
      tower: csv.tower,
      units: csv.totalUnits ? parseInt(csv.totalUnits) : 0,
      salesPerson: csv.salesPerson,
      status: 'active',
      image_url: images[0],
      images,
      rawData: csv,
    };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = parseCSV(text);

        if (parsed.length === 0) {
          toast({
            title: 'Error',
            description: 'No valid data found in CSV',
            variant: 'destructive',
          });
          return;
        }

        setCSVData(parsed);
        const mapped = parsed.map(mapToProperty);
        setMappedData(mapped);
        setShowPreview(true);

        toast({
          title: 'Success',
          description: `Imported ${parsed.length} properties from CSV`,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to parse CSV file',
          variant: 'destructive',
        });
      }
    };

    reader.readAsText(file);
  };

  const handleClearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setSelectedFileName('');
    setCSVData([]);
    setMappedData([]);
    setSelectedRows(new Set());
    setShowPreview(false);
    toast({
      title: 'Cleared',
      description: 'CSV file removed',
    });
  };

  const handleImportSelected = () => {
    const selected = Array.from(selectedRows).map(idx => mappedData[idx]);

    if (selected.length === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select at least one property to import',
        variant: 'destructive',
      });
      return;
    }

    onImport(selected);
    setShowPreview(false);
    setCSVData([]);
    setMappedData([]);
    setSelectedRows(new Set());

    toast({
      title: 'Success',
      description: `${selected.length} properties imported successfully`,
    });
  };

  const toggleRowSelection = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const toggleAllSelection = () => {
    if (selectedRows.size === mappedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(mappedData.map((_, i) => i)));
    }
  };

  return (
    <div className="space-y-4">
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Import Properties
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4">
            <div>
              <Label htmlFor="csv-upload">Upload CSV File</Label>
              <Input
                id="csv-upload"
                type="file"
                accept=".csv,.tsv,.txt"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="mt-2"
              />
              {selectedFileName && (
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground truncate">
                    Selected: {selectedFileName}
                  </p>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                    onClick={handleClearFile}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove CSV
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Supported formats: CSV, TSV, TXT (Tab-separated or comma-separated)
              </p>
            </div>

            <div>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Download Template
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Download a sample CSV template to see the required format
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview Imported Properties</DialogTitle>
            <DialogDescription>
              Review and select properties to import. {selectedRows.size} of {mappedData.length} selected
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-muted">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{mappedData.length}</div>
                  <p className="text-sm text-muted-foreground">Total Properties</p>
                </CardContent>
              </Card>
              <Card className="bg-muted">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-primary">{selectedRows.size}</div>
                  <p className="text-sm text-muted-foreground">Selected</p>
                </CardContent>
              </Card>
              <Card className="bg-muted">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-green-500">{mappedData.length - selectedRows.size}</div>
                  <p className="text-sm text-muted-foreground">Remaining</p>
                </CardContent>
              </Card>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedRows.size === mappedData.length && mappedData.length > 0}
                        onChange={toggleAllSelection}
                        className="cursor-pointer"
                      />
                    </TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Builder</TableHead>
                    <TableHead>Specification</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Possession</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappedData.map((property, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedRows.has(index)}
                          onChange={() => toggleRowSelection(index)}
                          className="cursor-pointer"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{property.rawData.projectName}</TableCell>
                      <TableCell>{property.rawData.builder}</TableCell>
                      <TableCell>{property.rawData.specification}</TableCell>
                      <TableCell>{property.rawData.price}</TableCell>
                      <TableCell>{property.rawData.location}</TableCell>
                      <TableCell>{property.rawData.possession}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Cancel
            </Button>
            <Button onClick={handleImportSelected} disabled={selectedRows.size === 0}>
              Import {selectedRows.size} Properties
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
