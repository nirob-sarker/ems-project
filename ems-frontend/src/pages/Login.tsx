import { useState, type FormEvent } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import type { AuthResponse, ErrorResponse, LoginRequest } from '../types';

function Login() {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const { login, isAuthenticated, role } = useAuth();
    const navigate = useNavigate();

    // Already Login করা অবস্থায় Login Page এ এলে → নিজের Dashboard এ Redirect
    if (isAuthenticated) {
        return role === 'ADMIN'
            ? <Navigate to="/admin/dashboard" replace />
            : <Navigate to="/employee/dashboard" replace />;
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const requestBody: LoginRequest = { username, password };

        try {
            const response = await api.post<AuthResponse>('/auth/login', requestBody);
            const { token, username: resUsername, role: resRole } = response.data;

            login(token, resUsername, resRole);

            if (resRole === 'ADMIN') {
                navigate('/admin/dashboard');
            } else {
                navigate('/employee/dashboard');
            }
        } catch (err) {
            if (axios.isAxiosError<ErrorResponse>(err) && err.response) {
                setError(err.response.data.message);
            } else {
                setError('Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cornsilk-500 px-4">
            <div className="w-full max-w-md bg-cornsilk-900 rounded-2xl shadow-lg p-8 border border-sunlit-clay-800">

                <h1 className="text-3xl font-bold text-black-forest-500 mb-1 text-center">
                    Welcome Back
                </h1>
                <p className="text-olive-leaf-500 text-center mb-6">
                    Login to your EMS account
                </p>

                {error && (
                    <div className="bg-copperwood-900 text-copperwood-300 text-sm px-4 py-2 rounded-lg mb-4 border border-copperwood-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-black-forest-500 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-sunlit-clay-700 bg-cornsilk-800 text-black-forest-500 focus:outline-none focus:ring-2 focus:ring-olive-leaf-500"
                            placeholder="Enter your username"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-black-forest-500 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-sunlit-clay-700 bg-cornsilk-800 text-black-forest-500 focus:outline-none focus:ring-2 focus:ring-olive-leaf-500"
                            placeholder="Enter your password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black-forest-500 hover:bg-black-forest-600 text-cornsilk-500 font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p className="text-center text-sm text-olive-leaf-500 mt-6">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-copperwood-500 font-medium hover:underline">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;