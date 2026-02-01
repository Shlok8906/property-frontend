# 📌 MongoDB Users Collection - Quick Start Card

## 🎯 What You Got
A complete MongoDB Users collection system to track who logged into your website.

## ⚡ TL;DR (30 seconds)
1. Check `.env` has `MONGODB_URI`
2. Run `npm start`
3. Login/signup
4. Check MongoDB for user record
5. ✅ Done!

---

## 🚀 Getting Started

### 1. Verify MongoDB URI
```bash
# In your .env file, make sure you have:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/property-canvas
```

### 2. Start Server
```bash
npm start
# Should show: ✅ MongoDB connected successfully
```

### 3. Test It
- Go to login page
- Create account or login
- Server logs should show: `✅ Login tracked successfully`
- Check MongoDB Atlas → Collections → users → new user record ✅

---

## 📊 What's Tracked

Every login automatically records:
- ✅ Email & name
- ✅ IP address
- ✅ Device type (Mobile/Desktop/Tablet)
- ✅ Login timestamp
- ✅ User agent
- ✅ Login count
- ✅ Last login date

---

## 💻 Key Code Files

| File | What It Does |
|------|--------------|
| `server/index.js` | Backend API endpoints (lines 109-599) |
| `src/contexts/AuthContext.tsx` | Auto-tracking on login |
| `src/lib/userTracking.ts` | Utility functions for tracking |

---

## 🔌 API Endpoints

**Automatic (works automatically):**
```
POST /api/users/track-login
```

**Get User Data:**
```
GET /api/users/:supabaseId
PUT /api/users/:supabaseId
GET /api/users/:supabaseId/login-history
```

**Admin:**
```
GET /api/users
GET /api/users/stats/overview
```

**Optional Tracking:**
```
POST /api/users/:supabaseId/track-property-view
POST /api/users/:supabaseId/track-enquiry
```

---

## 📚 Documentation Quick Links

| Document | Content |
|----------|---------|
| **QUICK_START** | 5-min overview |
| **QUICK_REFERENCE** | Visual diagrams |
| **SETUP_CHECKLIST** | Setup steps |
| **GUIDE** | Full API reference |
| **ARCHITECTURE** | System design |

---

## ✨ Examples

### Get User Stats (Admin Dashboard)
```typescript
import { getUserStats } from '@/lib/userTracking';

const stats = await getUserStats();
console.log(`Total Users: ${stats.totalUsers}`);
console.log(`Active Today: ${stats.activeToday}`);
```

### Track Property View (Optional)
```typescript
import { trackPropertyView } from '@/lib/userTracking';

// Add to PropertyDetail page
if (user) {
  trackPropertyView(user.id);
}
```

### Get Login History
```typescript
import { getUserLoginHistory } from '@/lib/userTracking';

const history = await getUserLoginHistory(user.id);
console.log(`Last login: ${history.lastLogin}`);
```

---

## ✅ Checklist

- [ ] MongoDB URI set in `.env`
- [ ] Server running: `npm start`
- [ ] Login/signup tested
- [ ] User appears in MongoDB
- [ ] (Optional) Add property view tracking
- [ ] (Optional) Add enquiry tracking
- [ ] (Optional) Create admin dashboard

---

## 🆘 Troubleshooting

### Users not appearing?
- Check `.env` has correct `MONGODB_URI`
- Verify server is running
- Check server logs for errors

### "MongoDB connection error"?
- Verify MongoDB Atlas cluster is running
- Check credentials in URI are correct
- Whitelist your IP in MongoDB Atlas

### API returning 500?
- Check server logs
- Ensure MongoDB is connected
- Verify endpoint name is correct

---

## 📈 What You Can Build

With this system, you can now:
- Track daily active users
- Identify most engaged users
- See user engagement metrics
- Create admin dashboards
- Monitor signup trends
- Analyze user behavior
- Build personalization features

---

## 🎯 Next Steps

1. **Immediate:** Run `npm start` and test login
2. **Today:** Verify users appear in MongoDB
3. **This Week:** (Optional) Add property view tracking
4. **This Month:** (Optional) Create admin dashboard

---

## 📝 File Locations

```
Backend:        server/index.js (lines 109-599)
Frontend:       src/contexts/AuthContext.tsx
Utilities:      src/lib/userTracking.ts (NEW)
Docs:           USERS_COLLECTION_*.md (7 files)
```

---

## 🎉 Summary

✅ Automatic login tracking enabled
✅ User data stored in MongoDB
✅ 9 API endpoints ready
✅ Complete documentation provided
✅ Zero breaking changes
✅ Production ready

**No setup required. Just run `npm start`!**

---

**Status:** ✅ Ready to Use  
**Effort Required:** Minimal (automated)  
**Time to Start:** 5 minutes  
**Breaking Changes:** None
