# 🚛 Transport Management App

Zero Cost | Offline-First | React Native (Expo) Transport Management Application for Indian Transport Operators

## Features

### Phase 1 — Foundation ✅
- ✅ SQLite Database with 14 core tables
- ✅ Vehicle Management (Add/Edit/Delete)
- ✅ Driver Management (Add/Edit/Delete)
- ✅ Zustand State Management
- ✅ Offline-First Local Notifications
- ✅ Helper Utilities (30+ functions)
- ✅ Professional UI Components

### Upcoming Phases
- 📦 Phase 2: Trip & LR Management
- 💰 Phase 3: Expense & Finance
- 👨‍✈️ Phase 4: HR & Attendance
- 📊 Phase 5: Accounting & Inventory
- 📈 Phase 6: Reports & Financial Statements
- 🔄 Phase 7: Multi-Device Sync

## Tech Stack

| Layer | Technology | Cost |
|---|---|---|
| Framework | React Native (Expo) | ₹0 |
| Database | SQLite | ₹0 |
| State Management | Zustand | ₹0 |
| Notifications | expo-notifications | ₹0 |
| PDF Generation | expo-print | ₹0 |
| File Storage | expo-file-system | ₹0 |
| Charts | victory-native | ₹0 |

## Installation

```bash
# Clone the repository
git clone https://github.com/imsagarme-netizen/transport-management-app.git
cd transport-management-app

# Install dependencies
npm install

# Start the development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## Project Structure

```
src/
├── database/
│   └── init.ts          # SQLite schema (14 tables)
├── store/
│   ├── vehicleStore.ts  # Vehicle CRUD & state
│   └── driverStore.ts   # Driver CRUD & state
├── components/
│   ├── VehicleForm.tsx  # Vehicle form component
│   └── DriverForm.tsx   # Driver form component
└── utils/
    ├── notifications.ts # Offline notification system
    └── helpers.ts       # 30+ helper functions
```

## Database Schema

### 14 Core Tables

1. **vehicles** — Vehicle management with expiry tracking
2. **drivers** — Driver information and license management
3. **vendors** — Vendor ledger system
4. **trips** — Trip management and tracking
5. **lr_bilty** — Lorry Receipt tracking
6. **invoices** — Invoice generation and billing
7. **expenses** — Expense logging and categorization
8. **diesel_logs** — Fuel consumption tracking
9. **toll_logs** — Toll charge tracking
10. **vehicle_loans** — Loan management per vehicle
11. **driver_attendance** — Daily attendance marking
12. **driver_salary** — Salary calculations
13. **accounting_ledger** — Double-entry bookkeeping
14. **inventory** — Stock management

## Notification System (Offline)

All alerts work **without internet**!

- 🚨 Insurance expiry alerts (30 days before + on date)
- 🚨 PUC expiry alerts
- 🚨 Service due alerts (within 500 km)
- 🚨 License expiry alerts
- 💰 EMI due alerts
- 📦 Low stock alerts
- 📋 Invoice overdue alerts

## State Management

### Vehicle Store
```typescript
const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useVehicleStore();
```

### Driver Store
```typescript
const { drivers, addDriver, updateDriver, deleteDriver } = useDriverStore();
```

## Helper Functions

### Date Utilities
- `formatDate(date)` — Format to YYYY-MM-DD
- `formatDateForDisplay(date)` — Format to "15 May 2024"
- `daysUntilExpiry(date)` — Calculate days remaining
- `isExpired(date)` — Check if expired
- `isExpiringSoon(date)` — Check if expiring within 30 days

### Validation
- `validatePhoneNumber(phone)` — Validate 10-digit Indian phone
- `validateGSTNumber(gst)` — Validate GST format
- `validateEmail(email)` — Validate email format

### Currency & Calculations
- `formatCurrency(amount)` — Format to ₹ with 2 decimals
- `calculateMileage(km, litres)` — Calculate km/litre
- `calculateProfit(revenue, expenses)` — Calculate profit
- `calculateProfitMargin(profit, revenue)` — Calculate margin %
- `calculateGST(amount, rate)` — Calculate GST amount

### IDs & Numbers
- `generateId(prefix)` — Generate unique IDs (VEH-, DRV-, etc.)
- `generateLRNumber()` — Auto-generate LR numbers
- `generateInvoiceNumber()` — Auto-generate invoice numbers

### Status & Colors
- `getExpiryStatus(date)` — Get status with color (Expired/Expiring/Active)
- `getStatusColor(status)` — Get color for any status
- `getVehicleTypeIcon(type)` — Get emoji for vehicle type

## User Roles (Phase 7)

- 👑 **Owner** — Full access (all modules & reports)
- 🧾 **Accountant** — Operational access (LR, Invoice, Expenses)
- 🚛 **Driver** — Limited access (own trips & salary)

## Roadmap

- [x] Phase 1: Foundation (Database, CRUD, Notifications)
- [ ] Phase 2: Trip & LR Management
- [ ] Phase 3: Expense & Finance
- [ ] Phase 4: HR & Attendance
- [ ] Phase 5: Accounting & Inventory
- [ ] Phase 6: Reports & Financial Statements
- [ ] Phase 7: Multi-Device Sync with Supabase

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## License

MIT License — See LICENSE file for details

## Support

For issues or questions:
1. Check the [GitHub Issues](https://github.com/imsagarme-netizen/transport-management-app/issues)
2. Create a new issue with details
3. Include screenshots or error logs

## Changelog

### v1.0.0 (Phase 1)
- ✅ SQLite database setup
- ✅ Vehicle & Driver CRUD
- ✅ Offline notifications
- ✅ 30+ helper utilities
- ✅ UI components

---

**Built for Indian Transport Operators | Zero External Dependencies | Offline-First Design**
