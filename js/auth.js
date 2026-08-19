// Authentication Module
// Handles user login, registration, and authentication state

import { auth, db } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  getDocs
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Determine if we're on login page
const isLoginPage = document.body.contains(document.getElementById('loginForm'));

// ===== DOM Elements =====
const loginForm = document.getElementById('loginForm');
const registerLink = document.getElementById('registerLink');
const closeRegisterModal = document.getElementById('closeRegisterModal');
const registerModal = document.getElementById('registerModal');
const registerForm = document.getElementById('registerForm');
const roleButtons = document.querySelectorAll('.role-btn');
const passwordToggle = document.getElementById('togglePassword');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const loginBtn = document.getElementById('loginBtn');
const regErrorMessage = document.getElementById('regErrorMessage');

let selectedRole = 'student';

if (isLoginPage) {
  // Role selection
  roleButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      roleButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      selectedRole = this.dataset.role;
    });
  });

  // Password toggle
  if (passwordToggle) {
    passwordToggle.addEventListener('click', function () {
      const passwordInput = document.getElementById('password');
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      this.textContent = isPassword ? '🙈' : '👁️';
    });
  }

  // Register link
  registerLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerModal.style.display = 'flex';
  });

  closeRegisterModal.addEventListener('click', () => {
    registerModal.style.display = 'none';
  });

  registerModal.addEventListener('click', (e) => {
    if (e.target === registerModal) {
      registerModal.style.display = 'none';
    }
  });

  // Login Form Submit
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await loginUser();
  });

  // Register Form Submit
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await registerUser();
  });
}

// ===== Login Function =====
async function loginUser() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  errorMessage.style.display = 'none';
  successMessage.style.display = 'none';

  // Show loading state
  loginBtn.disabled = true;
  document.querySelector('.btn-text').style.display = 'none';
  document.querySelector('.btn-spinner').style.display = 'inline-block';

  try {
    // Sign in with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check user role from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));

    if (!userDoc.exists()) {
      throw new Error('User profile not found. Please contact administrator.');
    }

    const userData = userDoc.data();
    const userRole = userData.role;

    if (userRole !== selectedRole) {
      await signOut(auth);
      throw new Error(`This account is registered as a ${userRole}. Please select the correct login type.`);
    }

    // Show success message
    successMessage.textContent = 'Login successful! Redirecting...';
    successMessage.style.display = 'block';

    // Redirect based on role
    setTimeout(() => {
      if (userRole === 'student') {
        window.location.href = 'student-dashboard.html';
      } else if (userRole === 'staff') {
        window.location.href = 'staff-dashboard.html';
      }
    }, 1000);
  } catch (error) {
    let friendlyMessage = 'Login failed. Please try again.';

    switch (error.code) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        friendlyMessage = 'Invalid email or password. Please try again.';
        break;
      case 'auth/too-many-requests':
        friendlyMessage = 'Too many failed login attempts. Please try again later.';
        break;
      case 'auth/invalid-email':
        friendlyMessage = 'Please enter a valid email address.';
        break;
      default:
        friendlyMessage = error.message || friendlyMessage;
    }

    errorMessage.textContent = friendlyMessage;
    errorMessage.style.display = 'block';
  } finally {
    // Restore button state
    loginBtn.disabled = false;
    document.querySelector('.btn-text').style.display = 'inline';
    document.querySelector('.btn-spinner').style.display = 'none';
  }
}

// ===== Register Function =====
async function registerUser() {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirmPassword = document.getElementById('regConfirmPassword').value;
  const studentId = document.getElementById('regStudentId').value.trim();
  const department = document.getElementById('regDepartment').value;
  const year = document.getElementById('regYear').value;

  regErrorMessage.style.display = 'none';

  // Validation
  if (!name || !email || !password || !studentId || !department || !year) {
    regErrorMessage.textContent = 'Please fill in all fields.';
    regErrorMessage.style.display = 'block';
    return;
  }

  if (password !== confirmPassword) {
    regErrorMessage.textContent = 'Passwords do not match.';
    regErrorMessage.style.display = 'block';
    return;
  }

  if (password.length < 6) {
    regErrorMessage.textContent = 'Password must be at least 6 characters long.';
    regErrorMessage.style.display = 'block';
    return;
  }

  try {
    // Create Firebase user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      name: name,
      email: email,
      role: 'student', // Registration creates students
      studentId: studentId,
      department: department,
      year: year,
      phone: '',
      createdAt: new Date().toISOString()
    });

    regErrorMessage.style.display = 'none';
    document.getElementById('regErrorMessage').textContent = 'Account created successfully! Please login.';
    document.getElementById('regErrorMessage').style.display = 'block';
    document.getElementById('regErrorMessage').classList.add('success-message');

    // Clear form
    registerForm.reset();

    // Redirect to login after delay
    setTimeout(() => {
      registerModal.style.display = 'none';
      loginForm.reset();
      document.getElementById('email').focus();
    }, 2000);
  } catch (error) {
    let friendlyMessage = 'Registration failed. Please try again.';

    switch (error.code) {
      case 'auth/email-already-in-use':
        friendlyMessage = 'This email is already registered. Please login or use a different email.';
        break;
      case 'auth/invalid-email':
        friendlyMessage = 'Please enter a valid email address.';
        break;
      case 'auth/weak-password':
        friendlyMessage = 'Password is too weak. Please use a stronger password.';
        break;
      default:
        friendlyMessage = error.message || friendlyMessage;
    }

    regErrorMessage.textContent = friendlyMessage;
    regErrorMessage.style.display = 'block';
  }
}

// ===== Forgot Password =====
const forgotPasswordLink = document.querySelector('.forgot-password-link');
if (forgotPasswordLink) {
  forgotPasswordLink.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();

    if (!email) {
      errorMessage.textContent = 'Please enter your email address first.';
      errorMessage.style.display = 'block';
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      successMessage.textContent = 'Password reset email sent. Please check your inbox.';
      successMessage.style.display = 'block';
    } catch (error) {
      errorMessage.textContent = 'Failed to send reset email. Please check your email address.';
      errorMessage.style.display = 'block';
    }
  });
}

// ===== Authentication State Checker =====
export function checkAuthState() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is logged in
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            resolve({
              uid: user.uid,
              email: user.email,
              ...userDoc.data()
            });
          } else {
            // No profile found, sign out
            await signOut(auth);
            resolve(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          resolve(null);
        }
      } else {
        // User is not logged in
        resolve(null);
      }
    });
  });
}

// ===== Logout Function =====
export async function logoutUser() {
  try {
    await signOut(auth);
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Logout error:', error);
    alert('Failed to logout. Please try again.');
  }
}

// ===== Export =====
export { auth, db };
