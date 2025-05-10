import { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  AcademicCapIcon, 
  ClockIcon, 
  ShieldCheckIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

// Sample stats data
const statsData = [
  {
    id: 1,
    name: 'Total Students',
    value: 42,
    trend: 12,
    trendType: 'increase',
    icon: UserGroupIcon,
    color: 'bg-blue-500',
  },
  {
    id: 2,
    name: 'Active Exams',
    value: 3,
    trend: -2,
    trendType: 'decrease',
    icon: AcademicCapIcon,
    color: 'bg-green-500',
  },
  {
    id: 3,
    name: 'Total Violations',
    value: 8,
    trend: 5,
    trendType: 'increase',
    icon: ShieldCheckIcon,
    color: 'bg-yellow-500',
  },
  {
    id: 4,
    name: 'Average Trust Score',
    value: '85%',
    trend: 3,
    trendType: 'increase',
    icon: ClockIcon,
    color: 'bg-purple-500',
  },
];

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
];

// Stats Card Component
const StatCard = ({ stat }) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
            <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{stat.value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3">
        <div className="text-sm flex items-center">
          {stat.trendType === 'increase' ? (
            <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
          ) : (
            <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
          )}
          <span
            className={
              stat.trendType === 'increase' ? 'text-green-600' : 'text-red-600'
            }
          >
            {Math.abs(stat.trend)}%
          </span>
          <span className="text-gray-500 ml-1">from last month</span>
        </div>
      </div>
    </div>
  );
};

export default function ResponsiveDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

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
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className="flex space-x-3">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Export
          </button>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Report
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statsData.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>

      {/* Recent exams table */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Upcoming Exams</h3>
          <p className="mt-1 text-sm text-gray-500">
            A list of all upcoming exams in the next 30 days.
          </p>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-gray-900">
                    Name
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Subject
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Duration
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Start Time
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    End Time
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
                {examsData.map((exam) => (
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
                        className="inline-flex items-center px-3 py-1.5 border border-indigo-600 text-xs font-medium rounded text-indigo-600 bg-white hover:bg-indigo-50 mr-2"
                      >
                        Edit
                      </button>
                      <button
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
      </div>

      {/* Activity feed */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
          <p className="mt-1 text-sm text-gray-500">
            Latest activities in the system.
          </p>
        </div>
        <div className="p-6">
          <ul className="space-y-6">
            {[1, 2, 3].map((item) => (
              <li key={item} className="relative flex gap-x-4">
                <div className="absolute left-0 top-0 flex w-6 justify-center -bottom-6">
                  <div className="w-px bg-gray-200"></div>
                </div>
                <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-white">
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300"></div>
                </div>
                <div className="flex-auto py-0.5 text-sm leading-5">
                  <span className="font-medium text-gray-900">User {item}</span> completed an action
                  <span className="block text-gray-500">2 hours ago</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
