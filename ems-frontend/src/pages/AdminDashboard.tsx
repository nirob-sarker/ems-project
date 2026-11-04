import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import DepartmentManager from '../components/DepartmentManager';
import EmployeeManager from '../components/EmployeeManager';
import LeaveManager from '../components/LeaveManager';
import AttendanceManager from '../components/AttendanceManager';
import type { DashboardStats } from '../types';
import {
    LayoutDashboard,
    Users,
    Building2,
    CalendarDays,
    ClockCheck,
    LogOut,
    UserCheck,
    Hourglass,
    Menu,
    X,
} from 'lucide-react';

type Tab = 'overview' | 'departments' | 'employees' | 'leaves' | 'attendance';

function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [statsLoading, setStatsLoading] = useState<boolean>(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

    const { username, logout } = useAuth();
    const navigate = useNavigate();

    const fetchStats = async (): Promise<void> => {
        setStatsLoading(true);
        try {
            const res = await api.get<DashboardStats>('/dashboard/stats');
            setStats(res.data);
        } catch {
            setStats(null);
        } finally {
            setStatsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [activeTab]);

    const handleLogout = (): void => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'employees', label: 'Employees', icon: Users },
        { id: 'departments', label: 'Departments', icon: Building2 },
        { id: 'leaves', label: 'Leave Requests', icon: CalendarDays },
        { id: 'attendance', label: 'Attendance Log', icon: ClockCheck },
    ];

    return (
        <div className="min-h-screen bg-cornsilk-500 flex flex-col md:flex-row">
            {/* Mobile Header Bar */}
            <div className="md:hidden bg-black-forest-500 px-4 py-3 flex items-center justify-between text-cornsilk-500">
                <div className="flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-sunlit-clay-500" />
                    <span className="font-bold text-lg">EMS Portal</span>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-1 rounded-lg hover:bg-black-forest-600"
                >
                    {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Sidebar Navigation */}
            <aside
                className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-black-forest-500 text-cornsilk-500 flex flex-col justify-between transition-transform duration-300 transform ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                }`}
            >
                <div>
                    <div className="hidden md:flex items-center gap-3 px-6 py-6 border-b border-black-forest-600">
                        <div className="w-9 h-9 rounded-xl bg-sunlit-clay-500 flex items-center justify-center text-black-forest-100 font-extrabold text-lg">
                            E
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-none">EMS Admin</h1>
                            <span className="text-[10px] text-olive-leaf-700 tracking-wider uppercase font-semibold">
                                Enterprise Suite
                            </span>
                        </div>
                    </div>

                    <nav className="p-4 space-y-1.5">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveTab(item.id as Tab);
                                        setIsSidebarOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                                        isActive
                                            ? 'bg-cornsilk-500 text-black-forest-500 font-bold shadow-md'
                                            : 'text-cornsilk-800 hover:bg-black-forest-600 hover:text-cornsilk-500'
                                    }`}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-black-forest-500' : 'text-olive-leaf-700'}`} />
                                    {item.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Sidebar Footer / User Profile */}
                <div className="p-4 border-t border-black-forest-600">
                    <div className="flex items-center justify-between bg-black-forest-600 p-3 rounded-xl">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-sunlit-clay-500 text-black-forest-100 flex items-center justify-center font-bold text-xs">
                                {username?.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="truncate max-w-[100px]">
                                <p className="text-xs font-bold truncate">{username}</p>
                                <p className="text-[10px] text-olive-leaf-700">Administrator</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-1.5 text-copperwood-500 hover:text-copperwood-300 hover:bg-black-forest-500 rounded-lg transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
                {/* Top Header */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-black-forest-500 capitalize">
                            {activeTab === 'overview' ? 'Dashboard Overview' : activeTab}
                        </h1>
                        <p className="text-xs text-olive-leaf-500">
                            Welcome back, {username}. Here is what's happening today.
                        </p>
                    </div>
                </header>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Metric Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <MetricCard
                                title="Total Employees"
                                value={statsLoading ? '...' : stats?.totalEmployees ?? 0}
                                icon={Users}
                                color="bg-olive-leaf-600"
                            />
                            <MetricCard
                                title="Total Departments"
                                value={statsLoading ? '...' : stats?.totalDepartments ?? 0}
                                icon={Building2}
                                color="bg-black-forest-500"
                            />
                            <MetricCard
                                title="Pending Leaves"
                                value={statsLoading ? '...' : stats?.pendingLeaves ?? 0}
                                icon={Hourglass}
                                color="bg-copperwood-500"
                            />
                            <MetricCard
                                title="Present Today"
                                value={statsLoading ? '...' : stats?.presentToday ?? 0}
                                icon={UserCheck}
                                color="bg-olive-leaf-500"
                            />
                        </div>

                        {/* Direct Shortcuts / Quick Sections */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-cornsilk-900 rounded-2xl p-6 border border-sunlit-clay-800 shadow-xs">
                                <h3 className="font-bold text-black-forest-500 mb-2">Quick Actions</h3>
                                <p className="text-xs text-olive-leaf-500 mb-4">Frequently used admin operations</p>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setActiveTab('employees')}
                                        className="px-4 py-2 bg-cornsilk-800 border border-sunlit-clay-700 hover:bg-cornsilk-700 rounded-xl text-xs font-semibold text-black-forest-500 transition-colors"
                                    >
                                        + Manage Employees
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('leaves')}
                                        className="px-4 py-2 bg-cornsilk-800 border border-sunlit-clay-700 hover:bg-cornsilk-700 rounded-xl text-xs font-semibold text-black-forest-500 transition-colors"
                                    >
                                        Review Leave Applications
                                    </button>
                                </div>
                            </div>

                            <div className="bg-cornsilk-900 rounded-2xl p-6 border border-sunlit-clay-800 shadow-xs">
                                <h3 className="font-bold text-black-forest-500 mb-2">System Status</h3>
                                <div className="space-y-2 text-xs text-olive-leaf-500">
                                    <p className="flex justify-between">
                                        <span>Authentication Mode:</span>
                                        <span className="font-bold text-black-forest-500">JWT Stateless</span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span>Role Protection:</span>
                                        <span className="font-bold text-black-forest-500">Spring Security RBAC</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'departments' && <DepartmentManager />}
                {activeTab === 'employees' && <EmployeeManager />}
                {activeTab === 'leaves' && <LeaveManager />}
                {activeTab === 'attendance' && <AttendanceManager />}
            </main>
        </div>
    );
}

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
}

function MetricCard({ title, value, icon: Icon, color }: MetricCardProps) {
    return (
        <div className="bg-cornsilk-900 rounded-2xl p-5 border border-sunlit-clay-800 shadow-xs flex items-center justify-between">
            <div>
                <p className="text-xs text-olive-leaf-500 font-medium mb-1">{title}</p>
                <p className="text-2xl font-extrabold text-black-forest-500">{value}</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl ${color} text-cornsilk-500 flex items-center justify-center shadow-sm`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    );
}

export default AdminDashboard;