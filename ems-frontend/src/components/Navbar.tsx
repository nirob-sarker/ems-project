import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
    title: string;
}

export default function Navbar({ title }: NavbarProps) {
    const { username, role, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = (): void => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-black-forest-500 px-6 py-4 flex items-center justify-between shadow-md">
            <h1 className="text-cornsilk-500 text-xl font-bold">{title}</h1>
            <div className="flex items-center gap-4">
                <span className="text-cornsilk-800 text-sm">
                    {username} <span className="text-olive-leaf-700">({role})</span>
                </span>
                <button
                    onClick={handleLogout}
                    className="bg-copperwood-500 hover:bg-copperwood-400 text-cornsilk-500 text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}