import { useState, useEffect, type FormEvent } from 'react';
import axios from 'axios';
import api from '../api/axiosConfig';
import Navbar from '../components/Navbar';
import type { Employee, ErrorResponse } from '../types';

function EmployeeDashboard() {
    const [profile, setProfile] = useState<Employee | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [showPasswordForm, setShowPasswordForm] = useState<boolean>(false);
    const [currentPassword, setCurrentPassword] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
    const [changingPassword, setChangingPassword] = useState<boolean>(false);

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

    return (
        <div className="min-h-screen bg-cornsilk-500">
            <Navbar title="Employee Dashboard" />

            <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
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

                {passwordSuccess && (
                    <div className="bg-black-forest-900 text-black-forest-700 text-sm px-4 py-3 rounded-lg border border-black-forest-700">
                        {passwordSuccess}
                    </div>
                )}

                <div className="bg-cornsilk-900 rounded-2xl shadow-lg border border-sunlit-clay-800 p-6">
                    <h3 className="text-lg font-bold text-black-forest-500 mb-4">Change Password</h3>

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
                            className="text-copperwood-500 font-medium hover:underline"
                        >
                            Click here to change your password
                        </button>
                    )}
                </div>
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