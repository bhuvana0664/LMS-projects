// Courses Module
// Handles course management and retrieval

import { db } from './firebase-config.js';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  getDoc
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const coursesRef = collection(db, 'courses');

// ===== Get All Courses =====
export async function getAllCourses() {
  try {
    const q = query(coursesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const courses = [];
    querySnapshot.forEach((doc) => {
      courses.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return courses;
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}

// ===== Get Course by ID =====
export async function getCourseById(courseId) {
  try {
    const courseDoc = await getDoc(doc(db, 'courses', courseId));
    if (courseDoc.exists()) {
      return {
        id: courseDoc.id,
        ...courseDoc.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching course:', error);
    return null;
  }
}

// ===== Add Course =====
export async function addCourse(courseData) {
  try {
    const docRef = await addDoc(coursesRef, {
      ...courseData,
      createdAt: new Date().toISOString()
    });
    return {
      id: docRef.id,
      ...courseData
    };
  } catch (error) {
    console.error('Error adding course:', error);
    throw error;
  }
}

// ===== Update Course =====
export async function updateCourse(courseId, courseData) {
  try {
    await updateDoc(doc(db, 'courses', courseId), {
      ...courseData,
      updatedAt: new Date().toISOString()
    });
    return {
      id: courseId,
      ...courseData
    };
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
}

// ===== Delete Course =====
export async function deleteCourse(courseId) {
  try {
    await deleteDoc(doc(db, 'courses', courseId));
    return true;
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
}

// ===== Validate Course Data =====
export function validateCourseData(data) {
  if (!data.courseName || data.courseName.trim() === '') {
    throw new Error('Course name is required.');
  }
  if (!data.courseCode || data.courseCode.trim() === '') {
    throw new Error('Course code is required.');
  }
  if (!data.facultyName || data.facultyName.trim() === '') {
    throw new Error('Faculty name is required.');
  }
  if (!data.department || data.department.trim() === '') {
    throw new Error('Department is required.');
  }
  if (!data.semester || data.semester.trim() === '') {
    throw new Error('Semester is required.');
  }
}

// ===== Format Course for Display =====
export function formatCourseDisplay(course) {
  return {
    id: course.id,
    name: course.courseName || 'N/A',
    code: course.courseCode || 'N/A',
    faculty: course.facultyName || 'N/A',
    department: course.department || 'N/A',
    semester: course.semester || 'N/A',
    description: course.description || 'No description available'
  };
}
