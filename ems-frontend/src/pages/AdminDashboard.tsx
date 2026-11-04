import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/api';
import type { DashboardStats } from '../types';
import EmployeeManager from '../components/EmployeeManager';
import DepartmentManager from '../components/DepartmentManager';
import LeaveManager from '../components/LeaveManager';
import AttendanceManager from '../components/AttendanceManager';

import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Calendar, 
  Clock, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

type AdminTabType = 'overview' | 'employees' | 'departments' | 'leaves' | 'attendance';

const AdminDashboard: React.FC = () => {
  const { username, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTabType>('overview');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await dashboardService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load dashboard stats', error);
    } finally {
      setLoading(false);
    }
  };

  // Get initials for avatar
  const getInitials = (): string => {
    if (!username) return 'AD';
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#f7e1d7]/20 flex flex-col md:flex-row font-sans">
      
      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-[#0f1d13] text-white flex flex-col justify-between
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-[#182c1e] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#486b51] flex items-center justify-center font-bold text-lg text-white shadow-md">
                EMS
              </div>
              <div>
                <h1 className="font-bold text-base tracking-wide text-white">Admin Portal</h1>
                <p className="text-xs text-[#a3b899]">System Management</p>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-[#a3b899] hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-[#486b51] text-white shadow-sm'
                  : 'text-[#a3b899] hover:bg-[#182c1e] hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard Overview</span>
            </button>

            <button
              onClick={() => { setActiveTab('employees'); setSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'employees'
                  ? 'bg-[#486b51] text-white shadow-sm'
                  : 'text-[#a3b899] hover:bg-[#182c1e] hover:text-white'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Manage Employees</span>
            </button>

            <button
              onClick={() => { setActiveTab('departments'); setSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'departments'
                  ? 'bg-[#486b51] text-white shadow-sm'
                  : 'text-[#a3b899] hover:bg-[#182c1e] hover:text-white'
              }`}
            >
              <Building2 className="w-5 h-5" />
              <span>Manage Departments</span>
            </button>

            <button
              onClick={() => { setActiveTab('leaves'); setSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'leaves'
                  ? 'bg-[#486b51] text-white shadow-sm'
                  : 'text-[#a3b899] hover:bg-[#182c1e] hover:text-white'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>Leave Requests</span>
              {(stats?.pendingLeaves ?? 0) > 0 && (
                <span className="ml-auto bg-[#d4e09b] text-[#0f1d13] font-bold text-xs px-2 py-0.5 rounded-full">
                  {stats?.pendingLeaves}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('attendance'); setSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'attendance'
                  ? 'bg-[#486b51] text-white shadow-sm'
                  : 'text-[#a3b899] hover:bg-[#182c1e] hover:text-white'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span>Attendance Log</span>
            </button>
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-[#182c1e]">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-[#65886e] text-white font-semibold flex items-center justify-center text-sm shadow">
              {getInitials()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">
                {username || 'Administrator'}
              </p>
              <p className="text-xs text-[#a3b899] truncate">System Admin</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg border border-[#65886e]/40 text-[#a3b899] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 text-sm font-medium transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* TOP HEADER */}
        <header className="bg-white border-b border-[#a3b899]/30 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-[#0f1d13] hover:bg-[#f7e1d7]/40"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-[#0f1d13] tracking-tight">
                {activeTab === 'overview' && 'Admin Dashboard'}
                {activeTab === 'employees' && 'Employee Directory'}
                {activeTab === 'departments' && 'Department Management'}
                {activeTab === 'leaves' && 'Leave Applications Review'}
                {activeTab === 'attendance' && 'Company Attendance Log'}
              </h2>
              <p className="text-xs text-[#486b51]">
                Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="hidden sm:inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#486b51]/10 text-[#486b51] border border-[#486b51]/20">
              <ShieldCheck className="w-3 h-3" />
              <span>Role: ADMIN</span>
            </span>
          </div>
        </header>

        {/* MAIN BODY CONTAINER */}
        <main className="p-6 max-w-7xl w-full mx-auto space-y-6">

          {activeTab === 'overview' && (
            <>
              {/* METRIC SUMMARY CARDS */}
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-4 border-[#486b51] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  
                  {/* CARD 1: TOTAL EMPLOYEES */}
                  <div className="bg-white rounded-2xl p-5 border border-[#a3b899]/30 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                      <p className="text-xs font-semibold text-[#65886e] uppercase tracking-wider">Total Employees</p>
                      <p className="text-2xl font-bold text-[#0f1d13] mt-1">{stats?.totalEmployees || 0}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Active profiles</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>

                  {/* CARD 2: DEPARTMENTS */}
                  <div className="bg-white rounded-2xl p-5 border border-[#a3b899]/30 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                      <p className="text-xs font-semibold text-[#65886e] uppercase tracking-wider">Departments</p>
                      <p className="text-2xl font-bold text-[#0f1d13] mt-1">{stats?.totalDepartments || 0}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Operational units</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-[#486b51]/10 text-[#486b51] flex items-center justify-center">
                      <Building2 className="w-6 h-6" />
                    </div>
                  </div>

                  {/* CARD 3: PENDING LEAVES */}
                  <div className="bg-white rounded-2xl p-5 border border-[#a3b899]/30 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                      <p className="text-xs font-semibold text-[#65886e] uppercase tracking-wider">Pending Leaves</p>
                      <p className="text-2xl font-bold text-[#0f1d13] mt-1">{stats?.pendingLeaves || 0}</p>
                      <p className="text-xs text-amber-600 font-medium mt-0.5">Require review</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Calendar className="w-6 h-6" />
                    </div>
                  </div>

                  {/* CARD 4: PRESENT TODAY */}
                  <div className="bg-white rounded-2xl p-5 border border-[#a3b899]/30 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                      <p className="text-xs font-semibold text-[#65886e] uppercase tracking-wider">Present Today</p>
                      <p className="text-2xl font-bold text-[#0f1d13] mt-1">{stats?.presentToday || 0}</p>
                      <p className="text-xs text-green-600 font-medium mt-0.5">Checked-in staff</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                      <Clock className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              )}

              {/* WELCOME / QUICK LINKS SECTION */}
              <div className="bg-white rounded-2xl border border-[#a3b899]/30 shadow-xs p-6 mt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#0f1d13] mb-2">Welcome back, {username}!</h3>
                    <p className="text-sm text-[#65886e] max-w-2xl">
                      As an Administrator, you have full access to manage employees, departments, oversee leave requests, and track daily attendance. Select an option from the sidebar or use the quick links to get started.
                    </p>
                  </div>
                  
                  <div className="flex flex-col space-y-3 min-w-[200px]">
                    <button 
                      onClick={() => setActiveTab('employees')}
                      className="flex items-center justify-between px-4 py-2.5 bg-[#f7e1d7]/30 hover:bg-[#f7e1d7]/60 border border-[#a3b899]/20 rounded-xl text-sm font-semibold text-[#0f1d13] transition-colors"
                    >
                      <span className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-[#486b51]" />
                        <span>Add New Employee</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#a3b899]" />
                    </button>
                    <button 
                      onClick={() => setActiveTab('leaves')}
                      className="flex items-center justify-between px-4 py-2.5 bg-[#f7e1d7]/30 hover:bg-[#f7e1d7]/60 border border-[#a3b899]/20 rounded-xl text-sm font-semibold text-[#0f1d13] transition-colors"
                    >
                      <span className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-[#486b51]" />
                        <span>Review Leaves</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#a3b899]" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* RENDER RESPECTIVE MANAGERS BASED ON TAB */}
          {activeTab === 'employees' && <EmployeeManager />}
          {activeTab === 'departments' && <DepartmentManager />}
          {activeTab === 'leaves' && <LeaveManager />}
          {activeTab === 'attendance' && <AttendanceManager />}

        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;