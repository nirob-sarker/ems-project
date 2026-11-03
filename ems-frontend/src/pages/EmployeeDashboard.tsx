import { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../api/axiosConfig';
import Navbar from '../components/Navbar';
import type { Employee, ErrorResponse } from '../types';

function EmployeeDashboard() {
    const [profile, setProfile] = useState<Employee | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async (): Promise<void> => {
            try {
                const response = await api.get<Employee>('/employees/me');
                setProfile(response.data);
            } catch (err) {
                if (axios.isAxiosError<ErrorResponse>(err) && err.response) {
                    setError(err.response.data.message);
                } else {
                    setError('Failed to load profile.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    return (
        <div className="min-h-screen bg-cornsilk-500">
            <Navbar title="Employee Dashboard" />

            <div className="max-w-2xl mx-auto px-4 py-8">
                {loading ? (
                    <p className="text-olive-leaf-500 text-center">Loading profile...</p>
                ) : error ? (
                    <div className="bg-copperwood-900 text-copperwood-300 text-center px-4 py-3 rounded-lg border border-copperwood-700">
                        {error}
                    </div>
                ) : profile ? (
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