import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  ArrowRight,
  RefreshCw,
  Plus
} from 'lucide-react';

interface UploadResult {
  success: boolean;
  projectsCreated: number;
  projectsUpdated: number;
  unitsAdded: number;
  rowsSkipped: number;
  errors: { row: number; message: string }[];
}

export default function AdminUpload() {
  const { role, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'replace' | 'append'>('append');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile);
      setResult(null);
    } else {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a CSV file.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }

    return rows;
  };

  const normalizeBhkType = (bhk: string): string => {
    const normalized = bhk.toLowerCase().trim();
    if (normalized.includes('villa')) return 'Villa';
    const match = normalized.match(/(\d+)\s*bhk/i);
    if (match) return `${match[1]} BHK`;
    return bhk.trim() || '2 BHK';
  };

  const parsePrice = (priceStr: string): { min: number | null; max: number | null } => {
    if (!priceStr || priceStr.toLowerCase() === 'on request') {
      return { min: null, max: null };
    }

    const normalized = priceStr.toLowerCase().replace(/\s+/g, '');
    
    // Handle ranges like "1.10 to 1.16 cr"
    const rangeMatch = normalized.match(/([\d.]+)(?:to|-)([\d.]+)(cr|l|lakh|lac)/);
    if (rangeMatch) {
      const multiplier = rangeMatch[3].startsWith('cr') ? 10000000 : 100000;
      return {
        min: parseFloat(rangeMatch[1]) * multiplier,
        max: parseFloat(rangeMatch[2]) * multiplier,
      };
    }

    // Handle single values like "90L" or "1.12cr"
    const singleMatch = normalized.match(/([\d.]+)(cr|l|lakh|lac)/);
    if (singleMatch) {
      const multiplier = singleMatch[2].startsWith('cr') ? 10000000 : 100000;
      const value = parseFloat(singleMatch[1]) * multiplier;
      return { min: value, max: value };
    }

    // Try parsing as plain number
    const numericValue = parseFloat(priceStr.replace(/[^\d.]/g, ''));
    if (!isNaN(numericValue)) {
      return { min: numericValue, max: numericValue };
    }

    return { min: null, max: null };
  };

  const parseCarpet = (carpetStr: string): { min: number | null; max: number | null } => {
    if (!carpetStr) return { min: null, max: null };

    // Handle ranges like "863, 887"
    const rangeMatch = carpetStr.match(/([\d.]+)\s*[,\-to]+\s*([\d.]+)/);
    if (rangeMatch) {
      return {
        min: parseFloat(rangeMatch[1]),
        max: parseFloat(rangeMatch[2]),
      };
    }

    // Single value
    const singleValue = parseFloat(carpetStr.replace(/[^\d.]/g, ''));
    if (!isNaN(singleValue)) {
      return { min: singleValue, max: singleValue };
    }

    return { min: null, max: null };
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setUploading(true);
    setProgress(0);
    setResult(null);

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      if (rows.length === 0) {
        throw new Error('CSV file is empty or invalid');
      }

      setProgress(10);

      // Create upload record
      const { data: uploadRecord, error: uploadError } = await supabase
        .from('csv_uploads')
        .insert({
          uploaded_by: user.id,
          filename: file.name,
          file_size: file.size,
          total_rows: rows.length,
          mode,
        })
        .select()
        .single();

      if (uploadError) throw uploadError;

      setProgress(20);

      // Group rows by projectId
      const projectGroups: Map<string, typeof rows> = new Map();
      rows.forEach(row => {
        const projectId = (row.projectid || row.project_id || '').toLowerCase().trim();
        if (projectId) {
          if (!projectGroups.has(projectId)) {
            projectGroups.set(projectId, []);
          }
          projectGroups.get(projectId)!.push(row);
        }
      });

      setProgress(30);

      // If replace mode, delete existing data
      if (mode === 'replace') {
        await supabase.from('units').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      }

      setProgress(40);

      let projectsCreated = 0;
      let projectsUpdated = 0;
      let unitsAdded = 0;
      let rowsSkipped = 0;
      const errors: { row: number; message: string }[] = [];

      const totalGroups = projectGroups.size;
      let processedGroups = 0;

      for (const [projectId, projectRows] of projectGroups) {
        try {
          const firstRow = projectRows[0];

          // Check if project exists
          const { data: existingProject } = await supabase
            .from('projects')
            .select('id')
            .eq('project_id', projectId)
            .single();

          let projectUuid: string;

          if (existingProject) {
            // Update existing project
            projectUuid = existingProject.id;
            await supabase
              .from('projects')
              .update({
                project_name: firstRow.projectname || firstRow.project_name || projectId,
                builder: firstRow.builder || 'Unknown Builder',
                sales_person: firstRow.salesperson || firstRow.sales_person || null,
                land_parcel: firstRow.landparcel || firstRow.land_parcel || null,
                tower: firstRow.tower || null,
                construction: firstRow.construction || null,
                amenities: firstRow.amenities || null,
                location: firstRow.location || 'Unknown Location',
                possession: firstRow.possession || null,
                launch_date: firstRow.launchdate || firstRow.launch_date || null,
                image_url: firstRow.imageurl || firstRow.image_url || null,
              })
              .eq('id', projectUuid);

            projectsUpdated++;

            // Delete existing units if in replace mode
            if (mode === 'replace') {
              await supabase.from('units').delete().eq('project_uuid', projectUuid);
            }
          } else {
            // Create new project
            const { data: newProject, error: projectError } = await supabase
              .from('projects')
              .insert({
                project_id: projectId,
                project_name: firstRow.projectname || firstRow.project_name || projectId,
                builder: firstRow.builder || 'Unknown Builder',
                sales_person: firstRow.salesperson || firstRow.sales_person || null,
                land_parcel: firstRow.landparcel || firstRow.land_parcel || null,
                tower: firstRow.tower || null,
                construction: firstRow.construction || null,
                amenities: firstRow.amenities || null,
                location: firstRow.location || 'Unknown Location',
                possession: firstRow.possession || null,
                launch_date: firstRow.launchdate || firstRow.launch_date || null,
                image_url: firstRow.imageurl || firstRow.image_url || null,
              })
              .select()
              .single();

            if (projectError) throw projectError;
            projectUuid = newProject.id;
            projectsCreated++;
          }

          // Add units for each row
          for (const row of projectRows) {
            const bhkType = normalizeBhkType(row.bhktype || row.bhk_type || '');
            const priceData = parsePrice(row.price || '');
            const carpetData = parseCarpet(row.carpet || '');

            const { error: unitError } = await supabase.from('units').insert({
              project_uuid: projectUuid,
              bhk_type: bhkType,
              carpet: row.carpet || null,
              carpet_min: carpetData.min,
              carpet_max: carpetData.max,
              price: row.price || null,
              price_min: priceData.min,
              price_max: priceData.max,
              floor: row.floor || null,
              flat_per_floor: row.flatperfloor ? parseInt(row.flatperfloor) : null,
              total_units: row.totalunits || row.total_units ? parseInt(row.totalunits || row.total_units) : null,
              parking: row.parking || null,
              details: row.details || null,
            });

            if (unitError) {
              rowsSkipped++;
            } else {
              unitsAdded++;
            }
          }
        } catch (err: any) {
          errors.push({ row: processedGroups + 1, message: err.message });
          rowsSkipped += projectRows.length;
        }

        processedGroups++;
        setProgress(40 + Math.round((processedGroups / totalGroups) * 50));
      }

      setProgress(95);

      // Update upload record with results
      await supabase
        .from('csv_uploads')
        .update({
          projects_created: projectsCreated,
          projects_updated: projectsUpdated,
          units_added: unitsAdded,
          rows_skipped: rowsSkipped,
          errors: errors,
          status: errors.length > 0 ? 'completed' : 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', uploadRecord.id);

      setProgress(100);
      setResult({
        success: true,
        projectsCreated,
        projectsUpdated,
        unitsAdded,
        rowsSkipped,
        errors,
      });

      toast({
        title: 'Upload Complete!',
        description: `Created ${projectsCreated} projects, added ${unitsAdded} units.`,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      setResult({
        success: false,
        projectsCreated: 0,
        projectsUpdated: 0,
        unitsAdded: 0,
        rowsSkipped: 0,
        errors: [{ row: 0, message: error.message }],
      });
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setResult(null);
    setProgress(0);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <h1 className="text-xl font-bold">Upload CSV</h1>
            </div>
          </header>

          <main className="flex-1 p-6 max-w-4xl">
            {/* Upload Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                  CSV Upload
                </CardTitle>
                <CardDescription>
                  Upload your broker CSV file to import projects and units. The system will 
                  automatically normalize and structure the data.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Drop Zone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className={`
                    border-2 border-dashed rounded-xl p-8 text-center transition-colors
                    ${file ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                  `}
                >
                  {file ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileSpreadsheet className="h-10 w-10 text-primary" />
                      <div className="text-left">
                        <p className="font-semibold">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={resetUpload}>
                        Change
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2">
                        Drop your CSV file here
                      </p>
                      <p className="text-muted-foreground mb-4">
                        or click to browse
                      </p>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                        id="csv-upload"
                      />
                      <Button asChild variant="outline">
                        <label htmlFor="csv-upload" className="cursor-pointer">
                          Select File
                        </label>
                      </Button>
                    </>
                  )}
                </div>

                {/* Mode Selection */}
                {file && !result && (
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Upload Mode</Label>
                    <RadioGroup value={mode} onValueChange={(v) => setMode(v as 'replace' | 'append')}>
                      <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value="append" id="append" />
                        <div className="flex-1">
                          <Label htmlFor="append" className="font-medium cursor-pointer">
                            Append / Update
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Add new projects and update existing ones. Existing data is preserved.
                          </p>
                        </div>
                        <Badge variant="secondary">Recommended</Badge>
                      </div>
                      <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value="replace" id="replace" />
                        <div className="flex-1">
                          <Label htmlFor="replace" className="font-medium cursor-pointer">
                            Replace All
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Delete all existing projects and units, then import fresh data.
                          </p>
                        </div>
                        <Badge variant="destructive">Destructive</Badge>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {/* Progress */}
                {uploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Processing...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}

                {/* Upload Button */}
                {file && !result && (
                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full gradient-primary"
                    size="lg"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload & Process
                      </>
                    )}
                  </Button>
                )}

                {/* Results */}
                {result && (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {result.success ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span className={`font-semibold ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                          {result.success ? 'Upload Successful!' : 'Upload Failed'}
                        </span>
                      </div>
                    </div>

                    {result.success && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-muted/50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-primary">{result.projectsCreated}</p>
                          <p className="text-sm text-muted-foreground">Projects Created</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-blue-600">{result.projectsUpdated}</p>
                          <p className="text-sm text-muted-foreground">Projects Updated</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-green-600">{result.unitsAdded}</p>
                          <p className="text-sm text-muted-foreground">Units Added</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-orange-600">{result.rowsSkipped}</p>
                          <p className="text-sm text-muted-foreground">Rows Skipped</p>
                        </div>
                      </div>
                    )}

                    {result.errors.length > 0 && (
                      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                          <span className="font-medium text-orange-700">Warnings</span>
                        </div>
                        <ul className="text-sm text-orange-700 space-y-1 max-h-32 overflow-y-auto">
                          {result.errors.slice(0, 5).map((err, i) => (
                            <li key={i}>Row {err.row}: {err.message}</li>
                          ))}
                          {result.errors.length > 5 && (
                            <li>...and {result.errors.length - 5} more</li>
                          )}
                        </ul>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button onClick={resetUpload} variant="outline" className="flex-1">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Upload Another
                      </Button>
                      <Button asChild className="flex-1 gradient-primary">
                        <a href="/admin/projects">
                          View Projects
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* CSV Format Guide */}
            <Card>
              <CardHeader>
                <CardTitle>Expected CSV Format</CardTitle>
                <CardDescription>
                  Your CSV file should include these columns (headers are case-insensitive):
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {[
                    'projectId', 'builder', 'salesPerson', 'projectName', 'landParcel',
                    'tower', 'construction', 'amenities', 'location', 'possession',
                    'launchDate', 'bhkType', 'carpet', 'price', 'floor',
                    'flatPerFloor', 'totalUnits', 'parking', 'details', 'imageUrl'
                  ].map((col) => (
                    <Badge key={col} variant="secondary" className="font-mono text-xs">
                      {col}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
