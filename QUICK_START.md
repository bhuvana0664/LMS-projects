## 🚀 QUICK START GUIDE

### ⏱️ Estimated Setup Time: 10-15 minutes

---

## STEP 1: Open Project in VS Code (1 min)

1. Click File → Open Folder
2. Navigate to: **d:\LMS Portal**
3. Click "Select Folder"

---

## STEP 2: Launch Live Server (1 min)

1. Right-click **index.html** in the file explorer
2. Select **"Open with Live Server"**
3. Your browser opens to the homepage ✓

---

## STEP 3: Create Firebase Project (3 min)

1. Go to: https://console.firebase.google.com/
2. Click **"Create a project"**
3. Name: `LMS Portal`
4. Accept terms → Click **"Continue"**
5. Select region → Click **"Create project"**
6. Wait for creation (takes ~30 seconds)

---

## STEP 4: Get Firebase Credentials (2 min)

1. Click settings icon (⚙️) → **"Project Settings"**
2. Scroll to **"Your apps"** section
3. Click web icon **</> **
4. App name: `LMS Portal Web`
5. ✓ Check "Also set up Firebase Hosting"
6. Click **"Register app"**
7. **Copy the entire config object** (looks like below)

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

---

## STEP 5: Add Credentials to Project (1 min)

1. In VS Code, open **js/firebase-config.js**
2. Find the lines with `YOUR_API_KEY_HERE` etc.
3. Replace with your Firebase config values
4. **Save** (Ctrl+S)

---

## STEP 6: Setup Firebase Authentication (2 min)

1. Back in Firebase Console
2. Click **"Authentication"** (left sidebar)
3. Click **"Get Started"**
4. Click **"Email/Password"**
5. Toggle the switch to **ON**
6. Click **"Save"**

---

## STEP 7: Create Firestore Database (2 min)

1. Click **"Firestore Database"** (left sidebar)
2. Click **"Create database"**
3. Select your region
4. ⚠️ Choose **"Start in test mode"** (we'll secure it later)
5. Click **"Create"**
6. Wait for initialization (~1 min)

---

## STEP 8: Deploy Security Rules (2 min)

1. In Firestore, click **"Rules"** tab
2. Delete all existing rules
3. Copy from **firestore.rules** file in your project folder
4. Paste into the Rules editor
5. Click **"Publish"**

---

## STEP 9: Create First Staff Account (2 min)

You MUST do this manually because only staff can add data.

1. Firebase Console → **Authentication** → **Users** tab
2. Click **"Add user"**
   - Email: `staff@lms.edu`
   - Password: `Staff@123456`
3. Click **"Add user"**
4. Copy the **UID** of created user
5. Go to **Firestore Database** → **Users collection** → **Add document**
6. Paste UID as the Document ID
7. Add these fields:
   ```
   uid: (paste the UID)
   name: "Admin Staff"
   email: "staff@lms.edu"
   role: "staff"
   phone: ""
   department: "Administration"
   createdAt: (click "Server timestamp")
   ```
8. Click **"Save"**

---

## STEP 10: Test the System (3 min)

### Login as Staff:
1. Go to http://127.0.0.1:5500/login.html
2. Select **"Staff/Admin"**
3. Email: `staff@lms.edu`
4. Password: `Staff@123456`
5. Click **"Sign In"**
6. ✓ Should see staff dashboard

### Create a Student Account:
1. Click **"Create one"** link on login page
2. Fill the form (any test data)
3. Click **"Create Account"**
4. ✓ Account created
5. Return to login page
6. Login with new student account
7. ✓ Should see student dashboard

---

## ✅ YOU'RE DONE!

Your LMS is now fully functional. 

### What to do next:

1. **As Staff (log in with staff account)**:
   - Add courses
   - Add assignments
   - Post announcements

2. **As Student (log in with student account)**:
   - View courses
   - Read announcements
   - Check profile

---

## 🎯 Quick Reference

| Feature | Staff | Student |
|---------|-------|---------|
| View Courses | ✓ | ✓ |
| Add Course | ✓ | ✗ |
| View Students | ✓ | ✗ |
| Mark Attendance | ✓ | ✓ (view only) |
| Create Assignment | ✓ | ✓ (view only) |
| Post Announcement | ✓ | ✓ (view only) |
| Edit Profile | ✓ | ✓ |

---

## 📝 Important Notes

- **Credentials are REAL**: Use strong passwords
- **Firestore Rules**: Protects data based on user role
- **Test Mode**: Switch to production rules before deploying live
- **No Backend Server Needed**: Everything runs in the browser!

---

## 🆘 Something Not Working?

1. **Check browser console**: Press F12 → Click "Console" tab
2. **Verify Firebase Config**: Open `js/firebase-config.js`
3. **Check Internet**: Firebase needs internet connection
4. **Clear Cache**: Ctrl+Shift+Delete → Clear all

---

**Enjoy your LMS!** 🎓
