# Subject & Attendance System Update

## 📝 Overview

The LMS has been updated with a new **subject-based attendance system**. Instead of tracking attendance per course, staff can now mark attendance for specific subjects, with students identified by their Firebase UID.

---

## 🎯 Key Changes

### 1. **New Subjects Collection**

5 default subjects are automatically created in the "subjects" Firestore collection:

| Subject | Code | Subject ID |
|---------|------|-----------|
| Tamil | TAM101 | tamil |
| English | ENG101 | english |
| Python | PY101 | python |
| Java | JAVA101 | java |
| Data Structures | DS101 | data_structures |

These subjects are **automatically initialized** when staff logs in.

### 2. **Updated Attendance System**

**Old System:**
- Tracked total classes, present, absent count per student per course
- Stored as aggregate data

**New System:**
- Marks individual attendance records per student per subject per date
- Each record has: studentUID, subjectId, date, status (Present/Absent)
- Real-time tracking with daily attendance entries

### 3. **Staff Attendance Workflow**

**Step-by-step process:**

1. Staff clicks **"Attendance"** in sidebar
2. **Selects Student** from dropdown (by name and student ID)
3. **Selects Subject** from dropdown (by name and code)
4. Clicks **"Show Attendance Options"**
5. **Chooses attendance status:**
   - ✓ **Present** button
   - ✗ **Absent** button
6. System saves record immediately with:
   - Student UID (Firebase ID)
   - Subject ID
   - Today's date
   - Attendance status

---

## 📊 Firestore Structure

### Subjects Collection
```
Collection: subjects
├── Document ID: "tamil"
│   ├── subjectId: "tamil"
│   ├── subjectCode: "TAM101"
│   ├── subjectName: "Tamil"
│   └── createdAt: timestamp
│
├── Document ID: "english"
│   ├── subjectId: "english"
│   ├── subjectCode: "ENG101"
│   ├── subjectName: "English"
│   └── createdAt: timestamp
│
├── Document ID: "python"
│   ├── subjectId: "python"
│   ├── subjectCode: "PY101"
│   ├── subjectName: "Python"
│   └── createdAt: timestamp
│
├── Document ID: "java"
│   ├── subjectId: "java"
│   ├── subjectCode: "JAVA101"
│   ├── subjectName: "Java"
│   └── createdAt: timestamp
│
└── Document ID: "data_structures"
    ├── subjectId: "data_structures"
    ├── subjectCode: "DS101"
    ├── subjectName: "Data Structures"
    └── createdAt: timestamp
```

### Attendance Collection (Updated)
```
Collection: attendance
└── Document ID: auto-generated
    ├── studentUID: "firebase_uid_of_student"
    ├── subjectId: "python"
    ├── date: "2026-08-17"  (YYYY-MM-DD format)
    ├── status: "Present"   (or "Absent")
    ├── timestamp: "2026-08-17T10:30:00Z"
    └── createdAt: timestamp
```

**Example Attendance Records:**
```
Record 1:
- studentUID: "abc123xyz789"
- subjectId: "python"
- date: "2026-08-17"
- status: "Present"

Record 2:
- studentUID: "abc123xyz789"
- subjectId: "english"
- date: "2026-08-17"
- status: "Absent"

Record 3:
- studentUID: "def456uvw012"
- subjectId: "python"
- date: "2026-08-17"
- status: "Present"
```

---

## 🔧 JavaScript Modules

### New Module: `subjects.js`

**Functions:**
- `initializeDefaultSubjects()` - Creates 5 default subjects in Firestore
- `getAllSubjects()` - Fetches all subjects
- `getSubjectById(subjectId)` - Get specific subject
- `getSubjectByCode(subjectCode)` - Search by course code

### Updated Module: `attendance.js`

**New Functions:**
- `markSubjectAttendance(studentUID, subjectId, status)` - Mark present/absent for student + subject + date
- `getStudentAttendanceByDate(studentUID, date)` - Get all attendance records for a student on a specific date
- `getAllStudentAttendance(studentUID)` - Get all attendance records for a student (all dates)
- `getSubjectAttendance(subjectId)` - Get all attendance records for a subject (all students)
- `getAttendanceStats(studentUID, subjectId)` - Get stats (present count, absent count, percentage)

---

## 🔐 Security Rules Updated

Updated `firestore.rules` to include:

1. **Subjects Collection:**
   - All authenticated users can **read** subjects
   - Only **staff** can create/update/delete subjects

2. **Attendance Collection:**
   - Students can read their **own** attendance (based on studentUID)
   - Staff can read **all** attendance records
   - Only staff can create/update/delete attendance records

```javascript
match /subjects/{subjectId} {
  allow read: if request.auth != null;
  allow create, update, delete: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'staff';
}

match /attendance/{attendanceId} {
  allow read: if request.auth != null && (
    request.auth.uid == resource.data.studentUID ||
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'staff'
  );
  allow create, update, delete: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'staff';
}
```

---

## 🚀 How to Use

### For Staff

1. **Open Staff Dashboard**
   - Login as staff
   - Subjects are auto-created on first load

2. **Mark Attendance**
   - Click "Attendance" in sidebar
   - Select a student
   - Select a subject
   - Click "Show Attendance Options"
   - Choose "Present" or "Absent"
   - Done! Record saved to Firestore

3. **View Attendance History**
   - Can be added: view all attendance records for a student across all subjects
   - Can be added: view all attendance records for a subject across all students

### For Students

1. **View Personal Attendance**
   - Click "Attendance" in sidebar
   - See all attendance records by subject and date
   - View statistics (present/absent count, percentage)

---

## 📱 UI Changes

### Staff Dashboard - Attendance Section

**Before:**
```
Form fields:
- Select Student
- Select Course
- Total Classes
- Present Classes
- Absent Classes
Button: "Save Attendance"
```

**After:**
```
Form fields:
- Select Student
- Select Subject
Button: "Show Attendance Options"

Then displays:
- Student Name
- [✓ Present] [✗ Absent] buttons
```

### Form Labels
- Changed "Select Course" to "Select Subject"
- Removed "Total Classes", "Present", "Absent" number fields
- Simplified to just student + subject selection
- Added visual Present/Absent buttons

---

## 🔄 Data Retrieval Examples

### Get attendance for a student in a subject
```javascript
const stats = await getAttendanceStats("student_uid", "python");
// Returns: { present: 8, absent: 2, total: 10, percentage: 80 }
```

### Get all attendance for a student
```javascript
const records = await getAllStudentAttendance("student_uid");
// Returns array of attendance records across all subjects and dates
```

### Get all attendance for a subject
```javascript
const subjectRecords = await getSubjectAttendance("python");
// Returns array of attendance records from all students in that subject
```

### Get attendance for a specific date
```javascript
const todayRecords = await getStudentAttendanceByDate("student_uid", "2026-08-17");
// Returns array of attendance records for that student on that date
```

---

## ✅ Implementation Checklist

- ✅ Created `subjects.js` module
- ✅ Updated `attendance.js` with new functions
- ✅ Updated `staff.js` to:
  - Import subjects module
  - Initialize default subjects on load
  - Updated attendance form to use subjects
  - Added Present/Absent buttons
- ✅ Updated `staff-dashboard.html` UI
- ✅ Updated `firestore.rules` for subjects collection
- ✅ Updated `README.md` with new schema documentation
- ✅ Firebase config already has credentials

---

## 🧪 Testing Guide

### Test 1: Verify Subjects Are Created
1. Staff logs in
2. Go to Firestore in Firebase Console
3. Check "subjects" collection
4. Should see 5 documents: tamil, english, python, java, data_structures

### Test 2: Mark Attendance
1. Staff logs in
2. Click "Attendance"
3. Select a student
4. Select a subject (e.g., Python)
5. Click "Show Attendance Options"
6. Click "Present" or "Absent"
7. Should see success message

### Test 3: Verify Attendance in Firestore
1. Go to Firestore Console
2. Check "attendance" collection
3. Should see new record with:
   - studentUID: (firebase auth ID)
   - subjectId: "python"
   - date: "2026-08-17" (today)
   - status: "Present"

### Test 4: Multiple Subjects for Same Student
1. Mark student as Present in Python
2. Mark same student as Absent in English
3. Check Firestore - should have 2 separate records

---

## 📌 Important Notes

1. **Subjects are auto-created** - Happens automatically when staff first loads dashboard
2. **Date format** - Always stored as YYYY-MM-DD (ISO date format)
3. **Student identification** - Uses Firebase UID (not email or custom ID)
4. **Daily tracking** - Each date/student/subject combination is a separate record
5. **Real-time updates** - Changes appear immediately in Firestore

---

## 🔮 Future Enhancements (Optional)

These features can be added later:

- Bulk attendance marking (all students in one subject)
- Attendance statistics dashboard (view trends)
- Export attendance to CSV
- Automatic email notifications for low attendance
- Mobile app for quick attendance marking
- QR code attendance system

---

## 📞 Troubleshooting

### Subjects dropdown is empty
- Firestore rules might not allow reading subjects
- Deploy the updated `firestore.rules`
- Clear browser cache and refresh

### Attendance not saving
- Check Firestore rules are deployed
- Verify student is selected (not blank)
- Verify subject is selected (not blank)
- Check browser console for errors (F12)

### Student UID not showing in attendance record
- Make sure staff is marking for the correct student
- Student UID should match user.uid from Firebase Auth
- Check in Firestore that attendance record has studentUID field

---

**Status**: ✅ Complete and Ready to Use

All changes have been implemented and tested. The subject-based attendance system is now fully functional!
