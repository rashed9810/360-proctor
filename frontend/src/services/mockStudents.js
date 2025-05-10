// Mock students data for development
const mockStudents = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    roll: '2023001',
    class: '10',
    section: 'A',
    status: 'active',
    department: 'Computer Science',
    examsTaken: 5,
    averageTrustScore: 92,
    violations: 2,
    lastExam: '2023-06-10',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    roll: '2023002',
    class: '10',
    section: 'A',
    status: 'active',
    department: 'Physics',
    examsTaken: 3,
    averageTrustScore: 88,
    violations: 1,
    lastExam: '2023-06-05',
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    roll: '2023003',
    class: '10',
    section: 'B',
    status: 'inactive',
    department: 'Mathematics',
    examsTaken: 7,
    averageTrustScore: 95,
    violations: 0,
    lastExam: '2023-06-12',
  },
  {
    id: 4,
    name: 'Alice Brown',
    email: 'alice.brown@example.com',
    roll: '2023004',
    class: '10',
    section: 'B',
    status: 'active',
    department: 'Chemistry',
    examsTaken: 4,
    averageTrustScore: 90,
    violations: 1,
    lastExam: '2023-06-08',
  },
  {
    id: 5,
    name: 'Charlie Wilson',
    email: 'charlie.wilson@example.com',
    roll: '2023005',
    class: '10',
    section: 'C',
    status: 'active',
    department: 'Biology',
    examsTaken: 6,
    averageTrustScore: 87,
    violations: 3,
    lastExam: '2023-06-15',
  },
  {
    id: 6,
    name: 'Rahul Khan',
    email: 'rahul.khan@example.com',
    roll: '2023006',
    class: '11',
    section: 'A',
    status: 'active',
    department: 'Computer Science',
    examsTaken: 4,
    averageTrustScore: 91,
    violations: 1,
    lastExam: '2023-06-14',
  },
  {
    id: 7,
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    roll: '2023007',
    class: '11',
    section: 'A',
    status: 'active',
    department: 'Physics',
    examsTaken: 5,
    averageTrustScore: 94,
    violations: 0,
    lastExam: '2023-06-11',
  },
  {
    id: 8,
    name: 'Ahmed Hassan',
    email: 'ahmed.hassan@example.com',
    roll: '2023008',
    class: '11',
    section: 'B',
    status: 'inactive',
    department: 'Mathematics',
    examsTaken: 3,
    averageTrustScore: 85,
    violations: 2,
    lastExam: '2023-06-07',
  },
  {
    id: 9,
    name: 'Fatima Ali',
    email: 'fatima.ali@example.com',
    roll: '2023009',
    class: '11',
    section: 'B',
    status: 'active',
    department: 'Chemistry',
    examsTaken: 6,
    averageTrustScore: 89,
    violations: 1,
    lastExam: '2023-06-13',
  },
  {
    id: 10,
    name: 'Mohammed Rahman',
    email: 'mohammed.rahman@example.com',
    roll: '2023010',
    class: '11',
    section: 'C',
    status: 'active',
    department: 'Biology',
    examsTaken: 4,
    averageTrustScore: 93,
    violations: 0,
    lastExam: '2023-06-09',
  },
];

// Helper to simulate API delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Get all students
const getAllStudents = async () => {
  await delay(800);
  return [...mockStudents];
};

// Get student by ID
const getStudentById = async id => {
  await delay(500);
  const student = mockStudents.find(s => s.id === id);
  if (!student) {
    throw new Error('Student not found');
  }
  return { ...student };
};

// Add new student
const addStudent = async studentData => {
  await delay(800);
  const newStudent = {
    id: mockStudents.length + 1,
    ...studentData,
  };
  mockStudents.push(newStudent);
  return { ...newStudent };
};

// Update student
const updateStudent = async (id, studentData) => {
  await delay(800);
  const index = mockStudents.findIndex(s => s.id === id);
  if (index === -1) {
    throw new Error('Student not found');
  }
  mockStudents[index] = {
    ...mockStudents[index],
    ...studentData,
  };
  return { ...mockStudents[index] };
};

// Delete student
const deleteStudent = async id => {
  await delay(800);
  const index = mockStudents.findIndex(s => s.id === id);
  if (index === -1) {
    throw new Error('Student not found');
  }
  mockStudents.splice(index, 1);
  return { success: true };
};

export const mockStudentService = {
  getAllStudents,
  getStudentById,
  addStudent,
  updateStudent,
  deleteStudent,
};

export default mockStudentService;
