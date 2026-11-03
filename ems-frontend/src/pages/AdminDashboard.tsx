import { useState } from 'react';
import Navbar from '../components/Navbar';
import DepartmentManager from '../components/DepartmentManager';
import EmployeeManager from '../components/EmployeeManager';

type Tab = 'departments' | 'employees';

function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<Tab>('departments');

    return (
        <div className="min-h-screen bg-cornsilk-500">
            <Navbar title="Admin Dashboard" />

            <div className="max-w-5xl mx-auto px-4 py-6">
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('departments')}
                        className={`px-5 py-2 rounded-lg font-medium transition-colors ${
                            activeTab === 'departments'
                                ? 'bg-black-forest-500 text-cornsilk-500'
                                : 'bg-cornsilk-900 text-black-forest-500 border border-sunlit-clay-700'
                        }`}
                    >
                        Departments
                    </button>
                    <button
                        onClick={() => setActiveTab('employees')}
                        className={`px-5 py-2 rounded-lg font-medium transition-colors ${
                            activeTab === 'employees'
                                ? 'bg-black-forest-500 text-cornsilk-500'
                                : 'bg-cornsilk-900 text-black-forest-500 border border-sunlit-clay-700'
                        }`}
                    >
                        Employees
                    </button>
                </div>

                {activeTab === 'departments' ? <DepartmentManager /> : <EmployeeManager />}
            </div>
        </div>
    );
}

export default AdminDashboard;