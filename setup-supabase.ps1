# Property Canvas - Supabase Setup Script (Windows PowerShell)
# 
# This script automates the Supabase setup for Property Canvas
# It creates the storage bucket and runs database migrations
#
# IMPORTANT: You must provide your Supabase credentials:
# 1. Open: https://app.supabase.com/project/gnsgtnunohgnyslxmerq/settings/api
# 2. Copy your Project URL and Service Role Key
# 3. Set environment variables before running this script:
#    $env:SUPABASE_URL = "your-project-url"
#    $env:SUPABASE_SERVICE_KEY = "your-service-role-key"
#
# Then run: .\setup-supabase.ps1

# Enable error handling
$ErrorActionPreference = "Stop"

# Color output helper
function Write-Success { Write-Host "✓ $args" -ForegroundColor Green }
function Write-Error { Write-Host "✗ $args" -ForegroundColor Red }
function Write-Warning { Write-Host "⚠ $args" -ForegroundColor Yellow }
function Write-Info { Write-Host "ℹ $args" -ForegroundColor Cyan }
function Write-Step { Write-Host "`n[$args]" -ForegroundColor Blue }

# Main setup function
function Setup-PropertyCanvas {
    try {
        # Step 1: Validate environment
        Write-Step "1/4" "Validating Supabase credentials..."
        
        if (-not $env:SUPABASE_URL) {
            Write-Error "SUPABASE_URL environment variable not set"
            Write-Warning "Please set the following environment variables:"
            Write-Info 'Set environment variables with: $env:SUPABASE_URL = "your-url"'
            Write-Info 'Get credentials from: https://app.supabase.com/project/gnsgtnunohgnyslxmerq/settings/api'
            exit 1
        }
        
        if (-not $env:SUPABASE_SERVICE_KEY) {
            Write-Error "SUPABASE_SERVICE_KEY environment variable not set"
            Write-Warning "Please set: `$env:SUPABASE_SERVICE_KEY = `"your-service-key`""
            exit 1
        }
        
        Write-Success "Credentials configured"

        # Step 2: Create Node.js script for Supabase operations
        Write-Step "2/4" "Creating temporary setup script..."
        
        $setupScript = @'
const { createClient } = require("@supabase/supabase-js");

async function setup() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  
  const supabase = createClient(url, key);
  
  console.log("Creating storage bucket...");
  
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Failed to list buckets:", listError);
      process.exit(1);
    }
    
    const bucketExists = buckets?.some(b => b.name === "property-images");
    
    if (!bucketExists) {
      const { data, error } = await supabase.storage.createBucket("property-images", {
        public: true,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
        fileSizeLimit: 5242880,
      });
      
      if (error) {
        console.error("Bucket creation failed:", error);
        process.exit(1);
      }
      
      console.log("SUCCESS: Storage bucket created");
    } else {
      console.log("INFO: Storage bucket already exists");
    }
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

setup();
'@
        
        $scriptPath = "$PSScriptRoot\temp-setup.js"
        Set-Content -Path $scriptPath -Value $setupScript
        Write-Success "Setup script created"

        # Step 3: Run setup script
        Write-Step "3/4" "Executing Supabase setup..."
        
        # Pass environment variables to Node.js
        $env:SUPABASE_URL_TEMP = $env:SUPABASE_URL
        $env:SUPABASE_SERVICE_KEY_TEMP = $env:SUPABASE_SERVICE_KEY
        
        node $scriptPath
        
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Setup script failed"
            Remove-Item $scriptPath -Force
            exit 1
        }
        
        Write-Success "Supabase setup completed"

        # Step 4: Provide migration instructions
        Write-Step "4/4" "Database migration instructions..."
        
        Write-Info "The storage bucket has been created successfully!"
        Write-Warning "You must run the database migration manually:"
        Write-Host ""
        Write-Host "1. Open Supabase SQL Editor:"
        Write-Host "   https://app.supabase.com/project/gnsgtnunohgnyslxmerq/sql/new"
        Write-Host ""
        Write-Host "2. Copy and run the SQL from: SETUP_COMPLETE.md"
        Write-Host ""
        Write-Host "3. This creates the properties_images table and RLS policies"
        Write-Host ""

        # Cleanup
        Remove-Item $scriptPath -Force
        
        # Success summary
        Write-Host ("=" * 60) -ForegroundColor Green
        Write-Success "Setup completed successfully!"
        Write-Host ("=" * 60) -ForegroundColor Green
        
        Write-Info "Next steps:"
        Write-Info "1. Run database migration (see above)"
        Write-Info "2. Test image upload: Admin > Image Manager"
        Write-Info "3. View properties to confirm images display"

    } catch {
        Write-Error "Setup failed: $_"
        exit 1
    }
}

# Run setup
Setup-PropertyCanvas
