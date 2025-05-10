// Mock exams data for development
const mockExams = [
  {
    id: 1,
    name: 'Mathematics Final Exam',
    subject: 'Mathematics',
    duration: '120 minutes',
    startTime: '2023-06-15 10:00 AM',
    endTime: '2023-06-15 12:00 PM',
    status: 'scheduled',
    participants: 45,
    description: 'Final examination covering all topics from the semester',
    trustScoreThreshold: 80,
    proctorId: 1,
    date: '2023-06-15'
  },
  {
    id: 2,
    name: 'Physics Midterm',
    subject: 'Physics',
    duration: '90 minutes',
    startTime: '2023-06-20 02:00 PM',
    endTime: '2023-06-20 03:30 PM',
    status: 'scheduled',
    participants: 38,
    description: 'Midterm examination covering mechanics and thermodynamics',
    trustScoreThreshold: 75,
    proctorId: 2,
    date: '2023-06-20'
  },
  {
    id: 3,
    name: 'Computer Science Exam',
    subject: 'Computer Science',
    duration: '180 minutes',
    startTime: '2023-06-10 09:30 AM',
    endTime: '2023-06-10 12:30 PM',
    status: 'ongoing',
    participants: 52,
    description: 'Comprehensive examination on algorithms and data structures',
    trustScoreThreshold: 85,
    proctorId: 1,
    date: '2023-06-10'
  },
  {
    id: 4,
    name: 'Chemistry Quiz',
    subject: 'Chemistry',
    duration: '45 minutes',
    startTime: '2023-06-01 11:00 AM',
    endTime: '2023-06-01 11:45 AM',
    status: 'completed',
    participants: 40,
    description: 'Short quiz on organic chemistry',
    trustScoreThreshold: 70,
    proctorId: 3,
    date: '2023-06-01'
  },
  {
    id: 5,
    name: 'Biology Final',
    subject: 'Biology',
    duration: '150 minutes',
    startTime: '2023-06-25 10:00 AM',
    endTime: '2023-06-25 12:30 PM',
    status: 'scheduled',
    participants: 48,
    description: 'Final examination covering all biology topics',
    trustScoreThreshold: 80,
    proctorId: 2,
    date: '2023-06-25'
  }
];

// Helper to simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Get all exams
const getAllExams = async () => {
  await delay(800);
  return [...mockExams];
};

// Get exam by ID
const getExamById = async (id) => {
  await delay(500);
  const exam = mockExams.find((e) => e.id === id);
  if (!exam) {
    throw new Error('Exam not found');
  }
  return { ...exam };
};

// Add new exam
const addExam = async (examData) => {
  await delay(800);
  const newExam = {
    id: mockExams.length + 1,
    ...examData,
  };
  mockExams.push(newExam);
  return { ...newExam };
};

// Update exam
const updateExam = async (id, examData) => {
  await delay(800);
  const index = mockExams.findIndex((e) => e.id === id);
  if (index === -1) {
    throw new Error('Exam not found');
  }
  mockExams[index] = {
    ...mockExams[index],
    ...examData,
  };
  return { ...mockExams[index] };
};

// Delete exam
const deleteExam = async (id) => {
  await delay(800);
  const index = mockExams.findIndex((e) => e.id === id);
  if (index === -1) {
    throw new Error('Exam not found');
  }
  mockExams.splice(index, 1);
  return { success: true };
};

// Get exams for calendar
const getExamsForCalendar = async () => {
  await delay(500);
  return mockExams.map(exam => ({
    id: exam.id,
    title: exam.name,
    start: exam.startTime,
    end: exam.endTime,
    status: exam.status,
    participants: exam.participants,
    date: exam.date
  }));
};

// Get trust scores for an exam
const getTrustScoresForExam = async (examId) => {
  await delay(600);
  // Generate random trust score data
  const scores = [];
  const baseDate = new Date(mockExams.find(e => e.id === examId)?.date || new Date());
  
  for (let i = 0; i < 10; i++) {
    const date = new Date(baseDate);
    date.setMinutes(date.getMinutes() + i * 10);
    
    scores.push({
      timestamp: date.toISOString(),
      score: 75 + Math.floor(Math.random() * 20),
      violations: Math.floor(Math.random() * 3)
    });
  }
  
  return scores;
};

export const mockExamService = {
  getAllExams,
  getExamById,
  addExam,
  updateExam,
  deleteExam,
  getExamsForCalendar,
  getTrustScoresForExam
};

export default mockExamService;
