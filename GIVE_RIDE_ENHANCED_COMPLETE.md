# 🚗 RoadMate - Give Ride with Checkboxes & Date/Time Pickers

## ✅ New Features Added

### **1. Checkboxes:**
- ✅ **Available Anywhere** - Flexible route (hides from/to inputs)
- ✅ **Available All Day** - Flexible time (hides date/time pickers)
- ✅ **Women Only Booking** - Only women can book

### **2. Date & Time Pickers:**
- ✅ Native date picker (calendar view)
- ✅ Native time picker (clock view)
- ✅ Proper formatting (YYYY-MM-DD, HH:MM)
- ✅ Minimum date = today

---

## 📦 Required Installation

You need to install the date/time picker package:

```bash
cd D:\claude_projects\RoadMate\RoadMate

# Install DateTimePicker
npx expo install @react-native-community/datetimepicker

# Restart the app
npm start
```

---

## 🎨 Form Layout

```
Give Ride Form:
├─ Route Details
│  ├─ ☑ Available Anywhere (Flexible Route)
│  ├─ Pickup Location (hidden if anywhere)
│  └─ Drop Location (hidden if anywhere)
│
├─ Journey Schedule
│  ├─ ☑ Available All Day (Flexible Time)
│  ├─ Date Picker (hidden if all day)
│  └─ Time Picker (hidden if all day)
│
├─ Vehicle Type (Bike/Auto/Car)
│
├─ Pricing
│  ├─ Total Seats (auto)
│  └─ Price per Seat
│
├─ Preferences
│  └─ ☑ Women Only Booking
│
└─ Additional Details (optional)
```

---

## 📋 Checkbox Behaviors

### **1. Available Anywhere**
**When CHECKED:**
- Hides "Pickup Location" input
- Hides "Drop Location" input
- Sends `from: "Anywhere"` and `to: "Anywhere"` to API
- Sets `anywhereAvailable: 1`

**When UNCHECKED:**
- Shows location inputs
- Validates that from/to are filled
- Sends actual locations to API
- Sets `anywhereAvailable: 0`

### **2. Available All Day**
**When CHECKED:**
- Hides date picker
- Hides time picker
- Sends `journeyDate: null` and `journeyTime: null` to API
- Sets `allDayAvailable: 1`

**When UNCHECKED:**
- Shows date picker (defaults to today)
- Shows time picker (defaults to current time)
- Sends selected date/time to API
- Sets `allDayAvailable: 0`

### **3. Women Only Booking**
**When CHECKED:**
- Visual indicator on ride card
- Only women passengers can book
- Sets `womenBooking: 1`

**When UNCHECKED:**
- Anyone can book
- Sets `womenBooking: 0`

---

## 📅 Date & Time Pickers

### **Date Picker:**
```typescript
// When user taps date field
→ Opens native calendar picker
→ User selects date
→ Formats as: YYYY-MM-DD (e.g., 2024-12-25)
→ Minimum date: Today
```

### **Time Picker:**
```typescript
// When user taps time field
→ Opens native clock picker
→ User selects time
→ Formats as: HH:MM (e.g., 14:30)
→ 24-hour format
```

### **Platforms:**
- **Android:** Shows dialog picker
- **iOS:** Shows spinner/wheel picker

---

## 🎯 API Payload Examples

### **Example 1: Regular Ride**
```json
{
  "userId": "GHAR_12345",
  "from": "Indore",
  "to": "Bhopal",
  "journeyDate": "2024-12-25",
  "journeyTime": "09:30",
  "vehicleType": "car",
  "totalSeats": 4,
  "pricePerSeat": 300,
  "additionalDetails": "AC available",
  "allDayAvailable": 0,
  "anywhereAvailable": 0,
  "womenBooking": 0
}
```

### **Example 2: Anywhere, All Day Ride**
```json
{
  "userId": "GHAR_12345",
  "from": "Anywhere",
  "to": "Anywhere",
  "journeyDate": null,
  "journeyTime": null,
  "vehicleType": "car",
  "totalSeats": 4,
  "pricePerSeat": 250,
  "additionalDetails": "Flexible timing and route",
  "allDayAvailable": 1,
  "anywhereAvailable": 1,
  "womenBooking": 0
}
```

### **Example 3: Women Only Ride**
```json
{
  "userId": "GHAR_12345",
  "from": "Indore",
  "to": "Ujjain",
  "journeyDate": "2024-12-26",
  "journeyTime": "07:00",
  "vehicleType": "car",
  "totalSeats": 4,
  "pricePerSeat": 200,
  "additionalDetails": "Safe ride for women",
  "allDayAvailable": 0,
  "anywhereAvailable": 0,
  "womenBooking": 1
}
```

---

## 🔧 Updated PHP API

You need to update your `post-ride.php` to handle the `journeyTime` field:

### **Add to Database:**
```sql
-- Add journey_time column
ALTER TABLE posted_rides 
ADD COLUMN journey_time TIME NULL AFTER journey_date;
```

### **Update PHP Code:**
```php
<?php
require_once '../config.php';

// Set CORS headers
setCorsHeaders();

// Get POST data
$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields (note: from/to not required if anywhereAvailable)
$requiredFields = ['userId', 'vehicleType', 'totalSeats', 'pricePerSeat'];
foreach ($requiredFields as $field) {
    if (empty($data[$field])) {
        echo json_encode([
            'success' => false,
            'message' => "Field $field is required"
        ]);
        exit;
    }
}

// Get database connection
$conn = getConnection();

try {
    // Prepare data
    $userId = $data['userId'];
    $fromLocation = $data['from'];
    $toLocation = $data['to'];
    $journeyDate = isset($data['journeyDate']) ? $data['journeyDate'] : null;
    $journeyTime = isset($data['journeyTime']) ? $data['journeyTime'] : null;
    $allDayAvailable = isset($data['allDayAvailable']) ? (int)$data['allDayAvailable'] : 0;
    $anywhereAvailable = isset($data['anywhereAvailable']) ? (int)$data['anywhereAvailable'] : 0;
    $vehicleType = $data['vehicleType'];
    $totalSeats = (int)$data['totalSeats'];
    $pricePerSeat = (float)$data['pricePerSeat'];
    $womenBooking = isset($data['womenBooking']) ? (int)$data['womenBooking'] : 0;
    $additionalDetails = isset($data['additionalDetails']) ? $data['additionalDetails'] : null;
    
    // If anywhere available is true, set from/to to generic values
    if ($anywhereAvailable) {
        $fromLocation = 'Anywhere';
        $toLocation = 'Anywhere';
    }
    
    // If all day available is true, set journey date and time to null
    if ($allDayAvailable) {
        $journeyDate = null;
        $journeyTime = null;
    }
    
    // Insert ride data
    $sql = "INSERT INTO posted_rides 
            (user_id, from_location, to_location, journey_date, journey_time, all_day_available, 
             anywhere_available, vehicle_type, total_seats, available_seats, price_per_seat,
             women_booking, additional_details, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        "sssssiiiiidis",
        $userId,
        $fromLocation,
        $toLocation,
        $journeyDate,
        $journeyTime,
        $allDayAvailable,
        $anywhereAvailable,
        $vehicleType,
        $totalSeats,
        $totalSeats, // available_seats = total_seats initially
        $pricePerSeat,
        $womenBooking,
        $additionalDetails
    );
    
    if ($stmt->execute()) {
        $rideId = $conn->insert_id;
        
        echo json_encode([
            'success' => true,
            'message' => 'Ride posted successfully',
            'rideId' => $rideId
        ]);
    } else {
        throw new Exception('Failed to post ride: ' . $stmt->error);
    }
    
    $stmt->close();
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} finally {
    $conn->close();
}
?>
```

---

## 🎨 UI Components

### **Checkbox Style:**
```
┌────────────────────────────────┐
│ ☑ Available Anywhere           │
│   (Flexible Route)             │
└────────────────────────────────┘
```

### **Date Picker:**
```
┌───────────────┐
│ Date *        │
│ ┌───────────┐ │
│ │📅 2024-12-25│ │ ← Tap to open picker
│ └───────────┘ │
└───────────────┘
```

### **Time Picker:**
```
┌───────────────┐
│ Time *        │
│ ┌───────────┐ │
│ │🕐 14:30   │ │ ← Tap to open picker
│ └───────────┘ │
└───────────────┘
```

---

## 🧪 Testing Scenarios

### **Test 1: Regular Ride**
1. Don't check any checkboxes
2. Fill: From, To
3. Select: Date (tomorrow), Time (9:00 AM)
4. Select: Car
5. Enter: Price ₹300
6. Post Ride
✅ Should save with specific date/time/location

### **Test 2: Flexible Ride**
1. ✅ Check "Available Anywhere"
2. ✅ Check "Available All Day"
3. From/To inputs should be hidden
4. Date/Time pickers should be hidden
5. Select: Auto
6. Enter: Price ₹200
7. Post Ride
✅ Should save as Anywhere/All Day

### **Test 3: Women Only Ride**
1. Fill: From, To, Date, Time
2. Select: Car
3. Enter: Price ₹250
4. ✅ Check "Women Only Booking"
5. Post Ride
✅ Should save with womenBooking = 1

### **Test 4: Date/Time Pickers**
1. Tap on Date field
✅ Should open calendar picker
2. Select a future date
✅ Should update and format correctly
3. Tap on Time field
✅ Should open clock picker
4. Select a time
✅ Should update and format correctly

---

## 📊 Database Schema Update

```sql
-- Complete schema for posted_rides table

CREATE TABLE IF NOT EXISTS posted_rides (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  from_location VARCHAR(255) NOT NULL,
  to_location VARCHAR(255) NOT NULL,
  journey_date DATE NULL,
  journey_time TIME NULL,
  all_day_available TINYINT(1) DEFAULT 0,
  anywhere_available TINYINT(1) DEFAULT 0,
  vehicle_type VARCHAR(20) NOT NULL,
  total_seats INT NOT NULL,
  available_seats INT NOT NULL,
  price_per_seat DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  women_booking TINYINT(1) DEFAULT 0,
  additional_details TEXT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## ✅ Installation Steps

1. **Install DateTimePicker:**
```bash
cd D:\claude_projects\RoadMate\RoadMate
npx expo install @react-native-community/datetimepicker
```

2. **Add journey_time column:**
```sql
ALTER TABLE posted_rides 
ADD COLUMN journey_time TIME NULL AFTER journey_date;
```

3. **Update PHP API** (use code above)

4. **Restart App:**
```bash
npm start
```

---

## 🎉 Features Summary

**Checkboxes:**
✅ Available Anywhere (flexible route)  
✅ Available All Day (flexible time)  
✅ Women Only Booking  

**Date & Time:**
✅ Native date picker (calendar)  
✅ Native time picker (clock)  
✅ Proper formatting  
✅ Minimum date validation  

**Conditional UI:**
✅ Hides inputs when checkboxes are checked  
✅ Shows/hides based on selections  
✅ Smart validation  

**API Integration:**
✅ Sends checkbox states (0 or 1)  
✅ Sends formatted date/time  
✅ Handles null values for flexible options  

---

**Version**: 5.0.0  
**Last Updated**: Now!  
**Status**: Checkboxes & Date/Time Pickers Complete ✅

**Ready to post flexible rides!** 🚗✨
