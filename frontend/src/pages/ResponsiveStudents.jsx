import { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// Sample students data
const studentsData = [
  {
    id: 1,
    name: 'Jane Cooper',
    email: 'jane.cooper@example.com',
    studentId: 'STU-001',
    department: 'Computer Science',
    enrollmentDate: '2022-09-01',
    status: 'active',
    trustScore: 0.95,
  },
  {
    id: 2,
    name: 'Cody Fisher',
    email: 'cody.fisher@example.com',
    studentId: 'STU-002',
    department: 'Mathematics',
    enrollmentDate: '2022-09-01',
    status: 'active',
    trustScore: 0.88,
  },
  {
    id: 3,
    name: 'Esther Howard',
    email: 'esther.howard@example.com',
    studentId: 'STU-003',
    department: 'Physics',
    enrollmentDate: '2022-09-01',
    status: 'inactive',
    trustScore: 0.72,
  },
  {
    id: 4,
    name: 'Jenny Wilson',
    email: 'jenny.wilson@example.com',
    studentId: 'STU-004',
    department: 'Chemistry',
    enrollmentDate: '2022-09-01',
    status: 'active',
    trustScore: 0.91,
  },
  {
    id: 5,
    name: 'Kristin Watson',
    email: 'kristin.watson@example.com',
    studentId: 'STU-005',
    department: 'Biology',
    enrollmentDate: '2022-09-01',
    status: 'active',
    trustScore: 0.85,
  },
  {
    id: 6,
    name: 'Cameron Williamson',
    email: 'cameron.williamson@example.com',
    studentId: 'STU-006',
    department: 'Computer Science',
    enrollmentDate: '2022-09-01',
    status: 'inactive',
    trustScore: 0.65,
  },
];

export default function ResponsiveStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setStudents(studentsData);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Filter students based on search term
  const filteredStudents = students.filter(student =>
    Object.values(student).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleEdit = student => {
    // In a real app, this would open an edit modal with the student data
    console.log('Edit student:', student);
    // For now, just show an alert
    alert(`Edit student: ${student.name}`);
  };

  const handleDelete = id => {
    // In a real app, this would show a confirmation dialog
    if (window.confirm('Are you sure you want to delete this student?')) {
      // Filter out the deleted student
      setStudents(students.filter(student => student.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Students</h1>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Add Student
        </button>
      </div>

      {/* Search box */}
      <div className="mb-6">
        <div className="relative max-w-md w-full">
          <input
            type="text"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10"
            placeholder="Search students..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Students table */}
      <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <div className="min-w-full">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-gray-900">
                  Name
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Email
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Student ID
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Department
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Trust Score
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-6 text-right">
                  <span className="sr-only">Actions</span>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-gray-900">
                    {student.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {student.email}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {student.studentId}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {student.department}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            student.trustScore > 0.8 
                              ? 'bg-green-500' 
                              : student.trustScore > 0.6 
                                ? 'bg-yellow-500' 
                                : 'bg-red-500'
                          }`} 
                          style={{ width: `${student.trustScore * 100}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-gray-700">{(student.trustScore * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {student.status}
                    </span>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(student)}
                      className="inline-flex items-center px-3 py-1.5 border border-indigo-600 text-xs font-medium rounded text-indigo-600 bg-white hover:bg-indigo-50 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-red-600 text-xs font-medium rounded text-red-600 bg-white hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add Student</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {/* Add student form would go here */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
