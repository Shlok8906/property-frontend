# How to Create a Lead in Nivvaas

## Overview
A **Lead** is a potential customer interested in purchasing a property. The lead system tracks customer interest and manages follow-ups with prospects.

---

## 📌 Two Ways to Create a Lead

### **Method 1: User Submits Enquiry (Automatic Lead Creation)**

When a user interested in a property submits an enquiry, a lead is automatically created.

**Steps:**

1. **Navigate to a Property**
   - User goes to `/properties` page
   - Clicks on any property listing
   - Arrives at `/properties/{property-id}` (Property Detail Page)

2. **Fill Enquiry Form**
   - Scroll down to the **"Enquiry Form"** section
   - Fill in the following details:
     - **Name** - Customer's full name
     - **Email** - Customer's email address
     - **Phone** - Customer's contact number
     - **Message** - Additional details about interest (optional)

3. **Submit Enquiry**
   - Click **"Submit Enquiry"** button
   - Form data is saved to `enquiries` table
   - A **LEAD** is automatically created in the `leads` table with:
     - ✅ Customer name from enquiry
     - ✅ Phone & email details
     - ✅ Property interest recorded
     - ✅ Source: "Website Enquiry"
     - ✅ Status: "New" (waiting for admin follow-up)

4. **Admin Gets Notified**
   - Admin can see new lead in Admin Dashboard → **Leads** section
   - Lead appears with status: `new` or `pending`

---

### **Method 2: Manual Lead Creation (For Admin)**

Admins can manually create leads from the **Leads Management Page**.

**Steps:**

1. **Login as Admin**
   - Login with admin credentials
   - Admin email role verified in Supabase

2. **Go to Leads Page**
   - Navigate to: `/admin/leads`
   - Click **"+ Add Lead"** or **"New Lead"** button (if available)

3. **Fill Lead Form**
   - **Customer Name** - Full name of prospect
   - **Phone** - Contact number
   - **Email** - Email address
   - **Budget** - Expected budget (e.g., "50L - 1Cr")
   - **Interested Localities** - Areas of interest (comma-separated)
   - **Source** - How you got the lead:
     - Walk-in
     - Phone Call
     - Website
     - Referral
     - Facebook
     - Other
   - **Status** - Current stage:
     - `new` - Recently captured
     - `contacted` - We've reached out
     - `interested` - Active interest shown
     - `qualified` - Fits criteria
     - `negotiating` - In discussion
     - `won` - Purchased
     - `rejected` - Not interested
     - `unreachable` - Can't contact

4. **Submit**
   - Click **"Create Lead"** button
   - Lead is saved to database

---

## 📊 Lead Data Structure

```typescript
interface Lead {
  id: string;                          // Unique lead ID
  customer_name: string;                // Prospect's name
  phone: string;                        // Contact phone
  email: string | null;                 // Email address
  budget: string | null;                // Expected budget range
  interested_localities: string | null; // Areas of interest
  property_id: string | null;           // Related property (if from enquiry)
  source: string;                       // Lead source
  status: string;                       // Current status
  rejection_reason: string | null;      // Why rejected (if rejected)
  notes: LeadNote[] | null;            // Internal notes
  created_at: string;                   // Created timestamp
  updated_at: string;                   // Last updated timestamp
}

interface LeadNote {
  id: string;
  text: string;
  created_at: string;
}
```

---

## 🛠️ Managing Leads (Admin Only)

Once a lead is created, admins can manage it:

### **View Lead Details**
- Go to `/admin/leads`
- Click on a lead row to see full details
- View contact info, interest areas, budget

### **Add Internal Notes**
- Click **"📝"** (note icon) next to lead
- Add private notes for team
- Notes include timestamp and creator info
- Visible only to admin team

### **Update Lead Status**
- Click **"Update"** button next to lead
- Change status to any of the valid statuses
- If rejecting: select rejection reason:
  - Budget too low
  - Not interested
  - Unresponsive
  - Purchased elsewhere
  - Other

### **Contact Lead**
- Click **"💬"** (WhatsApp icon) to contact via WhatsApp
- Pre-filled with project name message

### **Search & Filter**
- **Search box**: Search by name, phone, or email
- **Status filter**: Filter by lead status (New, Contacted, Won, etc.)

---

## 📱 Database Tables

### **leads** table
```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  budget TEXT,
  interested_localities TEXT,
  property_id TEXT,
  source TEXT,
  status TEXT,
  rejection_reason TEXT,
  notes JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### **enquiries** table
```sql
CREATE TABLE enquiries (
  id UUID PRIMARY KEY,
  project_uuid TEXT,
  user_id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  message TEXT,
  created_at TIMESTAMP
);
```

---

## 🔄 Lead Workflow

```
Customer Visits Property
         ↓
Fills Enquiry Form
         ↓
Submits Form
         ↓
✅ LEAD CREATED (Status: NEW)
         ↓
Admin Reviews in Dashboard
         ↓
Admin Contacts Customer
         ↓
Update Status: CONTACTED
         ↓
    ↙──────╲
  INTERESTED  REJECTED
    ↓          ↓
  QUALIFIED   [CLOSED]
    ↓
NEGOTIATING
    ↓
WON (PURCHASED) ✅
```

---

## 💡 Best Practices

1. **Quick Response**
   - Follow up with new leads within 24 hours
   - Use WhatsApp for instant communication

2. **Keep Notes Updated**
   - Add conversation details
   - Track customer preferences
   - Note any objections or requirements

3. **Regular Status Updates**
   - Update status as lead progresses
   - Helps with pipeline tracking
   - Shows project momentum

4. **Data Quality**
   - Ensure correct phone format
   - Verify email addresses
   - Complete budget information for better qualification

5. **No Spam**
   - Only reject if genuinely uninterested
   - Track rejection reason for analysis

---

## 🔒 Permissions

- **Users**: Can submit enquiries (creates leads automatically)
- **Admins**: Can view, create, edit, and manage all leads
- **Guests**: Cannot create leads (must be logged in to submit enquiry)

---

## ❓ Troubleshooting

### Enquiry Not Submitting
- Check internet connection
- Ensure all required fields filled
- Check browser console for errors

### Lead Not Appearing
- Refresh the leads page
- Check user login status
- Verify Supabase connection

### Can't Update Lead Status
- Ensure logged in as admin
- Check database permissions
- Verify lead exists

---

## 📞 Example Lead Creation Flow

**Scenario: Customer interested in Pyramids Properties**

```
1. Customer visits: /properties/pyramid-123
2. Sees property details
3. Scrolls to "Enquiry Form" section
4. Enters:
   - Name: "Rajesh Kumar"
   - Phone: "9876543210"
   - Email: "rajesh@email.com"
   - Message: "Interested in 3BHK, need details"
5. Clicks "Submit Enquiry"
6. ✅ LEAD CREATED with:
   - Name: Rajesh Kumar
   - Phone: 9876543210
   - Email: rajesh@email.com
   - Source: Website Enquiry
   - Status: New
   - Property: Pyramids Properties
7. Admin sees notification
8. Admin contacts Rajesh via WhatsApp
9. Updates status to "Contacted"
10. Adds notes: "Customer interested in 3BHK layout options"
11. ... continues until lead is won or rejected
```

---

**Happy selling! 🏠✨**
