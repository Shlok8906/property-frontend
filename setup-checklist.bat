@echo off
REM Property Canvas - Setup Checklist (Windows)
REM This checklist will help you complete the Supabase setup

setlocal enabledelayedexpansion

cls
echo.
echo  ===================================
echo  Property Canvas - Setup Checklist
echo  ===================================
echo.
echo.
echo  1. GATHER CREDENTIALS ^(2 min^)
echo     [ ] Go to: https://app.supabase.com/project/gnsgtnunohgnyslxmerq/settings/api
echo     [ ] Copy Project URL ^(https://...^)
echo     [ ] Copy Service Role Key ^(eyJ...^)
echo.
echo.
echo  2. CREATE STORAGE BUCKET ^(1 min^)
echo     [ ] Go to Storage section
echo     [ ] Click 'Create a new bucket'
echo     [ ] Name: property-images
echo     [ ] Privacy: Public
echo     [ ] Click Create
echo.
echo.
echo  3. RUN DATABASE MIGRATION ^(1 min^)
echo     [ ] Go to SQL Editor
echo     [ ] Create new query
echo     [ ] Copy SQL from SETUP_COMPLETE.md
echo     [ ] Paste into editor
echo     [ ] Click Run
echo.
echo.
echo  4. TEST FUNCTIONALITY ^(1 min^)
echo     [ ] Open admin panel
echo     [ ] Go to Image Manager
echo     [ ] Drag and drop an image
echo     [ ] Upload succeeds
echo     [ ] Image appears in properties table
echo.
echo.
echo  5. VERIFY DISPLAY ^(1 min^)
echo     [ ] Go to Properties page
echo     [ ] Click on a property
echo     [ ] Images display correctly
echo     [ ] Amenities show in separate boxes
echo     [ ] Premium features look good
echo.
echo.
echo  ===================================
echo  Setup Time: ~5 minutes
echo  Status: Ready to begin!
echo  ===================================
echo.
echo  Press any key to continue...
pause > nul
exit /b 0
