// Assignments Module
// Handles assignment management and retrieval

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

const assignmentsRef = collection(db, 'assignments');

// ===== Get All Assignments =====
export async function getAllAssignments() {
  try {
    const q = query(assignmentsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const assignments = [];
    querySnapshot.forEach((doc) => {
      assignments.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return assignments;
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return [];
  }
}

// ===== Get Assignment by ID =====
export async function getAssignmentById(assignmentId) {
  try {
    const assignmentDoc = await getDoc(doc(db, 'assignments', assignmentId));
    if (assignmentDoc.exists()) {
      return {
        id: assignmentDoc.id,
        ...assignmentDoc.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching assignment:', error);
    return null;
  }
}

// ===== Add Assignment =====
export async function addAssignment(assignmentData) {
  try {
    const docRef = await addDoc(assignmentsRef, {
      ...assignmentData,
      createdAt: new Date().toISOString()
    });
    return {
      id: docRef.id,
      ...assignmentData
    };
  } catch (error) {
    console.error('Error adding assignment:', error);
    throw error;
  }
}

// ===== Update Assignment =====
export async function updateAssignment(assignmentId, assignmentData) {
  try {
    await updateDoc(doc(db, 'assignments', assignmentId), {
      ...assignmentData,
      updatedAt: new Date().toISOString()
    });
    return {
      id: assignmentId,
      ...assignmentData
    };
  } catch (error) {
    console.error('Error updating assignment:', error);
    throw error;
  }
}

// ===== Delete Assignment =====
export async function deleteAssignment(assignmentId) {
  try {
    await deleteDoc(doc(db, 'assignments', assignmentId));
    return true;
  } catch (error) {
    console.error('Error deleting assignment:', error);
    throw error;
  }
}

// ===== Validate Assignment Data =====
export function validateAssignmentData(data) {
  if (!data.title || data.title.trim() === '') {
    throw new Error('Assignment title is required.');
  }
  if (!data.courseId || data.courseId.trim() === '') {
    throw new Error('Course selection is required.');
  }
  if (!data.dueDate || data.dueDate.trim() === '') {
    throw new Error('Due date is required.');
  }
}

// ===== Determine Assignment Status =====
export function getAssignmentStatus(dueDate) {
  const now = new Date();
  const due = new Date(dueDate);

  if (due < now) {
    return 'overdue';
  } else if (due.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
    return 'pending';
  } else {
    return 'pending';
  }
}

// ===== Format Date for Display =====
export function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

// ===== Get Pending Assignments Count =====
export async function getPendingAssignmentsCount() {
  try {
    const assignments = await getAllAssignments();
    return assignments.filter(a => getAssignmentStatus(a.dueDate) === 'pending').length;
  } catch (error) {
    console.error('Error counting pending assignments:', error);
    return 0;
  }
}
