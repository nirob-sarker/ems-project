import { useState, useEffect, type FormEvent } from 'react';
import axios from 'axios';
import api from '../api/axiosConfig';
import type {
    Employee,
    EmployeeRequest,
    EmployeeUpdateRequest,
    Department,
    UserSummary,
    ErrorResponse,
} from '../types';

function EmployeeManager() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [unassignedUsers, setUnassignedUsers] = useState<UserSummary[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Form States
    const [showForm, setShowForm] = useState<boolean>(false);
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
    const itemsPerPage = 5; // প্রতি পেজে কয়জন Employee দেখাবে

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

    // Search বা Filter পাল্টালে পেজ নম্বর ১ এ ফেরত যাবে
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedFilterDeptId]);

    // Filtering Logic (Search Term & Department Filter)
    const filteredEmployees = employees.filter((emp) => {
        const matchesSearch =
            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.designation.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDept =
            selectedFilterDeptId === 'all' ||
            emp.departmentId === Number(selectedFilterDeptId);

        return matchesSearch && matchesDept;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedEmployees = filteredEmployees.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    const openCreateForm = async (): Promise<void> => {
        setEditingId(null);
        resetFormFields();
        await fetchUnassignedUsers();
        setShowForm(true);
    };

    const openEditForm = (employee: Employee): void => {
        setEditingId(employee.id);
        setName(employee.name);
        setPhone(employee.phone);
        setDesignation(employee.designation);
        setSalary(String(employee.salary));
        setJoiningDate(employee.joiningDate);
        setSelectedUserId('');
        setSelectedDeptId(String(employee.departmentId));
        setFormError(null);
        setShowForm(true);
    };

    const closeForm = (): void => {
        setShowForm(false);
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
            closeForm();
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

    const inputClass =
        'w-full px-4 py-2 rounded-lg border border-sunlit-clay-700 bg-cornsilk-900 text-black-forest-500 focus:outline-none focus:ring-2 focus:ring-olive-leaf-500';
    const selectClass =
        'w-full px-4 py-2 rounded-lg border border-sunlit-clay-700 bg-cornsilk-900 text-black-forest-500 focus:outline-none focus:ring-2 focus:ring-olive-leaf-500';

    return (
        <div className="bg-cornsilk-900 rounded-xl p-6 border border-sunlit-clay-800">
            {/* Header Area */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-black-forest-500">Employees</h2>
                <button
                    onClick={openCreateForm}
                    className="bg-black-forest-500 hover:bg-black-forest-600 text-cornsilk-500 font-medium px-4 py-2 rounded-lg transition-colors"
                >
                    + Add Employee
                </button>
            </div>

            {/* Create/Edit Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-cornsilk-800 border border-sunlit-clay-700 rounded-lg p-5 mb-6 space-y-4">
                    <h3 className="font-semibold text-black-forest-500 text-lg">
                        {editingId === null ? 'New Employee' : 'Edit Employee'}
                    </h3>

                    {formError && (
                        <div className="bg-copperwood-900 text-copperwood-300 text-sm px-3 py-2 rounded-lg border border-copperwood-700">
                            {formError}
                        </div>
                    )}

                    {editingId === null && (
                        <div>
                            <label className="block text-sm font-medium text-black-forest-500 mb-1">
                                User
                            </label>
                            <select
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                required
                                className={selectClass}
                            >
                                <option value="">Select a user</option>
                                {unassignedUsers.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.username} ({user.email})
                                    </option>
                                ))}
                            </select>
                            {unassignedUsers.length === 0 && (
                                <p className="text-xs text-copperwood-500 mt-1">
                                    No unassigned users available. Register new users first.
                                </p>
                            )}
                        </div>
                    )}

                    {editingId !== null && (
                        <p className="text-sm text-olive-leaf-500">
                            User cannot be changed during edit.
                        </p>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-black-forest-500 mb-1">
                            Department
                        </label>
                        <select
                            value={selectedDeptId}
                            onChange={(e) => setSelectedDeptId(e.target.value)}
                            required
                            className={selectClass}
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
                            <label className="block text-sm font-medium text-black-forest-500 mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="e.g. Rahim Uddin"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-black-forest-500 mb-1">
                                Phone
                            </label>
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                                placeholder="e.g. 01712345678"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-black-forest-500 mb-1">
                                Designation
                            </label>
                            <input
                                type="text"
                                value={designation}
                                onChange={(e) => setDesignation(e.target.value)}
                                required
                                placeholder="e.g. Software Engineer"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-black-forest-500 mb-1">
                                Salary
                            </label>
                            <input
                                type="number"
                                value={salary}
                                onChange={(e) => setSalary(e.target.value)}
                                required
                                min="0"
                                step="0.01"
                                placeholder="e.g. 50000"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-black-forest-500 mb-1">
                                Joining Date
                            </label>
                            <input
                                type="date"
                                value={joiningDate}
                                onChange={(e) => setJoiningDate(e.target.value)}
                                required
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-black-forest-500 hover:bg-black-forest-600 text-cornsilk-500 font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'Saving...' : 'Save'}
                        </button>
                        <button
                            type="button"
                            onClick={closeForm}
                            className="bg-cornsilk-900 border border-sunlit-clay-700 text-black-forest-500 font-medium px-4 py-2 rounded-lg hover:bg-cornsilk-800 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Search and Filter Controls Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="md:col-span-2">
                    <input
                        type="text"
                        placeholder="Search by name or designation..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-sunlit-clay-700 bg-cornsilk-800 text-black-forest-500 focus:outline-none focus:ring-2 focus:ring-olive-leaf-500 placeholder-olive-leaf-500"
                    />
                </div>
                <div>
                    <select
                        value={selectedFilterDeptId}
                        onChange={(e) => setSelectedFilterDeptId(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-sunlit-clay-700 bg-cornsilk-800 text-black-forest-500 focus:outline-none focus:ring-2 focus:ring-olive-leaf-500"
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

            {/* Table Area */}
            {loading ? (
                <p className="text-olive-leaf-500">Loading employees...</p>
            ) : error ? (
                <p className="text-copperwood-500">{error}</p>
            ) : filteredEmployees.length === 0 ? (
                <p className="text-olive-leaf-500 text-center py-4">No employees match your criteria.</p>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-sunlit-clay-700">
                                    <th className="py-2 text-sm font-semibold text-olive-leaf-500">Name</th>
                                    <th className="py-2 text-sm font-semibold text-olive-leaf-500">Username</th>
                                    <th className="py-2 text-sm font-semibold text-olive-leaf-500">Department</th>
                                    <th className="py-2 text-sm font-semibold text-olive-leaf-500">Designation</th>
                                    <th className="py-2 text-sm font-semibold text-olive-leaf-500">Salary</th>
                                    <th className="py-2 text-sm font-semibold text-olive-leaf-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedEmployees.map((emp) => (
                                    <tr key={emp.id} className="border-b border-sunlit-clay-800 hover:bg-cornsilk-800 transition-colors">
                                        <td className="py-3 text-black-forest-500 font-medium">{emp.name}</td>
                                        <td className="py-3 text-olive-leaf-500">{emp.username}</td>
                                        <td className="py-3 text-black-forest-500">{emp.departmentName}</td>
                                        <td className="py-3 text-black-forest-500">{emp.designation}</td>
                                        <td className="py-3 text-black-forest-500">৳{emp.salary.toLocaleString()}</td>
                                        <td className="py-3 text-right space-x-3">
                                            <button
                                                onClick={() => openEditForm(emp)}
                                                className="text-sunlit-clay-300 hover:underline text-sm font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(emp.id)}
                                                className="text-copperwood-500 hover:underline text-sm font-medium"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-sunlit-clay-800">
                            <span className="text-sm text-olive-leaf-500">
                                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length} entries
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 rounded-lg border border-sunlit-clay-700 bg-cornsilk-800 text-black-forest-500 text-sm font-medium hover:bg-cornsilk-700 disabled:opacity-40 transition-colors"
                                >
                                    Previous
                                </button>

                                <span className="px-3 py-1.5 text-sm text-black-forest-500 font-semibold">
                                    Page {currentPage} of {totalPages}
                                </span>

                                <button
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 rounded-lg border border-sunlit-clay-700 bg-cornsilk-800 text-black-forest-500 text-sm font-medium hover:bg-cornsilk-700 disabled:opacity-40 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default EmployeeManager;