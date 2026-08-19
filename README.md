# LMS - Learning Management System

A modern, responsive Learning Management System built with HTML5, CSS3, vanilla JavaScript ES modules, and Firebase. Designed for beginner-friendly implementation with complete student and staff functionality.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Features](#features)
- [Setup Instructions](#setup-instructions)
- [Firebase Configuration](#firebase-configuration)
- [Firestore Setup](#firestore-setup)
- [Security Rules](#security-rules)
- [Running the Project](#running-the-project)
- [Creating User Accounts](#creating-user-accounts)
- [Common Issues & Solutions](#common-issues--solutions)

---

## 📌 Project Overview

This LMS provides a unified platform for:

- **Students**: Browse courses, view attendance, submit assignments, read announcements, manage profiles
- **Staff/Admins**: Manage students, courses, attendance records, create assignments, post announcements

The system uses Firebase Authentication for secure login and Firestore for data persistence. All data is protected with role-based security rules.

---

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES Modules)
- **Authentication**: Firebase Authentication (Email/Password)
- **Database**: Firestore (Cloud Database)
- **Hosting**: Can be run locally with VS Code Live Server
- **No Build Tools Required**: Works directly in modern browsers

---

## 📁 Project Structure

```
LMS_Project/
├── index.html                    # Home/landing page
├── login.html                    # Login and registration page
├── student-dashboard.html        # Student main dashboard
├── staff-dashboard.html          # Staff/admin dashboard
├── firestore.rules              # Firestore security rules
├── README.md                     # This file
│
├── css/
│   └── style.css                # All CSS styling (responsive)
│
└── js/
    ├── firebase-config.js        # Firebase configuration
    ├── auth.js                   # Authentication logic
    ├── courses.js                # Course management
    ├── attendance.js             # Attendance handling
    ├── assignments.js            # Assignment management
    ├── announcements.js          # Announcement management
    ├── student.js                # Student dashboard logic
    └── staff.js                  # Staff dashboard logic
```

---

## ✨ Features

### For Students
- ✅ View courses with details (code, faculty, department, semester)
- ✅ Track attendance percentage with warnings below 75%
- ✅ View assignments with status (pending/completed/overdue)
- ✅ Read all announcements from faculty
- ✅ Update personal profile (phone number)
- ✅ Dashboard with quick stats (total courses, avg attendance, pending assignments)
- ✅ Secure authentication with email/password
- ✅ Role-based access control

### For Staff
- ✅ Manage student list with search and filter by department
- ✅ View/edit student details
- ✅ Create, edit, and delete courses
- ✅ Mark attendance for students (with validation)
- ✅ Create, edit, and delete assignments
- ✅ Create, edit, and delete announcements
- ✅ Update personal profile
- ✅ Dashboard with quick stats (total students, courses, assignments, announcements)
- ✅ Secure authentication with email/password
- ✅ Role-based access control

### General Features
- 📱 Fully responsive design (desktop, tablet, mobile)
- 🔐 Secure Firebase Authentication
- 🛡️ Firestore Security Rules (role-based access)
- 🎨 Professional, clean UI design
- ⚡ Fast, smooth interactions
- 💾 Real-time data synchronization
- ♿ Semantic HTML for accessibility
- 📊 Modal dialogs for forms
- 🔔 Loading states and error messages
- 📋 Data validation on all forms

---

## 🚀 Setup Instructions

### Step 1: Open VS Code

1. Open VS Code
2. Click "File" → "Open Folder"
3. Navigate to and select the "LMS Portal" folder (d:\LMS Portal)
4. Click "Select Folder"

### Step 2: Install VS Code Extension (Optional but Recommended)

For local testing without a backend server:

1. Go to Extensions (Ctrl+Shift+X)
2. Search for "Live Server"
3. Install the extension by Ritwick Dey
4. Right-click on `index.html` and select "Open with Live Server"

The project will open in your browser at `http://127.0.0.1:5500`

---

## 🔥 Firebase Configuration

### Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `LMS Portal` (or your choice)
4. Accept the terms and click "Continue"
5. Select your region and click "Create project"
6. Wait for project creation to complete

### Get Firebase Credentials

1. In Firebase Console, click the settings icon (⚙️) → "Project Settings"
2. Scroll down to "Your apps" section
3. Click "Web" icon (</>) to add a web app
4. Enter app name: `LMS Portal Web`
5. **IMPORTANT**: Check "Also set up Firebase Hosting for this project" checkbox
6. Click "Register app"
7. You'll see a config object - **Copy all the credentials**

### Add Credentials to Project

1. In VS Code, open `js/firebase-config.js`
2. Find the section:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyCl0IWh_lWSoaX0717P2zEAsy4aj7g0jFA",
  authDomain: "smartlms-b177e.firebaseapp.com",
  projectId: "smartlms-b177e",
  storageBucket: "smartlms-b177e.firebasestorage.app",
  messagingSenderId: "824755896362",
  appId: "1:824755896362:web:7c16234f22cd0447358353",
  measurementId: "G-8301KWGYBQ"
};
```

3. Replace each `YOUR_*_HERE` with your actual credentials from Firebase
4. **Save the file** (Ctrl+S)

**⚠️ IMPORTANT**: Never commit this file to public repositories with real credentials!

---

## 🔐 Firebase Authentication Setup

### Enable Email/Password Authentication

1. In Firebase Console, go to "Authentication" (left sidebar)
2. Click "Get Started"
3. Click "Email/Password" option
4. Enable the toggle switch
5. Click "Enable"
6. Click "Save"

### Enable Email Verification (Optional)

1. In Authentication → Users tab
2. Go to "Settings" (or your email link templates)
3. You can customize the email verification message
4. This is automatic after setup

---

## 📊 Firestore Setup

### Create Firestore Database

1. In Firebase Console, go to "Firestore Database" (left sidebar)
2. Click "Create database"
3. Choose your location
4. **Important**: Select "Start in test mode" for now
   - This allows anyone to read/write (we'll secure it with rules)
5. Click "Create"
6. Wait for database to initialize

### Initialize Collections (Optional)

The collections will be created automatically when you add data. But you can pre-create them:

1. Click "Start collection"
2. Create these collections (leave empty, they auto-populate):
   - `users`
   - `courses`
   - `attendance`
   - `assignments`
   - `announcements`

---

## 🛡️ Security Rules

### Deploy Firestore Security Rules

**This step is CRITICAL before deploying to production!**

1. In Firebase Console, go to "Firestore Database" → "Rules" tab
2. Delete the default rules
3. Copy the entire contents from `firestore.rules` file in your project
4. Paste into the Firebase Console Rules editor
5. Click "Publish"

**What these rules do:**
- Users can only read/write their own profile
- Students can only read their own attendance
- Staff can read/write courses, attendance, assignments, announcements
- Students can read courses, assignments, announcements
- All unauthenticated access is denied

---

## 🎯 Running the Project

### Option 1: Live Server (Recommended for Development)

1. Right-click on `index.html` in VS Code
2. Select "Open with Live Server"
3. The project opens at `http://127.0.0.1:5500/index.html`

### Option 2: Open Directly in Browser

1. Open `index.html` in any modern web browser:
   - Chrome (recommended)
   - Firefox
   - Edge
   - Safari

**Note**: Some Firebase features might not work with `file://` protocol. Use Live Server for best results.

---

## 👥 Creating User Accounts

### Create First Staff Account (Manually)

Since only staff can add courses/assignments/announcements, you need to manually create the first staff account:

1. In Firebase Console → Authentication → Users tab
2. Click "Add user"
3. Enter email: `staff@example.com`
4. Enter password: `Staff@123`
5. Click "Add user"
6. In Firebase Console → Firestore → Users collection
7. Click "Add document"
   - Document ID: Copy the UID from the user you just created
   - Add these fields:
     ```
     uid: <copied UID>
     name: "Your Name"
     email: "staff@example.com"
     role: "staff"
     phone: ""
     department: "Computer Science"
     createdAt: (current timestamp)
     ```
8. Click "Save"

### Create Student Accounts

#### Method 1: Through Registration (Recommended)

1. Open the LMS in browser
2. Go to Login page
3. Click "Create one" link
4. Select "Student" role
5. Fill in the registration form:
   - Name: `John Doe`
   - Email: `student@example.com`
   - Password: `Student@123`
   - Student ID: `STU001`
   - Department: `Computer Science`
   - Year: `First Year`
6. Click "Create Account"
7. Return to login
8. Login with student credentials

#### Method 2: Manual Creation in Firebase

1. In Firebase Console → Authentication → Users tab
2. Click "Add user"
3. Enter student email and password
4. Click "Add user"
5. Copy the generated UID
6. Go to Firestore → Users collection
7. Add new document with UID as ID:
   ```
   uid: <copied UID>
   name: "Student Name"
   email: "student@example.com"
   role: "student"
   studentId: "STU001"
   department: "Computer Science"
   year: "1"
   phone: ""
   createdAt: (timestamp)
   ```

### Test Accounts (After Setup)

**Staff Account:**
- Email: `staff@example.com`
- Password: `Staff@123`

**Student Account:**
- Email: `student@example.com`
- Password: `Student@123`

---

## 📝 How to Use

### For Students

1. **Login**
   - Navigate to `login.html`
   - Select "Student" role
   - Enter email and password
   - Click "Sign In"

2. **Dashboard**
   - View quick stats (courses, attendance, assignments)
   - See recent announcements

3. **View Courses**
   - Click "Courses" in sidebar
   - See all available courses
   - View course details (code, faculty, department)

4. **Check Attendance**
   - Click "Attendance" in sidebar
   - View attendance percentage for each course
   - ⚠️ Warning appears if below 75%

5. **View Assignments**
   - Click "Assignments" in sidebar
   - See assignment status (pending/completed/overdue)
   - View due dates

6. **Read Announcements**
   - Click "Announcements" in sidebar
   - Read latest updates from staff

7. **Update Profile**
   - Click "Profile" in sidebar
   - Update phone number
   - Click "Update Profile"

### For Staff

1. **Login**
   - Navigate to `login.html`
   - Select "Staff/Admin" role
   - Enter email and password
   - Click "Sign In"

2. **Dashboard**
   - View quick stats (students, courses, assignments, announcements)

3. **Manage Students**
   - Click "Students" in sidebar
   - Search by name or student ID
   - Filter by department
   - Click "View" to edit student details

4. **Manage Courses**
   - Click "Courses" in sidebar
   - Click "+ Add Course" button
   - Fill course details and click "Save Course"
   - Click "Edit" or "Delete" for existing courses

5. **Manage Attendance**
   - Click "Attendance" in sidebar
   - Select student and course
   - Enter total classes, present, absent
   - Click "Save Attendance"
   - **Validation**: present + absent cannot exceed total classes

6. **Manage Assignments**
   - Click "Assignments" in sidebar
   - Click "+ Add Assignment" button
   - Fill assignment details and set due date
   - Click "Save Assignment"
   - Edit or delete existing assignments

7. **Post Announcements**
   - Click "Announcements" in sidebar
   - Click "+ Create Announcement" button
   - Enter title and message
   - Click "Post Announcement"
   - Edit or delete existing announcements

---

## 🐛 Common Issues & Solutions

### Issue: "Firebase is not defined" or "No configuration provided"

**Solution:**
- Ensure `firebase-config.js` has your actual Firebase credentials
- Check that `js/firebase-config.js` path is correct in imports
- Clear browser cache (Ctrl+Shift+Delete)

### Issue: Login page doesn't load

**Solution:**
- Check browser console for errors (F12 → Console tab)
- Ensure all Firebase SDK URLs are correct in `auth.js`
- Try a different browser
- Check internet connection

### Issue: Students can't login despite correct credentials

**Solution:**
- Verify email/password in Firebase Console → Authentication
- Ensure user document exists in Firestore with `role: "student"`
- Check Firestore Security Rules are deployed
- Try resetting password through "Forgot Password" link

### Issue: Staff can't add courses

**Solution:**
- Verify staff account has `role: "staff"` in Firestore users collection
- Check Firestore Security Rules are deployed
- Try in an incognito/private browser window
- Clear browser cache

### Issue: Data not saving to Firestore

**Solution:**
- Check browser console for Firebase errors (F12)
- Ensure Firestore database is initialized and in "test mode" or has proper rules
- Check internet connection
- Verify all form fields are filled correctly

### Issue: "Attendance warning" not showing

**Solution:**
- Ensure attendance records exist for the student
- Check that at least one attendance percentage is below 75%
- Refresh the page (F5)

### Issue: Responsive design not working on mobile

**Solution:**
- Check `<meta name="viewport"...>` tag in HTML files
- Clear browser cache
- Test in different mobile browser
- Try landscape and portrait orientation

### Issue: "Authentication failed" after creating account

**Solution:**
- Ensure email is not already registered
- Check password meets requirements (at least 6 characters)
- Verify email format is correct
- Try a different email address

---

## 📱 Browser Compatibility

- ✅ Chrome/Chromium (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Note**: Internet Explorer is not supported. Use modern browsers only.

---

## 🔄 Data Flow

### Login Process
1. User enters email/password
2. Firebase Authentication validates credentials
3. User document fetched from Firestore
4. Role verified (student/staff)
5. Redirect to appropriate dashboard

### Adding a Course (Staff)
1. Staff fills course form
2. Data validated on client-side
3. Sent to Firestore via `addCourse()`
4. Firestore security rules verify staff role
5. Course saved to database
6. Page refreshes to show new course
7. All students see updated course list

### Marking Attendance (Staff)
1. Staff selects student and course
2. Enters attendance data
3. Client-side validation (present + absent ≤ total)
4. Saved to Firestore
5. Student sees updated attendance on next load

---

## 📚 Firebase Collections Schema

### users
```javascript
{
  uid: string,              // User's Firebase Auth ID
  name: string,             // Full name
  email: string,            // Email address
  role: "student" | "staff",
  studentId: string,        // Only for students
  department: string,
  year: string,             // Only for students (1-4)
  phone: string,
  createdAt: timestamp
}
```

### subjects (NEW - Default Subjects)
```javascript
{
  // Document ID: subjectId (tamil, english, python, java, data_structures)
  subjectId: string,         // Unique identifier (tamil, english, python, etc.)
  subjectCode: string,       // Course code (TAM101, ENG101, PY101, etc.)
  subjectName: string,       // Full subject name
  createdAt: timestamp
}
```

**Default Subjects Automatically Created:**
1. Tamil (TAM101)
2. English (ENG101)
3. Python (PY101)
4. Java (JAVA101)
5. Data Structures (DS101)

### courses
```javascript
{
  courseName: string,
  courseCode: string,
  facultyName: string,
  department: string,
  semester: string,
  description: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### attendance (UPDATED - Subject-Based)
```javascript
{
  studentUID: string,        // Student's Firebase UID
  subjectId: string,         // Subject ID (references subjects collection)
  date: string,              // Date in YYYY-MM-DD format
  status: "Present" | "Absent",
  timestamp: string,         // ISO timestamp
  createdAt: timestamp
}
```

### assignments
```javascript
{
  title: string,
  courseId: string,
  courseName: string,
  description: string,
  dueDate: string (ISO format),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### announcements
```javascript
{
  title: string,
  message: string,
  staffName: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

## 🚀 Deployment (Next Steps)

Once testing is complete, you can deploy to:

1. **Firebase Hosting** (recommended - free)
   - `firebase deploy --only hosting`

2. **Netlify** or **Vercel**
   - Connect GitHub repo and auto-deploy

3. **GitHub Pages**
   - Push to repository and enable Pages

**Security reminder**: Before deploying, update Firestore rules to only allow authenticated users!

---

## 📞 Support

For issues:
1. Check the "Common Issues & Solutions" section above
2. Review browser console (F12 → Console)
3. Check Firebase Console for any errors
4. Review Firestore rules for access issues

---

## 📄 License

This project is provided as-is for educational purposes.

---

## ✅ Final Checklist Before Going Live

- [ ] Firebase project created and configured
- [ ] Firebase credentials added to `firebase-config.js`
- [ ] Email/Password Authentication enabled
- [ ] Firestore database created and initialized
- [ ] Firestore Security Rules deployed
- [ ] First staff account created manually
- [ ] Test accounts created (staff + student)
- [ ] Login tested and working
- [ ] Dashboard loads correctly
- [ ] Add course/attendance/assignment tested
- [ ] Responsive design checked on mobile
- [ ] All links and navigation working
- [ ] Error messages displaying correctly
- [ ] Form validation working

---

## 🎉 You're All Set!

Your LMS is ready to use. Start with creating courses, then students, and manage everything through the staff dashboard.

**Happy Learning!** 📚
