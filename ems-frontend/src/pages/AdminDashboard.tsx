import { useState } from 'react';
import Navbar from '../components/Navbar';
import DepartmentManager from '../components/DepartmentManager';
import EmployeeManager from '../components/EmployeeManager';
import LeaveManager from '../components/LeaveManager';
import AttendanceManager from '../components/AttendanceManager';

type Tab = 'departments' | 'employees' | 'leaves' | 'attendance';

function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<Tab>('departments');

    return (
        <div className="min-h-screen bg-cornsilk-500">
            <Navbar title="Admin Dashboard" />

            <div className="max-w-5xl mx-auto px-4 py-6">
                <div className="flex gap-2 mb-6 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('departments')}
                        className={`px-5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                            activeTab === 'departments'
                                ? 'bg-black-forest-500 text-cornsilk-500'
                                : 'bg-cornsilk-900 text-black-forest-500 border border-sunlit-clay-700'
                        }`}
                    >
                        Departments
                    </button>
                    <button
                        onClick={() => setActiveTab('employees')}
                        className={`px-5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                            activeTab === 'employees'
                                ? 'bg-black-forest-500 text-cornsilk-500'
                                : 'bg-cornsilk-900 text-black-forest-500 border border-sunlit-clay-700'
                        }`}
                    >
                        Employees
                    </button>
                    <button
                        onClick={() => setActiveTab('leaves')}
                        className={`px-5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                            activeTab === 'leaves'
                                ? 'bg-black-forest-500 text-cornsilk-500'
                                : 'bg-cornsilk-900 text-black-forest-500 border border-sunlit-clay-700'
                        }`}
                    >
                        Leave Requests
                    </button>
                    <button
                        onClick={() => setActiveTab('attendance')}
                        className={`px-5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                            activeTab === 'attendance'
                                ? 'bg-black-forest-500 text-cornsilk-500'
                                : 'bg-cornsilk-900 text-black-forest-500 border border-sunlit-clay-700'
                        }`}
                    >
                        Attendance Log
                    </button>
                </div>

                {activeTab === 'departments' ? (
                    <DepartmentManager />
                ) : activeTab === 'employees' ? (
                    <EmployeeManager />
                ) : activeTab === 'leaves' ? (
                    <LeaveManager />
                ) : (
                    <AttendanceManager />
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;