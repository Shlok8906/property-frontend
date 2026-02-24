@echo off
REM Test contact message endpoint
echo Testing POST /api/contact...
curl -X POST http://localhost:3001/api/contact ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test User\",\"phone\":\"9876543210\",\"email\":\"test@example.com\",\"message\":\"This is a test\"}"

echo.
echo.
echo Testing POST /api/enquiries...
curl -X POST http://localhost:3001/api/enquiries ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test User\",\"phone\":\"9876543210\",\"email\":\"test@example.com\",\"message\":\"This is a test\",\"propertyId\":\"123\",\"propertyTitle\":\"Test Property\"}"
