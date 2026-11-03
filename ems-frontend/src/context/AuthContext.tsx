import { createContext, useContext, useState, type ReactNode } from 'react';
import type { AuthContextType, Role } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [username, setUsername] = useState<string | null>(
        localStorage.getItem('username')
    );
    const [role, setRole] = useState<Role | null>(
        localStorage.getItem('role') as Role | null
    );

    const isAuthenticated: boolean = username !== null;

    const login = (token: string, newUsername: string, newRole: Role): void => {
        localStorage.setItem('token', token);
        localStorage.setItem('username', newUsername);
        localStorage.setItem('role', newRole);
        setUsername(newUsername);
        setRole(newRole);
    };

    const logout = (): void => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        setUsername(null);
        setRole(null);
    };

    const value: AuthContextType = {
        username,
        role,
        isAuthenticated,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}