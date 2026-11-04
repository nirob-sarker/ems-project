import { useState, useEffect, type FormEvent } from 'react';
import axios from 'axios';
import api from '../api/axiosConfig';
import Modal from './Modal';
import type { Department, DepartmentRequest, ErrorResponse } from '../types';
import { Plus, Edit2, Trash2, Building2 } from 'lucide-react';

function DepartmentManager() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
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

    const openCreateModal = (): void => {
        setEditingId(null);
        setName('');
        setFormError(null);
        setIsModalOpen(true);
    };

    const openEditModal = (department: Department): void => {
        setEditingId(department.id);
        setName(department.name);
        setFormError(null);
        setIsModalOpen(true);
    };

    const closeModal = (): void => {
        setIsModalOpen(false);
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
            closeModal();
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
        <div className="bg-cornsilk-900 rounded-2xl p-6 border border-sunlit-clay-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-black-forest-500">Departments</h2>
                    <p className="text-xs text-olive-leaf-500">Manage company organizational departments</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-black-forest-500 hover:bg-black-forest-600 text-cornsilk-500 font-medium px-4 py-2 rounded-xl text-sm transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add Department
                </button>
            </div>

            {loading ? (
                <p className="text-olive-leaf-500 text-sm">Loading departments...</p>
            ) : error ? (
                <p className="text-copperwood-500 text-sm">{error}</p>
            ) : departments.length === 0 ? (
                <p className="text-olive-leaf-500 text-sm py-4">No departments found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-sunlit-clay-700 text-olive-leaf-500 text-xs font-semibold uppercase tracking-wider">
                                <th className="py-3 px-4">Department ID</th>
                                <th className="py-3 px-4">Department Name</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sunlit-clay-800 text-sm">
                            {departments.map((dept) => (
                                <tr key={dept.id} className="hover:bg-cornsilk-800 transition-colors">
                                    <td className="py-3 px-4 text-olive-leaf-500 font-mono">#{dept.id}</td>
                                    <td className="py-3 px-4 text-black-forest-500 font-semibold flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-sunlit-clay-300" />
                                        {dept.name}
                                    </td>
                                    <td className="py-3 px-4 text-right space-x-2">
                                        <button
                                            onClick={() => openEditModal(dept)}
                                            className="p-1.5 text-sunlit-clay-300 hover:text-black-forest-500 hover:bg-cornsilk-700 rounded-lg transition-colors"
                                            title="Edit Department"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(dept.id)}
                                            className="p-1.5 text-copperwood-500 hover:text-copperwood-300 hover:bg-copperwood-900 rounded-lg transition-colors"
                                            title="Delete Department"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal for Create/Edit */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingId === null ? 'Add New Department' : 'Edit Department'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {formError && (
                        <div className="bg-copperwood-900 text-copperwood-300 text-sm px-3 py-2 rounded-lg border border-copperwood-700">
                            {formError}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-black-forest-500 mb-1">
                            Department Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="e.g. Human Resources"
                            className="w-full px-4 py-2 rounded-xl border border-sunlit-clay-700 bg-cornsilk-800 text-black-forest-500 focus:outline-none focus:ring-2 focus:ring-olive-leaf-500 text-sm"
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 bg-black-forest-500 hover:bg-black-forest-600 text-cornsilk-500 font-medium py-2 rounded-xl text-sm transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'Saving...' : 'Save Department'}
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

export default DepartmentManager;