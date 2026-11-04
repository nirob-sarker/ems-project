import { useState, useEffect, type FormEvent } from 'react';
import axios from 'axios';
import api from '../api/axiosConfig';
import Navbar from '../components/Navbar';
import type {
    Employee,
    LeaveRequest,
    LeaveType,
    LeaveStatus,
    CreateLeaveRequestInput,
    Attendance,
    ErrorResponse,
} from '../types';

function EmployeeDashboard() {
    const [profile, setProfile] = useState<Employee | null>(null);
    const [myLeaves, setMyLeaves] = useState<LeaveRequest[]>([]);
    const [myAttendance, setMyAttendance] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Attendance States
    const [attendanceError, setAttendanceError] = useState<string | null>(null);
    const [attendanceActionLoading, setAttendanceActionLoading] = useState<boolean>(false);

    // Password Change States
    const [showPasswordForm, setShowPasswordForm] = useState<boolean>(false);
    const [currentPassword, setCurrentPassword] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
    const [changingPassword, setChangingPassword] = useState<boolean>(false);

    // Leave Application States
    const [showLeaveForm, setShowLeaveForm] = useState<boolean>(false);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [leaveType, setLeaveType] = useState<LeaveType>('CASUAL');
    const [reason, setReason] = useState<string>('');
    const [leaveError, setLeaveError] = useState<string | null>(null);
    const [leaveSuccess, setLeaveSuccess] = useState<string | null>(null);
    const [submittingLeave, setSubmittingLeave] = useState<boolean>(false);

    const fetchAllData = async (): Promise<void> => {
        try {
            const [profileRes, leavesRes, attendanceRes] = await Promise.all([
                api.get<Employee>('/employees/me'),
                api.get<LeaveRequest[]>('/leaves/me'),
                api.get<Attendance[]>('/attendance/me'),
            ]);
            setProfile(profileRes.data);
            setMyLeaves(leavesRes.data);
            setMyAttendance(attendanceRes.data);
        } catch (err) {
            if (axios.isAxiosError<ErrorResponse>(err) && err.response) {
                setError(err.response.data.message);
            } else {
                setError('Failed to load profile data.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    // Check today's attendance status
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRecord = myAttendance.find((att) => itemIsToday(att.date, todayStr));

    function itemIsToday(dateStr: string, today: string) {
        return dateStr === today;
    }

    const handleCheckIn = async (): Promise<void> => {
        setAttendanceError(null);
        setAttendanceActionLoading(true);
        try {
            await api.post('/attendance/check-in');
            await fetchAllData();
        } catch (err) {
            if (axios.isAxiosError<ErrorResponse>(err) && err.response) {
                setAttendanceError(err.response.data.message);
            } else {
                setAttendanceError('Check-in failed.');
            }
        } finally {
            setAttendanceActionLoading(false);
        }
    };

    const handleCheckOut = async (): Promise<void> => {
        setAttendanceError(null);
        setAttendanceActionLoading(true);
        try {
            await api.put('/attendance/check-out');
            await fetchAllData();
        } catch (err) {
            if (axios.isAxiosError<ErrorResponse>(err) && err.response) {
                setAttendanceError(err.response.data.message);
            } else {
                setAttendanceError('Check-out failed.');
            }
        } finally {
            setAttendanceActionLoading(false);
        }
    };

    const handleChangePassword = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setPasswordError(null);
        setPasswordSuccess(null);
        setChangingPassword(true);

        try {
            await api.put('/auth/change-password', {
                currentPassword,
                newPassword,
            });
            setPasswordSuccess('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setShowPasswordForm(false);
        } catch (err) {
            if (axios.isAxiosError<ErrorResponse>(err) && err.response) {
                setPasswordError(err.response.data.message);
            } else {
                setPasswordError('Something went wrong. Please try again.');
            }
        } finally {
            setChangingPassword(false);
        }
    };

    const handleApplyLeave = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setLeaveError(null);
        setLeaveSuccess(null);
        setSubmittingLeave(true);

        const payload: CreateLeaveRequestInput = {
            startDate,
            endDate,
            leaveType,
            reason,
        };

        try {
            await api.post('/leaves', payload);
            setLeaveSuccess('Leave application submitted successfully!');
            setStartDate('');
            setEndDate('');
            setReason('');
            setShowLeaveForm(false);
            await fetchAllData();
        } catch (err) {
            if (axios.isAxiosError<ErrorResponse>(err) && err.response) {
                setLeaveError(err.response.data.message);
            } else {
                setLeaveError('Failed to submit leave request.');
            }
        } finally {
            setSubmittingLeave(false);
        }
    };

    const getStatusBadge = (status: LeaveStatus) => {
        switch (status) {
            case 'APPROVED':
                return 'bg-olive-leaf-600 text-cornsilk-500';
            case 'REJECTED':
                return 'bg-copperwood-500 text-cornsilk-500';
            default:
                return 'bg-sunlit-clay-500 text-black-forest-100';
        }
    };

    const formatTime = (timeString: string | null): string => {
        if (!timeString) return '--:--';
        return timeString.slice(0, 5);
    };

    return (
        <div className="min-h-screen bg-cornsilk-500">
            <Navbar title="Employee Dashboard" />

            <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
                {loading ? (
                    <p className="text-olive-leaf-500 text-center">Loading dashboard...</p>
                ) : error ? (
                    <div className="bg-copperwood-900 text-copperwood-300 text-center px-4 py-3 rounded-lg border border-copperwood-700">
                        {error}
                    </div>
                ) : profile ? (
                    <>
                        {/* Profile Section */}
                        <div className="bg-cornsilk-900 rounded-2xl shadow-lg border border-sunlit-clay-800 overflow-hidden">
                            <div className="bg-black-forest-500 px-6 py-5">
                                <h2 className="text-2xl font-bold text-cornsilk-500">{profile.name}</h2>
                                <p className="text-olive-leaf-700 text-sm">{profile.designation}</p>
                            </div>

                            <div className="p-6 space-y-4">
                                <ProfileRow label="Username" value={profile.username} />
                                <ProfileRow label="Email" value={profile.email} />
                                <ProfileRow label="Phone" value={profile.phone} />
                                <ProfileRow label="Department" value={profile.departmentName} />
                                <ProfileRow label="Salary" value={`৳${profile.salary.toLocaleString()}`} />
                                <ProfileRow label="Joining Date" value={profile.joiningDate} />
                            </div>
                        </div>

                        {/* Attendance Tracker Section */}
                        <div className="bg-cornsilk-900 rounded-2xl shadow-lg border border-sunlit-clay-800 p-6">
                            <h3 className="text-lg font-bold text-black-forest-500 mb-4">Daily Attendance</h3>

                            {attendanceError && (
                                <div className="bg-copperwood-900 text-copperwood-300 text-sm px-3 py-2 rounded-lg border border-copperwood-700 mb-4">
                                    {attendanceError}
                                </div>
                            )}

                            {/* Check-In / Check-Out Actions */}
                            <div className="bg-cornsilk-800 rounded-xl p-4 border border-sunlit-clay-700 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                                <div>
                                    <p className="text-xs text-olive-leaf-500 font-medium">TODAY'S STATUS</p>
                                    <p className="text-sm font-bold text-black-forest-500">
                                        {!todayRecord ? (
                                            'Not Checked In'
                                        ) : todayRecord.checkOutTime ? (
                                            <span className="text-olive-leaf-600">Day Completed (Checked Out)</span>
                                        ) : (
                                            <span className="text-copperwood-500">Currently Checked In</span>
                                        )}
                                    </p>
                                    {todayRecord && (
                                        <p className="text-xs text-olive-leaf-500 mt-0.5">
                                            In: {formatTime(todayRecord.checkInTime)} | Out: {formatTime(todayRecord.checkOutTime)}
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    {!todayRecord && (
                                        <button
                                            onClick={handleCheckIn}
                                            disabled={attendanceActionLoading}
                                            className="bg-black-forest-500 hover:bg-black-forest-600 text-cornsilk-500 font-semibold px-5 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                                        >
                                            {attendanceActionLoading ? 'Processing...' : 'Check In'}
                                        </button>
                                    )}

                                    {todayRecord && !todayRecord.checkOutTime && (
                                        <button
                                            onClick={handleCheckOut}
                                            disabled={attendanceActionLoading}
                                            className="bg-copperwood-500 hover:bg-copperwood-600 text-cornsilk-500 font-semibold px-5 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                                        >
                                            {attendanceActionLoading ? 'Processing...' : 'Check Out'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Attendance History */}
                            <h4 className="text-sm font-semibold text-olive-leaf-500 mb-2">Attendance History</h4>
                            {myAttendance.length === 0 ? (
                                <p className="text-xs text-olive-leaf-500 text-center py-2">No attendance records found.</p>
                            ) : (
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                    {myAttendance.map((att) => (
                                        <div key={att.id} className="flex justify-between items-center bg-cornsilk-800 p-2.5 rounded-lg border border-sunlit-clay-800 text-xs">
                                            <span className="font-medium text-black-forest-500">{att.date}</span>
                                            <span className="font-mono text-olive-leaf-500">
                                                In: {formatTime(att.checkInTime)} | Out: {formatTime(att.checkOutTime)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Leave Request Section */}
                        <div className="bg-cornsilk-900 rounded-2xl shadow-lg border border-sunlit-clay-800 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-black-forest-500">My Leave Applications</h3>
                                <button
                                    onClick={() => setShowLeaveForm(!showLeaveForm)}
                                    className="bg-black-forest-500 hover:bg-black-forest-600 text-cornsilk-500 font-medium text-sm px-4 py-2 rounded-lg transition-colors"
                                >
                                    {showLeaveForm ? 'Cancel' : '+ Apply for Leave'}
                                </button>
                            </div>

                            {leaveSuccess && (
                                <div className="bg-black-forest-900 text-black-forest-700 text-sm px-4 py-2 rounded-lg border border-black-forest-700 mb-4">
                                    {leaveSuccess}
                                </div>
                            )}

                            {showLeaveForm && (
                                <form onSubmit={handleApplyLeave} className="bg-cornsilk-800 border border-sunlit-clay-700 rounded-lg p-5 mb-6 space-y-4">
                                    <h4 className="font-semibold text-black-forest-500">New Leave Request</h4>

                                    {leaveError && (
                                        <div className="bg-copperwood-900 text-copperwood-300 text-sm px-3 py-2 rounded-lg border border-copperwood-700">
                                            {leaveError}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-black-forest-500 mb-1">
                                                Start Date
                                            </label>
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                required
                                                className="w-full px-4 py-2 rounded-lg border border-sunlit-clay-700 bg-cornsilk-900 text-black-forest-500 focus:outline-none focus:ring-2 focus:ring-olive-leaf-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-black-forest-500 mb-1">
                                                End Date
                                            </label>
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                required
                                                className="w-full px-4 py-2 rounded-lg border border-sunlit-clay-700 bg-cornsilk-900 text-black-forest-500 focus:outline-none focus:ring-2 focus:ring-olive-leaf-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-black-forest-500 mb-1">
                                            Leave Type
                                        </label>
                                        <select
                                            value={leaveType}
                                            onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                                            className="w-full px-4 py-2 rounded-lg border border-sunlit-clay-700 bg-cornsilk-900 text-black-forest-500 focus:outline-none focus:ring-2 focus:ring-olive-leaf-500"
                                        >
                                            <option value="CASUAL">Casual Leave</option>
                                            <option value="SICK">Sick Leave</option>
                                            <option value="ANNUAL">Annual Leave</option>
                                            <option value="UNPAID">Unpaid Leave</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-black-forest-500 mb-1">
                                            Reason
                                        </label>
                                        <textarea
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            required
                                            rows={3}
                                            placeholder="Explain reason for leave..."
                                            className="w-full px-4 py-2 rounded-lg border border-sunlit-clay-700 bg-cornsilk-900 text-black-forest-500 focus:outline-none focus:ring-2 focus:ring-olive-leaf-500"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submittingLeave}
                                        className="bg-black-forest-500 hover:bg-black-forest-600 text-cornsilk-500 font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {submittingLeave ? 'Submitting...' : 'Submit Application'}
                                    </button>
                                </form>
                            )}

                            {myLeaves.length === 0 ? (
                                <p className="text-olive-leaf-500 text-sm text-center py-2">No leave applications submitted yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {myLeaves.map((leave) => (
                                        <div key={leave.id} className="border border-sunlit-clay-800 rounded-lg p-3.5 bg-cornsilk-800 flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-black-forest-500 text-sm uppercase">{leave.leaveType}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(leave.status)}`}>
                                                        {leave.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-olive-leaf-500">
                                                    {leave.startDate} to {leave.endDate}
                                                </p>
                                                <p className="text-xs text-black-forest-500 mt-1 italic">
                                                    "{leave.reason}"
                                                </p>
                                            </div>
                                            <span className="text-[11px] text-sunlit-clay-300">
                                                Applied: {leave.appliedOn}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Password Change Section */}
                        <div className="bg-cornsilk-900 rounded-2xl shadow-lg border border-sunlit-clay-800 p-6">
                            <h3 className="text-lg font-bold text-black-forest-500 mb-4">Security</h3>

                            {passwordSuccess && (
                                <div className="bg-black-forest-900 text-black-forest-700 text-sm px-4 py-2 rounded-lg border border-black-forest-700 mb-4">
                                    {passwordSuccess}
                                </div>
                            )}

                            {showPasswordForm ? (
                                <form onSubmit={handleChangePassword} className="space-y-4">
                                    {passwordError && (
                                        <div className="bg-copperwood-900 text-copperwood-300 text-sm px-3 py-2 rounded-lg border border-copperwood-700">
                                            {passwordError}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-black-forest-500 mb-1">
                                            Current Password
                                        </label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            required
                                            className="w-full px-4 py-2 rounded-lg border border-sunlit-clay-700 bg-cornsilk-800 text-black-forest-500 focus:outline-none focus:ring-2 focus:ring-olive-leaf-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-black-forest-500 mb-1">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            minLength={6}
                                            className="w-full px-4 py-2 rounded-lg border border-sunlit-clay-700 bg-cornsilk-800 text-black-forest-500 focus:outline-none focus:ring-2 focus:ring-olive-leaf-500"
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            disabled={changingPassword}
                                            className="bg-black-forest-500 hover:bg-black-forest-600 text-cornsilk-500 font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {changingPassword ? 'Changing...' : 'Change Password'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowPasswordForm(false);
                                                setPasswordError(null);
                                                setCurrentPassword('');
                                                setNewPassword('');
                                            }}
                                            className="bg-cornsilk-900 border border-sunlit-clay-700 text-black-forest-500 font-medium px-4 py-2 rounded-lg hover:bg-cornsilk-800 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <button
                                    onClick={() => setShowPasswordForm(true)}
                                    className="text-copperwood-500 font-medium hover:underline text-sm"
                                >
                                    Click here to change your password
                                </button>
                            )}
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
}

interface ProfileRowProps {
    label: string;
    value: string;
}

function ProfileRow({ label, value }: ProfileRowProps) {
    return (
        <div className="flex justify-between items-center border-b border-sunlit-clay-800 pb-3 last:border-0 last:pb-0">
            <span className="text-sm font-medium text-olive-leaf-500">{label}</span>
            <span className="text-black-forest-500 font-semibold">{value}</span>
        </div>
    );
}

export default EmployeeDashboard;