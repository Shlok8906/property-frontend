import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { CSVImporterAdvanced } from './CSVImporterAdvanced';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { FileText, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { RealEstateProject, UnitConfiguration } from '@/types/realEstateData';
import { propertyAPI, Property } from '@/lib/api';

const mapToProperties = (
  projects: RealEstateProject[],
  configurations: UnitConfiguration[],
): Omit<Property, '_id' | 'created_at' | 'updated_at'>[] => {
  // Helper to safely get lakhs from various shapes
  const getLakhs = (pr: any): number => {
    if (!pr) return 0;
    // Support both {min,max} and {minLakhs,maxLakhs}
    const lakhs = pr.minLakhs ?? pr.min ?? 0;
    if (typeof lakhs === 'number' && isFinite(lakhs)) return lakhs;
    // Fallback: try to parse original string like "90L" or "1.12 Cr"
    const s = pr.originalFormat as string | undefined;
    if (!s) return 0;
    const m = s.match(/(\d+(?:\.\d+)?)\s*(cr|l|lakhs?|crore)?/i);
    if (!m) return 0;
    const value = parseFloat(m[1]);
    const unit = (m[2] || 'L').toLowerCase();
    return unit.includes('cr') ? value * 100 : value;
  };

  return configurations.map((config) => {
    const project = projects.find((p) => p.projectId === config.projectId);
    const priceLakhs = getLakhs((config as any).priceRange);
    const price = Math.round(priceLakhs * 100000);

    return {
      title: `${project?.projectName ?? 'Property'} - ${config.specification}`,
      location: project?.location ?? 'Unknown',
      bhk: config.specification || 'N/A',
      price,
      type: 'apartment',
      category: 'residential',
      purpose: 'sell',
      builder: project?.builder,
      projectName: project?.projectName,
      specification: config.specification,
      tower: config.tower,
      carpetArea: config.carpetAreas.length > 0 
        ? `${Math.min(...config.carpetAreas)}-${Math.max(...config.carpetAreas)} sqft`
        : undefined,
      units: config.totalUnits,
      possession: config.possession,
      amenities: config.amenities,
      salesPerson: project?.salesPersonName,
    };
  });
};

export function CSVImportPage() {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalToImport, setTotalToImport] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleImport = async (projects: RealEstateProject[], configurations: UnitConfiguration[]) => {
    setIsImporting(true);
    setProgress(0);
    
    try {
      const mapped = mapToProperties(projects, configurations);
      setTotalToImport(mapped.length);

      // For large imports, process in chunks on the frontend too
      const CHUNK_SIZE = 100;
      let totalSaved = 0;

      for (let i = 0; i < mapped.length; i += CHUNK_SIZE) {
        const chunk = mapped.slice(i, i + CHUNK_SIZE);
        
        // Save chunk to MongoDB via API
        const result = await propertyAPI.createBulk(chunk);
        totalSaved += result.count;
        
        // Update progress
        setProgress(Math.round((totalSaved / mapped.length) * 100));
        
        // Small delay to prevent UI freeze
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      toast({
        title: 'Import successful',
        description: `${totalSaved} properties saved to database. Opening Manage Properties...`,
      });

      // Small delay before navigation to show completion
      setTimeout(() => {
        navigate('/admin/properties');
      }, 1000);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to import properties',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
      setProgress(0);
      setTotalToImport(0);
    }
  };

  const downloadTemplate = () => {
    const template = `Sr Nos	Builder	Sales Person	Project name	Land Parcel	Tower	Floor	Specification	Carpet	Price	Flat/Floor	Total Units	Possession	Parking	Construction	Amenities	Location	Launch Date	Floor Rise	Details
1	Example Builder	Sales Name - 1234567890	Project Name	55 Acre	Tower 1	16 Floor	3BHK	863, 887	90L	4Flats	64 Flats	Dec 26	3=1 / 4=2	Mivan	All Amenities	Location	2024			
2	Another Builder	Sales Name - 9876543210	Another Project	3.5 Acre	5 Tower	21 Floor	2BHK	794,895	84,94L	A-4 / B-7	600 Unit	RERA Dec 29	2,3= 1	Mivan	All amenities	Location	2024			`;

    const blob = new Blob([template], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'property_import_template.txt';
    link.click();
  };

  return (
    <AdminLayout title="CSV Import">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Bulk Import Properties</h1>
          <p className="text-muted-foreground mt-1">
            Import multiple properties from CSV/TSV files into MongoDB database
          </p>
        </div>

        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            <strong>How it works:</strong> Upload a CSV file with property data. AI will automatically clean and fix the data. Review the preview, then import directly to MongoDB database. <strong>Can handle up to 1000+ properties!</strong>
          </AlertDescription>
        </Alert>

        {isImporting && (
          <Card className="border-primary">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Importing properties...</span>
                  <span className="text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing {totalToImport} properties in batches</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div>
          <CSVImporterAdvanced onImport={handleImport} disabled={isImporting} />
        </div>

        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              CSV Template
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Download a sample CSV template to ensure your data is in the correct format
            </p>
            <Button onClick={downloadTemplate} className="gap-2">
              <Download className="h-4 h-4" />
              Download Template
            </Button>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardHeader>
            <CardTitle>Import Format Guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium mb-1">Required Fields:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li><strong>Builder</strong> - Developer/Builder name</li>
                  <li><strong>Project name</strong> - Name of the project</li>
                  <li><strong>Specification</strong> - BHK type (1BHK, 2BHK, 3BHK, etc.)</li>
                  <li><strong>Location</strong> - City/Area location</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
