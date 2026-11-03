import { useState, useEffect, type FormEvent } from 'react';
import axios from 'axios';
import api from '../api/axiosConfig';
import type { Department, DepartmentRequest, ErrorResponse } from '../types';

function DepartmentManager() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [showForm, setShowForm] = useState<boolean>(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [name, setName] = useState<string>('');
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState<boolean>(false);

    const fetchDepartments = async (): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get<Department[]>('/departments');
            setDepartments(response.data);
        } catch {
            setError('Failed to load departments.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const openCreateForm = (): void => {
        setEditingId(null);
        setName('');
        setFormError(null);
        setShowForm(true);
    };

    const openEditForm = (department: Department): void => {
        setEditingId(department.id);
        setName(department.name);
        setFormError(null);
        setShowForm(true);
    };

    const closeForm = (): void => {
        setShowForm(false);
        setEditingId(null);
        setName('');
        setFormError(null);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setFormError(null);
        setSubmitting(true);

        const requestBody: DepartmentRequest = { name };

        try {
            if (editingId === null) {
                await api.post<Department>('/departments', requestBody);
            } else {
                await api.put<Department>(`/departments/${editingId}`, requestBody);
            }
            closeForm();
            await fetchDepartments();
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
        const confirmed = window.confirm('Are you sure you want to delete this department?');
        if (!confirmed) return;

        try {
            await api.delete(`/departments/${id}`);
            await fetchDepartments();
        } catch (err) {
            if (axios.isAxiosError<ErrorResponse>(err) && err.response) {
                alert(err.response.data.message);
            } else {
                alert('Failed to delete department.');
            }
        }
    };

    return (
        <div className="bg-cornsilk-900 rounded-xl p-6 border border-sunlit-clay-800">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-black-forest-500">Departments</h2>
                <button
                    onClick={openCreateForm}
                    className="bg-black-forest-500 hover:bg-black-forest-600 text-cornsilk-500 font-medium px-4 py-2 rounded-lg transition-colors"
                >
                    + Add Department
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-cornsilk-800 border border-sunlit-clay-700 rounded-lg p-4 mb-5 space-y-3">
                    <h3 className="font-semibold text-black-forest-500">
                        {editingId === null ? 'New Department' : 'Edit Department'}
                    </h3>

                    {formError && (
                        <div className="bg-copperwood-900 text-copperwood-300 text-sm px-3 py-2 rounded-lg border border-copperwood-700">
                            {formError}
                        </div>
                    )}

                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Department name"
                        className="w-full px-4 py-2 rounded-lg border border-sunlit-clay-700 bg-cornsilk-900 text-black-forest-500 focus:outline-none focus:ring-2 focus:ring-olive-leaf-500"
                    />

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

            {loading ? (
                <p className="text-olive-leaf-500">Loading departments...</p>
            ) : error ? (
                <p className="text-copperwood-500">{error}</p>
            ) : departments.length === 0 ? (
                <p className="text-olive-leaf-500">No departments found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-sunlit-clay-700">
                                <th className="py-2 text-sm font-semibold text-olive-leaf-500">ID</th>
                                <th className="py-2 text-sm font-semibold text-olive-leaf-500">Name</th>
                                <th className="py-2 text-sm font-semibold text-olive-leaf-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departments.map((dept) => (
                                <tr key={dept.id} className="border-b border-sunlit-clay-800">
                                    <td className="py-2 text-black-forest-500">{dept.id}</td>
                                    <td className="py-2 text-black-forest-500">{dept.name}</td>
                                    <td className="py-2 text-right space-x-3">
                                        <button
                                            onClick={() => openEditForm(dept)}
                                            className="text-sunlit-clay-300 hover:underline text-sm font-medium"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(dept.id)}
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
            )}
        </div>
    );
}

export default DepartmentManager;