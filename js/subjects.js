// Subjects Module
// Handles subject management and initialization

import { db } from './firebase-config.js';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  orderBy
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const subjectsRef = collection(db, 'subjects');

// Default subjects to initialize
const DEFAULT_SUBJECTS = [
  {
    subjectId: 'tamil',
    subjectCode: 'TAM101',
    subjectName: 'Tamil',
    createdAt: new Date().toISOString()
  },
  {
    subjectId: 'english',
    subjectCode: 'ENG101',
    subjectName: 'English',
    createdAt: new Date().toISOString()
  },
  {
    subjectId: 'python',
    subjectCode: 'PY101',
    subjectName: 'Python',
    createdAt: new Date().toISOString()
  },
  {
    subjectId: 'java',
    subjectCode: 'JAVA101',
    subjectName: 'Java',
    createdAt: new Date().toISOString()
  },
  {
    subjectId: 'data_structures',
    subjectCode: 'DS101',
    subjectName: 'Data Structures',
    createdAt: new Date().toISOString()
  },
  {
    subjectId: 'computer_networks',
    subjectCode: 'CN101',
    subjectName: 'Computer Networks',
    createdAt: new Date().toISOString()
  }
];

// ===== Initialize Default Subjects =====
export async function initializeDefaultSubjects() {
  try {
    for (const subject of DEFAULT_SUBJECTS) {
      const docRef = doc(db, 'subjects', subject.subjectId);
      const docSnap = await getDoc(docRef);

      // Only add if doesn't already exist
      if (!docSnap.exists()) {
        await setDoc(docRef, subject);
      }
    }
    return true;
  } catch (error) {
    console.error('Error initializing subjects:', error);
    return false;
  }
}

// ===== Get All Subjects =====
export async function getAllSubjects() {
  try {
    const q = query(subjectsRef, orderBy('subjectCode', 'asc'));
    const querySnapshot = await getDocs(q);
    const subjects = [];
    querySnapshot.forEach((doc) => {
      subjects.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return subjects;
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }
}

// ===== Get Subject by ID =====
export async function getSubjectById(subjectId) {
  try {
    const docSnap = await getDoc(doc(db, 'subjects', subjectId));
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching subject:', error);
    return null;
  }
}

// ===== Get Subject by Code =====
export async function getSubjectByCode(subjectCode) {
  try {
    const q = query(subjectsRef);
    const querySnapshot = await getDocs(q);
    
    for (const doc of querySnapshot.docs) {
      if (doc.data().subjectCode === subjectCode) {
        return {
          id: doc.id,
          ...doc.data()
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Error fetching subject by code:', error);
    return null;
  }
}
