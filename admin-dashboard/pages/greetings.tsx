import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import LanguageTabs from '../components/LanguageTabs';
import ConfirmationModal from '../components/ConfirmationModal';
import {
    Plus, Edit2, Trash2, Search, X, MessageCircle,
    Check, AlertTriangle, Globe, Tag, RefreshCw,
    ChevronLeft, ChevronRight, Activity, Trash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import clsx from 'clsx';

// --- Types ---
interface GreetingData {
    _id?: string;
    text: string;
    slug?: string;
    category?: any;
    is_active?: boolean;
    is_deleted?: boolean;
    translations?: { [key: string]: { text?: string } };
}

const initialFormState: GreetingData = {
    text: '',
    slug: '',
    category: '',
    is_active: true,
    translations: {}
};

export default function Greetings() {
    const [greetings, setGreetings] = useState<GreetingData[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [formData, setFormData] = useState<GreetingData>(initialFormState);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
    const [activeLang, setActiveLang] = useState('en');
    const [showTrash, setShowTrash] = useState(false);

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [permanentDelete, setPermanentDelete] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        fetchGreetings();
        fetchCategories();
    }, [showTrash, debouncedSearch, pagination.page]);

    const fetchGreetings = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                trash: showTrash.toString(),
                search: debouncedSearch,
                page: pagination.page.toString(),
                limit: '15'
            });
            const res = await fetch(`/api/greetings?${params}`);
            const json = await res.json();
            if (json.success) {
                setGreetings(json.data);
                if (json.pagination) {
                    setPagination(json.pagination);
                }
            }
        } catch (err) {
            toast.error('Failed to fetch greetings');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            const json = await res.json();
            if (json.success) setCategories(json.data);
        } catch (err) { /* silent */ }
    };

    const handleEdit = (item: GreetingData) => {
        setFormData({
            ...item,
            category: typeof item.category === 'object' ? item.category?._id : item.category || '',
        });
        setEditId(item._id || null);
        setShowForm(true);
    };

    const confirmDelete = (id: string, permanent = false) => {
        setDeleteId(id);
        setPermanentDelete(permanent);
        setModalOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        const tid = toast.loading(permanentDelete ? 'Permanently deleting...' : 'Moving to trash...');
        try {
            const res = await fetch(`/api/greetings?id=${deleteId}${permanentDelete ? '&permanent=true' : ''}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                toast.success(permanentDelete ? 'Deleted forever' : 'Moved to trash', { id: tid });
                fetchGreetings();
            } else {
                toast.error('Delete failed', { id: tid });
            }
        } catch (err) {
            toast.error('Network error', { id: tid });
        } finally {
            setModalOpen(false);
            setDeleteId(null);
        }
    };

    const handleRestore = async (id: string) => {
        const tid = toast.loading('Restoring greeting...');
        try {
            const res = await fetch('/api/greetings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _id: id, is_deleted: false, deleted_at: null })
            });
            const json = await res.json();
            if (json.success) {
                toast.success('Greeting restored', { id: tid });
                fetchGreetings();
            }
        } catch (err) {
            toast.error('Restore failed', { id: tid });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const tid = toast.loading(editId ? 'Updating greeting...' : 'Creating greeting...');
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
                toast.success(editId ? 'Greeting updated!' : 'Greeting created!', { id: tid });
                setShowForm(false);
                setEditId(null);
                setFormData(initialFormState);
                fetchGreetings();
            }
        } catch (err) {
            toast.error('Save failed', { id: tid });
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

    const getCategoryName = (cat: any) => {
        if (!cat) return '—';
        if (typeof cat === 'string') return cat;
        return cat.translations?.en?.name || cat.code || '—';
    };

    return (
        <div className="flex h-screen bg-slate-950 font-sans text-white overflow-hidden">
            <Sidebar />
            <ConfirmationModal
                isOpen={modalOpen}
                onCancel={() => setModalOpen(false)}
                onConfirm={handleDelete}
                title={permanentDelete ? "Permanent Delete" : "Move to Trash"}
                message={permanentDelete 
                    ? "This action cannot be undone. This greeting will be permanently removed from the database." 
                    : "Are you sure you want to move this greeting to the trash? You can restore it later."}
                isDestructive
            />

            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header Section */}
                <div className="bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 p-8 z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-inner group">
                                <MessageCircle className="w-8 h-8 text-emerald-400 group-hover:scale-110 transition-transform" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black tracking-tight text-white uppercase">Greetings Library</h1>
                                <p className="text-slate-500 mt-1 uppercase tracking-widest text-[10px] font-bold">
                                    {pagination.total} Greetings · Multilingual Mission Control
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowTrash(!showTrash)}
                                className={clsx(
                                    "px-5 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                    showTrash
                                        ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                                        : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                                )}
                            >
                                {showTrash ? <ChevronLeft size={18} /> : <Trash size={18} />}
                                {showTrash ? 'Back' : 'Trash'}
                            </button>
                            <button
                                onClick={() => { setShowForm(true); setEditId(null); setFormData(initialFormState); }}
                                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl text-sm font-black text-white shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 transition-all hover:scale-[1.02] flex items-center gap-2 uppercase tracking-widest"
                            >
                                <Plus size={18} /> Add Greeting
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mt-8 relative max-w-xl group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Type to find greetings across languages..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white">
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-950 pb-32">
                    {loading && greetings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <Activity className="w-12 h-12 text-emerald-500 animate-pulse" />
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs tracking-widest">Scanning Communication Channels...</p>
                        </div>
                    ) : greetings.length === 0 ? (
                        <div className="text-center py-32 bg-slate-900/40 rounded-[2.5rem] border-2 border-dashed border-slate-800 animate-in fade-in zoom-in duration-500">
                            <MessageCircle className="w-16 h-16 mx-auto mb-6 text-slate-700 opacity-20" />
                            <h3 className="text-xl font-black text-slate-400 uppercase tracking-tighter">Silence in the library</h3>
                            <p className="text-slate-600 text-sm mt-2 font-medium">Try a different search or create a new greeting</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence mode="popLayout">
                                {greetings.map((item, i) => (
                                    <motion.div
                                        key={item._id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="group relative bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-[2rem] p-6 hover:bg-slate-900/80 transition-all duration-300 shadow-xl"
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 group-hover:border-emerald-500/20 transition-colors">
                                                <Globe className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                                            </div>
                                            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                                {showTrash ? (
                                                    <button 
                                                        onClick={() => handleRestore(item._id!)}
                                                        className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-lg"
                                                        title="Restore"
                                                    >
                                                        <RefreshCw size={16} />
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleEdit(item)}
                                                        className="p-2 bg-slate-950 text-slate-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-lg border border-slate-800"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => confirmDelete(item._id!, showTrash)}
                                                    className="p-2 bg-slate-950 text-slate-400 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-lg border border-slate-800"
                                                    title={showTrash ? "Delete Permanently" : "Move to Trash"}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <p className="text-white font-bold text-lg leading-relaxed mb-6 italic line-clamp-3 group-hover:text-emerald-50 transition-colors">
                                            "{item.text}"
                                        </p>

                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {item.category && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-800 group-hover:border-emerald-500/20">
                                                    <Tag className="w-3 h-3" />
                                                    {getCategoryName(item.category)}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1.5 pt-6 border-t border-slate-800/50">
                                            {['hi', 'mr', 'gu', 'bn', 'ta', 'te', 'kn', 'ml'].map(lang => (
                                                <div
                                                    key={lang}
                                                    title={lang.toUpperCase()}
                                                    className={clsx(
                                                        "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black uppercase tracking-tighter border transition-all",
                                                        (item.translations as any)?.[lang]?.text
                                                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                                                            : "bg-slate-950 border-slate-800 text-slate-700"
                                                    )}
                                                >
                                                    {lang}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Pagination Footer */}
                <div className="absolute bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-xl border-t border-slate-800/50 px-8 py-6 flex items-center justify-between z-20">
                    <div className="text-xs font-black text-slate-500 uppercase tracking-widest">
                        Page <span className="text-white">{pagination.page}</span> of <span className="text-white">{pagination.pages}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                            disabled={pagination.page === 1}
                            className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex gap-1.5">
                            {[...Array(Math.min(5, pagination.pages))].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
                                    className={clsx(
                                        "w-10 h-10 rounded-xl text-xs font-black transition-all border",
                                        pagination.page === i + 1
                                            ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                            : "bg-slate-900 border-slate-800 text-slate-500 hover:text-white"
                                    )}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                            disabled={pagination.page === pagination.pages}
                            className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </main>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-8 border-b border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                        <Plus className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight">
                                        {editId ? 'Modify Greeting' : 'New Greeting Asset'}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => { setShowForm(false); setEditId(null); setFormData(initialFormState); }}
                                    className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                                <LanguageTabs activeLang={activeLang} onChange={setActiveLang} />

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                        Content {activeLang !== 'en' && `(${activeLang.toUpperCase()})`}
                                    </label>
                                    <textarea
                                        value={getFieldValue('text')}
                                        onChange={e => updateField('text', e.target.value)}
                                        rows={4}
                                        required={activeLang === 'en'}
                                        placeholder="Enter celebration message content..."
                                        className="w-full px-6 py-5 bg-slate-950 border border-slate-800 rounded-[1.5rem] text-white placeholder-slate-700 focus:outline-none focus:border-emerald-500/50 transition-all resize-none shadow-inner"
                                    />
                                </div>

                                {activeLang === 'en' && (
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Asset Slug</label>
                                            <input
                                                value={formData.slug || ''}
                                                onChange={prev => setFormData(prev => ({ ...prev, slug: (prev as any).target.value }))}
                                                placeholder="e.g. diwali-morning-wish"
                                                className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-emerald-500/50 transition-all font-mono shadow-inner"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
                                            <select
                                                value={formData.category || ''}
                                                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                                className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-emerald-500/50 transition-all appearance-none cursor-pointer shadow-inner"
                                            >
                                                <option value="">Ungrouped</option>
                                                {categories.map(cat => (
                                                    <option key={cat._id} value={cat._id}>
                                                        {cat.translations?.en?.name || cat.code}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => { setShowForm(false); setEditId(null); setFormData(initialFormState); }}
                                        className="flex-1 py-4 border border-slate-800 rounded-2xl text-xs font-black text-slate-500 hover:text-white hover:bg-slate-800 transition-all uppercase tracking-widest"
                                    >
                                        DISCARD
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] py-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl text-xs font-black text-white shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all active:scale-95 uppercase tracking-widest"
                                    >
                                        {editId ? 'COMMIT CHANGES' : 'GENERATE ASSET'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
