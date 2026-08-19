// Announcements Module
// Handles announcement management and retrieval

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
  limit,
  getDoc
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const announcementsRef = collection(db, 'announcements');

// ===== Get All Announcements =====
export async function getAllAnnouncements() {
  try {
    const q = query(announcementsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const announcements = [];
    querySnapshot.forEach((doc) => {
      announcements.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return announcements;
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
}

// ===== Get Recent Announcements =====
export async function getRecentAnnouncements(count = 3) {
  try {
    const q = query(announcementsRef, orderBy('createdAt', 'desc'), limit(count));
    const querySnapshot = await getDocs(q);
    const announcements = [];
    querySnapshot.forEach((doc) => {
      announcements.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return announcements;
  } catch (error) {
    console.error('Error fetching recent announcements:', error);
    return [];
  }
}

// ===== Get Announcement by ID =====
export async function getAnnouncementById(announcementId) {
  try {
    const announcementDoc = await getDoc(doc(db, 'announcements', announcementId));
    if (announcementDoc.exists()) {
      return {
        id: announcementDoc.id,
        ...announcementDoc.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching announcement:', error);
    return null;
  }
}

// ===== Add Announcement =====
export async function addAnnouncement(announcementData) {
  try {
    const docRef = await addDoc(announcementsRef, {
      ...announcementData,
      createdAt: new Date().toISOString()
    });
    return {
      id: docRef.id,
      ...announcementData
    };
  } catch (error) {
    console.error('Error adding announcement:', error);
    throw error;
  }
}

// ===== Update Announcement =====
export async function updateAnnouncement(announcementId, announcementData) {
  try {
    await updateDoc(doc(db, 'announcements', announcementId), {
      ...announcementData,
      updatedAt: new Date().toISOString()
    });
    return {
      id: announcementId,
      ...announcementData
    };
  } catch (error) {
    console.error('Error updating announcement:', error);
    throw error;
  }
}

// ===== Delete Announcement =====
export async function deleteAnnouncement(announcementId) {
  try {
    await deleteDoc(doc(db, 'announcements', announcementId));
    return true;
  } catch (error) {
    console.error('Error deleting announcement:', error);
    throw error;
  }
}

// ===== Validate Announcement Data =====
export function validateAnnouncementData(data) {
  if (!data.title || data.title.trim() === '') {
    throw new Error('Announcement title is required.');
  }
  if (!data.message || data.message.trim() === '') {
    throw new Error('Announcement message is required.');
  }
}

// ===== Format Date for Display =====
export function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}
