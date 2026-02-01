# MongoDB Users Collection Setup Guide

## Overview
A **Users collection** has been added to track all user logins and activity on your Property Canvas website. This allows you to monitor:
- Who logged in and when
- Login frequency and patterns
- IP addresses and device information
- User engagement metrics
- User profiles and preferences

## Collection Structure

### User Document Schema
```json
{
  "_id": "ObjectId",
  "supabaseId": "string (unique)",
  "email": "string (lowercase)",
  "fullName": "string",
  "phone": "string (optional)",
  "accountCreatedAt": "Date",
  "lastLogin": "Date",
  "loginCount": "number",
  "loginHistory": [
    {
      "timestamp": "Date",
      "ipAddress": "string",
      "userAgent": "string",
      "deviceInfo": "string (Mobile/Tablet/Desktop)"
    }
  ],
  "role": "string (admin/customer)",
  "isActive": "boolean",
  "metadata": {
    "searchInterests": ["string"],
    "preferredLocations": ["string"],
    "totalPropertiesViewed": "number",
    "totalEnquiriesMade": "number"
  },
  "created_at": "Date",
  "updated_at": "Date"
}
```

## Available API Endpoints

### 1. Track User Login
**Endpoint:** `POST /api/users/track-login`

Automatically called after Supabase authentication. Records login event in MongoDB.

**Request Body:**
```json
{
  "supabaseId": "user-uuid-from-supabase",
  "email": "user@example.com",
  "fullName": "John Doe",
  "deviceInfo": "Desktop" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login tracked successfully",
  "user": {
    "id": "mongodb-object-id",
    "email": "user@example.com",
    "fullName": "John Doe",
    "loginCount": 5,
    "lastLogin": "2024-02-01T10:30:00Z"
  }
}
```

### 2. Get User Data
**Endpoint:** `GET /api/users/:supabaseId`

Retrieve user information from MongoDB.

**Response:**
```json
{
  "_id": "...",
  "supabaseId": "...",
  "email": "user@example.com",
  "fullName": "John Doe",
  "loginCount": 5,
  "lastLogin": "2024-02-01T10:30:00Z",
  // ... other fields
}
```

**Usage in Frontend:**
```typescript
import { getUserData } from '@/lib/userTracking';

const user = await getUserData(supabaseUser.id);
console.log(`User has logged in ${user.loginCount} times`);
```

### 3. Get All Users (Admin)
**Endpoint:** `GET /api/users`

Retrieve all registered users (login history excluded for performance).

**Response:**
```json
{
  "totalUsers": 150,
  "activeUsers": 120,
  "users": [
    {
      "_id": "...",
      "email": "user@example.com",
      "fullName": "John Doe",
      "loginCount": 5,
      "lastLogin": "2024-02-01T10:30:00Z",
      "role": "customer"
    }
    // ... more users
  ]
}
```

**Usage:**
```typescript
import { getAllUsers } from '@/lib/userTracking';

const data = await getAllUsers();
console.log(`Total users: ${data.totalUsers}`);
console.log(`Active users: ${data.activeUsers}`);
```

### 4. Get User Statistics
**Endpoint:** `GET /api/users/stats/overview`

Get overall user engagement statistics.

**Response:**
```json
{
  "totalUsers": 150,
  "activeUsers": 120,
  "activeToday": 25,
  "activeThisWeek": 85
}
```

**Usage:**
```typescript
import { getUserStats } from '@/lib/userTracking';

const stats = await getUserStats();
console.log(`Active today: ${stats.activeToday}`);
```

### 5. Get User Login History
**Endpoint:** `GET /api/users/:supabaseId/login-history`

Retrieve last 50 login attempts for a specific user.

**Response:**
```json
{
  "supabaseId": "...",
  "email": "user@example.com",
  "loginCount": 5,
  "lastLogin": "2024-02-01T10:30:00Z",
  "loginHistory": [
    {
      "timestamp": "2024-02-01T10:30:00Z",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "deviceInfo": "Desktop"
    },
    // ... more login records
  ]
}
```

**Usage:**
```typescript
import { getUserLoginHistory } from '@/lib/userTracking';

const history = await getUserLoginHistory(supabaseUser.id);
history.loginHistory.forEach(login => {
  console.log(`Logged in on ${login.timestamp} from ${login.ipAddress}`);
});
```

### 6. Track Property View
**Endpoint:** `POST /api/users/:supabaseId/track-property-view`

Increment property view count for user.

**Usage:**
```typescript
import { trackPropertyView } from '@/lib/userTracking';

// Call this when user views a property detail page
await trackPropertyView(supabaseUser.id);
```

### 7. Track Enquiry
**Endpoint:** `POST /api/users/:supabaseId/track-enquiry`

Increment enquiry count for user.

**Usage:**
```typescript
import { trackEnquiry } from '@/lib/userTracking';

// Call this after user submits an enquiry
await trackEnquiry(supabaseUser.id);
```

### 8. Update User Profile
**Endpoint:** `PUT /api/users/:supabaseId`

Update user profile information including preferences.

**Request Body:**
```json
{
  "phone": "+91-XXXXXXXXXX",
  "searchInterests": ["apartment", "villa"],
  "preferredLocations": ["Pune", "Mumbai"]
}
```

**Usage:**
```typescript
import { updateUserProfile } from '@/lib/userTracking';

await updateUserProfile(supabaseUser.id, {
  phone: "+91-9876543210",
  preferredLocations: ["Pune", "Mumbai"],
  searchInterests: ["apartment", "villa"]
});
```

### 9. Deactivate User Account
**Endpoint:** `POST /api/users/:supabaseId/deactivate`

Deactivate a user account.

**Usage:**
```typescript
// Call when user wants to delete/deactivate account
await fetch(`/api/users/${supabaseUser.id}/deactivate`, {
  method: 'POST'
});
```

## Integration with Your Application

### Automatic Login Tracking
Login tracking is **automatically integrated** in your authentication flow:

**File:** `src/contexts/AuthContext.tsx`

When a user signs in or signs up, the MongoDB user record is automatically created/updated:

```typescript
const signIn = async (email: string, password: string) => {
  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // Automatically tracks login in MongoDB
  if (!error && data?.user) {
    await trackUserLogin({
      supabaseId: data.user.id,
      email: data.user.email || email,
      fullName: data.user.user_metadata?.full_name || 'User',
    });
  }

  return { error };
};
```

### Track Property Views
Add this to your Property Detail page (`src/pages/PropertyDetail.tsx`):

```typescript
import { useAuth } from '@/contexts/AuthContext';
import { trackPropertyView } from '@/lib/userTracking';

export default function PropertyDetail() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Track that user viewed this property
      trackPropertyView(user.id);
    }
  }, [user, propertyId]);

  // ... rest of component
}
```

### Track Enquiries
Add this to your Enquiry form:

```typescript
import { trackEnquiry } from '@/lib/userTracking';

const handleEnquirySubmit = async () => {
  // ... submit enquiry to API
  
  if (user) {
    await trackEnquiry(user.id);
  }
};
```

## MongoDB Atlas Setup

If you haven't connected MongoDB Atlas yet:

1. **Create MongoDB Atlas Cluster:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Create a database user
   - Get connection string

2. **Set Environment Variable:**
   ```bash
   # In your .env file
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/property-canvas
   ```

3. **Verify Connection:**
   ```bash
   npm start
   # Check server logs for: ✅ MongoDB connected successfully
   ```

## Admin Dashboard Features

You can create an admin dashboard to visualize user data:

```typescript
import { getAllUsers, getUserStats } from '@/lib/userTracking';

export default function AdminUserDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const userStats = await getUserStats();
      const userData = await getAllUsers();
      
      setStats(userStats);
      setUsers(userData.users);
    };

    loadData();
  }, []);

  return (
    <div>
      <h2>User Statistics</h2>
      <p>Total Users: {stats?.totalUsers}</p>
      <p>Active Today: {stats?.activeToday}</p>
      
      <h2>Recent Users</h2>
      {users.map(user => (
        <div key={user._id}>
          <p>{user.email} - Logins: {user.loginCount}</p>
        </div>
      ))}
    </div>
  );
}
```

## Query Examples

### Get users who logged in today
```javascript
const today = new Date();
today.setHours(0, 0, 0, 0);

const users = await User.find({
  lastLogin: { $gte: today }
});
```

### Get most active users
```javascript
const activeUsers = await User.find()
  .sort({ loginCount: -1 })
  .limit(10);
```

### Get users from specific location
```javascript
const users = await User.find({
  'metadata.preferredLocations': 'Pune'
});
```

### Get login attempts from specific date range
```javascript
const startDate = new Date('2024-01-01');
const endDate = new Date('2024-02-01');

const users = await User.find({
  'loginHistory.timestamp': {
    $gte: startDate,
    $lte: endDate
  }
});
```

## Security Considerations

1. **Protect Admin Endpoints:** Add authentication checks to admin endpoints
2. **IP Tracking:** Monitor for suspicious login patterns
3. **Deactivation:** Soft delete users (mark as inactive) for audit trails
4. **Privacy:** Only collect necessary user data
5. **GDPR:** Implement data export/deletion endpoints if required

## Troubleshooting

### Users not appearing in MongoDB
- Check MongoDB connection string in `.env`
- Verify server is running: `npm start`
- Check server logs for MongoDB connection errors

### Login tracking not working
- Verify `trackUserLogin` is called after Supabase auth
- Check browser console for API errors
- Verify MongoDB URI is correct

### IP Address showing as localhost
- This is normal in development
- In production, ensure your reverse proxy sets `X-Forwarded-For` header

## Next Steps

1. ✅ Users collection is ready to use
2. 📊 Create an admin dashboard for user analytics
3. 📈 Track additional metrics (searches, page views, etc.)
4. 🔔 Set up alerts for suspicious activity
5. 📧 Create email notifications for admins on new user signups
