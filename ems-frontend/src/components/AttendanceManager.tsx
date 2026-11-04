import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import type { Attendance } from '../types';

function AttendanceManager() {
    const [attendances, setAttendances] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAttendances = async (): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get<Attendance[]>('/attendance');
            setAttendances(response.data);
        } catch {
            setError('Failed to load attendance records.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendances();
    }, []);

    const formatTime = (timeString: string | null): string => {
        if (!timeString) return '--:--';
        return timeString.slice(0, 5); // "09:30:15" -> "09:30"
    };

    return (
        <div className="bg-cornsilk-900 rounded-xl p-6 border border-sunlit-clay-800">
            <h2 className="text-xl font-bold text-black-forest-500 mb-6">Attendance Log</h2>

            {loading ? (
                <p className="text-olive-leaf-500">Loading attendance records...</p>
            ) : error ? (
                <p className="text-copperwood-500">{error}</p>
            ) : attendances.length === 0 ? (
                <p className="text-olive-leaf-500 text-center py-4">No attendance records found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-sunlit-clay-700">
                                <th className="py-2 text-sm font-semibold text-olive-leaf-500">Date</th>
                                <th className="py-2 text-sm font-semibold text-olive-leaf-500">Employee</th>
                                <th className="py-2 text-sm font-semibold text-olive-leaf-500">Department</th>
                                <th className="py-2 text-sm font-semibold text-olive-leaf-500">Check-In</th>
                                <th className="py-2 text-sm font-semibold text-olive-leaf-500">Check-Out</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendances.map((item) => (
                                <tr key={item.id} className="border-b border-sunlit-clay-800 hover:bg-cornsilk-800 transition-colors">
                                    <td className="py-3 text-black-forest-500 font-medium">{item.date}</td>
                                    <td className="py-3 text-black-forest-500">{item.employeeName}</td>
                                    <td className="py-3 text-olive-leaf-500">{item.departmentName}</td>
                                    <td className="py-3 text-black-forest-500 font-mono text-sm">
                                        {formatTime(item.checkInTime)}
                                    </td>
                                    <td className="py-3 text-black-forest-500 font-mono text-sm">
                                        {formatTime(item.checkOutTime)}
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

export default AttendanceManager;