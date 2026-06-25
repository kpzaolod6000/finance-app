import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Category, CategoryType } from '@/types/models';
import { Head, router, useForm } from '@inertiajs/react';
import React, { useState } from 'react';

const COLORS = ['#6366f1', '#3b82f6', '#22c55e', '#f97316', '#ef4444', '#8b5cf6', '#ec4899', '#eab308', '#06b6d4', '#94a3b8'];

function CategoryForm({ category, categories, onClose }: { category?: Category; categories: Category[]; onClose: () => void }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: category?.name ?? '',
        type: (category?.type ?? 'expense') as CategoryType,
        color: category?.color ?? '#6366f1',
        icon: category?.icon ?? 'tag',
        parent_id: category?.parent_id ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // Normalise empty string parent_id → null before submit
        if (!data.parent_id) setData('parent_id', '');
        if (category) {
            put(route('categories.update', category.id), { onSuccess: onClose });
        } else {
            post(route('categories.store'), { onSuccess: onClose });
        }
    };

    const parents = categories.filter((c) => c.type === data.type && !c.parent_id && c.id !== category?.id);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    {category ? 'Edit Category' : 'New Category'}
                </h2>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                        <input
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            value={data.type}
                            onChange={(e) => { setData('type', e.target.value as CategoryType); setData('parent_id', ''); }}
                        >
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Parent Category (optional)</label>
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            value={data.parent_id}
                            onChange={(e) => setData('parent_id', e.target.value)}
                        >
                            <option value="">None</option>
                            {parents.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
                        <div className="mt-1 flex flex-wrap gap-2">
                            {COLORS.map((c) => (
                                <button key={c} type="button"
                                    className={`h-7 w-7 rounded-full border-2 ${data.color === c ? 'border-gray-900 dark:border-white' : 'border-transparent'}`}
                                    style={{ backgroundColor: c }}
                                    onClick={() => setData('color', c)}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm text-gray-700 dark:text-gray-300">Cancel</button>
                        <button type="submit" disabled={processing} className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50">
                            {category ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function CategoriesIndex({ categories }: { categories: Category[] }) {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Category | undefined>();

    const handleDelete = (category: Category) => {
        if (confirm(`Delete "${category.name}"? Transactions will be uncategorized.`)) {
            router.delete(route('categories.destroy', category.id));
        }
    };

    const income = categories.filter((c) => c.type === 'income');
    const expense = categories.filter((c) => c.type === 'expense');

    const renderGroup = (title: string, items: Category[], accent: string) => (
        <div>
            <h3 className={`mb-2 text-xs font-semibold uppercase tracking-wider ${accent}`}>{title}</h3>
            {items.length === 0 ? (
                <p className="rounded-lg bg-white p-4 text-sm text-gray-400 dark:bg-gray-800">No {title.toLowerCase()} categories.</p>
            ) : (
                <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                    {items.map((cat) => (
                        <div key={cat.id} className="flex items-center justify-between border-b border-gray-100 px-4 py-3 last:border-0 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                                <span className="text-sm text-gray-900 dark:text-white">{cat.name}</span>
                                {cat.parent_id && <span className="text-xs text-gray-400">sub</span>}
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => { setEditing(cat); setShowForm(true); }} className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">Edit</button>
                                <button onClick={() => handleDelete(cat)} className="text-xs text-red-600 hover:text-red-800 dark:text-red-400">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Categories</h2>}>
            <Head title="Categories" />
            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="mb-4 flex justify-end">
                        <button onClick={() => { setEditing(undefined); setShowForm(true); }} className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">
                            New Category
                        </button>
                    </div>
                    <div className="space-y-6">
                        {renderGroup('Income', income, 'text-green-600 dark:text-green-400')}
                        {renderGroup('Expense', expense, 'text-red-600 dark:text-red-400')}
                    </div>
                </div>
            </div>
            {showForm && <CategoryForm category={editing} categories={categories} onClose={() => setShowForm(false)} />}
        </AuthenticatedLayout>
    );
}
