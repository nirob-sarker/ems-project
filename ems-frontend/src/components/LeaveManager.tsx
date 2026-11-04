import { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../api/axiosConfig';
import type { LeaveRequest, LeaveStatus, ErrorResponse } from '../types';

function LeaveManager() {
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const fetchLeaves = async (): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get<LeaveRequest[]>('/leaves');
            setLeaves(response.data);
        } catch {
            setError('Failed to load leave requests.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const handleStatusUpdate = async (id: number, newStatus: LeaveStatus): Promise<void> => {
        setUpdatingId(id);
        try {
            await api.put(`/leaves/${id}/status`, { status: newStatus });
            await fetchLeaves();
        } catch (err) {
            if (axios.isAxiosError<ErrorResponse>(err) && err.response) {
                alert(err.response.data.message);
            } else {
                alert('Failed to update status.');
            }
        } finally {
            setUpdatingId(null);
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

    return (
        <div className="bg-cornsilk-900 rounded-xl p-6 border border-sunlit-clay-800">
            <h2 className="text-xl font-bold text-black-forest-500 mb-6">Leave Applications</h2>

            {loading ? (
                <p className="text-olive-leaf-500">Loading leave requests...</p>
            ) : error ? (
                <p className="text-copperwood-500">{error}</p>
            ) : leaves.length === 0 ? (
                <p className="text-olive-leaf-500 text-center py-4">No leave requests submitted yet.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-sunlit-clay-700">
                                <th className="py-2 text-sm font-semibold text-olive-leaf-500">Employee</th>
                                <th className="py-2 text-sm font-semibold text-olive-leaf-500">Department</th>
                                <th className="py-2 text-sm font-semibold text-olive-leaf-500">Type</th>
                                <th className="py-2 text-sm font-semibold text-olive-leaf-500">Dates</th>
                                <th className="py-2 text-sm font-semibold text-olive-leaf-500">Reason</th>
                                <th className="py-2 text-sm font-semibold text-olive-leaf-500">Status</th>
                                <th className="py-2 text-sm font-semibold text-olive-leaf-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaves.map((leave) => (
                                <tr key={leave.id} className="border-b border-sunlit-clay-800 hover:bg-cornsilk-800 transition-colors">
                                    <td className="py-3 text-black-forest-500 font-medium">{leave.employeeName}</td>
                                    <td className="py-3 text-olive-leaf-500">{leave.departmentName}</td>
                                    <td className="py-3 text-black-forest-500 font-semibold text-xs uppercase">{leave.leaveType}</td>
                                    <td className="py-3 text-black-forest-500 text-xs">
                                        {leave.startDate} to {leave.endDate}
                                    </td>
                                    <td className="py-3 text-black-forest-500 text-sm max-w-xs truncate" title={leave.reason}>
                                        {leave.reason}
                                    </td>
                                    <td className="py-3">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusBadge(leave.status)}`}>
                                            {leave.status}
                                        </span>
                                    </td>
                                    <td className="py-3 text-right space-x-2">
                                        {leave.status === 'PENDING' ? (
                                            <>
                                                <button
                                                    onClick={() => handleStatusUpdate(leave.id, 'APPROVED')}
                                                    disabled={updatingId === leave.id}
                                                    className="bg-black-forest-500 hover:bg-black-forest-600 text-cornsilk-500 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(leave.id, 'REJECTED')}
                                                    disabled={updatingId === leave.id}
                                                    className="bg-copperwood-500 hover:bg-copperwood-600 text-cornsilk-500 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        ) : (
                                            <span className="text-xs text-olive-leaf-500 italic">No action</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default LeaveManager;