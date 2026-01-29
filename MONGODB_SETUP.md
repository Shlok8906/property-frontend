# MongoDB Setup Guide

## 🎯 Overview
Your Property Canvas app now uses **MongoDB** to store all property data persistently.

## 📋 Prerequisites

1. **Install MongoDB Community Server**
   - Download from: https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

2. **Verify MongoDB is running**
   ```powershell
   # Check if MongoDB service is running
   Get-Service -Name MongoDB
   
   # Or check if mongod process is running
   Get-Process mongod
   ```

## 🚀 Quick Start

### 1. Start MongoDB (if not running)

**Option A: Using Windows Service**
```powershell
# Start MongoDB service
net start MongoDB
```

**Option B: Manual Start**
```powershell
# Start mongod manually (if not installed as service)
mongod --dbpath="C:\data\db"
```

### 2. Start Backend API Server

```powershell
# Terminal 1: Start the backend API
node server/index.js
```

The API server will run on `http://localhost:3001`

### 3. Start Frontend Dev Server

```powershell
# Terminal 2: Start Vite frontend
npm run dev
```

The frontend will run on `http://localhost:8080`

## 📁 Database Info

- **Database Name**: `property-canvas`
- **Connection String**: `mongodb://localhost:27017/property-canvas`
- **Collections**:
  - `properties` - All property listings

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/properties` | Get all properties |
| GET | `/api/properties/:id` | Get single property |
| POST | `/api/properties` | Create new property |
| POST | `/api/properties/bulk` | Bulk import properties |
| PUT | `/api/properties/:id` | Update property |
| DELETE | `/api/properties/:id` | Delete property |
| GET | `/api/health` | Health check |

## 📊 Using the System

### Import Properties from CSV

1. Go to: `http://localhost:8080/admin/csv-import`
2. Upload your CSV file
3. Review AI-cleaned data
4. Click "Import" - properties are saved to MongoDB
5. View in Manage Properties

### Manage Properties

1. Go to: `http://localhost:8080/admin/properties`
2. All properties are loaded from MongoDB
3. Create, Edit, Delete - all changes persist to database

## 🛠️ Troubleshooting

### MongoDB Connection Error

**Problem**: `MongoDB connection error: connect ECONNREFUSED`

**Solution**:
```powershell
# Check if MongoDB is running
Get-Service -Name MongoDB

# If not running, start it
net start MongoDB

# Or install as Windows Service
# Run this in admin PowerShell:
mongod --install --serviceName "MongoDB" --serviceDisplayName "MongoDB" --dbpath="C:\data\db"
```

### API Server Not Starting

**Problem**: Port 3001 already in use

**Solution**:
```powershell
# Find process using port 3001
netstat -ano | findstr :3001

# Kill the process (replace <PID> with actual PID)
taskkill /F /PID <PID>

# Or change port in .env file
# Edit .env and set: PORT=3002
```

### Frontend Can't Connect to API

**Problem**: CORS errors or fetch failed

**Solution**:
1. Make sure backend is running on port 3001
2. Check `src/lib/api.ts` has correct `API_BASE_URL`
3. Verify MongoDB is running

## 🎨 Development Workflow

### Running Both Servers

**Option 1: Two Terminals**
```powershell
# Terminal 1
node server/index.js

# Terminal 2
npm run dev
```

**Option 2: Install Concurrently (Optional)**
```powershell
npm install -D concurrently

# Add to package.json scripts:
# "dev:all": "concurrently \"npm run dev\" \"node server/index.js\""

# Then run both with one command:
npm run dev:all
```

## 📦 Data Persistence

- All property data is stored in MongoDB database
- No more localStorage - data persists even after browser refresh
- Database survives server restarts
- Perfect for production deployment

## 🌐 MongoDB Atlas (Cloud Option)

Want to use cloud MongoDB instead?

1. Create free account: https://www.mongodb.com/cloud/atlas
2. Create cluster and get connection string
3. Update `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/property-canvas
   ```

## ✅ Verify Setup

Run health check:
```bash
curl http://localhost:3001/api/health
```

Should return:
```json
{"status":"OK","mongodb":true}
```

## 📝 Next Steps

1. ✅ Start MongoDB
2. ✅ Start backend server (`node server/index.js`)
3. ✅ Start frontend (`npm run dev`)
4. ✅ Import your CSV data
5. ✅ All properties now in MongoDB!

Your real estate platform now has a real database! 🎉
