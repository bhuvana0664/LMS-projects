// Staff Dashboard Module
// Handles all staff dashboard functionality

import { checkAuthState, logoutUser } from './auth.js';
import { db } from './firebase-config.js';
import { getAllCourses, addCourse, updateCourse, deleteCourse, validateCourseData } from './courses.js';
import { saveAttendance, validateAttendanceData, markSubjectAttendance, getAttendanceStats, getAllStudentAttendance } from './attendance.js';
import { getAllAssignments, addAssignment, updateAssignment, deleteAssignment, validateAssignmentData, formatDate } from './assignments.js';
import { getAllAnnouncements, addAnnouncement, updateAnnouncement, deleteAnnouncement, validateAnnouncementData } from './announcements.js';
import { initializeDefaultSubjects, getAllSubjects } from './subjects.js';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  getDoc
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

let currentUser = null;
let allStudents = [];
let allCourses = [];
let currentEditingId = null;

// ===== Initialize Dashboard =====
window.addEventListener('load', async () => {
  const user = await checkAuthState();

  if (!user || user.role !== 'staff') {
    window.location.href = 'login.html';
    return;
  }

  currentUser = user;
  await initializeDashboard();
});

// ===== Initialize Dashboard =====
async function initializeDashboard() {
  document.getElementById('userName').textContent = currentUser.name;

  // Initialize default subjects
  await initializeDefaultSubjects();

  // Setup page navigation
  setupPageNavigation();

  // Setup logout
  document.getElementById('logoutBtn').addEventListener('click', logoutUser);

  // Load initial data
  await loadAllStudents();
  allCourses = await getAllCourses();

  // Load dashboard
  await loadDashboardData();

  // Setup modals and event listeners
  setupCourseModal();
  setupAssignmentModal();
  setupAnnouncementModal();
  setupStudentDetailsModal();

  // Load all pages
  await loadStudentsPage();
  await loadCoursesPage();
  await loadAttendancePage();
  await loadAssignmentsPage();
  await loadAnnouncementsPage();
  await loadProfilePage();
}

// ===== Setup Page Navigation =====
function setupPageNavigation() {
  const sidebarLinks = document.querySelectorAll('.sidebar-link');

  sidebarLinks.forEach(link => {
    if (link.id === 'logoutBtn') return;

    link.addEventListener('click', function () {
      const pageName = this.dataset.page;

      sidebarLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');

      const pages = document.querySelectorAll('.page');
      pages.forEach(page => page.classList.remove('active'));

      const pageId = pageName + 'Page';
      const targetPage = document.getElementById(pageId);
      if (targetPage) {
        targetPage.classList.add('active');
        document.getElementById('pageTitle').textContent = 
          pageName.charAt(0).toUpperCase() + pageName.slice(1);
      }
    });
  });
}

// ===== Load All Students =====
async function loadAllStudents() {
  try {
    const q = query(collection(db, 'users'), where('role', '==', 'student'));
    const querySnapshot = await getDocs(q);
    allStudents = [];
    querySnapshot.forEach((doc) => {
      allStudents.push({
        id: doc.id,
        ...doc.data()
      });
    });
  } catch (error) {
    console.error('Error loading students:', error);
  }
}

// ===== Load Dashboard Data =====
async function loadDashboardData() {
  try {
    document.getElementById('totalStudentsCard').textContent = allStudents.length;
    document.getElementById('totalCoursesCard').textContent = allCourses.length;

    const assignments = await getAllAssignments();
    document.getElementById('totalAssignmentsCard').textContent = assignments.length;

    const announcements = await getAllAnnouncements();
    document.getElementById('totalAnnouncementsCard').textContent = announcements.length;
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

// ===== Load Students Page =====
async function loadStudentsPage() {
  try {
    const searchInput = document.getElementById('studentSearch');
    const deptFilter = document.getElementById('departmentFilter');
    const tableBody = document.getElementById('studentsTableBody');

    // Filter and display students
    async function displayStudents() {
      const searchTerm = searchInput.value.toLowerCase();
      const deptTerm = deptFilter.value;

      tableBody.innerHTML = '';

      let filtered = allStudents.filter(student => {
        const matchSearch = student.name.toLowerCase().includes(searchTerm) ||
                           student.studentId.toLowerCase().includes(searchTerm);
        const matchDept = !deptTerm || student.department === deptTerm;
        return matchSearch && matchDept;
      });

      if (filtered.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="empty-state">No students found</td></tr>';
        return;
      }

      filtered.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${student.name}</td>
          <td>${student.studentId}</td>
          <td>${student.email}</td>
          <td>${student.department}</td>
          <td>${student.year}</td>
          <td>
            <button class="btn btn-primary" style="font-size: 12px;" onclick="viewStudentDetails('${student.id}')">View</button>
          </td>
        `;
        tableBody.appendChild(row);
      });
    }

    searchInput.addEventListener('input', displayStudents);
    deptFilter.addEventListener('change', displayStudents);

    await displayStudents();
  } catch (error) {
    console.error('Error loading students page:', error);
  }
}

// ===== View Student Details (Global) =====
window.viewStudentDetails = async function (studentId) {
  const student = allStudents.find(s => s.id === studentId);
  if (!student) return;

  document.getElementById('detailName').value = student.name;
  document.getElementById('detailEmail').value = student.email;
  document.getElementById('detailStudentId').value = student.studentId;
  document.getElementById('detailDepartment').value = student.department;
  document.getElementById('detailYear').value = student.year;
  document.getElementById('detailPhone').value = student.phone || '';

  const modal = document.getElementById('studentDetailsModal');
  modal.style.display = 'flex';

  const form = document.getElementById('studentDetailsForm');
  form.onsubmit = async (e) => {
    e.preventDefault();
    
    try {
      await updateDoc(doc(db, 'users', studentId), {
        name: document.getElementById('detailName').value,
        department: document.getElementById('detailDepartment').value,
        year: document.getElementById('detailYear').value,
        phone: document.getElementById('detailPhone').value
      });

      document.getElementById('studentDetailsMessage').textContent = 'Student updated successfully!';
      document.getElementById('studentDetailsMessage').className = 'message success-message';
      document.getElementById('studentDetailsMessage').style.display = 'block';

      setTimeout(() => {
        modal.style.display = 'none';
        loadAllStudents();
        loadStudentsPage();
      }, 1500);
    } catch (error) {
      document.getElementById('studentDetailsMessage').textContent = 'Failed to update student.';
      document.getElementById('studentDetailsMessage').className = 'message error-message';
      document.getElementById('studentDetailsMessage').style.display = 'block';
    }
  };
};

// ===== Setup Course Modal =====
function setupCourseModal() {
  const modal = document.getElementById('courseModal');
  const closeBtn = document.getElementById('closeCourseModal');
  const addBtn = document.getElementById('addCourseBtn');
  const form = document.getElementById('courseForm');

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    form.reset();
    currentEditingId = null;
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      form.reset();
      currentEditingId = null;
    }
  });

  addBtn.addEventListener('click', () => {
    currentEditingId = null;
    document.getElementById('courseModalTitle').textContent = 'Add Course';
    form.reset();
    modal.style.display = 'flex';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveCourse();
  });
}

// ===== Save Course =====
async function saveCourse() {
  const courseData = {
    courseName: document.getElementById('courseName').value.trim(),
    courseCode: document.getElementById('courseCode').value.trim(),
    facultyName: document.getElementById('courseFacultyName').value.trim(),
    department: document.getElementById('courseDepartment').value,
    semester: document.getElementById('courseSemester').value,
    description: document.getElementById('courseDescription').value.trim()
  };

  try {
    validateCourseData(courseData);

    if (currentEditingId) {
      await updateCourse(currentEditingId, courseData);
    } else {
      await addCourse(courseData);
    }

    document.getElementById('courseMessage').textContent = 'Course saved successfully!';
    document.getElementById('courseMessage').className = 'message success-message';
    document.getElementById('courseMessage').style.display = 'block';

    setTimeout(() => {
      document.getElementById('courseModal').style.display = 'none';
      document.getElementById('courseForm').reset();
      currentEditingId = null;
      allCourses = awaitgetAllCourses();
      loadCoursesPage();
      loadDashboardData();
    }, 1000);
  } catch (error) {
    document.getElementById('courseMessage').textContent = error.message;
    document.getElementById('courseMessage').className = 'message error-message';
    document.getElementById('courseMessage').style.display = 'block';
  }
}

// ===== Load Courses Page =====
async function loadCoursesPage() {
  try {
    const coursesList = document.getElementById('coursesList');
    coursesList.innerHTML = '';

    if (allCourses.length === 0) {
      coursesList.innerHTML = '<p class="empty-state">No courses available</p>';
      return;
    }

    allCourses.forEach(course => {
      const card = document.createElement('div');
      card.className = 'course-card';
      card.innerHTML = `
        <div class="course-header">
          <div class="course-code">${course.courseCode}</div>
          <h3 class="course-name">${course.courseName}</h3>
        </div>
        <div class="course-body">
          <p><strong>Faculty:</strong> ${course.facultyName}</p>
          <p><strong>Department:</strong> ${course.department}</p>
          <p><strong>Semester:</strong> ${course.semester}</p>
          <p>${course.description || 'No description'}</p>
          <div class="course-actions">
            <button class="btn btn-primary" onclick="editCourse('${course.id}')">Edit</button>
            <button class="btn btn-secondary" onclick="deleteCourseAction('${course.id}')">Delete</button>
          </div>
        </div>
      `;
      coursesList.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading courses:', error);
  }
}

// ===== Edit Course (Global) =====
window.editCourse = async function (courseId) {
  const course = allCourses.find(c => c.id === courseId);
  if (!course) return;

  currentEditingId = courseId;
  document.getElementById('courseModalTitle').textContent = 'Edit Course';
  document.getElementById('courseName').value = course.courseName;
  document.getElementById('courseCode').value = course.courseCode;
  document.getElementById('courseFacultyName').value = course.facultyName;
  document.getElementById('courseDepartment').value = course.department;
  document.getElementById('courseSemester').value = course.semester;
  document.getElementById('courseDescription').value = course.description || '';

  document.getElementById('courseModal').style.display = 'flex';
};

// ===== Delete Course (Global) =====
window.deleteCourseAction = async function (courseId) {
  if (!confirm('Are you sure you want to delete this course?')) return;

  try {
    await deleteCourse(courseId);
    allCourses = await getAllCourses();
    await loadCoursesPage();
    await loadDashboardData();
  } catch (error) {
    alert('Failed to delete course: ' + error.message);
  }
};

// ===== Load Attendance Page =====
async function loadAttendancePage() {
  try {
    const subjectSelect = document.getElementById('attendanceCourse'); // Reusing for subjects
    const attendanceContainer = document.getElementById('attendanceContainer');
    const form = document.getElementById('attendanceForm');
    const allSubjects = await getAllSubjects();
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Populate subject dropdown
    subjectSelect.innerHTML = '<option value="">Choose a subject...</option>';
    allSubjects.forEach(subject => {
      const option = document.createElement('option');
      option.value = subject.id; // subjectId
      option.textContent = `${subject.subjectName} (${subject.subjectCode})`;
      subjectSelect.appendChild(option);
    });

    // Form submit - show all students for the selected subject
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await showStudentsForAttendance();
    });
  } catch (error) {
    console.error('Error loading attendance page:', error);
  }
}

// ===== Show All Students for Attendance Marking =====
async function showStudentsForAttendance() {
  const subjectId = document.getElementById('attendanceCourse').value;
  const attendanceContainer = document.getElementById('attendanceContainer');

  if (!subjectId) {
    alert('Please select a subject.');
    return;
  }

  // Get today's date
  const today = new Date().toISOString().split('T')[0];
  
  // Build student list with checkboxes
  let html = `
    <div class="attendance-section">
      <h3>Mark Attendance for ${document.querySelector(`#attendanceCourse option[value="${subjectId}"]`).textContent}</h3>
      <p style="font-size: 12px; color: #666; margin-bottom: 15px;">Date: ${today}</p>
      
      <div class="attendance-list" style="max-height: 400px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px;">
        <table class="attendance-table" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f5f5f5; position: sticky; top: 0;">
              <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Student</th>
              <th style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd; width: 120px;">Present</th>
              <th style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd; width: 120px;">Absent</th>
            </tr>
          </thead>
          <tbody>
  `;

  allStudents.forEach(student => {
    html += `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px;">
          <strong>${student.name}</strong><br/>
          <span style="font-size: 12px; color: #666;">${student.studentId}</span>
        </td>
        <td style="padding: 10px; text-align: center;">
          <input type="radio" name="attendance_${student.id}" value="present" 
                 data-student-id="${student.id}" data-subject-id="${subjectId}" class="attendance-radio">
        </td>
        <td style="padding: 10px; text-align: center;">
          <input type="radio" name="attendance_${student.id}" value="absent" 
                 data-student-id="${student.id}" data-subject-id="${subjectId}" class="attendance-radio">
        </td>
      </tr>
    `;
  });

  html += `
          </tbody>
        </table>
      </div>
      
      <div style="margin-top: 15px; display: flex; gap: 10px;">
        <button type="button" class="btn btn-primary" onclick="saveAllAttendance('${subjectId}', '${today}')">
          💾 Save Attendance
        </button>
        <button type="button" class="btn btn-secondary" onclick="clearAttendanceForm()">
          ✕ Clear
        </button>
      </div>
      
      <div id="attendanceMessage" class="message" style="display: none; margin-top: 15px;"></div>
    </div>
  `;

  attendanceContainer.innerHTML = html;
}

// ===== Save All Attendance Records (Global) =====
window.saveAllAttendance = async function (subjectId, attendanceDate) {
  const radioButtons = document.querySelectorAll('.attendance-radio');
  const attendanceMap = {};
  
  // Collect attendance data
  radioButtons.forEach(radio => {
    if (radio.checked) {
      const studentId = radio.getAttribute('data-student-id');
      const status = radio.value === 'present' ? 'Present' : 'Absent';
      attendanceMap[studentId] = status;
    }
  });
  
  if (Object.keys(attendanceMap).length === 0) {
    alert('Please mark attendance for at least one student.');
    return;
  }

  try {
    const messageEl = document.getElementById('attendanceMessage');
    messageEl.textContent = 'Saving attendance...';
    messageEl.className = 'message';
    messageEl.style.display = 'block';

    let savedCount = 0;
    for (const [studentUID, status] of Object.entries(attendanceMap)) {
      await markSubjectAttendance(studentUID, subjectId, status);
      savedCount++;
    }

    messageEl.textContent = `✓ Attendance saved successfully for ${savedCount} students!`;
    messageEl.className = 'message success-message';
    messageEl.style.display = 'block';

    setTimeout(() => {
      document.getElementById('attendanceForm').reset();
      document.getElementById('attendanceContainer').innerHTML = '';
      messageEl.style.display = 'none';
    }, 2000);
  } catch (error) {
    const messageEl = document.getElementById('attendanceMessage');
    messageEl.textContent = 'Failed to save attendance: ' + error.message;
    messageEl.className = 'message error-message';
    messageEl.style.display = 'block';
    console.error('Error saving attendance:', error);
  }
};

// ===== Clear Attendance Form (Global) =====
window.clearAttendanceForm = function () {
  document.getElementById('attendanceForm').reset();
  document.getElementById('attendanceContainer').innerHTML = '';
  document.getElementById('attendanceMessage').style.display = 'none';
};

// ===== OLD Save Attendance Record (Kept for backward compatibility) =====
async function saveAttendanceRecord() {
  const studentId = document.getElementById('attendanceStudent').value;
  const courseId = document.getElementById('attendanceCourse').value;
  const totalClasses = parseInt(document.getElementById('totalClasses').value);
  const presentClasses = parseInt(document.getElementById('presentClasses').value);
  const absentClasses = parseInt(document.getElementById('absentClasses').value);

  if (!studentId || !courseId) {
    alert('Please select both student and course.');
    return;
  }

  const student = allStudents.find(s => s.id === studentId);
  const course = allCourses.find(c => c.id === courseId);

  const attendanceData = {
    studentId,
    courseId,
    courseName: course.courseName,
    totalClasses,
    present: presentClasses,
    absent: absentClasses
  };

  try {
    validateAttendanceData(attendanceData);
    await saveAttendance(attendanceData);

    document.getElementById('attendanceMessage').textContent = 'Attendance saved successfully!';
    document.getElementById('attendanceMessage').className = 'message success-message';
    document.getElementById('attendanceMessage').style.display = 'block';

    setTimeout(() => {
      document.getElementById('attendanceForm').reset();
      document.getElementById('attendanceMessage').style.display = 'none';
    }, 2000);
  } catch (error) {
    document.getElementById('attendanceMessage').textContent = error.message;
    document.getElementById('attendanceMessage').className = 'message error-message';
    document.getElementById('attendanceMessage').style.display = 'block';
  }
}

// ===== Setup Assignment Modal =====
function setupAssignmentModal() {
  const modal = document.getElementById('assignmentModal');
  const closeBtn = document.getElementById('closeAssignmentModal');
  const addBtn = document.getElementById('addAssignmentBtn');
  const form = document.getElementById('assignmentForm');

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    form.reset();
    currentEditingId = null;
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      form.reset();
      currentEditingId = null;
    }
  });

  addBtn.addEventListener('click', () => {
    currentEditingId = null;
    document.getElementById('assignmentModalTitle').textContent = 'Add Assignment';
    form.reset();

    // Populate course dropdown
    const courseSelect = document.getElementById('assignmentCourse');
    courseSelect.innerHTML = '<option value="">Select a course...</option>';
    allCourses.forEach(course => {
      const option = document.createElement('option');
      option.value = course.id;
      option.textContent = course.courseName;
      courseSelect.appendChild(option);
    });

    modal.style.display = 'flex';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveAssignment();
  });
}

// ===== Save Assignment =====
async function saveAssignment() {
  const assignmentData = {
    title: document.getElementById('assignmentTitle').value.trim(),
    courseId: document.getElementById('assignmentCourse').value,
    courseName: allCourses.find(c => c.id === document.getElementById('assignmentCourse').value)?.courseName || '',
    description: document.getElementById('assignmentDescription').value.trim(),
    dueDate: document.getElementById('assignmentDueDate').value
  };

  try {
    validateAssignmentData(assignmentData);

    if (currentEditingId) {
      await updateAssignment(currentEditingId, assignmentData);
    } else {
      await addAssignment(assignmentData);
    }

    document.getElementById('assignmentMessage').textContent = 'Assignment saved successfully!';
    document.getElementById('assignmentMessage').className = 'message success-message';
    document.getElementById('assignmentMessage').style.display = 'block';

    setTimeout(() => {
      document.getElementById('assignmentModal').style.display = 'none';
      document.getElementById('assignmentForm').reset();
      currentEditingId = null;
      loadAssignmentsPage();
      loadDashboardData();
    }, 1000);
  } catch (error) {
    document.getElementById('assignmentMessage').textContent = error.message;
    document.getElementById('assignmentMessage').className = 'message error-message';
    document.getElementById('assignmentMessage').style.display = 'block';
  }
}

// ===== Load Assignments Page =====
async function loadAssignmentsPage() {
  try {
    const assignments = await getAllAssignments();
    const assignmentsList = document.getElementById('assignmentsList');
    assignmentsList.innerHTML = '';

    if (assignments.length === 0) {
      assignmentsList.innerHTML = '<p class="empty-state">No assignments</p>';
      return;
    }

    assignments.forEach(assignment => {
      const card = document.createElement('div');
      card.className = 'assignment-card';
      card.innerHTML = `
        <div class="assignment-header">
          <h3 class="assignment-title">${assignment.title}</h3>
        </div>
        <div class="assignment-meta">
          <div><strong>Course:</strong> ${assignment.courseName}</div>
          <div><strong>Due:</strong> ${formatDate(assignment.dueDate)}</div>
        </div>
        <p class="assignment-description">${assignment.description || 'No description'}</p>
        <div class="assignment-actions">
          <button class="btn btn-primary" onclick="editAssignment('${assignment.id}')">Edit</button>
          <button class="btn btn-secondary" onclick="deleteAssignmentAction('${assignment.id}')">Delete</button>
        </div>
      `;
      assignmentsList.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading assignments:', error);
  }
}

// ===== Edit Assignment (Global) =====
window.editAssignment = async function (assignmentId) {
  const assignments = await getAllAssignments();
  const assignment = assignments.find(a => a.id === assignmentId);
  if (!assignment) return;

  currentEditingId = assignmentId;
  document.getElementById('assignmentModalTitle').textContent = 'Edit Assignment';
  document.getElementById('assignmentTitle').value = assignment.title;
  document.getElementById('assignmentDescription').value = assignment.description || '';
  document.getElementById('assignmentDueDate').value = assignment.dueDate;

  const courseSelect = document.getElementById('assignmentCourse');
  courseSelect.innerHTML = '<option value="">Select a course...</option>';
  allCourses.forEach(course => {
    const option = document.createElement('option');
    option.value = course.id;
    option.textContent = course.courseName;
    if (course.id === assignment.courseId) option.selected = true;
    courseSelect.appendChild(option);
  });

  document.getElementById('assignmentModal').style.display = 'flex';
};

// ===== Delete Assignment (Global) =====
window.deleteAssignmentAction = async function (assignmentId) {
  if (!confirm('Are you sure you want to delete this assignment?')) return;

  try {
    await deleteAssignment(assignmentId);
    await loadAssignmentsPage();
    await loadDashboardData();
  } catch (error) {
    alert('Failed to delete assignment: ' + error.message);
  }
};

// ===== Setup Announcement Modal =====
function setupAnnouncementModal() {
  const modal = document.getElementById('announcementModal');
  const closeBtn = document.getElementById('closeAnnouncementModal');
  const addBtn = document.getElementById('addAnnouncementBtn');
  const form = document.getElementById('announcementForm');

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    form.reset();
    currentEditingId = null;
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      form.reset();
      currentEditingId = null;
    }
  });

  addBtn.addEventListener('click', () => {
    currentEditingId = null;
    document.getElementById('announcementModalTitle').textContent = 'Create Announcement';
    form.reset();
    modal.style.display = 'flex';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveAnnouncement();
  });
}

// ===== Save Announcement =====
async function saveAnnouncement() {
  const announcementData = {
    title: document.getElementById('announcementTitle').value.trim(),
    message: document.getElementById('announcementMessage').value.trim(),
    staffName: currentUser.name
  };

  try {
    validateAnnouncementData(announcementData);

    if (currentEditingId) {
      await updateAnnouncement(currentEditingId, announcementData);
    } else {
      await addAnnouncement(announcementData);
    }

    const messageEl = document.getElementById('announcementMessage');
    messageEl.textContent = 'Announcement posted successfully!';
    messageEl.className = 'message success-message';
    messageEl.style.display = 'block';

    setTimeout(() => {
      document.getElementById('announcementModal').style.display = 'none';
      document.getElementById('announcementForm').reset();
      currentEditingId = null;
      loadAnnouncementsPage();
      loadDashboardData();
    }, 1000);
  } catch (error) {
    const messageEl = document.getElementById('announcementMessage');
    messageEl.textContent = error.message;
    messageEl.className = 'message error-message';
    messageEl.style.display = 'block';
  }
}

// ===== Load Announcements Page =====
async function loadAnnouncementsPage() {
  try {
    const announcements = await getAllAnnouncements();
    const announcementsList = document.getElementById('announcementsList');
    announcementsList.innerHTML = '';

    if (announcements.length === 0) {
      announcementsList.innerHTML = '<p class="empty-state">No announcements</p>';
      return;
    }

    announcements.forEach(announcement => {
      const card = document.createElement('div');
      card.className = 'announcement-card';

      const createdDate = new Date(announcement.createdAt);
      const formattedDate = createdDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      card.innerHTML = `
        <h3 class="announcement-title">${announcement.title}</h3>
        <div class="announcement-meta">
          <span>${formattedDate}</span>
        </div>
        <p class="announcement-message">${announcement.message}</p>
        <div class="announcement-actions">
          <button class="btn btn-primary" onclick="editAnnouncement('${announcement.id}')">Edit</button>
          <button class="btn btn-secondary" onclick="deleteAnnouncementAction('${announcement.id}')">Delete</button>
        </div>
      `;
      announcementsList.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading announcements:', error);
  }
}

// ===== Edit Announcement (Global) =====
window.editAnnouncement = async function (announcementId) {
  const announcements = await getAllAnnouncements();
  const announcement = announcements.find(a => a.id === announcementId);
  if (!announcement) return;

  currentEditingId = announcementId;
  document.getElementById('announcementModalTitle').textContent = 'Edit Announcement';
  document.getElementById('announcementTitle').value = announcement.title;
  document.getElementById('announcementMessage').value = announcement.message;

  document.getElementById('announcementModal').style.display = 'flex';
};

// ===== Delete Announcement (Global) =====
window.deleteAnnouncementAction = async function (announcementId) {
  if (!confirm('Are you sure you want to delete this announcement?')) return;

  try {
    await deleteAnnouncement(announcementId);
    await loadAnnouncementsPage();
    await loadDashboardData();
  } catch (error) {
    alert('Failed to delete announcement: ' + error.message);
  }
};

// ===== Setup Student Details Modal =====
function setupStudentDetailsModal() {
  const modal = document.getElementById('studentDetailsModal');
  const closeBtn = document.getElementById('closeStudentDetailsModal');

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
}

// ===== Load Profile Page =====
async function loadProfilePage() {
  try {
    document.getElementById('profileName').value = currentUser.name || '';
    document.getElementById('profileEmail').value = currentUser.email || '';
    document.getElementById('profilePhone').value = currentUser.phone || '';
    document.getElementById('profileDepartment').value = currentUser.department || '';

    document.getElementById('profileForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      await updateProfile();
    });
  } catch (error) {
    console.error('Error loading profile:', error);
  }
}

// ===== Update Profile =====
async function updateProfile() {
  try {
    const phone = document.getElementById('profilePhone').value.trim();
    const department = document.getElementById('profileDepartment').value.trim();

    await updateDoc(doc(db, 'users', currentUser.uid), {
      phone,
      department
    });

    const messageEl = document.getElementById('profileMessage');
    messageEl.textContent = 'Profile updated successfully!';
    messageEl.className = 'message success-message';
    messageEl.style.display = 'block';

    setTimeout(() => {
      messageEl.style.display = 'none';
    }, 3000);
  } catch (error) {
    const messageEl = document.getElementById('profileMessage');
    messageEl.textContent = 'Failed to update profile.';
    messageEl.className = 'message error-message';
    messageEl.style.display = 'block';
  }
}
