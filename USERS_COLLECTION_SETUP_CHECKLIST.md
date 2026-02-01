# MongoDB Users Collection - Setup Checklist

## ✅ What's Already Done

- [x] User Schema created in MongoDB
- [x] 9 API endpoints added to backend
- [x] User tracking utility functions created
- [x] Authentication context updated to track logins
- [x] Automatic login recording enabled
- [x] Complete documentation provided

## 📋 Setup Steps

### Step 1: Verify MongoDB Connection
- [ ] Check your `.env` file has `MONGODB_URI` set correctly
- [ ] Format: `mongodb+srv://username:password@cluster.mongodb.net/property-canvas`
- [ ] If using MongoDB Atlas:
  - [ ] Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
  - [ ] Copy connection string from "Connect" button
  - [ ] Replace `<username>` and `<password>` with your credentials

### Step 2: Start Backend
- [ ] Open terminal in project root
- [ ] Run: `npm start`
- [ ] Verify output shows: `✅ MongoDB connected successfully`
- [ ] If connection fails:
  - [ ] Check MongoDB URI in `.env`
  - [ ] Verify MongoDB Atlas cluster is running
  - [ ] Whitelist your IP in MongoDB Atlas

### Step 3: Test Login Tracking
- [ ] Open frontend: `npm run dev` (in another terminal)
- [ ] Go to login page
- [ ] Create account or login
- [ ] Check server logs for: `✅ Login tracked successfully`
- [ ] Go to MongoDB Atlas → Collections → Your Database → users
- [ ] Verify new user record appears

### Step 4: Integrate Tracking (Optional)

#### Track Property Views
- [ ] Open `src/pages/PropertyDetail.tsx`
- [ ] Add this import at top:
  ```typescript
  import { trackPropertyView } from '@/lib/userTracking';
  ```
- [ ] Add in useEffect after property loads:
  ```typescript
  if (user && propertyId) {
    trackPropertyView(user.id);
  }
  ```

#### Track Enquiries
- [ ] Find your enquiry submission code
- [ ] Add this import:
  ```typescript
  import { trackEnquiry } from '@/lib/userTracking';
  ```
- [ ] After successful enquiry submission add:
  ```typescript
  if (user) {
    await trackEnquiry(user.id);
  }
  ```

### Step 5: Create Admin Dashboard (Optional)
- [ ] Create new file: `src/pages/admin/UserAnalytics.tsx`
- [ ] Use these functions:
  ```typescript
  import { getUserStats, getAllUsers } from '@/lib/userTracking';
  
  const stats = await getUserStats();
  const users = await getAllUsers();
  ```
- [ ] Display:
  - Total users
  - Active users today
  - Recent logins
  - User engagement metrics

## 🔍 Verification Checklist

### Verify Backend is Working
```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Should return: {"status":"OK","mongodb":1}
```

### Verify User Recording
```bash
# After login, check if user was recorded
curl http://localhost:3001/api/users/stats/overview

# Should return something like:
# {
#   "totalUsers": 1,
#   "activeUsers": 1,
#   "activeToday": 1,
#   "activeThisWeek": 1
# }
```

### Check MongoDB Directly
1. Go to MongoDB Atlas
2. Navigate to: Database → Collections → your-database
3. Look for "users" collection
4. Click "users" to see documents
5. Should see entries like:
   - email: user@example.com
   - supabaseId: (uuid)
   - loginCount: 1+
   - lastLogin: recent timestamp

## 📊 Available Features

### Basic User Tracking
- [x] Record every login
- [x] Store IP address
- [x] Detect device type
- [x] Keep login history (last 50 logins)
- [x] Track account creation date

### User Engagement
- [x] Count property views
- [x] Count enquiries made
- [x] Track search interests
- [x] Store preferred locations

### Admin Features
- [x] View all users
- [x] Get user statistics
- [x] See login history per user
- [x] Update user information
- [x] Deactivate user accounts

## 🚀 Next Steps After Setup

1. **Monitor in MongoDB Atlas:**
   - Check users collection daily
   - Look for patterns in login times
   - Identify most active users

2. **Create Admin Dashboard:**
   - Show total users
   - Display active users today
   - Show recent logins
   - Display user engagement metrics

3. **Add More Tracking:**
   - Track search queries
   - Track time spent on properties
   - Track user source (direct/google/etc)

4. **Set Up Alerts (Optional):**
   - Alert on suspicious login patterns
   - Notify admin of new signups
   - Track inactive users

5. **Create Reports:**
   - Weekly user activity report
   - Monthly user growth
   - User engagement metrics
   - Popular properties by users

## 🔐 Security Notes

- ✅ IPs are logged (useful for fraud detection)
- ✅ User agents recorded (detect bot logins)
- ✅ Device info captured (detect unusual patterns)
- ⚠️ TODO: Add admin authentication to sensitive endpoints
- ⚠️ TODO: Implement rate limiting for API endpoints
- ⚠️ TODO: Add data privacy controls for GDPR compliance

## 📚 Documentation Files

- **Quick Start:** `USERS_COLLECTION_QUICK_START.md`
- **Complete Guide:** `USERS_COLLECTION_GUIDE.md`
- **This Checklist:** `USERS_COLLECTION_SETUP_CHECKLIST.md`

## ❓ Common Issues

### Issue: "MongoDB connected but no users appearing"
**Solution:**
1. Check if tracking call is happening (look for "Login tracked successfully" in logs)
2. Verify API is being called: `http://localhost:3001/api/users/track-login`
3. Check `.env` file has `MONGODB_URI`

### Issue: "API returns 500 error"
**Solution:**
1. Check server logs for error details
2. Verify MongoDB connection string
3. Ensure MongoDB cluster is running and accessible

### Issue: "Localhost shows in loginHistory instead of real IP"
**Solution:**
1. This is normal in development
2. In production, the real IP will be captured
3. Make sure your server's reverse proxy sets `X-Forwarded-For` header

### Issue: "Can't connect to MongoDB Atlas"
**Solution:**
1. Verify connection string in `.env`
2. Check MongoDB Atlas dashboard:
   - Is cluster running?
   - Is IP whitelist configured?
   - Are credentials correct?
3. Test connection string locally first

## 📞 Support

If you encounter any issues:

1. Check the `USERS_COLLECTION_GUIDE.md` for detailed API documentation
2. Review server logs for error messages
3. Verify MongoDB connection and credentials
4. Check that all files were created correctly:
   - `server/index.js` (updated with User schema and endpoints)
   - `src/lib/userTracking.ts` (new file)
   - `src/contexts/AuthContext.tsx` (updated)

## ✨ You're All Set!

Once you've completed the setup:
- ✅ Users collection is live
- ✅ Logins are being tracked automatically
- ✅ User data is stored in MongoDB
- ✅ APIs are ready for integration

Start using the tracking functions in your pages to enhance user insights!

---

**Last Updated:** February 1, 2024
**Status:** Ready to Use ✅
