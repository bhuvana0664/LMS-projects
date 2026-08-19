// Student Dashboard Module
// Handles all student dashboard functionality

import { checkAuthState, logoutUser, auth } from './auth.js';
import { db } from './firebase-config.js';
import { getAllCourses } from './courses.js';
import { getAllStudentAttendance, getAttendanceSummaryBySubject, checkLowAttendance } from './attendance.js';
import { getAllAssignments, getAssignmentStatus, formatDate } from './assignments.js';
import { getRecentAnnouncements, getAllAnnouncements } from './announcements.js';
import { getAllSubjects } from './subjects.js';
import { doc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

let currentUser = null;

// ===== Initialize Dashboard =====
window.addEventListener('load', async () => {
  const user = await checkAuthState();

  if (!user || user.role !== 'student') {
    window.location.href = 'login.html';
    return;
  }

  currentUser = user;
  await initializeDashboard();
});

// ===== Initialize Dashboard =====
async function initializeDashboard() {
  // Update user name
  document.getElementById('userName').textContent = currentUser.name;

  // Setup page navigation
  setupPageNavigation();

  // Setup logout
  document.getElementById('logoutBtn').addEventListener('click', logoutUser);

  // Load dashboard data
  await loadDashboardData();

  // Load all page data
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

      // Update active link
      sidebarLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');

      // Update active page
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

// ===== Load Dashboard Data =====
async function loadDashboardData() {
  try {
    // Load dashboard cards
    const courses = await getAllCourses();
    document.getElementById('totalCoursesCard').textContent = courses.length;

    // Calculate average attendance from all subjects
    const attendanceSummary = await getAttendanceSummaryBySubject(currentUser.uid);
    let totalPercentage = 0;
    if (attendanceSummary.length > 0) {
      totalPercentage = Math.round(
        attendanceSummary.reduce((sum, s) => sum + s.percentage, 0) / attendanceSummary.length
      );
    }
    document.getElementById('avgAttendanceCard').textContent = totalPercentage + '%';

    const assignments = await getAllAssignments();
    const pendingCount = assignments.filter(a => getAssignmentStatus(a.dueDate) !== 'overdue').length;
    document.getElementById('pendingAssignmentsCard').textContent = pendingCount;

    const announcements = await getRecentAnnouncements(100);
    document.getElementById('latestAnnouncementsCard').textContent = announcements.length;

    // Load recent announcements
    const recentAnnouncements = await getRecentAnnouncements(3);
    const announcementsList = document.getElementById('recentAnnouncementsList');
    announcementsList.innerHTML = '';

    if (recentAnnouncements.length === 0) {
      announcementsList.innerHTML = '<p class="empty-state">No announcements yet</p>';
      return;
    }

    recentAnnouncements.forEach(announcement => {
      const card = createAnnouncementCard(announcement);
      announcementsList.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

// ===== Load Courses Page =====
async function loadCoursesPage() {
  try {
    const courses = await getAllCourses();
    const coursesList = document.getElementById('coursesList');
    coursesList.innerHTML = '';

    if (courses.length === 0) {
      coursesList.innerHTML = '<p class="empty-state">No courses available</p>';
      return;
    }

    courses.forEach(course => {
      const card = createCourseCard(course);
      coursesList.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading courses:', error);
  }
}

// ===== Load Attendance Page =====
async function loadAttendance() {

    const q = query(
        collection(db, "attendance"),
        where("studentId", "==", student.studentId)
    );

    const snapshot = await getDocs(q);

    const container = document.getElementById(
        "attendanceContainer"
    );

    container.innerHTML = "";

    if (snapshot.empty) {

        container.innerHTML = `
            <div class="data-card">
                <p>No attendance records yet.</p>
            </div>
        `;

        document.getElementById(
            "attendancePercent"
        ).textContent = "0%";

        return;
    }

    const subjectSummary = {};

    snapshot.forEach((docSnapshot) => {

        const data = docSnapshot.data();

        const subjectId = data.subjectId;

        if (!subjectSummary[subjectId]) {

            subjectSummary[subjectId] = {
                total: 0,
                present: 0,
                absent: 0
            };
        }

        subjectSummary[subjectId].total++;

        if (data.status === "Present") {
            subjectSummary[subjectId].present++;
        }

        if (data.status === "Absent") {
            subjectSummary[subjectId].absent++;
        }
    });


    const subjectsSnapshot = await getDocs(
        collection(db, "subjects")
    );


    const subjectNames = {};

    subjectsSnapshot.forEach((docSnapshot) => {

        const data = docSnapshot.data();

        subjectNames[data.subjectId] =
            data.subjectName;
    });


    let totalClasses = 0;
    let totalPresent = 0;


    let html = `
        <div class="attendance-table">

            <table>

                <thead>

                    <tr>

                        <th>Subject</th>

                        <th>Total Classes</th>

                        <th>Present</th>

                        <th>Absent</th>

                        <th>Percentage</th>

                    </tr>

                </thead>

                <tbody>
    `;


    Object.keys(subjectSummary).forEach(
        (subjectId) => {

            const data =
                subjectSummary[subjectId];

            const percentage =
                data.total === 0
                    ? 0
                    : (
                        data.present /
                        data.total
                    ) * 100;


            totalClasses += data.total;

            totalPresent += data.present;


            html += `

                <tr>

                    <td>
                        ${
                            subjectNames[subjectId]
                            || subjectId
                        }
                    </td>

                    <td>
                        ${data.total}
                    </td>

                    <td>
                        ${data.present}
                    </td>

                    <td>
                        ${data.absent}
                    </td>

                    <td>
                        ${percentage.toFixed(2)}%
                    </td>

                </tr>
            `;
        }
    );


    html += `
                </tbody>

            </table>

        </div>
    `;


    container.innerHTML = html;


    const overallPercentage =
        totalClasses === 0
            ? 0
            : (
                totalPresent /
                totalClasses
            ) * 100;


    document.getElementById(
        "attendancePercent"
    ).textContent =
        overallPercentage.toFixed(2);
}
async function loadAttendancePage() {
  try {
    // Get all subjects and attendance summary
    const allSubjects = await getAllSubjects();
    const attendanceSummary = await getAttendanceSummaryBySubject(currentUser.uid);
    const allAttendanceRecords = await getAllStudentAttendance(currentUser.uid);
    
    const tableBody = document.getElementById('attendanceTableBody');
    tableBody.innerHTML = '';

    // Check if any attendance is low
    const hasLowAttendance = await checkLowAttendance(currentUser.uid);
    document.getElementById('attendanceWarning').style.display = hasLowAttendance ? 'block' : 'none';

    // Create a map of subject data
    const subjectMap = {};
    allSubjects.forEach(subject => {
      subjectMap[subject.id] = subject;
    });

    // If no attendance records, show empty state
    if (attendanceSummary.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5" class="empty-state">No attendance records yet</td></tr>';
      return;
    }

    // Sort by subject name
    attendanceSummary.sort((a, b) => {
      const nameA = subjectMap[a.subjectId]?.subjectName || a.subjectId;
      const nameB = subjectMap[b.subjectId]?.subjectName || b.subjectId;
      return nameA.localeCompare(nameB);
    });

    // Display subject-wise summary
    attendanceSummary.forEach(summary => {
      const subject = subjectMap[summary.subjectId];
      const subjectName = subject ? subject.subjectName : summary.subjectId;
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${subjectName}</td>
        <td>${summary.total}</td>
        <td>${summary.present}</td>
        <td>${summary.absent}</td>
        <td>${summary.percentage}%</td>
      `;
      tableBody.appendChild(row);
    });

    // Show detailed records section
    const detailsContainer = document.getElementById('attendanceDetailsContainer');
    if (detailsContainer) {
      detailsContainer.innerHTML = '';
      
      if (allAttendanceRecords.length > 0) {
        let detailsHtml = '<h3 style="margin-top: 30px; margin-bottom: 15px;">Detailed Attendance Records</h3>';
        detailsHtml += '<div class="table-container"><table class="data-table"><thead><tr><th>Date</th><th>Subject</th><th>Status</th></tr></thead><tbody>';
        
        allAttendanceRecords.forEach(record => {
          const subject = subjectMap[record.subjectId];
          const subjectName = subject ? subject.subjectName : record.subjectId;
          const statusClass = record.status === 'Present' ? 'status-present' : 'status-absent';
          const statusIcon = record.status === 'Present' ? '✓' : '✗';
          
          detailsHtml += `
            <tr>
              <td>${record.date}</td>
              <td>${subjectName}</td>
              <td><span class="${statusClass}">${statusIcon} ${record.status}</span></td>
            </tr>
          `;
        });
        
        detailsHtml += '</tbody></table></div>';
        detailsContainer.innerHTML = detailsHtml;
      }
    }
  } catch (error) {
    console.error('Error loading attendance:', error);
    const tableBody = document.getElementById('attendanceTableBody');
    tableBody.innerHTML = '<tr><td colspan="5" class="empty-state">Error loading attendance</td></tr>';
  }
}

// ===== Load Assignments Page =====
async function loadAssignmentsPage() {
  try {
    const assignments = await getAllAssignments();
    const assignmentsList = document.getElementById('assignmentsList');
    assignmentsList.innerHTML = '';

    if (assignments.length === 0) {
      assignmentsList.innerHTML = '<p class="empty-state">No assignments available</p>';
      return;
    }

    assignments.forEach(assignment => {
      const card = createAssignmentCard(assignment);
      assignmentsList.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading assignments:', error);
  }
}

// ===== Load Announcements Page =====
async function loadAnnouncementsPage() {
  try {
    const announcements = await getAllAnnouncements();
    const announcementsList = document.getElementById('allAnnouncementsList');
    announcementsList.innerHTML = '';

    if (announcements.length === 0) {
      announcementsList.innerHTML = '<p class="empty-state">No announcements</p>';
      return;
    }

    announcements.forEach(announcement => {
      const card = createAnnouncementCard(announcement);
      announcementsList.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading announcements:', error);
  }
}

// ===== Load Profile Page =====
async function loadProfilePage() {
  try {
    document.getElementById('profileName').value = currentUser.name || '';
    document.getElementById('profileEmail').value = currentUser.email || '';
    document.getElementById('profileStudentId').value = currentUser.studentId || '';
    document.getElementById('profileDepartment').value = currentUser.department || '';
    document.getElementById('profileYear').value = currentUser.year || '';
    document.getElementById('profilePhone').value = currentUser.phone || '';

    // Profile form submit
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

    await updateDoc(doc(db, 'users', currentUser.uid), {
      phone: phone
    });

    const messageEl = document.getElementById('profileMessage');
    messageEl.textContent = 'Profile updated successfully!';
    messageEl.className = 'message success-message';
    messageEl.style.display = 'block';

    setTimeout(() => {
      messageEl.style.display = 'none';
    }, 3000);
  } catch (error) {
    console.error('Error updating profile:', error);
    const messageEl = document.getElementById('profileMessage');
    messageEl.textContent = 'Failed to update profile.';
    messageEl.className = 'message error-message';
    messageEl.style.display = 'block';
  }
}

// ===== Create Course Card =====
function createCourseCard(course) {
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
      <p>${course.description || 'No description available'}</p>
    </div>
  `;
  return card;
}

// ===== Create Assignment Card =====
function createAssignmentCard(assignment) {
  const status = getAssignmentStatus(assignment.dueDate);
  const card = document.createElement('div');
  card.className = 'assignment-card';

  card.innerHTML = `
    <div class="assignment-header">
      <h3 class="assignment-title">${assignment.title}</h3>
      <span class="assignment-status ${status}">${status.toUpperCase()}</span>
    </div>
    <div class="assignment-meta">
      <div><strong>Course:</strong> ${assignment.courseName}</div>
      <div><strong>Due:</strong> ${formatDate(assignment.dueDate)}</div>
    </div>
    <p class="assignment-description">${assignment.description || 'No description'}</p>
  `;

  return card;
}

// ===== Create Announcement Card =====
function createAnnouncementCard(announcement) {
  const card = document.createElement('div');
  card.className = 'announcement-card';

  const createdDate = new Date(announcement.createdAt);
  const now = new Date();
  const diffMs = now - createdDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const formattedDate = diffDays < 7 ? `${diffDays}d ago` : createdDate.toLocaleDateString();

  card.innerHTML = `
    <h3 class="announcement-title">${announcement.title}</h3>
    <div class="announcement-meta">
      <span><strong>By:</strong> ${announcement.staffName}</span>
      <span>${formattedDate}</span>
    </div>
    <p class="announcement-message">${announcement.message}</p>
  `;

  return card;
}

// ===== Fetch attendance for a specific student =====
async function getStudentAttendance(studentId) {
  const { getDocs, query, where, collection, orderBy } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');

  try {
    const q = query(
      collection(db, 'attendance'),
      where('studentId', '==', studentId),
      orderBy('courseName', 'asc')
    );
    const querySnapshot = await getDocs(q);
    const attendance = [];
    querySnapshot.forEach((doc) => {
      attendance.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return attendance;
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return [];
  }
}
