import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import LanguageTabs from '../components/LanguageTabs';
import ConfirmationModal from '../components/ConfirmationModal';
import {
    Plus, Edit2, Trash2, Search, X, Sunrise,
    Check, AlertTriangle, Moon, Coffee, Sunset, Star, Sparkles,
    Activity, Clock, Globe, ArrowRight, ShieldCheck
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

const TYPE_META: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string; shadow: string }> = {
    morning: { label: 'Morning', icon: <Sunrise size={14} />, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', shadow: 'shadow-amber-500/20' },
    afternoon: { label: 'Afternoon', icon: <Coffee size={14} />, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', shadow: 'shadow-orange-500/20' },
    evening: { label: 'Evening', icon: <Sunset size={14} />, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', shadow: 'shadow-rose-500/20' },
    night: { label: 'Night', icon: <Moon size={14} />, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20', shadow: 'shadow-indigo-500/20' },
    festival: { label: 'Festival', icon: <Star size={14} />, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', shadow: 'shadow-yellow-500/20' },
    general: { label: 'General', icon: <Sparkles size={14} />, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20', shadow: 'shadow-teal-500/20' },
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

    // Modal state
    const [modalConfig, setModalConfig] = useState<{
        open: boolean;
        title: string;
        message: string;
        isDestructive: boolean;
        onConfirm: () => void;
    }>({ open: false, title: '', message: '', isDestructive: false, onConfirm: () => {} });

    useEffect(() => { fetchGreetings(); }, [showTrash]);

    const fetchGreetings = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/home-greetings${showTrash ? '?trash=true' : ''}`);
            const json = await res.json();
            if (json.success) setGreetings(json.data);
        } catch (err) {
            toast.error('GREETING_SYNC_ERROR');
        }
        setLoading(false);
    };

    const handleEdit = (item: HomeGreetingData) => {
        setFormData({ ...item });
        setTagsInput((item.tags || []).join(', '));
        setEditId(item._id || null);
        setShowForm(true);
    };

    const confirmAction = (id: string, permanent = false) => {
        setModalConfig({
            open: true,
            title: permanent ? 'Purge Greeting?' : 'Archive to Trash?',
            message: permanent 
                ? 'Terminating this object is permanent and cannot be reversed from the S3 vault.' 
                : 'This greeting will be moved to the archival trash vault.',
            isDestructive: permanent,
            onConfirm: () => handleDelete(id, permanent)
        });
    };

    const handleDelete = async (id: string, permanent = false) => {
        setModalConfig(prev => ({ ...prev, open: false }));
        const toastId = toast.loading(permanent ? 'PURGING OBJECT...' : 'ARCHIVING...');
        try {
            const res = await fetch(`/api/home-greetings?id=${id}${permanent ? '&permanent=true' : ''}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                toast.success(permanent ? 'OBJECT TERMINATED' : 'ARCHIVED TO VAULT', { id: toastId });
                fetchGreetings();
            } else {
                toast.error('DELETE_FAILURE', { id: toastId });
            }
        } catch {
            toast.error('NETWORK_PROTOCOL_ERROR', { id: toastId });
        }
    };

    const handleRestore = async (id: string) => {
        const toastId = toast.loading('RECITING OBJECT...');
        try {
            const res = await fetch('/api/home-greetings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _id: id, is_deleted: false, deleted_at: null })
            });
            const json = await res.json();
            if (json.success) { 
                toast.success('OBJECT RESTORED', { id: toastId }); 
                fetchGreetings(); 
            } else {
                toast.error('RESTORE_FAILURE', { id: toastId });
            }
        } catch { 
            toast.error('NETWORK_PROTOCOL_ERROR', { id: toastId }); 
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const toastId = toast.loading('SYNCING_CHANGES...');
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
                toast.success(editId ? 'MANIFEST_UPDATED' : 'ENTITY_CREATED', { id: toastId });
                setShowForm(false);
                setEditId(null);
                setFormData(initialFormState);
                setTagsInput('');
                fetchGreetings();
            } else {
                toast.error(json.error || 'SYNC_FAILURE', { id: toastId });
            }
        } catch { 
            toast.error('NETWORK_PROTOCOL_ERROR', { id: toastId }); 
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
        const matchSearch = (g.text || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchType = filterType === 'all' || g.type === filterType;
        return matchSearch && matchType;
    });

    const countByType = greetings.reduce((acc: Record<string, number>, g) => {
        acc[g.type] = (acc[g.type] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="flex h-screen bg-slate-950 text-white font-sans overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                
                {/* Header Section */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 shadow-inner group transition-all">
                            <Sunrise className="w-8 h-8 text-amber-400 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-rose-300 to-rose-400">
                                Global Greetings
                            </h1>
                            <p className="text-slate-500 mt-1 uppercase tracking-widest text-[10px] font-bold flex items-center gap-2">
                                <Activity size={12} className="text-emerald-500" /> Active Rotation · Registry: <span className="text-white">{greetings.length} Strings</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowTrash(!showTrash)}
                            className={clsx(
                                "group flex items-center gap-3 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border",
                                showTrash
                                    ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                                    : "bg-slate-900 border-slate-800 text-slate-500 hover:text-white"
                            )}
                        >
                            <Trash2 size={16} className={clsx("transition-transform", showTrash && "scale-110")} />
                            {showTrash ? 'Open Active Vault' : 'Open Trash Storage'}
                        </button>
                        <button
                            onClick={() => { setShowForm(true); setEditId(null); setFormData(initialFormState); setTagsInput(''); }}
                            className="group flex items-center gap-3 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white px-7 py-3.5 rounded-2xl font-black shadow-lg shadow-amber-500/20 transition-all active:scale-95 uppercase tracking-widest text-[10px]"
                        >
                            <Plus size={16} className="transition-transform group-hover:rotate-90" />
                            Register Greeting
                        </button>
                    </div>
                </div>

                {/* Status & Filter Bar */}
                <div className="bg-slate-900/40 p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl mb-10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 relative z-10">
                        {/* Type Filters */}
                        <div className="flex flex-wrap gap-2.5">
                            {TYPES.map(t => {
                                const meta = t === 'all' ? null : TYPE_META[t];
                                const count = t === 'all' ? greetings.length : (countByType[t] || 0);
                                const isActive = filterType === t;
                                return (
                                    <button
                                        key={t}
                                        onClick={() => setFilterType(t)}
                                        className={clsx(
                                            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95 shadow-sm",
                                            isActive
                                                ? "bg-white text-slate-950 border-white"
                                                : "bg-slate-950/50 text-slate-500 border-slate-800 hover:border-slate-700 hover:text-slate-300"
                                        )}
                                    >
                                        <div className={clsx(isActive ? "text-slate-950" : meta?.color)}>
                                            {meta ? meta.icon : <Globe size={14} />}
                                        </div>
                                        <span>{t}</span>
                                        <span className={clsx(
                                            "ml-1 px-1.5 py-0.5 rounded-md text-[9px]",
                                            isActive ? "bg-slate-900 text-white" : "bg-slate-800 text-slate-500"
                                        )}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full xl:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-amber-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="QUERY STRINGS BY KEYWORD..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-[1.5rem] text-[10px] font-black text-white uppercase tracking-widest focus:outline-none focus:border-amber-500/50 shadow-inner placeholder:text-slate-800 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                             <div key={i} className="h-48 bg-slate-900/50 rounded-[2.5rem] animate-pulse border border-slate-800" />
                        ))}
                    </div>
                ) : filteredGreetings.length === 0 ? (
                    <div className="text-center py-24 bg-slate-900/20 border border-slate-800/50 border-dashed rounded-[3rem]">
                        <Activity size={48} className="mx-auto mb-4 text-slate-800 opacity-50" />
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Grid Empty: No Objects Detected</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {filteredGreetings.map((item, i) => {
                                const meta = TYPE_META[item.type] || TYPE_META.general;
                                return (
                                    <motion.div
                                        key={item._id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: i * 0.02 }}
                                        className="group relative bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 hover:border-amber-500/40 transition-all duration-300 flex flex-col shadow-2xl overflow-hidden hover:-translate-y-1"
                                    >
                                        {/* Status Header */}
                                        <div className="flex items-center justify-between mb-6">
                                            <div className={clsx("flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-inner", meta.color, meta.bg)}>
                                                {meta.icon}
                                                {meta.label}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className={clsx(
                                                    "w-2 h-2 rounded-full",
                                                    item.is_active ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-slate-700"
                                                )} />
                                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                                    {item.is_active ? 'Live' : 'Standby'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Text Content */}
                                        <div className="flex-1">
                                            <p className="text-white font-bold text-lg leading-snug mb-4 group-hover:text-amber-200 transition-colors line-clamp-2">
                                                {item.text}
                                            </p>

                                            {/* Festival Tags */}
                                            {item.tags && item.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mb-5">
                                                    {item.tags.map(tag => (
                                                        <span key={tag} className="px-2 py-0.5 bg-slate-950 text-slate-500 text-[10px] font-black rounded-lg border border-slate-800 uppercase tracking-tighter">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Translation Status Grid */}
                                            <div className="flex items-center gap-1.5 mb-8 bg-slate-950/50 p-2 rounded-2xl border border-slate-800/50 w-fit">
                                                {['hi', 'mr', 'gu', 'bn', 'ta', 'te', 'kn', 'ml'].map(lang => (
                                                    <div
                                                        key={lang}
                                                        title={lang.toUpperCase()}
                                                        className={clsx(
                                                            "w-6 h-6 rounded-lg flex items-center justify-center text-[8px] font-black uppercase transition-all shadow-sm",
                                                            (item.translations as any)?.[lang]?.text
                                                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/20"
                                                                : "bg-slate-900 text-slate-700 border border-slate-800"
                                                        )}
                                                    >
                                                        {lang}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-3 pt-6 border-t border-slate-800/50 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                            {showTrash ? (
                                                <>
                                                    <button onClick={() => handleRestore(item._id!)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 text-slate-950 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95 shadow-lg shadow-emerald-500/20">
                                                        <Check size={14} /> Restore
                                                    </button>
                                                    <button onClick={() => confirmAction(item._id!, true)} className="p-3 bg-slate-950 border border-slate-800 text-rose-500 hover:border-rose-500/50 rounded-[1.25rem] transition-all active:scale-95 shadow-xl">
                                                        <AlertTriangle size={16} />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleEdit(item)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-white text-slate-950 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95 shadow-lg">
                                                        <Edit2 size={14} /> Edit Payload
                                                    </button>
                                                    <button onClick={() => confirmAction(item._id!)} className="p-3 bg-slate-950 border border-slate-800 text-slate-600 hover:text-red-500 hover:border-red-500/50 rounded-[1.25rem] transition-all active:scale-95 shadow-xl">
                                                        <Trash2 size={16} />
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

                {/* Unified Confirmation Modal */}
                <ConfirmationModal 
                    isOpen={modalConfig.open}
                    title={modalConfig.title}
                    message={modalConfig.message}
                    isDestructive={modalConfig.isDestructive}
                    confirmLabel={modalConfig.isDestructive ? "Terminating Asset" : "Proceed with Archive"}
                    onConfirm={modalConfig.onConfirm}
                    onCancel={() => setModalConfig(prev => ({ ...prev, open: false }))}
                />

                {/* Registry Modal */}
                <AnimatePresence>
                    {showForm && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowForm(false)} />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                                className="relative bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl"
                            >
                                <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
                                    <div>
                                        <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                            <Sunrise className="text-amber-400" size={24} /> {editId ? 'Entity Modification' : 'String Registration'}
                                        </h2>
                                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                            <ShieldCheck size={12} className="text-indigo-400" /> Secure Feed Protocol · ID: {editId || 'AUTO_GEN'}
                                        </p>
                                    </div>
                                    <button onClick={() => setShowForm(false)} className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all shadow-xl text-slate-400"><X /></button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
                                    <LanguageTabs activeLang={activeLang} onChange={setActiveLang} />

                                    <section className="space-y-6">
                                        {/* Greeting Text */}
                                        <div>
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 block ml-1">
                                                Greeting String ({activeLang.toUpperCase()})
                                            </label>
                                            <textarea
                                                value={getFieldValue('text')}
                                                onChange={e => updateField('text', e.target.value)}
                                                rows={2}
                                                required={activeLang === 'en'}
                                                placeholder="Rise and shine, seeker... ✨"
                                                className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder:text-slate-800 text-sm font-bold outline-none focus:border-amber-500/40 transition-all resize-none shadow-inner"
                                            />
                                        </div>

                                        {/* Configuration Group (English Only) */}
                                        <AnimatePresence>
                                            {activeLang === 'en' && (
                                                <motion.div 
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="space-y-8 pt-4 border-t border-slate-800/50"
                                                >
                                                    {/* Type Selector */}
                                                    <div>
                                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 block ml-1">Temporal Alignment</label>
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                            {(['morning', 'afternoon', 'evening', 'night', 'festival', 'general'] as const).map(t => {
                                                                const meta = TYPE_META[t];
                                                                const isSelected = formData.type === t;
                                                                return (
                                                                    <button
                                                                        key={t}
                                                                        type="button"
                                                                        onClick={() => setFormData(prev => ({ ...prev, type: t }))}
                                                                        className={clsx(
                                                                            "flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95 shadow-md",
                                                                            isSelected
                                                                                ? `${meta.color} ${meta.bg} border-amber-500/40`
                                                                                : "bg-slate-950 text-slate-500 border-slate-800 hover:border-slate-700"
                                                                        )}
                                                                    >
                                                                        {meta.icon}
                                                                        {meta.label}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* Tags */}
                                                    <div>
                                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 block ml-1">Logic Tags (CSV)</label>
                                                        <div className="relative group">
                                                            <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-800 group-focus-within:text-amber-500 transition-colors" />
                                                            <input
                                                                type="text"
                                                                value={tagsInput}
                                                                onChange={e => setTagsInput(e.target.value)}
                                                                placeholder="diwali, festive, celebration..."
                                                                className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder:text-slate-800 text-[10px] font-black uppercase outline-none focus:border-amber-500/40 shadow-inner"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Active Toggle */}
                                                    <div className="flex items-center justify-between p-5 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
                                                        <div className="flex items-center gap-4">
                                                            <div className={clsx("p-2 rounded-xl border transition-colors", formData.is_active ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-slate-900 border-slate-800 text-slate-600")}>
                                                                <Activity size={16} />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-white uppercase tracking-widest">Visibility Protocol</p>
                                                                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tight mt-0.5">Allow object to rotate in feed</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                                                            className={clsx(
                                                                "relative w-14 h-7 rounded-full transition-all duration-300 shadow-inner",
                                                                formData.is_active ? "bg-emerald-500/40" : "bg-slate-800"
                                                            )}
                                                        >
                                                            <div className={clsx(
                                                                "absolute top-1 w-5 h-5 rounded-full transition-all duration-300 flex items-center justify-center text-[8px] font-black uppercase",
                                                                formData.is_active ? "left-8 bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "left-1 bg-slate-600 text-white shadow-xl"
                                                            )}>
                                                                {formData.is_active ? 'ON' : 'OFF'}
                                                            </div>
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </section>

                                    {/* Action Footer */}
                                    <div className="flex gap-4 pt-10 border-t border-slate-800/50">
                                        <button type="button" onClick={() => { setShowForm(false); setEditId(null); setFormData(initialFormState); }} className="flex-1 py-4 text-slate-600 font-black uppercase tracking-widest text-[10px] hover:text-white transition-all">
                                            Abort Protocol
                                        </button>
                                        <button type="submit" className="flex-[2] py-4 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-amber-500/20 transition-all active:scale-95">
                                            {editId ? 'Commit Modifications' : 'Finalize Registration'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
