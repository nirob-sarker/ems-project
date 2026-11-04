import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { 
  employeeService, 
  leaveService, 
  attendanceService, 
  authService 
} from '../services/api';
import type { 
  Employee, 
  LeaveRequest, 
  Attendance, 
  LeaveType 
} from '../types';
import { 
  User, 
  Clock, 
  Calendar, 
  Key, 
  LogOut, 
  Menu, 
  X, 
  CheckCircle2, 
  Plus, 
  Building2, 
  AlertCircle
} from 'lucide-react';

type TabType = 'overview' | 'attendance' | 'leaves' | 'password';

const EmployeeDashboard: React.FC = () => {
  const { username, role, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Data States
  const [profile, setProfile] = useState<Employee | null>(null);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<Attendance[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);

  // UI States
  const [loading, setLoading] = useState<boolean>(true);
  const [actionError, setActionError] = useState<string>('');
  const [actionSuccess, setActionSuccess] = useState<string>('');

  // Modal State for Leave Application
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [leaveType, setLeaveType] = useState<LeaveType>('CASUAL');
  const [reason, setReason] = useState<string>('');
  const [submittingLeave, setSubmittingLeave] = useState<boolean>(false);

  // Password Form States
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [changingPassword, setChangingPassword] = useState<boolean>(false);

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = async () => {
    setLoading(true);
    setActionError('');

    // 1. Fetch Profile
    try {
      const profileRes = await employeeService.getMyProfile();
      setProfile(profileRes.data);
    } catch (err: unknown) {
      console.error('Failed to load profile', err);
      setActionError('Could not load profile details.');
    }

    // 2. Fetch My Leaves
    try {
      const leavesRes = await leaveService.getMyLeaves();
      setLeaves(leavesRes.data);
    } catch (err: unknown) {
      console.error('Failed to load leaves', err);
    }

    // 3. Fetch My Attendance
    try {
      const attendanceRes = await attendanceService.getMyLogs();
      const logs: Attendance[] = attendanceRes.data;
      setAttendanceLogs(logs);

      const todayStr = new Date().toISOString().split('T')[0];
      const todayRec = logs.find(log => log.date === todayStr);
      setTodayAttendance(todayRec || null);
    } catch (err: unknown) {
      console.error('Failed to load attendance logs', err);
    } finally {
      setLoading(false);
    }
  };

  // Check In Handler
  const handleCheckIn = async () => {
    setActionError('');
    setActionSuccess('');
    try {
      await attendanceService.checkIn();
      setActionSuccess('Successfully checked in for today!');
      fetchEmployeeData();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Check-in failed';
      setActionError(errorMsg);
    }
  };

  // Check Out Handler
  const handleCheckOut = async () => {
    setActionError('');
    setActionSuccess('');
    try {
      await attendanceService.checkOut();
      setActionSuccess('Successfully checked out for today!');
      fetchEmployeeData();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Check-out failed';
      setActionError(errorMsg);
    }
  };

  // Submit Leave Handler
  const handleApplyLeave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');
    setSubmittingLeave(true);

    try {
      await leaveService.applyLeave({
        startDate,
        endDate,
        leaveType,
        reason,
      });
      setActionSuccess('Leave request submitted successfully!');
      setIsLeaveModalOpen(false);
      setStartDate('');
      setEndDate('');
      setLeaveType('CASUAL');
      setReason('');
      fetchEmployeeData();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to submit leave request';
      setActionError(errorMsg);
    } finally {
      setSubmittingLeave(false);
    }
  };

    // Password Change Handler
  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');

    if (newPassword !== confirmPassword) {
      setActionError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setActionError('Password must be at least 6 characters long');
      return;
    }

    setChangingPassword(true);
    try {
      await authService.changePassword({ currentPassword: oldPassword, newPassword });
      setActionSuccess('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Password change failed', err);
      const serverMessage = err?.response?.data?.message || err?.message || 'Failed to change password';
      setActionError(serverMessage);
    } finally {
      setChangingPassword(false);
    }
  };

  // Extract User Initials
  const getInitials = (): string => {
    const empName = profile?.name?.trim();
    if (!empName) {
      return username ? username.slice(0, 2).toUpperCase() : 'EM';
    }
    const parts = empName.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return empName.slice(0, 2).toUpperCase();
  };

  // Calculated Counters
  const pendingLeavesCount = leaves.filter(l => l.status === 'PENDING').length;
  const approvedLeavesCount = leaves.filter(l => l.status === 'APPROVED').length;

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
                <h1 className="font-bold text-base tracking-wide text-white">Employee Portal</h1>
                <p className="text-xs text-[#a3b899]">Workspace Management</p>
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
              <User className="w-5 h-5" />
              <span>My Profile & Stats</span>
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
              <span>Attendance History</span>
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
              {pendingLeavesCount > 0 && (
                <span className="ml-auto bg-[#d4e09b] text-[#0f1d13] font-bold text-xs px-2 py-0.5 rounded-full">
                  {pendingLeavesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('password'); setSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'password'
                  ? 'bg-[#486b51] text-white shadow-sm'
                  : 'text-[#a3b899] hover:bg-[#182c1e] hover:text-white'
              }`}
            >
              <Key className="w-5 h-5" />
              <span>Security & Password</span>
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
                {profile?.name || username}
              </p>
              <p className="text-xs text-[#a3b899] truncate">{profile?.email || username}</p>
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
                {activeTab === 'overview' && 'Employee Dashboard'}
                {activeTab === 'attendance' && 'My Attendance Log'}
                {activeTab === 'leaves' && 'My Leave Requests'}
                {activeTab === 'password' && 'Account Security'}
              </h2>
              <p className="text-xs text-[#486b51]">
                Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#d4e09b]/40 text-[#0f1d13] border border-[#d4e09b]">
              Role: {role || 'EMPLOYEE'}
            </span>
          </div>
        </header>

        {/* MAIN BODY CONTAINER */}
        <main className="p-6 max-w-7xl w-full mx-auto space-y-6">

          {/* GLOBAL FEEDBACK ALERTS */}
          {actionError && (
            <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm shadow-xs">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {actionSuccess && (
            <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {/* LOADING STATE */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-10 h-10 border-4 border-[#486b51] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-[#486b51]">Loading employee profile...</p>
            </div>
          ) : (
            <>
              {/* METRIC SUMMARY CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                
                {/* CARD 1: TODAY'S ATTENDANCE STATUS */}
                <div className="bg-white rounded-2xl p-5 border border-[#a3b899]/30 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[#65886e] uppercase tracking-wider">Today's Status</p>
                    <p className="text-lg font-bold text-[#0f1d13] mt-1">
                      {todayAttendance ? (todayAttendance.checkOutTime ? 'Checked Out' : 'Checked In') : 'Not Checked In'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {todayAttendance?.checkInTime ? `In: ${todayAttendance.checkInTime.slice(0,5)}` : 'No active session'}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    todayAttendance?.checkOutTime ? 'bg-blue-100 text-blue-600' :
                    todayAttendance?.checkInTime ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    <Clock className="w-6 h-6" />
                  </div>
                </div>

                {/* CARD 2: DEPARTMENT */}
                <div className="bg-white rounded-2xl p-5 border border-[#a3b899]/30 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[#65886e] uppercase tracking-wider">Department</p>
                    <p className="text-lg font-bold text-[#0f1d13] mt-1 truncate max-w-[150px]">
                      {profile?.departmentName || 'Unassigned'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Assigned Unit</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#486b51]/10 text-[#486b51] flex items-center justify-center">
                    <Building2 className="w-6 h-6" />
                  </div>
                </div>

                {/* CARD 3: PENDING LEAVES */}
                <div className="bg-white rounded-2xl p-5 border border-[#a3b899]/30 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[#65886e] uppercase tracking-wider">Pending Leaves</p>
                    <p className="text-2xl font-bold text-[#0f1d13] mt-1">{pendingLeavesCount}</p>
                    <p className="text-xs text-amber-600 font-medium mt-0.5">Awaiting approval</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>

                {/* CARD 4: APPROVED LEAVES */}
                <div className="bg-white rounded-2xl p-5 border border-[#a3b899]/30 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[#65886e] uppercase tracking-wider">Approved Leaves</p>
                    <p className="text-2xl font-bold text-[#0f1d13] mt-1">{approvedLeavesCount}</p>
                    <p className="text-xs text-green-600 font-medium mt-0.5">Granted total</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>

              </div>

              {/* TAB 1: OVERVIEW & PROFILE */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* PROFILE DETAILS CARD */}
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-[#a3b899]/30 shadow-xs p-6 space-y-6">
                    <div className="flex items-center space-x-4 border-b border-gray-100 pb-5">
                      <div className="w-16 h-16 rounded-2xl bg-[#486b51] text-white font-bold text-2xl flex items-center justify-center shadow-md">
                        {getInitials()}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[#0f1d13]">
                          {profile?.name || username || 'Employee'}
                        </h3>
                        <p className="text-sm font-medium text-[#65886e]">{profile?.designation || 'Staff Member'}</p>
                        <p className="text-xs text-gray-500 mt-0.5">EMP ID: #{profile?.id || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-[#f7e1d7]/20 border border-[#a3b899]/20">
                        <span className="text-xs text-[#65886e] font-semibold block uppercase">Email Address</span>
                        <span className="text-sm font-bold text-[#0f1d13]">{profile?.email || 'N/A'}</span>
                      </div>
                      <div className="p-4 rounded-xl bg-[#f7e1d7]/20 border border-[#a3b899]/20">
                        <span className="text-xs text-[#65886e] font-semibold block uppercase">Phone Number</span>
                        <span className="text-sm font-bold text-[#0f1d13]">{profile?.phone || 'Not provided'}</span>
                      </div>
                      <div className="p-4 rounded-xl bg-[#f7e1d7]/20 border border-[#a3b899]/20">
                        <span className="text-xs text-[#65886e] font-semibold block uppercase">Department</span>
                        <span className="text-sm font-bold text-[#0f1d13]">{profile?.departmentName || 'Unassigned'}</span>
                      </div>
                      <div className="p-4 rounded-xl bg-[#f7e1d7]/20 border border-[#a3b899]/20">
                        <span className="text-xs text-[#65886e] font-semibold block uppercase">Joining Date</span>
                        <span className="text-sm font-bold text-[#0f1d13]">{profile?.joiningDate || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* QUICK ACTIONS SIDE CARD */}
                  <div className="bg-white rounded-2xl border border-[#a3b899]/30 shadow-xs p-6 space-y-5 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-[#0f1d13] mb-4">Quick Actions</h3>
                      
                      {/* ATTENDANCE TOGGLE BOX */}
                      <div className="p-4 rounded-xl bg-[#0f1d13] text-white space-y-3 mb-4">
                        <p className="text-xs font-semibold text-[#a3b899] uppercase tracking-wider">Daily Attendance Action</p>
                        <div className="flex items-center justify-between text-xs text-gray-300">
                          <span>In: <strong>{todayAttendance?.checkInTime ? todayAttendance.checkInTime.slice(0,5) : '--:--'}</strong></span>
                          <span>Out: <strong>{todayAttendance?.checkOutTime ? todayAttendance.checkOutTime.slice(0,5) : '--:--'}</strong></span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <button
                            onClick={handleCheckIn}
                            disabled={!!todayAttendance?.checkInTime}
                            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all shadow-xs ${
                              todayAttendance?.checkInTime
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-[#486b51] hover:bg-[#65886e] text-white'
                            }`}
                          >
                            Check In
                          </button>
                          <button
                            onClick={handleCheckOut}
                            disabled={!todayAttendance?.checkInTime || !!todayAttendance?.checkOutTime}
                            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all shadow-xs ${
                              !todayAttendance?.checkInTime || todayAttendance?.checkOutTime
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-[#d4e09b] hover:bg-yellow-300 text-[#0f1d13]'
                            }`}
                          >
                            Check Out
                          </button>
                        </div>
                      </div>

                      {/* APPLY LEAVE BUTTON */}
                      <button
                        onClick={() => setIsLeaveModalOpen(true)}
                        className="w-full py-3 px-4 bg-[#486b51] hover:bg-[#65886e] text-white rounded-xl text-sm font-bold flex items-center justify-center space-x-2 shadow-xs transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Request Time Off / Leave</span>
                      </button>
                    </div>

                    <div className="pt-4 border-t border-gray-100 text-xs text-[#65886e]">
                      Need details updated? Contact system Administrator.
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: DAILY ATTENDANCE LOG */}
              {activeTab === 'attendance' && (
                <div className="bg-white rounded-2xl border border-[#a3b899]/30 shadow-xs overflow-hidden">
                  <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#0f1d13]">Attendance History</h3>
                      <p className="text-xs text-[#65886e]">Your record of daily check-ins and check-outs</p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleCheckIn}
                        disabled={!!todayAttendance?.checkInTime}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                          todayAttendance?.checkInTime
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-[#486b51] hover:bg-[#65886e] text-white'
                        }`}
                      >
                        Check In Today
                      </button>
                      <button
                        onClick={handleCheckOut}
                        disabled={!todayAttendance?.checkInTime || !!todayAttendance?.checkOutTime}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                          !todayAttendance?.checkInTime || todayAttendance?.checkOutTime
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-[#d4e09b] hover:bg-yellow-400 text-[#0f1d13]'
                        }`}
                      >
                        Check Out Today
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-[#f7e1d7]/30 border-b border-[#a3b899]/20 text-[#0f1d13] uppercase text-xs font-semibold tracking-wider">
                          <th className="p-4">Date</th>
                          <th className="p-4">Check-In Time</th>
                          <th className="p-4">Check-Out Time</th>
                          <th className="p-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {attendanceLogs.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-gray-400">
                              No attendance logs recorded yet.
                            </td>
                          </tr>
                        ) : (
                          attendanceLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="p-4 font-semibold text-[#0f1d13]">{log.date}</td>
                              <td className="p-4 text-gray-700 font-mono text-xs">{log.checkInTime ? log.checkInTime.slice(0,5) : '--:--'}</td>
                              <td className="p-4 text-gray-700 font-mono text-xs">{log.checkOutTime ? log.checkOutTime.slice(0,5) : '--:--'}</td>
                              <td className="p-4">
                                {log.checkOutTime ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Completed
                                  </span>
                                ) : log.checkInTime ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Active Now
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    Incomplete
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: LEAVE REQUESTS */}
              {activeTab === 'leaves' && (
                <div className="bg-white rounded-2xl border border-[#a3b899]/30 shadow-xs overflow-hidden">
                  <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#0f1d13]">Leave Applications</h3>
                      <p className="text-xs text-[#65886e]">Track and manage your submitted leave requests</p>
                    </div>
                    <button
                      onClick={() => setIsLeaveModalOpen(true)}
                      className="px-4 py-2 bg-[#486b51] hover:bg-[#65886e] text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xs transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Apply For Leave</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-[#f7e1d7]/30 border-b border-[#a3b899]/20 text-[#0f1d13] uppercase text-xs font-semibold tracking-wider">
                          <th className="p-4">Leave Type</th>
                          <th className="p-4">Start Date</th>
                          <th className="p-4">End Date</th>
                          <th className="p-4">Reason</th>
                          <th className="p-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {leaves.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-400">
                              You have not submitted any leave requests yet.
                            </td>
                          </tr>
                        ) : (
                          leaves.map((leave) => (
                            <tr key={leave.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="p-4 font-bold text-[#0f1d13]">{leave.leaveType}</td>
                              <td className="p-4 text-gray-700">{leave.startDate}</td>
                              <td className="p-4 text-gray-700">{leave.endDate}</td>
                              <td className="p-4 text-gray-600 max-w-xs truncate">{leave.reason}</td>
                              <td className="p-4">
                                {leave.status === 'APPROVED' && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                    Approved
                                  </span>
                                )}
                                {leave.status === 'REJECTED' && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
                                    Rejected
                                  </span>
                                )}
                                {leave.status === 'PENDING' && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                                    Pending Review
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: CHANGE PASSWORD */}
              {activeTab === 'password' && (
                <div className="max-w-xl bg-white rounded-2xl border border-[#a3b899]/30 shadow-xs p-6">
                  <h3 className="text-lg font-bold text-[#0f1d13] mb-1">Change Account Password</h3>
                  <p className="text-xs text-[#65886e] mb-6">Ensure your account uses a strong, secure password.</p>

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0f1d13] uppercase tracking-wider mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        required
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#486b51] text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0f1d13] uppercase tracking-wider mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#486b51] text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0f1d13] uppercase tracking-wider mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#486b51] text-sm"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={changingPassword}
                        className="w-full py-3 bg-[#486b51] hover:bg-[#65886e] text-white font-bold rounded-xl text-sm transition-all shadow-xs disabled:opacity-50"
                      >
                        {changingPassword ? 'Updating Password...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}

        </main>
      </div>

      {/* POPUP MODAL: APPLY FOR LEAVE */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Submit Leave Application"
      >
        <form onSubmit={handleApplyLeave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#0f1d13] uppercase tracking-wider mb-1">
              Leave Type
            </label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value as LeaveType)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#486b51] text-sm bg-white"
            >
              <option value="CASUAL">Casual Leave</option>
              <option value="SICK">Sick Leave</option>
              <option value="ANNUAL">Annual Leave</option>
              <option value="UNPAID">Unpaid Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0f1d13] uppercase tracking-wider mb-1">
                Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#486b51] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0f1d13] uppercase tracking-wider mb-1">
                End Date
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#486b51] text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0f1d13] uppercase tracking-wider mb-1">
              Reason for Leave
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide details regarding your leave request..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#486b51] text-sm resize-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-semibold text-xs hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingLeave}
              className="px-4 py-2 rounded-xl bg-[#486b51] hover:bg-[#65886e] text-white font-semibold text-xs transition-colors disabled:opacity-50"
            >
              {submittingLeave ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default EmployeeDashboard;