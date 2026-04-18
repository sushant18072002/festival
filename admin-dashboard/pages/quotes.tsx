import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import LanguageTabs from '../components/LanguageTabs';
import ConfirmationModal from '../components/ConfirmationModal';
import {
    Plus, Edit2, Trash2, Search, X, Quote as QuoteIcon,
    Check, AlertTriangle, Globe, Tag, Star, StarOff, User,
    RefreshCw, ChevronLeft, ChevronRight, Activity, Trash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface QuoteData {
    _id?: string;
    text: string;
    slug?: string;
    author: string;
    source?: string;
    category?: any;
    is_featured?: boolean;
    is_active?: boolean;
    is_deleted?: boolean;
    translations?: { [key: string]: { text?: string; author?: string; source?: string } };
}

const initialFormState: QuoteData = {
    text: '',
    slug: '',
    author: '',
    source: '',
    category: '',
    is_featured: false,
    is_active: true,
    translations: {}
};

export default function Quotes() {
    const [quotes, setQuotes] = useState<QuoteData[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [formData, setFormData] = useState<QuoteData>(initialFormState);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
    const [activeLang, setActiveLang] = useState('en');
    const [showTrash, setShowTrash] = useState(false);
    const [filterFeatured, setFilterFeatured] = useState(false);

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
        fetchQuotes();
        fetchCategories();
    }, [showTrash, filterFeatured, debouncedSearch, pagination.page]);

    const fetchQuotes = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                trash: showTrash.toString(),
                featured: filterFeatured.toString(),
                search: debouncedSearch,
                page: pagination.page.toString(),
                limit: '10'
            });
            const res = await fetch(`/api/quotes?${params}`);
            const json = await res.json();
            if (json.success) {
                setQuotes(json.data);
                if (json.pagination) {
                    setPagination(json.pagination);
                }
            }
        } catch (err) {
            toast.error('Failed to fetch quotes');
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

    const handleEdit = (item: QuoteData) => {
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
            const res = await fetch(`/api/quotes?id=${deleteId}${permanentDelete ? '&permanent=true' : ''}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                toast.success(permanentDelete ? 'Quote deleted forever' : 'Quote moved to trash', { id: tid });
                fetchQuotes();
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
        const tid = toast.loading('Restoring quote...');
        try {
            const res = await fetch('/api/quotes', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _id: id, is_deleted: false, deleted_at: null })
            });
            const json = await res.json();
            if (json.success) {
                toast.success('Quote restored', { id: tid });
                fetchQuotes();
            }
        } catch (err) {
            toast.error('Restore failed', { id: tid });
        }
    };

    const toggleFeatured = async (item: QuoteData) => {
        const tid = toast.loading(item.is_featured ? 'Unfeaturing...' : 'Featuring...');
        try {
            const res = await fetch('/api/quotes', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _id: item._id, is_featured: !item.is_featured })
            });
            const json = await res.json();
            if (json.success) {
                toast.success(item.is_featured ? 'Quote unfeatured' : 'Quote featured ⭐', { id: tid });
                fetchQuotes();
            }
        } catch (err) {
            toast.error('Update failed', { id: tid });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const tid = toast.loading(editId ? 'Updating quote...' : 'Creating quote...');
        try {
            const method = editId ? 'PUT' : 'POST';
            const body = editId ? { ...formData, _id: editId } : formData;
            const res = await fetch('/api/quotes', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const json = await res.json();
            if (json.success) {
                toast.success(editId ? 'Quote updated!' : 'Quote created!', { id: tid });
                setShowForm(false);
                setEditId(null);
                setFormData(initialFormState);
                fetchQuotes();
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
        if (!cat) return null;
        if (typeof cat === 'string') return cat;
        return cat.translations?.en?.name || cat.code;
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
                    ? "This action cannot be undone. This quote will be permanently removed from the database." 
                    : "Are you sure you want to move this quote to the trash? You can restore it later."}
                isDestructive
            />

            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header Section */}
                <div className="bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 p-8 z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-violet-500/10 rounded-2xl border border-violet-500/20 shadow-inner group">
                                <QuoteIcon className="w-8 h-8 text-violet-400 group-hover:scale-110 transition-transform" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black tracking-tight text-white uppercase">Inspiration Vault</h1>
                                <p className="text-slate-500 mt-1 uppercase tracking-widest text-[10px] font-bold">
                                    {pagination.total} Quotes · Mission Control Analytics
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setFilterFeatured(!filterFeatured)}
                                className={clsx(
                                    "px-5 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                    filterFeatured
                                        ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                        : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                                )}
                            >
                                <Star size={18} className={filterFeatured ? "fill-amber-500" : ""} />
                                Featured
                            </button>
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
                                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl text-sm font-black text-white shadow-lg shadow-violet-600/20 hover:shadow-violet-600/40 transition-all hover:scale-[1.02] flex items-center gap-2 uppercase tracking-widest"
                            >
                                <Plus size={18} /> Add Quote
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mt-8 relative max-w-xl group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search by quote content, author, or keywords..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 transition-all"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white">
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-950 pb-32">
                    {loading && quotes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <Activity className="w-12 h-12 text-violet-500 animate-pulse" />
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Querying Ancestral Wisdom...</p>
                        </div>
                    ) : quotes.length === 0 ? (
                        <div className="text-center py-32 bg-slate-900/40 rounded-[2.5rem] border-2 border-dashed border-slate-800 animate-in fade-in zoom-in duration-500">
                            <QuoteIcon className="w-16 h-16 mx-auto mb-6 text-slate-700 opacity-20" />
                            <h3 className="text-xl font-black text-slate-400 uppercase tracking-tighter">Echoes of silence</h3>
                            <p className="text-slate-600 text-sm mt-2 font-medium">No quotes matching your parameters were found.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <AnimatePresence mode="popLayout">
                                {quotes.map((item, i) => (
                                    <motion.div
                                        key={item._id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className={clsx(
                                            "group relative bg-slate-900 border rounded-[2rem] p-8 hover:bg-slate-900/80 transition-all duration-300 shadow-xl",
                                            item.is_featured ? "border-amber-500/30 bg-amber-500/[0.02]" : "border-slate-800 hover:border-violet-500/40"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 group-hover:border-violet-500/20 transition-colors">
                                                    <QuoteIcon className="w-5 h-5 text-slate-600 group-hover:text-violet-400 transition-colors" />
                                                </div>
                                                {item.is_featured && (
                                                    <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-amber-500/20">
                                                        FEATURED
                                                    </span>
                                                )}
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
                                                        onClick={() => toggleFeatured(item)}
                                                        className={clsx(
                                                            "p-2 rounded-xl transition-all shadow-lg border border-slate-800",
                                                            item.is_featured ? "bg-amber-500 text-white border-amber-400" : "bg-slate-950 text-slate-400 hover:bg-amber-500 hover:text-white"
                                                        )}
                                                        title="Toggle Featured"
                                                    >
                                                        <Star size={16} className={item.is_featured ? "fill-white" : ""} />
                                                    </button>
                                                )}
                                                {!showTrash && (
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

                                        <p className="text-white font-serif text-xl italic leading-relaxed mb-6 group-hover:text-violet-50 transition-colors">
                                            "{item.text}"
                                        </p>

                                        <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-800/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-violet-400 font-bold">
                                                    {item.author?.[0] || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-white uppercase tracking-tight">{item.author || 'Anonymous'}</p>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.source || 'Original Work'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                {['hi', 'mr', 'gu', 'bn', 'ta', 'te', 'kn', 'ml'].map(lang => (
                                                    <div
                                                        key={lang}
                                                        className={clsx(
                                                            "w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black uppercase tracking-tighter border transition-all",
                                                            (item.translations as any)?.[lang]?.text
                                                                ? "bg-violet-500/10 border-violet-500/30 text-violet-500"
                                                                : "bg-slate-950 border-slate-800 text-slate-700"
                                                        )}
                                                    >
                                                        {lang}
                                                    </div>
                                                ))}
                                            </div>
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
                                            ? "bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/20"
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
                            className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
                        >
                            <div className="p-8 border-b border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-violet-500/10 rounded-2xl border border-violet-500/20">
                                        <QuoteIcon className="w-6 h-6 text-violet-400" />
                                    </div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight">
                                        {editId ? 'Curate Wisdom' : 'New Inspiration Entry'}
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
                                        Wisdom Content {activeLang !== 'en' && `(${activeLang.toUpperCase()})`}
                                    </label>
                                    <textarea
                                        value={getFieldValue('text')}
                                        onChange={e => updateField('text', e.target.value)}
                                        rows={5}
                                        required={activeLang === 'en'}
                                        placeholder="Enter the profound words here..."
                                        className="w-full px-8 py-6 bg-slate-950 border border-slate-800 rounded-[2rem] text-xl font-serif italic text-white placeholder-slate-800 focus:outline-none focus:border-violet-500/50 transition-all resize-none shadow-inner"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Author / Orator</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                            <input
                                                value={getFieldValue('author')}
                                                onChange={e => updateField('author', e.target.value)}
                                                placeholder="e.g. Swami Vivekananda"
                                                className="w-full pl-12 pr-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-violet-500/50 transition-all shadow-inner"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Source / Publication</label>
                                        <div className="relative">
                                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                            <input
                                                value={getFieldValue('source')}
                                                onChange={e => updateField('source', e.target.value)}
                                                placeholder="e.g. Chicago Speech, 1893"
                                                className="w-full pl-12 pr-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-violet-500/50 transition-all shadow-inner"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {activeLang === 'en' && (
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Thematic Category</label>
                                            <select
                                                value={formData.category || ''}
                                                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                                className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-violet-500/50 transition-all appearance-none cursor-pointer shadow-inner"
                                            >
                                                <option value="">Uncategorized</option>
                                                {categories.map(cat => (
                                                    <option key={cat._id} value={cat._id}>
                                                        {cat.translations?.en?.name || cat.code}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex items-end">
                                            <label className="flex items-center justify-between px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl w-full cursor-pointer hover:border-amber-500/30 transition-all group shadow-inner">
                                                <div className="flex items-center gap-3">
                                                    <Star className={clsx("w-5 h-5 transition-colors", formData.is_featured ? "text-amber-500 fill-amber-500" : "text-slate-600")} />
                                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300">Feature this entry</span>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.is_featured || false}
                                                    onChange={e => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                                                    className="w-5 h-5 rounded-lg border-slate-800 bg-slate-950 text-amber-500 focus:ring-amber-500/20"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4 pb-4">
                                    <button
                                        type="button"
                                        onClick={() => { setShowForm(false); setEditId(null); setFormData(initialFormState); }}
                                        className="flex-1 py-5 border border-slate-800 rounded-2xl text-xs font-black text-slate-500 hover:text-white hover:bg-slate-800 transition-all uppercase tracking-widest"
                                    >
                                        RETRACT
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] py-5 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl text-xs font-black text-white shadow-xl shadow-violet-500/20 hover:shadow-violet-500/40 transition-all active:scale-95 uppercase tracking-widest"
                                    >
                                        {editId ? 'COMMIT TO VAULT' : 'AUTHORIZE ENTRY'}
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
