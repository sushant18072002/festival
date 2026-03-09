import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import LanguageTabs from '../components/LanguageTabs';
import {
    Plus, Edit2, Trash2, Search, X, Sunrise,
    Check, AlertTriangle, Moon, Coffee, Sunset, Star, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import clsx from 'clsx';

// --- Types ---
interface HomeGreetingData {
    _id?: string;
    type: 'morning' | 'afternoon' | 'evening' | 'night' | 'festival' | 'general';
    text: string;
    tags?: string[];
    is_active?: boolean;
    is_deleted?: boolean;
    translations?: { [key: string]: { text?: string } };
}

const TYPES = ['all', 'morning', 'afternoon', 'evening', 'night', 'festival', 'general'] as const;

const TYPE_META: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
    morning: { label: 'Morning', icon: <Sunrise className="w-4 h-4" />, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    afternoon: { label: 'Afternoon', icon: <Coffee className="w-4 h-4" />, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
    evening: { label: 'Evening', icon: <Sunset className="w-4 h-4" />, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
    night: { label: 'Night', icon: <Moon className="w-4 h-4" />, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
    festival: { label: 'Festival', icon: <Star className="w-4 h-4" />, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    general: { label: 'General', icon: <Sparkles className="w-4 h-4" />, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
};

const initialFormState: HomeGreetingData = {
    type: 'general',
    text: '',
    tags: [],
    is_active: true,
    translations: {}
};

export default function HomeGreetings() {
    const [greetings, setGreetings] = useState<HomeGreetingData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [formData, setFormData] = useState<HomeGreetingData>(initialFormState);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeLang, setActiveLang] = useState('en');
    const [showTrash, setShowTrash] = useState(false);
    const [filterType, setFilterType] = useState<string>('all');
    const [tagsInput, setTagsInput] = useState('');

    useEffect(() => { fetchGreetings(); }, [showTrash]);

    const fetchGreetings = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/home-greetings${showTrash ? '?trash=true' : ''}`);
            const json = await res.json();
            if (json.success) setGreetings(json.data);
        } catch (err) {
            toast.error('Failed to fetch home greetings');
        }
        setLoading(false);
    };

    const handleEdit = (item: HomeGreetingData) => {
        setFormData({ ...item });
        setTagsInput((item.tags || []).join(', '));
        setEditId(item._id || null);
        setShowForm(true);
    };

    const handleDelete = async (id: string, permanent = false) => {
        if (!confirm(permanent ? 'Permanently delete this greeting?' : 'Move to trash?')) return;
        try {
            const res = await fetch(`/api/home-greetings?id=${id}${permanent ? '&permanent=true' : ''}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                toast.success(permanent ? 'Permanently deleted' : 'Moved to trash');
                fetchGreetings();
            }
        } catch {
            toast.error('Delete failed');
        }
    };

    const handleRestore = async (id: string) => {
        try {
            const res = await fetch('/api/home-greetings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _id: id, is_deleted: false, deleted_at: null })
            });
            const json = await res.json();
            if (json.success) { toast.success('Restored'); fetchGreetings(); }
        } catch { toast.error('Restore failed'); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const tagsArr = tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
            const payload = { ...formData, tags: tagsArr };
            const method = editId ? 'PUT' : 'POST';
            const body = editId ? { ...payload, _id: editId } : payload;
            const res = await fetch('/api/home-greetings', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const json = await res.json();
            if (json.success) {
                toast.success(editId ? 'Updated!' : 'Created!');
                setShowForm(false);
                setEditId(null);
                setFormData(initialFormState);
                setTagsInput('');
                fetchGreetings();
            } else {
                toast.error(json.error || 'Save failed');
            }
        } catch { toast.error('Save failed'); }
    };

    const updateField = (field: string, value: any) => {
        if (activeLang === 'en') {
            setFormData(prev => ({ ...prev, [field]: value }));
        } else {
            setFormData(prev => ({
                ...prev,
                translations: {
                    ...prev.translations,
                    [activeLang]: { ...(prev.translations?.[activeLang] || {}), [field]: value }
                }
            }));
        }
    };

    const getFieldValue = (field: string) => {
        if (activeLang === 'en') return (formData as any)[field] || '';
        return (formData.translations?.[activeLang] as any)?.[field] || '';
    };

    const filteredGreetings = greetings.filter(g => {
        const matchSearch = g.text?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchType = filterType === 'all' || g.type === filterType;
        return matchSearch && matchType;
    });

    // Count by type
    const countByType = greetings.reduce((acc: Record<string, number>, g) => {
        acc[g.type] = (acc[g.type] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="flex h-screen bg-slate-950 text-white">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                                <Sunrise className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Home Greetings</h1>
                                <p className="text-sm text-slate-400 mt-0.5">{greetings.length} greetings • App UI text rotation</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowTrash(!showTrash)}
                                className={clsx(
                                    "px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                                    showTrash
                                        ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                                        : "bg-slate-800/50 text-slate-400 hover:text-slate-200 border border-slate-700/50"
                                )}
                            >
                                {showTrash ? '← Back' : '🗑 Trash'}
                            </button>
                            <button
                                onClick={() => { setShowForm(true); setEditId(null); setFormData(initialFormState); setTagsInput(''); }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-rose-500 rounded-xl text-sm font-semibold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all hover:scale-[1.02]"
                            >
                                <Plus className="w-4 h-4" /> Add Greeting
                            </button>
                        </div>
                    </div>

                    {/* Stats + Filter Pills */}
                    <div className="mt-4 flex flex-wrap gap-2">
                        {TYPES.map(t => {
                            const meta = t === 'all' ? null : TYPE_META[t];
                            const count = t === 'all' ? greetings.length : (countByType[t] || 0);
                            return (
                                <button
                                    key={t}
                                    onClick={() => setFilterType(t)}
                                    className={clsx(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all",
                                        filterType === t
                                            ? "bg-white/10 text-white border-white/20"
                                            : "bg-slate-800/50 text-slate-400 border-slate-700/50 hover:text-slate-200"
                                    )}
                                >
                                    {meta?.icon}
                                    <span className="capitalize">{t}</span>
                                    <span className="ml-1 px-1.5 py-0.5 bg-slate-700/60 rounded-md">{count}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Search */}
                    <div className="mt-3 relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search greetings..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition-all"
                        />
                    </div>
                </div>

                <div className="p-8">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filteredGreetings.length === 0 ? (
                        <div className="text-center py-16 text-slate-500">
                            <Sunrise className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-lg font-medium">No home greetings found</p>
                            <p className="text-sm mt-1">Add short, positive greetings for the app's Home screen</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <AnimatePresence>
                                {filteredGreetings.map((item, i) => {
                                    const meta = TYPE_META[item.type] || TYPE_META.general;
                                    return (
                                        <motion.div
                                            key={item._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: i * 0.02 }}
                                            className="group bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 hover:border-amber-500/30 hover:bg-slate-900/80 transition-all duration-300"
                                        >
                                            {/* Type Badge */}
                                            <div className="flex items-center justify-between mb-3">
                                                <span className={clsx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border", meta.color, meta.bg)}>
                                                    {meta.icon}
                                                    {meta.label}
                                                </span>
                                                {item.is_active ? (
                                                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                                                ) : (
                                                    <span className="w-2 h-2 rounded-full bg-slate-600" />
                                                )}
                                            </div>

                                            {/* Text */}
                                            <p className="text-white font-medium text-base leading-relaxed mb-3 line-clamp-2">
                                                {item.text}
                                            </p>

                                            {/* Tags */}
                                            {item.tags && item.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-3">
                                                    {item.tags.map(tag => (
                                                        <span key={tag} className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded-md">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Translation dots */}
                                            <div className="flex items-center gap-1 mb-4">
                                                {['hi', 'mr', 'gu', 'bn', 'ta', 'te', 'kn', 'ml'].map(lang => (
                                                    <span
                                                        key={lang}
                                                        className={clsx(
                                                            "w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold uppercase",
                                                            (item.translations as any)?.[lang]?.text
                                                                ? "bg-amber-500/20 text-amber-400"
                                                                : "bg-slate-800 text-slate-600"
                                                        )}
                                                    >
                                                        {lang}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {showTrash ? (
                                                    <>
                                                        <button onClick={() => handleRestore(item._id!)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-500/20 transition-colors">
                                                            <Check className="w-3.5 h-3.5" /> Restore
                                                        </button>
                                                        <button onClick={() => handleDelete(item._id!, true)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500/10 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-colors">
                                                            <AlertTriangle className="w-3.5 h-3.5" /> Delete Forever
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => handleEdit(item)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-500/20 transition-colors">
                                                            <Edit2 className="w-3.5 h-3.5" /> Edit
                                                        </button>
                                                        <button onClick={() => handleDelete(item._id!)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500/10 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-colors">
                                                            <Trash2 className="w-3.5 h-3.5" /> Trash
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Create/Edit Modal */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                            onClick={() => { setShowForm(false); setEditId(null); setFormData(initialFormState); }}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                onClick={e => e.stopPropagation()}
                                className="w-full max-w-2xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto"
                            >
                                <div className="sticky top-0 bg-slate-900 border-b border-slate-800/50 px-6 py-4 flex items-center justify-between z-10">
                                    <h2 className="text-lg font-bold">{editId ? 'Edit Home Greeting' : 'New Home Greeting'}</h2>
                                    <button onClick={() => { setShowForm(false); setEditId(null); setFormData(initialFormState); }} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                    {/* Language Tabs */}
                                    <LanguageTabs activeLang={activeLang} onChange={setActiveLang} />

                                    {/* Greeting Text */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Greeting Text {activeLang !== 'en' && `(${activeLang.toUpperCase()})`}
                                        </label>
                                        <textarea
                                            value={getFieldValue('text')}
                                            onChange={e => updateField('text', e.target.value)}
                                            rows={2}
                                            required={activeLang === 'en'}
                                            placeholder="Rise and shine ✨"
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all resize-none"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Keep it short &amp; punchy. Under 60 characters is ideal.</p>
                                    </div>

                                    {/* Type + Tags (only in English) */}
                                    {activeLang === 'en' && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {(['morning', 'afternoon', 'evening', 'night', 'festival', 'general'] as const).map(t => {
                                                        const meta = TYPE_META[t];
                                                        return (
                                                            <button
                                                                key={t}
                                                                type="button"
                                                                onClick={() => setFormData(prev => ({ ...prev, type: t }))}
                                                                className={clsx(
                                                                    "flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all",
                                                                    formData.type === t
                                                                        ? `${meta.color} ${meta.bg}`
                                                                        : "text-slate-400 bg-slate-800/50 border-slate-700/50 hover:text-slate-200"
                                                                )}
                                                            >
                                                                {meta.icon}
                                                                {meta.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">Festival Tags (comma-separated)</label>
                                                <input
                                                    type="text"
                                                    value={tagsInput}
                                                    onChange={e => setTagsInput(e.target.value)}
                                                    placeholder="diwali, holi, eid"
                                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all"
                                                />
                                                <p className="text-xs text-slate-500 mt-1">For festival type: these tags let the feed engine know which festival to show this for.</p>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                                                    className={clsx(
                                                        "relative w-11 h-6 rounded-full transition-colors",
                                                        formData.is_active ? "bg-emerald-500" : "bg-slate-700"
                                                    )}
                                                >
                                                    <div className={clsx("absolute top-1 w-4 h-4 rounded-full bg-white transition-transform", formData.is_active ? "left-6" : "left-1")} />
                                                </button>
                                                <span className="text-sm text-slate-300">Active (shown in app)</span>
                                            </div>
                                        </>
                                    )}

                                    {/* Submit */}
                                    <div className="flex justify-end gap-3 pt-2">
                                        <button type="button" onClick={() => { setShowForm(false); setEditId(null); setFormData(initialFormState); }} className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                                            Cancel
                                        </button>
                                        <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-rose-500 rounded-xl text-sm font-semibold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all hover:scale-[1.02]">
                                            {editId ? 'Update Greeting' : 'Create Greeting'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
