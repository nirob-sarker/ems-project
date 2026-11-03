import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: Role[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, role } = useAuth();

    // Login করা নেই → Login Page এ পাঠাও
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Role Restriction আছে এবং Current User এর Role allowed list এ নেই
    if (allowedRoles && role && !allowedRoles.includes(role)) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}