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
}

interface MappedProperty {
  title: string;
  description: string;
  location: string;
  price: string;
  type: string;
  category: string;
  purpose: string;
  bhk: string;
  area: string;
  furnishing: string;
  builder: string;
  possession: string;
  parking: string;
  construction: string;
  amenities: string[];
  restrictions: string[];
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
    srNo: 'Sr Nos',
    builder: 'Builder',
    salesPerson: 'Sales Person',
    projectName: 'Project name',
    tower: 'Tower',
    floor: 'Floor',
    specification: 'Specification',
    carpet: 'Carpet',
    price: 'Price',
    flats: 'Flat/Floor',
    totalUnits: 'Total Units',
    possession: 'Possession',
    parking: 'Parking',
    construction: 'Construction',
    amenities: 'Amenities',
    location: 'Location',
    launchDate: 'Launch Date',
  });

  const parseCSV = (text: string): CSVProperty[] => {
    const lines = text.split('\n');
    const headers = lines[0].split('\t').map(h => h.trim());
    const data: CSVProperty[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split('\t').map(v => v.trim());
      const row: CSVProperty = {
        srNo: values[0] || '',
        builder: values[1] || '',
        salesPerson: values[2] || '',
        projectName: values[3] || '',
        tower: values[4] || '',
        floor: values[5] || '',
        specification: values[6] || '',
        carpet: values[7] || '',
        price: values[8] || '',
        flats: values[9] || '',
        totalUnits: values[10] || '',
        possession: values[11] || '',
        parking: values[12] || '',
        construction: values[13] || '',
        amenities: values[14] || '',
        location: values[15] || '',
        launchDate: values[16] || '',
      };

      if (row.builder) {
        data.push(row);
      }
    }

    return data;
  };

  const mapToProperty = (csv: CSVProperty): MappedProperty => {
    // Extract BHK from specification (e.g., "3BHK" -> "3BHK")
    const bhkMatch = csv.specification.match(/(\d+\.?\d*)(BHK|bhk)?/i);
    const bhk = bhkMatch ? bhkMatch[0] : '2BHK';

    // Extract price (remove L, Cr, and convert)
    const priceStr = csv.price
      .replace(/L/gi, '00000')
      .replace(/cr/gi, '0000000')
      .replace(/,/gi, '')
      .trim();

    // Extract area/carpet size
    const areaMatch = csv.carpet.match(/(\d+)/);
    const area = areaMatch ? areaMatch[1] : '0';

    // Extract amenities array
    const amenitiesArray = csv.amenities
      ? csv.amenities.split(',').map(a => a.trim()).filter(Boolean)
      : [];

    return {
      title: `${csv.specification} at ${csv.projectName}, ${csv.tower || ''}`,
      description: `${csv.specification} property in ${csv.projectName}. ${csv.construction ? `Construction: ${csv.construction}` : ''}`,
      location: csv.location,
      price: csv.price,
      type: 'apartment',
      category: 'residential',
      purpose: 'sell',
      bhk,
      area,
      furnishing: 'unfurnished',
      builder: csv.builder,
      possession: csv.possession,
      parking: csv.parking,
      construction: csv.construction,
      amenities: amenitiesArray,
      restrictions: [],
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
