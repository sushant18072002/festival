import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import LanguageTabs from '../components/LanguageTabs';
import ConfirmationModal from '../components/ConfirmationModal';
import {
    Plus, Edit2, Trash2, Search, X, BookOpen,
    Check, AlertTriangle, Globe, Tag, Play, Pause, Music, Upload,
    RefreshCw, ChevronLeft, ChevronRight, Activity, Trash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { getAudioUrl } from '../lib/getImageUrl';

interface MantraData {
    _id?: string;
    text: string;
    transliteration: string;
    meaning: string;
    slug?: string;
    category?: any;
    audio_file?: string;
    is_s3_uploaded?: boolean;
    is_active?: boolean;
    is_deleted?: boolean;
    translations?: { [key: string]: { text?: string; transliteration?: string; meaning?: string } };
}

const initialFormState: MantraData = {
    text: '',
    transliteration: '',
    meaning: '',
    slug: '',
    category: '',
    audio_file: '',
    is_active: true,
    translations: {}
};

export default function Mantras() {
    const [mantras, setMantras] = useState<MantraData[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [formData, setFormData] = useState<MantraData>(initialFormState);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
    const [activeLang, setActiveLang] = useState('en');
    const [showTrash, setShowTrash] = useState(false);
    
    const [playingId, setPlayingId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        fetchMantras();
        fetchCategories();
    }, [showTrash, debouncedSearch, pagination.page]);

    const fetchMantras = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                trash: showTrash.toString(),
                search: debouncedSearch,
                page: pagination.page.toString(),
                limit: '12'
            });
            const res = await fetch(`/api/mantras?${params}`);
            const json = await res.json();
            if (json.success) {
                setMantras(json.data);
                if (json.pagination) {
                    setPagination(json.pagination);
                }
            }
        } catch (err) {
            toast.error('Failed to fetch mantras');
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

    const handlePlay = (item: MantraData) => {
        if (!item.audio_file) return;

        if (playingId === item._id) {
            audioRef.current?.pause();
            setPlayingId(null);
        } else {
            if (audioRef.current) audioRef.current.pause();
            audioRef.current = new Audio(getAudioUrl(item.audio_file));
            audioRef.current.play();
            audioRef.current.onended = () => setPlayingId(null);
            setPlayingId(item._id || null);
        }
    };

    const handleEdit = (item: MantraData) => {
        setFormData({
            ...item,
            category: typeof item.category === 'object' ? item.category?._id : item.category || '',
        });
        setEditId(item._id || null);
        setUploadFile(null);
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
            const res = await fetch(`/api/mantras?id=${deleteId}${permanentDelete ? '&permanent=true' : ''}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                toast.success(permanentDelete ? 'Mantra deleted forever' : 'Mantra moved to trash', { id: tid });
                fetchMantras();
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
        const tid = toast.loading('Restoring mantra...');
        try {
            const res = await fetch('/api/mantras', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _id: id, is_deleted: false, deleted_at: null })
            });
            const json = await res.json();
            if (json.success) {
                toast.success('Mantra restored', { id: tid });
                fetchMantras();
            }
        } catch (err) {
            toast.error('Restore failed', { id: tid });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const toastId = toast.loading(editId ? 'Updating mantra...' : 'Creating mantra...');
        try {
            const method = editId ? 'PUT' : 'POST';
            
            const submitData = new FormData();
            Object.entries(formData).forEach(([k, v]) => {
                if (k === 'translations') submitData.append(k, JSON.stringify(v));
                else submitData.append(k, String(v || ''));
            });
            
            if (editId) submitData.set('_id', editId);
            if (uploadFile) submitData.append('audio_file', uploadFile);

            const res = await fetch('/api/mantras', {
                method,
                body: submitData
            });
            const json = await res.json();
            if (json.success) {
                toast.success(editId ? 'Mantra updated!' : 'Mantra created!', { id: toastId });
                setShowForm(false);
                setEditId(null);
                setFormData(initialFormState);
                setUploadFile(null);
                fetchMantras();
            } else {
                toast.error(`Save failed: ${json.error}`, { id: toastId });
            }
        } catch (err) {
            toast.error('Check network connection', { id: toastId });
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
                    ? "This action cannot be undone. This sacred mantra will be permanently removed from the database." 
                    : "Are you sure you want to move this mantra to the trash? You can restore it later."}
                isDestructive
            />

            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header Section */}
                <div className="bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 p-8 z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 shadow-inner group">
                                <BookOpen className="w-8 h-8 text-amber-400 group-hover:scale-110 transition-transform" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black tracking-tight text-white uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-400">Mantras Repository</h1>
                                <p className="text-slate-500 mt-1 uppercase tracking-widest text-[10px] font-bold">
                                    {pagination.total} Sacred Verses · Mission Control Analytics
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
                                onClick={() => { setShowForm(true); setEditId(null); setFormData(initialFormState); setUploadFile(null); }}
                                className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl text-sm font-black text-white shadow-lg shadow-amber-600/20 hover:shadow-amber-600/40 transition-all hover:scale-[1.02] flex items-center gap-2 uppercase tracking-widest"
                            >
                                <Plus size={18} /> Add Mantra
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mt-8 relative max-w-xl group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Find mantras by text, transliteration, or meaning..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-all font-medium"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white">
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-950 pb-32">
                    {loading && mantras.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <Activity className="w-12 h-12 text-amber-500 animate-pulse" />
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Harmonizing Frequency...</p>
                        </div>
                    ) : mantras.length === 0 ? (
                        <div className="text-center py-32 bg-slate-900/40 rounded-[2.5rem] border-2 border-dashed border-slate-800 animate-in fade-in zoom-in duration-500">
                            <BookOpen className="w-16 h-16 mx-auto mb-6 text-slate-700 opacity-20" />
                            <h3 className="text-xl font-black text-slate-400 uppercase tracking-tighter">Silence in the library</h3>
                            <p className="text-slate-600 text-sm mt-2 font-medium text-center max-w-xs mx-auto">No mantras matching your search criteria were found in our records.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence mode="popLayout">
                                {mantras.map((item, i) => (
                                    <motion.div
                                        key={item._id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="group relative bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-[2.5rem] p-8 hover:bg-slate-900/80 transition-all duration-300 shadow-xl flex flex-col h-full"
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <button 
                                                onClick={() => handlePlay(item)}
                                                className={clsx(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all border border-slate-800 shadow-lg",
                                                    !item.audio_file ? "bg-slate-950 text-slate-800 cursor-not-allowed" : 
                                                    playingId === item._id ? "bg-amber-500 text-white border-amber-400 scale-110" : "bg-slate-950 text-amber-500 hover:bg-amber-500 hover:text-white"
                                                )}
                                            >
                                                {playingId === item._id ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
                                            </button>
                                            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                                {showTrash ? (
                                                    <button 
                                                        onClick={() => handleRestore(item._id!)}
                                                        className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-lg border border-slate-800"
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

                                        <div className="flex-1">
                                            <h3 className="text-white font-black text-2xl mb-2 leading-tight group-hover:text-amber-200 transition-colors uppercase tracking-widest">{item.text}</h3>
                                            <p className="text-amber-500/60 italic text-sm mb-4 font-serif">{item.transliteration}</p>
                                            <p className="text-slate-400 text-xs leading-relaxed line-clamp-4 font-medium">{item.meaning}</p>
                                        </div>

                                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800/50">
                                            <span className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em] truncate max-w-[120px]">{item.slug}</span>
                                            <div className="flex items-center gap-1.5">
                                                {['hi', 'mr', 'gu', 'bn', 'ta', 'te', 'kn', 'ml'].map(lang => (
                                                    <div
                                                        key={lang}
                                                        className={clsx(
                                                            "w-6 h-6 rounded-md flex items-center justify-center text-[8px] font-black uppercase tracking-tighter border transition-all",
                                                            (item.translations as any)?.[lang]?.text
                                                                ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
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
                                            ? "bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-500/20"
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
                                    <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                                        <Plus className="w-6 h-6 text-amber-400" />
                                    </div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight">
                                        {editId ? 'Refine Mantra' : 'New Sacred Entry'}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => { setShowForm(false); setEditId(null); setFormData(initialFormState); setUploadFile(null); }}
                                    className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                                <LanguageTabs activeLang={activeLang} onChange={setActiveLang} />

                                {/* Audio Upload Zone */}
                                {activeLang === 'en' && (
                                    <div 
                                        onClick={() => fileInputRef.current?.click()} 
                                        className="group border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-[2rem] p-10 text-center cursor-pointer transition-all bg-slate-950/50 shadow-inner"
                                    >
                                        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-800 group-hover:border-amber-500/20 transition-all shadow-xl">
                                            <Upload className={clsx("transition-colors", uploadFile || formData.audio_file ? "text-emerald-400" : "text-slate-600 group-hover:text-amber-500")} size={32} />
                                        </div>
                                        {uploadFile ? (
                                            <div>
                                                <p className="text-amber-300 font-black uppercase tracking-widest text-xs">{uploadFile.name}</p>
                                                <p className="text-slate-600 text-[10px] mt-1 uppercase font-bold tracking-tighter">{(uploadFile.size / 1024).toFixed(1)} KB READY FOR SYNC</p>
                                            </div>
                                        ) : formData.audio_file ? (
                                            <div>
                                                <p className="text-emerald-400 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2">AUDIO CHANNEL SYNCED</p>
                                                <p className="text-slate-600 text-[10px] mt-1 truncate max-w-xs mx-auto uppercase font-bold tracking-tighter">{formData.audio_file}</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Acoustic Signature Required</p>
                                                <p className="text-slate-700 text-[10px] mt-1 uppercase font-bold tracking-tighter">Click to upload Mantra Audio (.aac recommended)</p>
                                            </div>
                                        )}
                                        <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={e => setUploadFile(e.target.files?.[0] || null)} />
                                    </div>
                                )}

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Vocalized Script {activeLang !== 'en' && `(${activeLang.toUpperCase()})`}</label>
                                        <textarea 
                                            required={activeLang === 'en'} 
                                            value={getFieldValue('text')} 
                                            onChange={e => updateField('text', e.target.value)} 
                                            rows={2} 
                                            placeholder="ओम गण गणपतये नमो नमः"
                                            className="w-full px-6 py-5 bg-slate-950 border border-slate-800 rounded-[1.5rem] text-2xl font-black text-amber-200 placeholder-slate-800 outline-none focus:border-amber-500/50 transition-all shadow-inner resize-none" 
                                        />
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phonetic Transliteration</label>
                                        <input 
                                            value={getFieldValue('transliteration')} 
                                            onChange={e => updateField('transliteration', e.target.value)} 
                                            placeholder="Om Gan Ganapataye Namo Namah"
                                            className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white italic placeholder-slate-800 outline-none focus:border-amber-500/50 transition-all shadow-inner" 
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Philosophical Meaning</label>
                                        <textarea 
                                            value={getFieldValue('meaning')} 
                                            onChange={e => updateField('meaning', e.target.value)} 
                                            rows={3} 
                                            placeholder="Explain the significance and translation..."
                                            className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-400 placeholder-slate-800 outline-none focus:border-amber-500/50 transition-all text-sm shadow-inner resize-none" 
                                        />
                                    </div>

                                    {activeLang === 'en' && (
                                        <div className="grid grid-cols-2 gap-8 pt-2">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Asset Identity (Slug)</label>
                                                <input 
                                                    value={formData.slug} 
                                                    onChange={e => setFormData({...formData, slug: e.target.value})} 
                                                    placeholder="e.g. ganesh-invocation" 
                                                    className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-sm outline-none focus:border-amber-500/50 font-mono shadow-inner" 
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Deity Classification</label>
                                                <div className="relative">
                                                    <select 
                                                        value={formData.category} 
                                                        onChange={e => setFormData({...formData, category: e.target.value})} 
                                                        className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-sm outline-none focus:border-amber-500/50 appearance-none cursor-pointer shadow-inner pr-12"
                                                    >
                                                        <option value="">Unclassified</option>
                                                        {categories.map(c => <option key={c._id} value={c._id}>{c.translations?.en?.name || c.code}</option>)}
                                                    </select>
                                                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none rotate-90" size={16} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-4 pt-4 pb-4">
                                    <button 
                                        type="button" 
                                        onClick={() => { setShowForm(false); setEditId(null); setFormData(initialFormState); setUploadFile(null); }} 
                                        className="flex-1 py-5 border border-slate-800 rounded-2xl text-xs font-black text-slate-500 hover:text-white hover:bg-slate-800 transition-all uppercase tracking-widest"
                                    >
                                        DISCARD
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="flex-[2] py-5 bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl text-xs font-black text-white shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 transform transition-all active:scale-95 uppercase tracking-widest"
                                    >
                                        {editId ? 'VALIDATE CHANGES' : 'AUTHORIZE MANTRA'}
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
