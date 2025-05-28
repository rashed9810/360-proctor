import { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// Sample exams data
const examsData = [
  {
    id: 1,
    name: 'Mathematics Final Exam',
    subject: 'Mathematics',
    duration: '120 minutes',
    startTime: '2023-06-15 10:00 AM',
    endTime: '2023-06-15 12:00 PM',
    status: 'scheduled',
  },
  {
    id: 2,
    name: 'Physics Midterm',
    subject: 'Physics',
    duration: '90 minutes',
    startTime: '2023-06-20 02:00 PM',
    endTime: '2023-06-20 03:30 PM',
    status: 'scheduled',
  },
  {
    id: 3,
    name: 'Biology Final',
    subject: 'Biology',
    duration: '150 minutes',
    startTime: '2023-06-25 10:00 AM',
    endTime: '2023-06-25 12:30 PM',
    status: 'scheduled',
  },
  {
    id: 4,
    name: 'Chemistry Quiz',
    subject: 'Chemistry',
    duration: '45 minutes',
    startTime: '2023-06-10 11:00 AM',
    endTime: '2023-06-10 11:45 AM',
    status: 'completed',
  },
  {
    id: 5,
    name: 'English Literature Essay',
    subject: 'English',
    duration: '180 minutes',
    startTime: '2023-06-18 09:00 AM',
    endTime: '2023-06-18 12:00 PM',
    status: 'scheduled',
  },
  {
    id: 6,
    name: 'Computer Science Practical',
    subject: 'Computer Science',
    duration: '120 minutes',
    startTime: '2023-06-22 01:00 PM',
    endTime: '2023-06-22 03:00 PM',
    status: 'scheduled',
  },
];

export default function ResponsiveExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setExams(examsData);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Filter exams based on search term
  const filteredExams = exams.filter(exam =>
    Object.values(exam).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleEdit = exam => {
    // In a real app, this would open an edit modal with the exam data
    console.log('Edit exam:', exam);
    // For now, just show an alert
    alert(`Edit exam: ${exam.name}`);
  };

  const handleDelete = id => {
    // In a real app, this would show a confirmation dialog
    if (window.confirm('Are you sure you want to delete this exam?')) {
      // Filter out the deleted exam
      setExams(exams.filter(exam => exam.id !== id));
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
        <h1 className="text-2xl font-semibold text-gray-900">Exams</h1>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Create Exam
        </button>
      </div>

      {/* Search box */}
      <div className="mb-6">
        <div className="relative max-w-md w-full">
          <input
            type="text"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10"
            placeholder="Search exams..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Exams table */}
      <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <div className="min-w-full">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-gray-900"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Subject
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Duration
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Start Time
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  End Time
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Status
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-6 text-right">
                  <span className="sr-only">Actions</span>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredExams.map(exam => (
                <tr key={exam.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-gray-900">
                    {exam.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {exam.subject}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {exam.duration}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {exam.startTime}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {exam.endTime}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        exam.status === 'ongoing'
                          ? 'bg-green-100 text-green-800'
                          : exam.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {exam.status}
                    </span>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(exam)}
                      className="inline-flex items-center px-3 py-1.5 border border-indigo-600 text-xs font-medium rounded text-indigo-600 bg-white hover:bg-indigo-50 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(exam.id)}
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

      {/* Add Exam Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Create Exam</h3>
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
            {/* Add exam form would go here */}
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
