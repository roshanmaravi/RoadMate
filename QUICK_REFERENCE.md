# 🚀 RoadMate Quick Reference

## 📱 Screens Overview

### 1. **Login Screen** (`/login`)
- Mobile number input with +91 prefix
- Password with show/hide toggle
- Remember Me checkbox
- Navigate to Sign Up

### 2. **Registration Screen** (`/signup`)
- Full name, mobile, password fields
- Location automatically detected
- Terms & Privacy checkbox
- Navigate to Sign In

### 3. **Home Screen** (`/(tabs)`)
- Welcome section with user name
- Quick action cards
- Stats display
- Logout button

### 4. **My Rides** (`/(tabs)/myRide`)
- **Booked Rides Tab**: View rides you've booked
- **Posted Rides Tab**: Manage rides you've posted

---

## 🎨 UI Components

### Colors
```typescript
Primary: #FF6B6B    // Red (buttons, icons)
Success: #4CAF50    // Green (accept, call)
Warning: #FF9800    // Orange (pending)
Error: #F44336      // Red (cancel, reject)
Background: #F5F7FA // Light gray
White: #FFFFFF      // Cards, backgrounds
```

### Icons (Ionicons)
- Home: `home` / `home-outline`
- My Rides: `car-sport` / `car-sport-outline`
- Profile: `person` / `person-outline`
- Location: `location` / `location-outline`
- Call: `call`
- Back: `arrow-back`

---

## 🔌 API Endpoints

### Base URL
```
https://domainapi.shop/g/backend
```

### Auth Endpoints
```typescript
POST /login.php
POST /register.php
```

### Ride Endpoints
```typescript
GET  /ride/get-my-bookings.php?userId={userId}
GET  /ride/get-my-posted-rides.php?userId={userId}
POST /ride/update-booking-status.php
```

---

## 📦 Key Dependencies

```json
{
  "@react-navigation/native": "^6.x",
  "@react-navigation/bottom-tabs": "^6.x",
  "expo-router": "~3.x",
  "expo-location": "~16.x",
  "@react-native-async-storage/async-storage": "1.x",
  "@expo/vector-icons": "^14.x",
  "react-native": "0.74.x"
}
```

---

## 🗂️ Folder Structure

```
app/
├── (tabs)/              # Tab navigation
│   ├── myRide/         # My Rides feature
│   │   ├── index.tsx   # Tab switcher
│   │   ├── getRides.tsx
│   │   └── givenRides.tsx
│   ├── index.tsx       # Home
│   ├── two.tsx         # Profile
│   └── _layout.tsx     # Tabs config
├── login.tsx           # Login screen
├── signup.tsx          # Register screen
├── index.tsx           # Entry point
└── _layout.tsx         # Root layout

contexts/
└── AuthContext.tsx     # Auth state

services/
└── AuthService.ts      # Auth API

utils/
└── auth.ts            # Utilities
```

---

## 🔐 Authentication Flow

```
1. App loads → index.tsx
2. Check if logged in
   ├─→ Yes → /(tabs) [Home]
   └─→ No  → /login
3. From login:
   ├─→ Login successful → /(tabs)
   └─→ Sign Up → /signup → /(tabs)
```

---

## 📝 Data Models

### User Data
```typescript
interface UserData {
  userId: string;
  name: string;
  mobile: string;
  location: string;
  city?: string;
}
```

### Booking
```typescript
interface Booking {
  bookingId: number;
  rideId: number;
  driverId: string;
  driverName: string;
  driverPhone: string;
  from: string;
  to: string;
  journeyDate: string;
  vehicleType: "bike" | "car" | "auto";
  seatsBooked: number;
  bookingStatus: "pending" | "confirmed" | "cancelled";
  bookedAt: string;
}
```

### Posted Ride
```typescript
interface PostedRide {
  id: number;
  from: string;
  to: string;
  journeyDate: string;
  vehicleType: "bike" | "car" | "auto";
  totalSeats: number;
  availableSeats: number;
  bookings: Booking[];
  bookingCount: number;
}
```

---

## 🛠️ Common Tasks

### Add a new tab
```typescript
// In app/(tabs)/_layout.tsx
<Tabs.Screen
  name="newTab"
  options={{
    title: 'New Tab',
    tabBarIcon: ({ color, focused }) => (
      <Ionicons name="star" size={24} color={color} />
    ),
  }}
/>
```

### Add a new screen
```typescript
// Create file: app/newScreen.tsx
export default function NewScreen() {
  return <View>...</View>;
}

// Update app/_layout.tsx
<Stack.Screen name="newScreen" options={{ ... }} />
```

### Call API
```typescript
import { ApiHelper } from '@/utils/auth';

const response = await ApiHelper.post(endpoint, data);
const response = await ApiHelper.get(endpoint);
```

### Get user data
```typescript
import { useAuth } from '@/contexts/AuthContext';

const { userData, isLoggedIn } = useAuth();
```

---

## 🐛 Troubleshooting

### Issue: Can't see login screen
**Fix**: Clear app data and restart
```bash
npm start -- --clear
```

### Issue: API not working
**Fix**: Check network, verify endpoint URLs

### Issue: Location not working
**Fix**: Grant location permissions in device settings

### Issue: AsyncStorage error
**Fix**: Install package
```bash
npx expo install @react-native-async-storage/async-storage
```

---

## ✅ Testing Steps

1. **Test Login**
   - Open app → Should show login
   - Enter credentials → Click Login
   - Should redirect to Home

2. **Test Registration**
   - Click Sign Up → Fill form
   - Accept terms → Click Sign Up
   - Should redirect to Home

3. **Test My Rides**
   - Go to My Rides tab
   - Check Booked Rides
   - Check Posted Rides
   - Test pull to refresh

4. **Test Logout**
   - Click logout on Home
   - Should go back to Login

---

## 🎯 Quick Commands

```bash
# Start dev server
npm start

# Clear cache
npm start -- --clear

# Build for Android
npm run android

# Build for iOS
npm run ios

# Build for Web
npm run web

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

---

## 📞 Contact Actions

### Call Driver/Passenger
```typescript
import { Linking } from 'react-native';

const callDriver = (phone: string) => {
  Linking.openURL(`tel:${phone}`);
};
```

---

## 🎨 Custom Styling Tips

### Card Shadow
```typescript
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.1,
shadowRadius: 4,
elevation: 3,
```

### Button Style
```typescript
backgroundColor: '#FF6B6B',
borderRadius: 25,
paddingVertical: 15,
elevation: 3,
```

### Input Style
```typescript
borderWidth: 1,
borderColor: '#E4E7EB',
borderRadius: 10,
paddingHorizontal: 12,
height: 50,
```

---

**Last Updated**: Now  
**Version**: 1.0.0  
**Status**: Complete ✅
