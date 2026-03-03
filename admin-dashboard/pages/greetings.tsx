import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import LanguageTabs from '../components/LanguageTabs';
import {
    Plus, Edit2, Trash2, Search, X, MessageCircle,
    Check, AlertTriangle, Globe, Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import clsx from 'clsx';

// --- Types ---
interface GreetingData {
    _id?: string;
    text: string;
    slug?: string;
    category?: string;
    event_id?: string;
    is_active?: boolean;
    is_deleted?: boolean;
    translations?: { [key: string]: { text?: string } };
}

const initialFormState: GreetingData = {
    text: '',
    slug: '',
    category: '',
    event_id: '',
    is_active: true,
    translations: {}
};

export default function Greetings() {
    const [greetings, setGreetings] = useState<GreetingData[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [formData, setFormData] = useState<GreetingData>(initialFormState);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeLang, setActiveLang] = useState('en');
    const [showTrash, setShowTrash] = useState(false);

    useEffect(() => {
        fetchGreetings();
        fetchCategories();
        fetchEvents();
    }, [showTrash]);

    const fetchGreetings = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/greetings${showTrash ? '?trash=true' : ''}`);
            const json = await res.json();
            if (json.success) setGreetings(json.data);
        } catch (err) {
            toast.error('Failed to fetch greetings');
        }
        setLoading(false);
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            const json = await res.json();
            if (json.success) setCategories(json.data);
        } catch (err) { /* silent */ }
    };

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/events?limit=100');
            const json = await res.json();
            if (json.success) setEvents(json.data);
        } catch (err) { /* silent */ }
    };

    const handleEdit = (item: GreetingData) => {
        setFormData({
            ...item,
            category: typeof item.category === 'object' ? (item.category as any)?._id : item.category || '',
            event_id: typeof item.event_id === 'object' ? (item.event_id as any)?._id : item.event_id || '',
        });
        setEditId(item._id || null);
        setShowForm(true);
    };

    const handleDelete = async (id: string, permanent = false) => {
        if (!confirm(permanent ? 'Permanently delete this greeting?' : 'Move to trash?')) return;
        try {
            const res = await fetch(`/api/greetings?id=${id}${permanent ? '&permanent=true' : ''}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                toast.success(permanent ? 'Permanently deleted' : 'Moved to trash');
                fetchGreetings();
            }
        } catch (err) {
            toast.error('Delete failed');
        }
    };

    const handleRestore = async (id: string) => {
        try {
            const res = await fetch('/api/greetings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _id: id, is_deleted: false, deleted_at: null })
            });
            const json = await res.json();
            if (json.success) {
                toast.success('Restored');
                fetchGreetings();
            }
        } catch (err) {
            toast.error('Restore failed');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editId ? 'PUT' : 'POST';
            const body = editId ? { ...formData, _id: editId } : formData;
            const res = await fetch('/api/greetings', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const json = await res.json();
            if (json.success) {
                toast.success(editId ? 'Greeting updated!' : 'Greeting created!');
                setShowForm(false);
                setEditId(null);
                setFormData(initialFormState);
                fetchGreetings();
            }
        } catch (err) {
            toast.error('Save failed');
        }
    };

    const updateField = (field: string, value: any) => {
        if (activeLang === 'en') {
            setFormData(prev => ({ ...prev, [field]: value }));
        } else {
            setFormData(prev => ({
                ...prev,
                translations: {
                    ...prev.translations,
                    [activeLang]: {
                        ...(prev.translations?.[activeLang] || {}),
                        [field]: value
                    }
                }
            }));
        }
    };

    const getFieldValue = (field: string) => {
        if (activeLang === 'en') return (formData as any)[field] || '';
        return (formData.translations?.[activeLang] as any)?.[field] || '';
    };

    const filteredGreetings = greetings.filter(g =>
        g.text?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getCategoryName = (cat: any) => {
        if (!cat) return '—';
        if (typeof cat === 'string') return cat;
        return cat.translations?.en?.name || cat.code || '—';
    };

    const getEventTitle = (evt: any) => {
        if (!evt) return '—';
        if (typeof evt === 'string') return evt;
        return evt.title || evt.slug || '—';
    };

    return (
        <div className="flex h-screen bg-slate-950 text-white">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <MessageCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Greetings</h1>
                                <p className="text-sm text-slate-400 mt-0.5">{greetings.length} greetings • Multilingual</p>
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
                                onClick={() => { setShowForm(true); setEditId(null); setFormData(initialFormState); }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all hover:scale-[1.02]"
                            >
                                <Plus className="w-4 h-4" /> Add Greeting
                            </button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="mt-4 relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search greetings..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all"
                        />
                    </div>
                </div>

                <div className="p-8">
                    {/* Greeting Cards Grid */}
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filteredGreetings.length === 0 ? (
                        <div className="text-center py-16 text-slate-500">
                            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-lg font-medium">No greetings found</p>
                            <p className="text-sm mt-1">Create your first greeting to get started</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <AnimatePresence>
                                {filteredGreetings.map((item, i) => (
                                    <motion.div
                                        key={item._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="group bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 hover:border-emerald-500/30 hover:bg-slate-900/80 transition-all duration-300"
                                    >
                                        {/* Greeting Text */}
                                        <p className="text-white font-medium text-base leading-relaxed mb-3 line-clamp-3">
                                            "{item.text}"
                                        </p>

                                        {/* Meta */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {item.category && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-lg border border-emerald-500/20">
                                                    <Tag className="w-3 h-3" />
                                                    {getCategoryName(item.category)}
                                                </span>
                                            )}
                                            {item.event_id && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-lg border border-blue-500/20">
                                                    <Globe className="w-3 h-3" />
                                                    {getEventTitle(item.event_id)}
                                                </span>
                                            )}
                                        </div>

                                        {/* Translation indicator */}
                                        <div className="flex items-center gap-1 mb-4">
                                            {['hi', 'mr', 'gu', 'bn', 'ta', 'te', 'kn', 'ml'].map(lang => (
                                                <span
                                                    key={lang}
                                                    className={clsx(
                                                        "w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold uppercase",
                                                        (item.translations as any)?.[lang]?.text
                                                            ? "bg-emerald-500/20 text-emerald-400"
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
                                                    <button
                                                        onClick={() => handleRestore(item._id!)}
                                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-500/20 transition-colors"
                                                    >
                                                        <Check className="w-3.5 h-3.5" /> Restore
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item._id!, true)}
                                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500/10 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-colors"
                                                    >
                                                        <AlertTriangle className="w-3.5 h-3.5" /> Delete Forever
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-500/20 transition-colors"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item._id!)}
                                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500/10 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" /> Trash
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
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
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="w-full max-w-2xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto"
                            >
                                <div className="sticky top-0 bg-slate-900 border-b border-slate-800/50 px-6 py-4 flex items-center justify-between z-10">
                                    <h2 className="text-lg font-bold">
                                        {editId ? 'Edit Greeting' : 'New Greeting'}
                                    </h2>
                                    <button
                                        onClick={() => { setShowForm(false); setEditId(null); setFormData(initialFormState); }}
                                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                                    >
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
                                            rows={3}
                                            required={activeLang === 'en'}
                                            placeholder="Happy Diwali! 🪔 May this festival of lights..."
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all resize-none"
                                        />
                                    </div>

                                    {/* Category & Event (only in English) */}
                                    {activeLang === 'en' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                                                <select
                                                    value={formData.category || ''}
                                                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
                                                >
                                                    <option value="">No Category</option>
                                                    {categories.map(cat => (
                                                        <option key={cat._id} value={cat._id}>
                                                            {cat.translations?.en?.name || cat.code}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">Linked Event</label>
                                                <select
                                                    value={formData.event_id || ''}
                                                    onChange={e => setFormData(prev => ({ ...prev, event_id: e.target.value }))}
                                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
                                                >
                                                    <option value="">No Event (General)</option>
                                                    {events.map(evt => (
                                                        <option key={evt._id} value={evt._id}>
                                                            {evt.title}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {/* Submit */}
                                    <div className="flex justify-end gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => { setShowForm(false); setEditId(null); setFormData(initialFormState); }}
                                            className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all hover:scale-[1.02]"
                                        >
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
