'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { parseRealEstateCSV } from '@/lib/realEstateCSVParser';
import { cleanRealEstateCSV, CleanedCSVResult } from '@/lib/csvCleaner';
import type { UnitConfiguration, RealEstateProject } from '@/types/realEstateData';

interface CSVImporterAdvancedProps {
  onImport?: (projects: RealEstateProject[], configurations: UnitConfiguration[]) => void;
  disabled?: boolean;
}

export function CSVImporterAdvanced({ onImport, disabled = false }: CSVImporterAdvancedProps) {
  const [projects, setProjects] = useState<RealEstateProject[]>([]);
  const [configurations, setConfigurations] = useState<UnitConfiguration[]>([]);
  const [selectedConfigs, setSelectedConfigs] = useState<Set<number>>(new Set());
  const [cleaningResult, setCleaningResult] = useState<CleanedCSVResult | null>(null);
  const [showCleaningPreview, setShowCleaningPreview] = useState(false);
  const [showCleaningDetails, setShowCleaningDetails] = useState(false);
  const [originalFileName, setOriginalFileName] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showParseDetails, setShowParseDetails] = useState(false);
  const [parseErrors, setParseErrors] = useState<Array<any>>([]);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setOriginalFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        
        // Step 1: Clean the CSV with AI
        toast({
          title: '🤖 AI Processing...',
          description: 'Analyzing and cleaning your CSV automatically',
        });
        
        const cleaned = cleanRealEstateCSV(text);
        setCleaningResult(cleaned);
        
        // Step 2: Show cleaning preview
        if (cleaned.issues.length > 0 || cleaned.changes.length > 0) {
          setShowCleaningDetails(false);
          setShowCleaningPreview(true);
          return; // Wait for user to review and proceed
        }
        
        // If no issues, proceed directly to parsing
        proceedWithCleaned(cleaned.cleanedText);
        
      } catch (error) {
        toast({
          title: 'Error reading file',
          description: `${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
  };

  const proceedWithCleaned = (cleanedText: string) => {
    try {
      const result = parseRealEstateCSV(cleanedText);

      // Debug: Log image URLs
      console.log('📸 Image URLs parsed:', result.configurations.map(c => ({ spec: c.specification, images: c.imageUrls })));

      // Check if we got any valid data
      if (result.configurations.length === 0) {
        toast({
          title: 'No valid data found in CSV',
          description: `Parsed ${result.stats.totalRows} rows but found no valid property configurations. Check that your CSV has: Builder, Project name, Specification, and Location columns with data.`,
          variant: 'destructive',
        });
        return;
      }

      setProjects(result.projects);
      setConfigurations(result.configurations);
      setParseErrors(result.errors);
      setShowParseDetails(false);
      setSelectedConfigs(new Set(result.configurations.map((_, i) => i)));
      setShowCleaningPreview(false);
      setShowPreview(true);

      if (result.errors.length > 0) {
        toast({
          description: `CSV parsed with ${result.errors.length} errors. Check details below.`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: '✅ Success!',
          description: `Found ${result.configurations.length} configurations from ${result.projects.length} projects!`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error parsing CSV',
        description: `${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  const toggleSelection = (index: number) => {
    const newSet = new Set(selectedConfigs);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedConfigs(newSet);
  };

  const toggleAllSelection = () => {
    if (selectedConfigs.size === configurations.length) {
      setSelectedConfigs(new Set());
    } else {
      setSelectedConfigs(new Set(configurations.map((_, i) => i)));
    }
  };

  const handleImport = () => {
    const selectedProjects = new Map<string, RealEstateProject>();
    const selectedConfigurations: UnitConfiguration[] = [];

    selectedConfigs.forEach((index) => {
      const config = configurations[index];
      const project = projects.find((p) => p.projectId === config.projectId);

      if (project) {
        selectedProjects.set(project.projectId, project);
      }
      selectedConfigurations.push(config);
    });

    onImport?.(Array.from(selectedProjects.values()), selectedConfigurations);

    toast({
      description: `Imported ${selectedConfigurations.length} configurations!`,
    });

    setShowPreview(false);
    setProjects([]);
    setConfigurations([]);
    setSelectedConfigs(new Set());
  };

  return (
    <div className="space-y-4">
      {/* File Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI-Powered CSV Import
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept=".csv,.txt,.tsv"
              onChange={handleFileUpload}
              className="flex-1"
            />
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </Button>
          </div>
          <div className="mt-3 space-y-2">
            <p className="text-xs text-muted-foreground">
              Supports CSV, TSV, and TXT files. Required columns: Builder, Project name, Specification, Location.
            </p>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-xs font-medium text-purple-900 mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                AI Automatic Fixes:
              </p>
              <ul className="text-xs text-purple-700 space-y-0.5 ml-4">
                <li>• Handles continuation rows (empty builder/project fields)</li>
                <li>• Skips empty rows and note rows automatically</li>
                <li>• Inherits project info for multiple specifications</li>
                <li>• Shows preview of all changes before importing</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview Import Data</DialogTitle>
            <DialogDescription>
              Review {configurations.length} configurations from {projects.length} projects
            </DialogDescription>
          </DialogHeader>

          {parseErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {parseErrors.length} parsing errors found. These rows were skipped.
              </AlertDescription>
            </Alert>
          )}

          {/* Configuration Preview Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Unit Configurations ({configurations.length})</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAllSelection}
              >
                {selectedConfigs.size === configurations.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedConfigs.size === configurations.length}
                        onCheckedChange={() => toggleAllSelection()}
                      />
                    </TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Builder</TableHead>
                    <TableHead>Spec</TableHead>
                    <TableHead>Tower</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Carpet Area</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configurations.map((config, idx) => {
                    const project = projects.find((p) => p.projectId === config.projectId);
                    return (
                      <TableRow key={idx} className={selectedConfigs.has(idx) ? 'bg-muted' : ''}>
                        <TableCell>
                          <Checkbox
                            checked={selectedConfigs.has(idx)}
                            onCheckedChange={() => toggleSelection(idx)}
                          />
                        </TableCell>
                        <TableCell className="font-medium text-sm">{project?.projectName}</TableCell>
                        <TableCell className="text-sm">{project?.builder}</TableCell>
                        <TableCell className="text-sm">{config.specification}</TableCell>
                        <TableCell className="text-sm">{config.tower || '-'}</TableCell>
                        <TableCell className="text-sm">
                          {Number.isFinite(config.priceRange.min) && Number.isFinite(config.priceRange.max)
                            ? config.priceRange.min === config.priceRange.max
                              ? `₹${config.priceRange.min}L`
                              : `₹${config.priceRange.min}L - ₹${config.priceRange.max}L`
                            : config.priceRange.originalFormat || '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {config.carpetAreas.length > 0
                            ? `${Math.min(...config.carpetAreas)}-${Math.max(...config.carpetAreas)} sqft`
                            : '-'}
                        </TableCell>
                        <TableCell className="text-sm">{config.totalUnits}</TableCell>
                        <TableCell className="text-sm">{project?.location}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between bg-muted p-3 rounded">
              <span className="text-sm font-medium">
                {selectedConfigs.size} of {configurations.length} selected for import
              </span>
              <Button onClick={handleImport} disabled={disabled || selectedConfigs.size === 0}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Import {selectedConfigs.size} Configurations
              </Button>
            </div>
          </div>

          {/* Projects Summary */}
          {projects.length > 0 && (
            <div className="space-y-3 mt-6 pt-6 border-t">
              <h3 className="font-semibold text-sm">Projects Summary</h3>
              <div className="grid grid-cols-2 gap-3">
                {projects.map((project) => (
                  <Card key={project.projectId} className="p-3">
                    <p className="font-medium text-sm">{project.projectName}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {project.builder} • {project.location}
                    </p>
                    <div className="text-xs text-muted-foreground mt-2">
                      {project.landParcel && <p>Land: {project.landParcel}</p>}
                      {project.launchDate && <p>Launch: {project.launchDate}</p>}
                      {project.salesPersonName && <p>Contact: {project.salesPersonName}</p>}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Parse Errors */}
          {parseErrors.length > 0 && (
            <div className="space-y-2 mt-6 pt-6 border-t">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Parsing Errors</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowParseDetails((p) => !p)}>
                  {showParseDetails ? 'Hide details' : 'Show details'}
                </Button>
              </div>
              {showParseDetails && (
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {parseErrors.slice(0, 10).map((error, idx) => (
                    <div key={idx} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                      Row {error.rowNumber}: {error.field} - {error.reason}
                    </div>
                  ))}
                  {parseErrors.length > 10 && (
                    <p className="text-xs text-muted-foreground">
                      ... and {parseErrors.length - 10} more errors
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Cleaning Preview Dialog */}
      <Dialog open={showCleaningPreview} onOpenChange={setShowCleaningPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              AI CSV Cleaning - Preview
            </DialogTitle>
            <DialogDescription>
              Review the automatic fixes applied to your CSV file
            </DialogDescription>
          </DialogHeader>

          {cleaningResult && (
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {cleaningResult.originalRows}
                  </div>
                  <div className="text-sm text-muted-foreground">Original Rows</div>
                </Card>
                <Card className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {cleaningResult.cleanedRows}
                  </div>
                  <div className="text-sm text-muted-foreground">Valid Properties</div>
                </Card>
                <Card className="p-4">
                  <div className="text-2xl font-bold text-orange-600">
                    {cleaningResult.changes.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Auto-Fixes Applied</div>
                </Card>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Summary view shown. Details are optional.</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCleaningDetails((prev) => !prev)}
                >
                  {showCleaningDetails ? 'Hide details' : 'Show details'}
                </Button>
              </div>

              {showCleaningDetails && (
                <>
                  {/* Changes Made */}
                  {cleaningResult.changes.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Automatic Fixes Applied
                      </h3>
                      <div className="max-h-48 overflow-y-auto space-y-1 bg-green-50 p-3 rounded">
                        {cleaningResult.changes.map((change, idx) => (
                          <div key={idx} className="text-xs text-green-700">
                            ✓ {change}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Issues Found */}
                  {cleaningResult.issues.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-600" />
                        Rows Skipped (Invalid Data)
                      </h3>
                      <div className="max-h-48 overflow-y-auto space-y-1 bg-orange-50 p-3 rounded">
                        {cleaningResult.issues.slice(0, 20).map((issue, idx) => (
                          <div key={idx} className="text-xs text-orange-700">
                            ⚠ {issue}
                          </div>
                        ))}
                        {cleaningResult.issues.length > 20 && (
                          <div className="text-xs text-muted-foreground">
                            ... and {cleaningResult.issues.length - 20} more skipped rows
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Preview of cleaned data */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Cleaned CSV Preview</h3>
                    <div className="bg-gray-50 p-3 rounded max-h-64 overflow-auto">
                      <pre className="text-xs font-mono">
                        {cleaningResult.cleanedText.split('\n').slice(0, 15).join('\n')}
                        {cleaningResult.cleanedText.split('\n').length > 15 && '\n... (showing first 15 rows)'}
                      </pre>
                    </div>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => proceedWithCleaned(cleaningResult.cleanedText)}
                  className="flex-1"
                  disabled={cleaningResult.cleanedRows === 0}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Proceed with {cleaningResult.cleanedRows} Valid Properties
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCleaningPreview(false);
                    setCleaningResult(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const blob = new Blob([cleaningResult.cleanedText], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `cleaned_${originalFileName}`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Cleaned CSV
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
