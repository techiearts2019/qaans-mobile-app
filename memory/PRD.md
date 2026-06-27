# Dihadi — Face Attendance App (UI Design Demo)

## Overview
Dihadi is a mobile-first face attendance app for supervisors to manage employee check-in/check-out via face recognition, add employees, view attendance & salary records. This iteration is a **UI-only design demo** with full navigation flow, mock data, and a simulated face-match interaction. No backend logic, no admin panel.

## Tech Stack
- **Framework**: Expo SDK 54 + Expo Router (file-based routing)
- **UI**: React Native + StyleSheet + expo-linear-gradient + expo-image
- **Camera**: expo-camera (live preview + photo capture)
- **TTS**: expo-speech (Hindi voice announcement on face match)
- **Keyboard UX**: react-native-keyboard-controller
- **Safe Areas**: react-native-safe-area-context

## Screens & Flow
1. **Splash** (`/`) → animated "D" monogram, brand intro, 1.9s auto-advance
2. **Welcome** (`/welcome`) → hero image + feature pills + Get Started CTA
3. **Login** (`/login`) → email + Send OTP, or "Continue as Demo Supervisor"
4. **OTP** (`/otp`) → 4-digit boxed inputs, resend timer, demo code 1234
5. **Dashboard** (`/(tabs)/dashboard`) → greeting, today's stats card, 6-tile quick-action grid, today's attendance list
6. **Face Attendance** (`/(tabs)/attendance`) → live front camera, scan line + pulsing ring + 4 corner markers, auto-simulated face match every ~4s, match modal with avatar, name in English + Hindi (रमेश कुमार), check-in/out toggle, Hindi voice announcement
7. **Employees List** (`/employees`) → search, status filter chips (All/Active/Inactive/No Allocation), employee cards (photo, name, code, designation, status badge)
8. **Add Employee** (`/employees/add`) → 3-step wizard (Personal / Communication / Documents), in-app photo capture, dropdowns, custom wheel date picker
9. **Attendance Records** (`/attendance-records`) → Present/Absent/Late stats, day filter chips, per-employee status rows
10. **Salary Records** (`/salary-records`) → monthly payout summary, month chips, per-employee breakdown (days × rate + bonus − deductions)
11. **Notifications** (`/(tabs)/notifications`) → categorized cards (attendance/employee/salary), unread dot, mark all read
12. **Profile** (`/(tabs)/profile`) → user card with verified badge, stats row, menu (edit/team/salary/settings/help), logout

## Bottom Tabs
Home · **Attendance (prominent center button)** · Notifications · Profile

## Design System
- **Palette**: Slate-900 primary, Blue-600 brand, Emerald-600 success, soft tints for status chips
- **Typography**: System fonts with strong 800 weight headings, -0.4 letter-spacing
- **Radius**: 12 / 16 / 20 / 28 (cards 20-28, buttons 16)
- **Spacing**: 8pt grid
- **Components**: PrimaryButton, DihadiLogo (custom CSS monogram), DatePickerField (wheel), DropdownField + PickerModal (bottom sheet), TextField, Toast

## Mock Data
5 employees with Indian names + Hindi translations, 3 today's attendance entries, 5 notifications, 5 salary rows. All in `/app/frontend/src/data/mockData.ts`.

## Permissions
- iOS: NSCameraUsageDescription
- Android: CAMERA permission
- Graceful permission gate on Face Attendance + Add Employee photo capture
