import { useState, useEffect, type FormEvent } from 'react';
import axios from 'axios';
import api from '../api/axiosConfig';
import Modal from './Modal';
import type {
    Employee,
    EmployeeRequest,
    EmployeeUpdateRequest,
    Department,
    UserSummary,
    ErrorResponse,
} from '../types';
import { Plus, Edit2, Trash2, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

function EmployeeManager() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [unassignedUsers, setUnassignedUsers] = useState<UserSummary[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Modal & Form States
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [name, setName] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [designation, setDesignation] = useState<string>('');
    const [salary, setSalary] = useState<string>('');
    const [joiningDate, setJoiningDate] = useState<string>('');
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [selectedDeptId, setSelectedDeptId] = useState<string>('');

    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState<boolean>(false);

    // Search, Filter & Pagination States
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedFilterDeptId, setSelectedFilterDeptId] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 5;

    const fetchData = async (): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            const [empRes, deptRes] = await Promise.all([
                api.get<Employee[]>('/employees'),
                api.get<Department[]>('/departments'),
            ]);
            setEmployees(empRes.data);
            setDepartments(deptRes.data);
        } catch {
            setError('Failed to load data.');
        } finally {
            setLoading(false);
        }
    };

    const fetchUnassignedUsers = async (): Promise<void> => {
        try {
            const res = await api.get<UserSummary[]>('/employees/unassigned-users');
            setUnassignedUsers(res.data);
        } catch {
            setUnassignedUsers([]);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedFilterDeptId]);

    const filteredEmployees = employees.filter((emp) => {
        const matchesSearch =
            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.designation.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDept =
            selectedFilterDeptId === 'all' ||
            emp.departmentId === Number(selectedFilterDeptId);

        return matchesSearch && matchesDept;
    });

    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedEmployees = filteredEmployees.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    const openCreateModal = async (): Promise<void> => {
        setEditingId(null);
        resetFormFields();
        await fetchUnassignedUsers();
        setIsModalOpen(true);
    };

    const openEditModal = (employee: Employee): void => {
        setEditingId(employee.id);
        setName(employee.name);
        setPhone(employee.phone);
        setDesignation(employee.designation);
        setSalary(String(employee.salary));
        setJoiningDate(employee.joiningDate);
        setSelectedUserId('');
        setSelectedDeptId(String(employee.departmentId));
        setFormError(null);
        setIsModalOpen(true);
    };

    const closeModal = (): void => {
        setIsModalOpen(false);
        setEditingId(null);
        resetFormFields();
    };

    const resetFormFields = (): void => {
        setName('');
        setPhone('');
        setDesignation('');
        setSalary('');
        setJoiningDate('');
        setSelectedUserId('');
        setSelectedDeptId('');
        setFormError(null);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setFormError(null);
        setSubmitting(true);

        try {
            if (editingId === null) {
                const requestBody: EmployeeRequest = {
                    userId: Number(selectedUserId),
                    departmentId: Number(selectedDeptId),
                    name,
                    phone,
                    designation,
                    salary: Number(salary),
                    joiningDate,
                };
                await api.post<Employee>('/employees', requestBody);
            } else {
                const requestBody: EmployeeUpdateRequest = {
                    departmentId: Number(selectedDeptId),
                    name,
                    phone,
                    designation,
                    salary: Number(salary),
                    joiningDate,
                };
                await api.put<Employee>(`/employees/${editingId}`, requestBody);
            }
            closeModal();
            await fetchData();
        } catch (err) {
            if (axios.isAxiosError<ErrorResponse>(err) && err.response) {
                setFormError(err.response.data.message);
            } else {
                setFormError('Something went wrong. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number): Promise<void> => {
        const confirmed = window.confirm('Are you sure you want to delete this employee?');
        if (!confirmed) return;

        try {
            await api.delete(`/employees/${id}`);
            await fetchData();
        } catch (err) {
            if (axios.isAxiosError<ErrorResponse>(err) && err.response) {
                alert(err.response.data.message);
            } else {
                alert('Failed to delete employee.');
            }
        }
    };

    const getInitials = (fullName: string) => {
        return fullName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const inputClass =
        'w-full px-4 py-2 rounded-xl border border-sunlit-clay-700 bg-cornsilk-800 text-black-forest-500 focus:outline-none focus:ring-2 focus:ring-olive-leaf-500 text-sm';

    return (
        <div className="bg-cornsilk-900 rounded-2xl p-6 border border-sunlit-clay-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-black-forest-500">Employees Directory</h2>
                    <p className="text-xs text-olive-leaf-500">Manage employee records and profiles</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-black-forest-500 hover:bg-black-forest-600 text-cornsilk-500 font-medium px-4 py-2 rounded-xl text-sm transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add Employee
                </button>
            </div>

            {/* Search & Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                <div className="relative md:col-span-2">
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-olive-leaf-500" />
                    <input
                        type="text"
                        placeholder="Search by name or designation..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-sunlit-clay-700 bg-cornsilk-800 text-black-forest-500 focus:outline-none focus:ring-2 focus:ring-olive-leaf-500 text-sm placeholder-olive-leaf-500"
                    />
                </div>
                <div className="relative">
                    <Filter className="w-4 h-4 absolute left-3.5 top-3 text-olive-leaf-500" />
                    <select
                        value={selectedFilterDeptId}
                        onChange={(e) => setSelectedFilterDeptId(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-sunlit-clay-700 bg-cornsilk-800 text-black-forest-500 focus:outline-none focus:ring-2 focus:ring-olive-leaf-500 text-sm appearance-none"
                    >
                        <option value="all">All Departments</option>
                        {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                                {dept.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <p className="text-olive-leaf-500 text-sm">Loading employees...</p>
            ) : error ? (
                <p className="text-copperwood-500 text-sm">{error}</p>
            ) : filteredEmployees.length === 0 ? (
                <p className="text-olive-leaf-500 text-center py-6 text-sm">No employees match your criteria.</p>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-sunlit-clay-700 text-olive-leaf-500 text-xs font-semibold uppercase tracking-wider">
                                    <th className="py-3 px-4">Employee</th>
                                    <th className="py-3 px-4">Department</th>
                                    <th className="py-3 px-4">Designation</th>
                                    <th className="py-3 px-4">Salary</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sunlit-clay-800 text-sm">
                                {paginatedEmployees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-cornsilk-800 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-black-forest-500 text-cornsilk-500 flex items-center justify-center font-bold text-xs shadow-xs">
                                                    {getInitials(emp.name)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-black-forest-500">{emp.name}</p>
                                                    <p className="text-xs text-olive-leaf-500">@{emp.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-black-forest-500 font-medium">
                                            <span className="px-2.5 py-1 rounded-lg bg-cornsilk-800 border border-sunlit-clay-700 text-xs">
                                                {emp.departmentName}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-black-forest-500">{emp.designation}</td>
                                        <td className="py-3 px-4 text-black-forest-500 font-semibold">৳{emp.salary.toLocaleString()}</td>
                                        <td className="py-3 px-4 text-right space-x-1">
                                            <button
                                                onClick={() => openEditModal(emp)}
                                                className="p-1.5 text-sunlit-clay-300 hover:text-black-forest-500 hover:bg-cornsilk-700 rounded-lg transition-colors"
                                                title="Edit Employee"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(emp.id)}
                                                className="p-1.5 text-copperwood-500 hover:text-copperwood-300 hover:bg-copperwood-900 rounded-lg transition-colors"
                                                title="Delete Employee"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-sunlit-clay-800 text-xs">
                            <span className="text-olive-leaf-500">
                                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length} entries
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-1.5 rounded-lg border border-sunlit-clay-700 bg-cornsilk-800 text-black-forest-500 hover:bg-cornsilk-700 disabled:opacity-40 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="font-semibold text-black-forest-500 px-2">
                                    {currentPage} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-1.5 rounded-lg border border-sunlit-clay-700 bg-cornsilk-800 text-black-forest-500 hover:bg-cornsilk-700 disabled:opacity-40 transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Modal Form */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingId === null ? 'Create Employee Profile' : 'Edit Employee Profile'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {formError && (
                        <div className="bg-copperwood-900 text-copperwood-300 text-sm px-3 py-2 rounded-lg border border-copperwood-700">
                            {formError}
                        </div>
                    )}

                    {editingId === null && (
                        <div>
                            <label className="block text-sm font-medium text-black-forest-500 mb-1">
                                Select User
                            </label>
                            <select
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                required
                                className={inputClass}
                            >
                                <option value="">Choose a registered user</option>
                                {unassignedUsers.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.username} ({user.email})
                                    </option>
                                ))}
                            </select>
                            {unassignedUsers.length === 0 && (
                                <p className="text-xs text-copperwood-500 mt-1">
                                    No unassigned users. Register a user first.
                                </p>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-black-forest-500 mb-1">
                            Department
                        </label>
                        <select
                            value={selectedDeptId}
                            onChange={(e) => setSelectedDeptId(e.target.value)}
                            required
                            className={inputClass}
                        >
                            <option value="">Select a department</option>
                            {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-black-forest-500 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="Rahim Uddin"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-black-forest-500 mb-1">Phone</label>
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                                placeholder="01712345678"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-black-forest-500 mb-1">Designation</label>
                            <input
                                type="text"
                                value={designation}
                                onChange={(e) => setDesignation(e.target.value)}
                                required
                                placeholder="Software Engineer"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-black-forest-500 mb-1">Salary (৳)</label>
                            <input
                                type="number"
                                value={salary}
                                onChange={(e) => setSalary(e.target.value)}
                                required
                                min="0"
                                step="0.01"
                                placeholder="50000"
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-black-forest-500 mb-1">Joining Date</label>
                        <input
                            type="date"
                            value={joiningDate}
                            onChange={(e) => setJoiningDate(e.target.value)}
                            required
                            className={inputClass}
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 bg-black-forest-500 hover:bg-black-forest-600 text-cornsilk-500 font-medium py-2 rounded-xl text-sm transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'Saving...' : 'Save Employee Profile'}
                        </button>
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 bg-cornsilk-800 border border-sunlit-clay-700 text-black-forest-500 font-medium py-2 rounded-xl text-sm hover:bg-cornsilk-700 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default EmployeeManager;