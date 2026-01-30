import { useState } from 'react';
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

  const normalizeHeader = (header: string) =>
    header.toLowerCase().replace(/\s|_|-/g, '');

  const detectDelimiter = (headerLine: string) => {
    if (headerLine.includes('\t')) return '\t';
    if (headerLine.includes(';')) return ';';
    return ',';
  };

  const getValue = (row: Record<string, string>, aliases: string[]) => {
    for (const alias of aliases) {
      const key = normalizeHeader(alias);
      if (row[key]) return row[key];
    }
    return '';
  };

  const parseCSV = (text: string): CSVProperty[] => {
    const lines = text.split(/\r?\n/);
    if (!lines[0]) return [];

    const delimiter = detectDelimiter(lines[0]);
    const headers = lines[0]
      .split(delimiter)
      .map(h => h.trim())
      .map(normalizeHeader);
    const data: CSVProperty[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split(delimiter).map(v => v.trim());
      
      // Map by header names instead of position
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      const csvRow: CSVProperty = {
        srNo: getValue(row, ['projectId', 'project', 'id']),
        builder: getValue(row, ['builder']),
        salesPerson: getValue(row, ['salesPerson', 'sales person', 'sales']),
        projectName: getValue(row, ['projectName', 'project name', 'project']),
        landParcel: getValue(row, ['landParcel', 'land parcel', 'land']),
        tower: getValue(row, ['tower', 'block']),
        floor: getValue(row, ['floor']),
        specification: getValue(row, ['bhkType', 'bhk', 'specification']),
        carpet: getValue(row, ['carpet', 'carpetArea', 'area']),
        price: getValue(row, ['price', 'cost']),
        flats: getValue(row, ['flatPerFloor', 'flatsPerFloor', 'flat/floor']),
        totalUnits: getValue(row, ['totalUnits', 'units', 'totalunit']),
        possession: getValue(row, ['possession', 'possessionStatus']),
        parking: getValue(row, ['parking']),
        construction: getValue(row, ['construction', 'status']),
        amenities: getValue(row, ['amenities', 'amenity']),
        location: getValue(row, ['location', 'locality', 'areaName']),
        launchDate: getValue(row, ['launchDate', 'launch date', 'launch']),
        details: getValue(row, ['details', 'description']),
        imageUrl: getValue(row, ['imageUrl', 'image', 'images', 'imageUrls']),
      };

      // Validate that row has required data
      if (csvRow.builder && csvRow.projectName && csvRow.specification && csvRow.location) {
        data.push(csvRow);
      }
    }

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
                className="mt-2"
              />
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
