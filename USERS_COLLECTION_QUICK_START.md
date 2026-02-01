# Users Collection - Quick Start Guide

## What Was Added?

A **MongoDB Users collection** to track who logged in to your Property Canvas website.

## Key Features

✅ **Automatic Login Tracking** - Records every login automatically  
✅ **Device Detection** - Captures device type (Mobile/Desktop/Tablet)  
✅ **IP Logging** - Stores IP address of each login  
✅ **Login History** - Last 50 logins per user  
✅ **User Engagement Metrics** - Properties viewed, enquiries made  
✅ **User Profiles** - Phone, preferences, locations  
✅ **Admin Dashboard Ready** - APIs for user analytics  

## What's New in Your Code?

### 1. Backend (Server)
**File:** `server/index.js`

- Added `User` schema and model
- 9 new API endpoints for user management
- Automatic tracking of login events

### 2. Frontend
**File:** `src/lib/userTracking.ts` (NEW)

Utility functions to interact with user tracking API:
```typescript
trackUserLogin()           // Track login (automatic)
getUserData()              // Get user info
trackPropertyView()        // Track when user views property
trackEnquiry()            // Track when user submits enquiry
updateUserProfile()        // Update user preferences
getUserLoginHistory()      // Get last 50 logins
getAllUsers()             // Get all users (admin)
getUserStats()            // Get user statistics (admin)
```

### 3. Authentication
**File:** `src/contexts/AuthContext.tsx`

Updated `signIn()` and `signUp()` to automatically track users in MongoDB.

## User Data Structure

```
User {
  supabaseId        - ID from Supabase auth
  email             - User email
  fullName          - User's name
  phone             - Phone number (optional)
  lastLogin         - Date of last login
  loginCount        - Total number of logins
  loginHistory      - Array of last 50 logins with:
                      - timestamp
                      - ipAddress
                      - userAgent
                      - deviceInfo (Mobile/Desktop/Tablet)
  role              - admin or customer
  isActive          - Account status
  metadata          - User preferences and stats:
                      - searchInterests
                      - preferredLocations
                      - totalPropertiesViewed
                      - totalEnquiriesMade
}
```

## API Endpoints

### For Regular Users
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/users/track-login` | POST | Track login (automatic) |
| `/api/users/:supabaseId` | GET | Get user data |
| `/api/users/:supabaseId` | PUT | Update user profile |
| `/api/users/:supabaseId/login-history` | GET | Get login history |
| `/api/users/:supabaseId/track-property-view` | POST | Track property view |
| `/api/users/:supabaseId/track-enquiry` | POST | Track enquiry |

### For Admin
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/users` | GET | Get all users |
| `/api/users/stats/overview` | GET | Get user statistics |
| `/api/users/:supabaseId/deactivate` | POST | Deactivate user |

## How to Use in Your Pages

### 1. Track Property Views
In `PropertyDetail.tsx`:
```typescript
import { trackPropertyView } from '@/lib/userTracking';
import { useAuth } from '@/contexts/AuthContext';

export default function PropertyDetail() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      trackPropertyView(user.id);
    }
  }, [user, propertyId]);
  
  // ...
}
```

### 2. Track Enquiries
In your Enquiry form:
```typescript
import { trackEnquiry } from '@/lib/userTracking';
import { useAuth } from '@/contexts/AuthContext';

const handleSubmit = async () => {
  // ... submit enquiry
  if (user) {
    await trackEnquiry(user.id);
  }
};
```

### 3. Get User Stats (Admin)
```typescript
import { getUserStats, getAllUsers } from '@/lib/userTracking';

const stats = await getUserStats();
console.log(`Total users: ${stats.totalUsers}`);
console.log(`Active today: ${stats.activeToday}`);

const users = await getAllUsers();
console.log(users.users); // Array of all users
```

## What Happens Automatically?

When a user **logs in**:
1. Supabase authenticates them
2. MongoDB users collection is updated:
   - New user record created (if first login)
   - loginCount incremented
   - lastLogin updated
   - IP address and device info recorded
   - Entry added to loginHistory array

## Example User Document

```json
{
  "_id": "ObjectId('507f1f77bcf86cd799439011')",
  "supabaseId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "email": "john@example.com",
  "fullName": "John Doe",
  "phone": "+91-9876543210",
  "accountCreatedAt": "2024-01-15T10:30:00Z",
  "lastLogin": "2024-02-01T15:45:00Z",
  "loginCount": 12,
  "loginHistory": [
    {
      "timestamp": "2024-02-01T15:45:00Z",
      "ipAddress": "203.0.113.45",
      "userAgent": "Mozilla/5.0...",
      "deviceInfo": "Desktop"
    },
    {
      "timestamp": "2024-01-31T10:20:00Z",
      "ipAddress": "203.0.113.45",
      "userAgent": "Mozilla/5.0...",
      "deviceInfo": "Mobile"
    }
  ],
  "role": "customer",
  "isActive": true,
  "metadata": {
    "searchInterests": ["apartment", "villa"],
    "preferredLocations": ["Pune", "Mumbai"],
    "totalPropertiesViewed": 45,
    "totalEnquiriesMade": 3
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-02-01T15:45:00Z"
}
```

## Next Steps

1. **Start your server:** `npm start`
2. **Test login:** Try logging in - user should appear in MongoDB
3. **Check MongoDB:** Go to MongoDB Atlas → Collections → Users
4. **Add to your pages:**
   - Track property views in PropertyDetail page
   - Track enquiries when user submits form
   - Show user stats in admin dashboard

## File Locations

- **Backend API:** `server/index.js`
- **User Tracking Utilities:** `src/lib/userTracking.ts`
- **Auth Context:** `src/contexts/AuthContext.tsx`
- **Documentation:** `USERS_COLLECTION_GUIDE.md`

## Testing

### Test Login Tracking
1. Start server: `npm start`
2. Run frontend: `npm run dev`
3. Go to login page
4. Login with test account
5. Open MongoDB Atlas → Collections → Database → Users collection
6. New user record should appear

### View User Data via API
```bash
# Get specific user
curl http://localhost:3001/api/users/{supabaseId}

# Get all users (admin)
curl http://localhost:3001/api/users

# Get user stats
curl http://localhost:3001/api/users/stats/overview

# Get login history
curl http://localhost:3001/api/users/{supabaseId}/login-history
```

## Troubleshooting

**Q: Users not appearing in MongoDB?**
A: Check `.env` file has correct `MONGODB_URI`

**Q: Login tracking not working?**
A: Check server logs - should see "Login tracked successfully"

**Q: Getting API errors?**
A: Verify server is running and MongoDB is connected

---

**For detailed API documentation:** See `USERS_COLLECTION_GUIDE.md`
