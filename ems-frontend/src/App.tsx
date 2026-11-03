import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* শুধু ADMIN এই Page এ ঢুকতে পারবে */}
            <Route
                path="/admin/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />

            {/* শুধু EMPLOYEE এই Page এ ঢুকতে পারবে */}
            <Route
                path="/employee/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                        <EmployeeDashboard />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}

export default App;