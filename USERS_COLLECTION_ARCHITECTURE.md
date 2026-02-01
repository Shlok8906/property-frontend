# MongoDB Users Collection - Architecture & Data Flow

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     PROPERTY CANVAS                             │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────┐  ┌────────────────┐
│   FRONTEND (React)   │         │  BACKEND (Node)  │  │ MONGODB ATLAS  │
│                      │         │                  │  │                │
│  src/pages/          │         │  server/         │  │  Database:     │
│  - Login.tsx         │         │  index.js        │  │  property-     │
│  - Signup.tsx        │         │                  │  │  canvas        │
│  - Properties.tsx    │         │  Collections:    │  │                │
│  - PropertyDetail    │◄───────►│  - Properties    │  │  Collections:  │
│  - MyEnquiries.tsx   │  HTTP   │  - Enquiries     │◄─┤  - properties  │
│  - Profile.tsx       │         │  - Leads         │  │  - enquiries   │
│                      │         │  - Users ✨ NEW  │  │  - leads       │
│  src/contexts/       │         │                  │  │  - users ✨ NEW│
│  AuthContext.tsx ✨  │         │  Ports: 3001     │  │  - user_roles  │
│  (auto-tracking)     │         │                  │  └────────────────┘
│                      │         │  Dependencies:   │
│  src/lib/            │         │  - mongoose      │
│  userTracking.ts ✨  │         │  - cors          │
│  (API functions)     │         │  - express       │
└──────────────────────┘         └──────────────────┘
        │                                ▲
        │                                │
        └────────────────────────────────┘
           HTTP/JSON Data
```

## 📊 Data Flow - User Login

```
User Action (Frontend)
    │
    ▼
┌─────────────────────────────────────┐
│  User clicks Login/Signup           │
│  Enters email & password            │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  AuthContext.tsx                    │
│  - signIn() or signUp() called      │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  Supabase Authentication            │
│  - Validates credentials            │
│  - Returns user object              │
└─────────────────────────────────────┘
    │
    ├─ Error? ──► Show error message ──► Stop
    │
    └─ Success?
        │
        ▼
┌─────────────────────────────────────┐
│  trackUserLogin() called            │
│  (src/lib/userTracking.ts)          │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  API Call                           │
│  POST /api/users/track-login        │
│  Body: {                            │
│    supabaseId,                      │
│    email,                           │
│    fullName,                        │
│    deviceInfo                       │
│  }                                  │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  Backend (server/index.js)          │
│  POST /api/users/track-login        │
│                                     │
│  1. Extract IP address              │
│  2. Capture user agent              │
│  3. Detect device type              │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  MongoDB Operation                  │
│  User.findOneAndUpdate()            │
│                                     │
│  If user exists:                    │
│  - Increment loginCount             │
│  - Update lastLogin                 │
│  - Add to loginHistory              │
│                                     │
│  If new user:                       │
│  - Create document                  │
│  - Set loginCount = 1               │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  Return Response to Frontend        │
│  {                                  │
│    success: true,                   │
│    user: {                          │
│      id, email, fullName,           │
│      loginCount, lastLogin          │
│    }                                │
│  }                                  │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  Frontend                           │
│  - Login complete                   │
│  - Redirect to dashboard            │
│  - Show welcome message             │
└─────────────────────────────────────┘

✅ User tracked in MongoDB!
```

## 📦 User Document Structure

```
MongoDB Document
─────────────────────────────────────

User {
  
  ┌─────────────────────────────────┐
  │ IDENTIFICATION                  │
  ├─────────────────────────────────┤
  │ _id: ObjectId                   │
  │ supabaseId: "uuid-from-supabase"│
  │ email: "user@example.com"       │
  │ fullName: "John Doe"            │
  │ phone: "+91-xxxxxxxxxx"         │
  └─────────────────────────────────┘
  
  ┌─────────────────────────────────┐
  │ LOGIN TRACKING                  │
  ├─────────────────────────────────┤
  │ loginCount: 12                  │
  │ lastLogin: 2024-02-01 15:45:00  │
  │ loginHistory: [                 │
  │   {                             │
  │     timestamp: 2024-02-01...    │
  │     ipAddress: "203.0.113.45"   │
  │     userAgent: "Mozilla/5.0..." │
  │     deviceInfo: "Desktop"       │
  │   },                            │
  │   { ... 49 more entries ... }   │
  │ ]                               │
  └─────────────────────────────────┘
  
  ┌─────────────────────────────────┐
  │ ACCOUNT INFO                    │
  ├─────────────────────────────────┤
  │ accountCreatedAt: 2024-01-15    │
  │ role: "customer"                │
  │ isActive: true                  │
  │ created_at: 2024-01-15          │
  │ updated_at: 2024-02-01          │
  └─────────────────────────────────┘
  
  ┌─────────────────────────────────┐
  │ METADATA (Engagement)           │
  ├─────────────────────────────────┤
  │ metadata: {                     │
  │   searchInterests: [            │
  │     "apartment",                │
  │     "villa"                     │
  │   ],                            │
  │   preferredLocations: [         │
  │     "Pune",                     │
  │     "Mumbai"                    │
  │   ],                            │
  │   totalPropertiesViewed: 45,    │
  │   totalEnquiriesMade: 3         │
  │ }                               │
  └─────────────────────────────────┘
}
```

## 🔄 Component Integration

```
┌─────────────────────────────────────────────────────────────┐
│                     APPLICATION FLOW                        │
└─────────────────────────────────────────────────────────────┘

User Journey:
─────────────

1. SIGNUP/LOGIN
   ├─ Frontend: src/pages/Login.tsx
   ├─ Auth: src/contexts/AuthContext.tsx
   ├─ Backend: server/index.js (POST /api/users/track-login)
   └─ DB: MongoDB users collection
   
2. VIEW PROPERTIES (Optional)
   ├─ Frontend: src/pages/PropertyDetail.tsx
   ├─ Tracking: src/lib/userTracking.ts (trackPropertyView)
   ├─ Backend: server/index.js (POST /api/users/.../track-property-view)
   └─ DB: MongoDB users (increment totalPropertiesViewed)
   
3. SUBMIT ENQUIRY (Optional)
   ├─ Frontend: Enquiry form component
   ├─ Tracking: src/lib/userTracking.ts (trackEnquiry)
   ├─ Backend: server/index.js (POST /api/users/.../track-enquiry)
   └─ DB: MongoDB users (increment totalEnquiriesMade)
   
4. ADMIN ANALYTICS (Optional)
   ├─ Frontend: src/pages/admin/UserAnalytics.tsx
   ├─ Data: src/lib/userTracking.ts (getUserStats, getAllUsers)
   ├─ Backend: server/index.js (GET /api/users, GET /api/users/stats/overview)
   └─ DB: MongoDB users (read all documents)
```

## 🔗 API Endpoint Network

```
Frontend Requests → Backend Endpoints → MongoDB Operations

LOGIN TRACKING (Automatic)
  POST /api/users/track-login
  ├─ Creates/updates user
  ├─ Increments loginCount
  └─ Records login details

USER MANAGEMENT
  GET /api/users/:supabaseId
  ├─ Fetches user data
  └─ Used for profile display

  PUT /api/users/:supabaseId
  ├─ Updates profile info
  └─ Sets preferences

LOGIN HISTORY
  GET /api/users/:supabaseId/login-history
  ├─ Gets last 50 logins
  └─ For security/audit

ENGAGEMENT TRACKING (Optional)
  POST /api/users/:supabaseId/track-property-view
  ├─ Increments view count
  └─ Tracks user interest

  POST /api/users/:supabaseId/track-enquiry
  ├─ Increments enquiry count
  └─ Tracks engagement

ADMIN FEATURES
  GET /api/users
  ├─ Lists all users
  └─ For admin dashboard

  GET /api/users/stats/overview
  ├─ User statistics
  ├─ activeUsers count
  ├─ activeToday count
  └─ activeThisWeek count

  POST /api/users/:supabaseId/deactivate
  ├─ Marks user inactive
  └─ Soft delete support
```

## 📈 Database Schema Relationship

```
MongoDB: property-canvas

Collections:
├─ properties (existing)
│   ├─ _id
│   ├─ title
│   ├─ location
│   ├─ price
│   └─ ...
│
├─ enquiries (existing)
│   ├─ _id
│   ├─ propertyId (references properties)
│   ├─ name
│   ├─ email
│   └─ ...
│
├─ leads (existing)
│   ├─ _id
│   ├─ name
│   ├─ email
│   └─ ...
│
├─ user_roles (existing - Supabase)
│   ├─ user_id (from Supabase)
│   ├─ role
│   └─ ...
│
└─ users ✨ NEW
    ├─ _id
    ├─ supabaseId (links to Supabase auth)
    ├─ email
    ├─ loginHistory
    ├─ metadata
    └─ ...

Relationships:
- users.supabaseId ← Supabase Auth users
- users.email ← enquiries.email (can join)
- users.email ← leads.email (can join)
```

## 🔐 Data Security Flow

```
Sensitive Data Handling
───────────────────────

User Input (Frontend)
  │
  ▼
Validation (Frontend)
  │
  ▼
HTTPS Transmission
  │
  ▼
Server Validation (Backend)
  │
  ▼
Extract Safe Data Only:
  ├─ supabaseId (from verified auth)
  ├─ email (from verified auth)
  ├─ IP address (server-side)
  ├─ User agent (server-side)
  └─ Timestamp (server-side)
  │
  ▼
MongoDB Storage (Encrypted at rest)
  │
  ├─ Stored securely
  ├─ Indexed for queries
  └─ Available for authorized reads

Never Stored:
  ├─ Passwords (handled by Supabase)
  ├─ Credit cards
  ├─ Sensitive personal data
  └─ API keys/secrets
```

## 📊 Analytics Capability

```
With Users Collection, You Can:

┌─────────────────────────────────────┐
│ USER ACQUISITION METRICS            │
├─────────────────────────────────────┤
│ • Total registered users            │
│ • New users per day/week/month     │
│ • User growth rate                  │
│ • Signup sources                    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ENGAGEMENT METRICS                  │
├─────────────────────────────────────┤
│ • Daily Active Users (DAU)          │
│ • Weekly Active Users (WAU)         │
│ • Monthly Active Users (MAU)        │
│ • Average session duration          │
│ • Login frequency                   │
│ • Properties viewed per user        │
│ • Enquiries per user                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ RETENTION METRICS                   │
├─────────────────────────────────────┤
│ • User churn rate                   │
│ • Days since last login             │
│ • User segments by activity         │
│ • Inactive user lists               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ BEHAVIOR PATTERNS                   │
├─────────────────────────────────────┤
│ • Login time patterns                │
│ • Device type distribution           │
│ • Geographic distribution (by IP)    │
│ • Search interests                   │
│ • Preferred locations                │
│ • User journey analysis              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ SECURITY INSIGHTS                   │
├─────────────────────────────────────┤
│ • Suspicious login patterns          │
│ • Multiple IP logins                 │
│ • Failed login attempts              │
│ • Location anomalies                 │
└─────────────────────────────────────┘
```

## 🎯 Usage Pattern Timeline

```
Time    Action                          MongoDB Effect
────────────────────────────────────────────────────────────
T0      User signs up
        │                              → Create user document
        │                                 loginCount = 1
        │                                 loginHistory = [entry]
        │
T+1     User logs in again
        │                              → Update user
        │                                 loginCount = 2
        │                                 loginHistory = [entry, ...]
        │
T+2     User views property
        │                              → Update metadata
        │                                 totalPropertiesViewed = 1
        │
T+3     User submits enquiry
        │                              → Update metadata
        │                                 totalEnquiriesMade = 1
        │
T+4     Admin checks user stats
        │                              → Read user collection
        │                                 Returns aggregate data
        │
T+30    User inactive for 30 days
        │                              → Data still stored
        │                                 Can be analyzed
        │
T+∞     User deleted/deactivated
        │                              → Mark isActive = false
        │                                 Data preserved (soft delete)
```

---

This architecture ensures:
- ✅ Automatic user tracking
- ✅ Secure data handling
- ✅ Scalable analytics
- ✅ Easy admin monitoring
- ✅ Data preservation for audits
