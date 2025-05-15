// Mock exams data for development
let exams = [
  {
    id: 1,
    title: 'Introduction to Computer Science',
    subject: 'Computer Science',
    description:
      'Fundamentals of computer science including algorithms, data structures, and programming concepts.',
    startTime: '2023-12-15T09:00:00',
    endTime: '2023-12-15T11:00:00',
    duration: 120,
    enableFaceDetection: true,
    enableMultipleFaceDetection: true,
    enableEyeTracking: true,
    enableAudioDetection: true,
    enableTabSwitchDetection: true,
    enablePhoneDetection: true,
    warningThreshold: 0.7,
    criticalThreshold: 0.5,
    allowLateSubmission: false,
    showResults: true,
    passingScore: 60,
    status: 'scheduled',
    participants: 45,
    createdAt: '2023-12-01T10:30:00',
    updatedAt: '2023-12-01T10:30:00',
    date: '2023-12-15',
    proctorId: 1,
    trustScoreThreshold: 70,
  },
  {
    id: 2,
    title: 'Advanced Mathematics',
    subject: 'Mathematics',
    description: 'Advanced topics in calculus, linear algebra, and differential equations.',
    startTime: '2023-12-18T14:00:00',
    endTime: '2023-12-18T16:30:00',
    duration: 150,
    enableFaceDetection: true,
    enableMultipleFaceDetection: true,
    enableEyeTracking: true,
    enableAudioDetection: true,
    enableTabSwitchDetection: true,
    enablePhoneDetection: true,
    warningThreshold: 0.7,
    criticalThreshold: 0.5,
    allowLateSubmission: true,
    showResults: true,
    passingScore: 70,
    status: 'scheduled',
    participants: 38,
    createdAt: '2023-12-02T09:15:00',
    updatedAt: '2023-12-02T09:15:00',
    date: '2023-12-18',
    proctorId: 2,
    trustScoreThreshold: 75,
  },
  {
    id: 3,
    title: 'Physics Midterm',
    subject: 'Physics',
    description: 'Midterm examination covering mechanics and thermodynamics.',
    startTime: '2023-12-10T09:30:00',
    endTime: '2023-12-10T12:30:00',
    duration: 180,
    enableFaceDetection: true,
    enableMultipleFaceDetection: true,
    enableEyeTracking: true,
    enableAudioDetection: true,
    enableTabSwitchDetection: true,
    enablePhoneDetection: true,
    warningThreshold: 0.75,
    criticalThreshold: 0.55,
    allowLateSubmission: false,
    showResults: true,
    passingScore: 65,
    status: 'ongoing',
    participants: 52,
    createdAt: '2023-12-01T11:45:00',
    updatedAt: '2023-12-01T11:45:00',
    date: '2023-12-10',
    proctorId: 1,
    trustScoreThreshold: 85,
  },
  {
    id: 4,
    title: 'Chemistry Quiz',
    subject: 'Chemistry',
    description: 'Short quiz on organic chemistry.',
    startTime: '2023-12-01T11:00:00',
    endTime: '2023-12-01T11:45:00',
    duration: 45,
    enableFaceDetection: true,
    enableMultipleFaceDetection: true,
    enableEyeTracking: false,
    enableAudioDetection: true,
    enableTabSwitchDetection: true,
    enablePhoneDetection: true,
    warningThreshold: 0.7,
    criticalThreshold: 0.5,
    allowLateSubmission: false,
    showResults: true,
    passingScore: 60,
    status: 'completed',
    participants: 40,
    createdAt: '2023-11-25T14:20:00',
    updatedAt: '2023-11-25T14:20:00',
    date: '2023-12-01',
    proctorId: 3,
    trustScoreThreshold: 70,
  },
  {
    id: 5,
    title: 'Biology Final',
    subject: 'Biology',
    description: 'Final examination covering all biology topics.',
    startTime: '2023-12-25T10:00:00',
    endTime: '2023-12-25T12:30:00',
    duration: 150,
    enableFaceDetection: true,
    enableMultipleFaceDetection: true,
    enableEyeTracking: true,
    enableAudioDetection: true,
    enableTabSwitchDetection: true,
    enablePhoneDetection: true,
    warningThreshold: 0.7,
    criticalThreshold: 0.5,
    allowLateSubmission: true,
    showResults: false,
    passingScore: 70,
    status: 'scheduled',
    participants: 48,
    createdAt: '2023-12-05T09:30:00',
    updatedAt: '2023-12-05T09:30:00',
    date: '2023-12-25',
    proctorId: 2,
    trustScoreThreshold: 80,
  },
];

// Helper to simulate API delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Mock data for students
const students = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    group: 'Group A',
    course: 'Computer Science',
    status: 'active',
    timeSpent: '45m',
    violations: 2,
    progress: '60%',
    trustScore: 0.85,
    faceDetectionScore: 0.9,
    eyeTrackingScore: 0.85,
    audioAnalysisScore: 0.95,
    tabSwitchingScore: 0.8,
    phoneDetectionScore: 1.0,
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    group: 'Group A',
    course: 'Computer Science',
    status: 'active',
    timeSpent: '38m',
    violations: 1,
    progress: '45%',
    trustScore: 0.92,
    faceDetectionScore: 0.95,
    eyeTrackingScore: 0.9,
    audioAnalysisScore: 1.0,
    tabSwitchingScore: 0.85,
    phoneDetectionScore: 1.0,
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    group: 'Group B',
    course: 'Mathematics',
    status: 'completed',
    timeSpent: '120m',
    violations: 0,
    progress: '100%',
    trustScore: 0.98,
    faceDetectionScore: 1.0,
    eyeTrackingScore: 0.95,
    audioAnalysisScore: 1.0,
    tabSwitchingScore: 0.95,
    phoneDetectionScore: 1.0,
  },
  {
    id: 4,
    name: 'Alice Williams',
    email: 'alice.williams@example.com',
    group: 'Group B',
    course: 'Mathematics',
    status: 'not_started',
    timeSpent: '0m',
    violations: 0,
    progress: '0%',
    trustScore: 0,
    faceDetectionScore: 0,
    eyeTrackingScore: 0,
    audioAnalysisScore: 0,
    tabSwitchingScore: 0,
    phoneDetectionScore: 0,
  },
  {
    id: 5,
    name: 'Charlie Brown',
    email: 'charlie.brown@example.com',
    group: 'Group C',
    course: 'Computer Science',
    status: 'active',
    timeSpent: '65m',
    violations: 5,
    progress: '75%',
    trustScore: 0.65,
    faceDetectionScore: 0.7,
    eyeTrackingScore: 0.6,
    audioAnalysisScore: 0.75,
    tabSwitchingScore: 0.5,
    phoneDetectionScore: 0.9,
  },
];

// Mock data for violations
const violations = [
  {
    id: 1,
    studentId: 1,
    studentName: 'John Doe',
    examId: 1,
    type: 'face_not_detected',
    severity: 'high',
    description: 'Face not detected for 15 seconds',
    timestamp: '2023-12-15T09:15:30',
  },
  {
    id: 2,
    studentId: 1,
    studentName: 'John Doe',
    examId: 1,
    type: 'tab_switch',
    severity: 'medium',
    description: 'Switched to another browser tab',
    timestamp: '2023-12-15T09:25:45',
  },
  {
    id: 3,
    studentId: 5,
    studentName: 'Charlie Brown',
    examId: 1,
    type: 'multiple_faces',
    severity: 'high',
    description: 'Multiple faces detected in camera',
    timestamp: '2023-12-15T09:30:20',
  },
  {
    id: 4,
    studentId: 5,
    studentName: 'Charlie Brown',
    examId: 1,
    type: 'phone_detected',
    severity: 'high',
    description: 'Phone detected in camera view',
    timestamp: '2023-12-15T09:35:10',
  },
  {
    id: 5,
    studentId: 2,
    studentName: 'Jane Smith',
    examId: 1,
    type: 'looking_away',
    severity: 'medium',
    description: 'Looking away from screen',
    timestamp: '2023-12-15T09:40:22',
  },
  {
    id: 6,
    studentId: 1,
    studentName: 'John Doe',
    examId: 1,
    type: 'audio_detected',
    severity: 'low',
    description: 'Audio detected during exam',
    timestamp: '2023-12-15T09:45:18',
  },
  {
    id: 7,
    studentId: 5,
    studentName: 'Charlie Brown',
    examId: 1,
    type: 'looking_away',
    severity: 'medium',
    description: 'Looking away from screen for extended period',
    timestamp: '2023-12-15T09:35:10',
  },
  {
    id: 8,
    studentId: 5,
    studentName: 'Charlie Brown',
    examId: 1,
    type: 'audio_detected',
    severity: 'medium',
    description: 'Suspicious audio detected',
    timestamp: '2023-12-15T09:40:05',
  },
  {
    id: 9,
    studentId: 5,
    studentName: 'Charlie Brown',
    examId: 1,
    type: 'phone_detected',
    severity: 'high',
    description: 'Phone detected in camera view',
    timestamp: '2023-12-15T09:45:30',
  },
  {
    id: 10,
    studentId: 5,
    studentName: 'Charlie Brown',
    examId: 1,
    type: 'tab_switch',
    severity: 'low',
    description: 'Switched to another browser tab',
    timestamp: '2023-12-15T09:50:15',
  },
  {
    id: 11,
    studentId: 2,
    studentName: 'Jane Smith',
    examId: 1,
    type: 'looking_away',
    severity: 'low',
    description: 'Looking away from screen briefly',
    timestamp: '2023-12-15T09:55:40',
  },
];

// Mock data for trust score history
const trustScoreHistory = [
  { studentId: 1, score: 100, timestamp: '2023-12-15T09:00:00' },
  { studentId: 1, score: 95, timestamp: '2023-12-15T09:10:00' },
  { studentId: 1, score: 85, timestamp: '2023-12-15T09:20:00' },
  { studentId: 1, score: 80, timestamp: '2023-12-15T09:30:00' },
  { studentId: 1, score: 85, timestamp: '2023-12-15T09:40:00' },
  { studentId: 1, score: 85, timestamp: '2023-12-15T09:50:00' },
  { studentId: 2, score: 100, timestamp: '2023-12-15T09:00:00' },
  { studentId: 2, score: 98, timestamp: '2023-12-15T09:10:00' },
  { studentId: 2, score: 95, timestamp: '2023-12-15T09:20:00' },
  { studentId: 2, score: 92, timestamp: '2023-12-15T09:30:00' },
  { studentId: 2, score: 92, timestamp: '2023-12-15T09:40:00' },
  { studentId: 2, score: 92, timestamp: '2023-12-15T09:50:00' },
  { studentId: 5, score: 100, timestamp: '2023-12-15T09:00:00' },
  { studentId: 5, score: 90, timestamp: '2023-12-15T09:10:00' },
  { studentId: 5, score: 80, timestamp: '2023-12-15T09:20:00' },
  { studentId: 5, score: 70, timestamp: '2023-12-15T09:30:00' },
  { studentId: 5, score: 65, timestamp: '2023-12-15T09:40:00' },
  { studentId: 5, score: 65, timestamp: '2023-12-15T09:50:00' },
];

// Mock exam schedules
let schedules = [
  {
    id: 1,
    examId: 1,
    date: '2023-12-15',
    startTime: '09:00',
    endTime: '11:00',
    maxParticipants: 30,
  },
  {
    id: 2,
    examId: 1,
    date: '2023-12-16',
    startTime: '14:00',
    endTime: '16:00',
    maxParticipants: 25,
  },
  {
    id: 3,
    examId: 2,
    date: '2023-12-18',
    startTime: '14:00',
    endTime: '16:30',
    maxParticipants: 20,
  },
];

// Mock assigned students
let assignedStudents = [
  { examId: 1, studentId: 1 },
  { examId: 1, studentId: 2 },
  { examId: 1, studentId: 5 },
  { examId: 2, studentId: 3 },
  { examId: 2, studentId: 4 },
];

// Get all exams
const getAllExams = async () => {
  await delay(800);
  return [...exams];
};

// Get exam by ID
const getExamById = async id => {
  await delay(500);
  const exam = exams.find(e => e.id === id);
  if (!exam) {
    throw new Error('Exam not found');
  }
  return { ...exam };
};

// Add new exam
const addExam = async examData => {
  await delay(800);
  const newExam = {
    id: exams.length + 1,
    ...examData,
    status: 'scheduled',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  exams.push(newExam);
  return { ...newExam };
};

// Update exam
const updateExam = async (id, examData) => {
  await delay(800);
  const index = exams.findIndex(e => e.id === id);
  if (index === -1) {
    throw new Error('Exam not found');
  }
  exams[index] = {
    ...exams[index],
    ...examData,
    updatedAt: new Date().toISOString(),
  };
  return { ...exams[index] };
};

// Delete exam
const deleteExam = async id => {
  await delay(800);
  const index = exams.findIndex(e => e.id === id);
  if (index === -1) {
    throw new Error('Exam not found');
  }
  exams = exams.filter(e => e.id !== id);
  return { success: true };
};

// Get exams for calendar
const getExamsForCalendar = async () => {
  await delay(500);
  return exams.map(exam => ({
    id: exam.id,
    title: exam.title || exam.name, // Support both title and name properties
    start: exam.startTime,
    end: exam.endTime,
    status: exam.status,
    participants: exam.participants,
    date: exam.date,
  }));
};

// Get trust scores for an exam
const getTrustScoresForExam = async examId => {
  await delay(600);
  // Generate random trust score data
  const scores = [];
  const baseDate = new Date(exams.find(e => e.id === examId)?.date || new Date());

  for (let i = 0; i < 10; i++) {
    const date = new Date(baseDate);
    date.setMinutes(date.getMinutes() + i * 10);

    scores.push({
      timestamp: date.toISOString(),
      score: 75 + Math.floor(Math.random() * 20),
      violations: Math.floor(Math.random() * 3),
    });
  }

  return scores;
};

// Get students
const getStudents = async () => {
  await delay(600);
  return [...students];
};

// Get students for an exam
const getExamStudents = async examId => {
  await delay(600);
  const studentIds = assignedStudents.filter(a => a.examId === examId).map(a => a.studentId);
  const examStudents = students.filter(s => studentIds.includes(s.id));
  return examStudents;
};

// Assign student to exam
const assignStudent = async (examId, studentId) => {
  await delay(500);
  const alreadyAssigned = assignedStudents.some(
    a => a.examId === examId && a.studentId === studentId
  );
  if (alreadyAssigned) {
    return { success: true, message: 'Student already assigned' };
  }
  assignedStudents.push({ examId, studentId });
  return { success: true };
};

// Unassign student from exam
const unassignStudent = async (examId, studentId) => {
  await delay(500);
  const index = assignedStudents.findIndex(a => a.examId === examId && a.studentId === studentId);
  if (index === -1) {
    throw new Error('Assignment not found');
  }
  assignedStudents = assignedStudents.filter(
    a => !(a.examId === examId && a.studentId === studentId)
  );
  return { success: true };
};

// Get violations for an exam
const getExamViolations = async examId => {
  await delay(600);
  const examViolations = violations.filter(v => v.examId === examId);
  return examViolations;
};

// Get violations for a student in an exam
const getStudentViolations = async (examId, studentId) => {
  await delay(500);
  const studentViolations = violations.filter(
    v => v.examId === examId && v.studentId === studentId
  );
  return studentViolations;
};

// Get trust score history for a student in an exam
const getStudentTrustScoreHistory = async studentId => {
  await delay(500);
  const history = trustScoreHistory.filter(h => h.studentId === studentId);
  return history;
};

// Get schedules for an exam
const getExamSchedules = async examId => {
  await delay(500);
  const examSchedules = schedules.filter(s => s.examId === examId);
  return examSchedules;
};

// Add schedule for an exam
const addExamSchedule = async (examId, scheduleData) => {
  await delay(600);
  const newSchedule = {
    id: schedules.length + 1,
    examId,
    ...scheduleData,
  };
  schedules.push(newSchedule);
  return newSchedule;
};

// Remove schedule
const removeExamSchedule = async scheduleId => {
  await delay(500);
  const index = schedules.findIndex(s => s.id === scheduleId);
  if (index === -1) {
    throw new Error('Schedule not found');
  }
  schedules = schedules.filter(s => s.id !== scheduleId);
  return { success: true };
};

// Batch assign students to exam
const batchAssignStudents = async (examId, studentIds) => {
  await delay(800);
  for (const studentId of studentIds) {
    const alreadyAssigned = assignedStudents.some(
      a => a.examId === examId && a.studentId === studentId
    );
    if (!alreadyAssigned) {
      assignedStudents.push({ examId, studentId });
    }
  }
  return { success: true };
};

export const mockExamService = {
  getAllExams,
  getExamById,
  addExam,
  updateExam,
  deleteExam,
  getExamsForCalendar,
  getTrustScoresForExam,
  getStudents,
  getExamStudents,
  assignStudent,
  unassignStudent,
  batchAssignStudents,
  getExamViolations,
  getStudentViolations,
  getStudentTrustScoreHistory,
  getExamSchedules,
  addExamSchedule,
  removeExamSchedule,
};

export default mockExamService;
