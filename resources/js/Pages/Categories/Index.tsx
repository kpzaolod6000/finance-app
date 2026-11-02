import SlideOver from '@/Components/SlideOver';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Category, CategoryType } from '@/types/models';
import { Head, router, useForm } from '@inertiajs/react';
import React, { useState } from 'react';

const COLORS = ['#4f9d7e', '#7d9ab5', '#b8a36a', '#9b8bc4', '#c26b62', '#6fa287', '#8a8d94', '#c08aa6', '#5fb0b5', '#a0a3aa'];

function CategoryForm({ category, categories, onClose }: { category?: Category; categories: Category[]; onClose: () => void }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: category?.name ?? '',
        type: (category?.type ?? 'expense') as CategoryType,
        color: category?.color ?? '#4f9d7e',
        icon: category?.icon ?? 'tag',
        parent_id: category?.parent_id ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.parent_id) setData('parent_id', '');
        if (category) {
            put(route('categories.update', category.id), { onSuccess: onClose });
        } else {
            post(route('categories.store'), { onSuccess: onClose });
        }
    };

    const parents = categories.filter((c) => c.type === data.type && !c.parent_id && c.id !== category?.id);

    return (
        <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="label">Name</label>
                        <input className="field" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                        {errors.name && <p className="field-error">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="label">Type</label>
                        <select className="field" value={data.type} onChange={(e) => { setData('type', e.target.value as CategoryType); setData('parent_id', ''); }}>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                    </div>
                    <div>
                        <label className="label">Parent category (optional)</label>
                        <select className="field" value={data.parent_id} onChange={(e) => setData('parent_id', e.target.value)}>
                            <option value="">None</option>
                            {parents.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="label">Color</label>
                        <div className="flex flex-wrap gap-2">
                            {COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    className={`h-7 w-7 rounded-full ring-2 ring-offset-2 ring-offset-card transition-all ${data.color === c ? 'ring-foreground' : 'ring-transparent'}`}
                                    style={{ backgroundColor: c }}
                                    onClick={() => setData('color', c)}
                                    aria-label={`Color ${c}`}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="sticky bottom-0 -mx-6 -mb-5 flex justify-end gap-3 border-t border-border bg-card px-6 py-4">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={processing} className="btn-primary">
                            {category ? 'Update' : 'Create'}
                        </button>
                    </div>
        </form>
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
            <h3 className={`eyebrow mb-2 ${accent}`}>{title}</h3>
            {items.length === 0 ? (
                <p className="card p-4 text-sm text-muted-foreground">No {title.toLowerCase()} categories.</p>
            ) : (
                <div className="card overflow-hidden">
                    {items.map((cat) => (
                        <div key={cat.id} className="flex items-center justify-between border-b border-border/70 px-4 py-3 last:border-0">
                            <div className="flex items-center gap-3">
                                <span className="dot" style={{ backgroundColor: cat.color }} />
                                <span className="text-sm text-foreground">{cat.name}</span>
                                {cat.parent_id && <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">sub</span>}
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => { setEditing(cat); setShowForm(true); }} className="text-xs link-accent">Edit</button>
                                <button onClick={() => handleDelete(cat)} className="text-xs text-destructive hover:underline">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <AuthenticatedLayout header="Categories">
            <Head title="Categories" />
            <div className="mx-auto max-w-3xl space-y-6">
                <div className="flex justify-end">
                    <button onClick={() => { setEditing(undefined); setShowForm(true); }} className="btn-primary">
                        New category
                    </button>
                </div>
                {renderGroup('Income', income, 'text-income')}
                {renderGroup('Expense', expense, 'text-expense')}
            </div>
            <SlideOver
                show={showForm}
                onClose={() => setShowForm(false)}
                title={editing ? 'Edit category' : 'New category'}
                maxWidth="md"
            >
                <CategoryForm
                    key={editing?.id ?? 'new'}
                    category={editing}
                    categories={categories}
                    onClose={() => setShowForm(false)}
                />
            </SlideOver>
        </AuthenticatedLayout>
    );
}
