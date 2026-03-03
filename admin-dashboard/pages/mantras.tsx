import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import LanguageTabs from '../components/LanguageTabs';
import {
    Plus, Edit2, Trash2, Search, X, BookOpen,
    Check, AlertTriangle, Globe, Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface MantraData {
    _id?: string;
    text: string;
    transliteration: string;
    meaning: string;
    slug?: string;
    category?: string;
    event_id?: string;
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
    event_id: '',
    is_active: true,
    translations: {}
};

export default function Mantras() {
    const [mantras, setMantras] = useState<MantraData[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [formData, setFormData] = useState<MantraData>(initialFormState);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeLang, setActiveLang] = useState('en');
    const [showTrash, setShowTrash] = useState(false);

    useEffect(() => { fetchMantras(); fetchCategories(); fetchEvents(); }, [showTrash]);

    const fetchMantras = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/mantras${showTrash ? '?trash=true' : ''}`);
            const json = await res.json();
            if (json.success) setMantras(json.data);
        } catch (err) { toast.error('Failed to fetch mantras'); }
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

    const handleEdit = (item: MantraData) => {
        setFormData({
            ...item,
            category: typeof item.category === 'object' ? (item.category as any)?._id : item.category || '',
            event_id: typeof item.event_id === 'object' ? (item.event_id as any)?._id : item.event_id || '',
        });
        setEditId(item._id || null);
        setShowForm(true);
    };

    const handleDelete = async (id: string, permanent = false) => {
        if (!confirm(permanent ? 'Permanently delete this mantra?' : 'Move to trash?')) return;
        try {
            const res = await fetch(`/api/mantras?id=${id}${permanent ? '&permanent=true' : ''}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) { toast.success(permanent ? 'Permanently deleted' : 'Moved to trash'); fetchMantras(); }
        } catch (err) { toast.error('Delete failed'); }
    };

    const handleRestore = async (id: string) => {
        try {
            const res = await fetch('/api/mantras', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _id: id, is_deleted: false, deleted_at: null })
            });
            const json = await res.json();
            if (json.success) { toast.success('Restored'); fetchMantras(); }
        } catch (err) { toast.error('Restore failed'); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editId ? 'PUT' : 'POST';
            const body = editId ? { ...formData, _id: editId } : formData;
            const res = await fetch('/api/mantras', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const json = await res.json();
            if (json.success) {
                toast.success(editId ? 'Mantra updated!' : 'Mantra created!');
                setShowForm(false); setEditId(null); setFormData(initialFormState);
                fetchMantras();
            }
        } catch (err) { toast.error('Save failed'); }
    };

    const updateField = (field: string, value: any) => {
        if (activeLang === 'en') {
            setFormData(prev => ({ ...prev, [field]: value }));
        } else {
            setFormData(prev => ({
                ...prev,
                translations: { ...prev.translations, [activeLang]: { ...(prev.translations?.[activeLang] || {}), [field]: value } }
            }));
        }
    };

    const getFieldValue = (field: string) => {
        if (activeLang === 'en') return (formData as any)[field] || '';
        return (formData.translations?.[activeLang] as any)?.[field] || '';
    };

    const filteredMantras = mantras.filter(m =>
        m.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.transliteration?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.meaning?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getCategoryName = (cat: any) => {
        if (!cat) return null;
        if (typeof cat === 'string') return cat;
        return cat.translations?.en?.name || cat.code;
    };

    const getEventTitle = (evt: any) => {
        if (!evt) return null;
        if (typeof evt === 'string') return evt;
        return evt.title || evt.slug;
    };

    return (
        <div className="flex h-screen bg-slate-950 text-white">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Mantras</h1>
                                <p className="text-sm text-slate-400 mt-0.5">{mantras.length} mantras • Sacred verses</p>
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
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl text-sm font-semibold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all hover:scale-[1.02]"
                            >
                                <Plus className="w-4 h-4" /> Add Mantra
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search mantras, transliterations, meanings..."
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
                    ) : filteredMantras.length === 0 ? (
                        <div className="text-center py-16 text-slate-500">
                            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-lg font-medium">No mantras found</p>
                            <p className="text-sm mt-1">Add sacred verses to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <AnimatePresence>
                                {filteredMantras.map((item, i) => (
                                    <motion.div
                                        key={item._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="group bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 hover:border-amber-500/30 hover:bg-slate-900/80 transition-all duration-300"
                                    >
                                        <div className="flex items-start gap-6">
                                            {/* Mantra Content */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-amber-300 font-medium text-lg mb-1">{item.text}</p>
                                                {item.transliteration && (
                                                    <p className="text-white/80 italic text-sm mb-1">{item.transliteration}</p>
                                                )}
                                                {item.meaning && (
                                                    <p className="text-slate-400 text-sm">{item.meaning}</p>
                                                )}

                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {getCategoryName(item.category) && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 text-amber-400 text-xs font-medium rounded-lg border border-amber-500/20">
                                                            <Tag className="w-3 h-3" /> {getCategoryName(item.category)}
                                                        </span>
                                                    )}
                                                    {getEventTitle(item.event_id) && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-lg border border-blue-500/20">
                                                            <Globe className="w-3 h-3" /> {getEventTitle(item.event_id)}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-1 mt-3">
                                                    {['hi', 'mr', 'gu', 'bn', 'ta', 'te', 'kn', 'ml'].map(lang => (
                                                        <span key={lang} className={clsx(
                                                            "w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold uppercase",
                                                            (item.translations as any)?.[lang]?.text
                                                                ? "bg-amber-500/20 text-amber-400"
                                                                : "bg-slate-800 text-slate-600"
                                                        )}>{lang}</span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {showTrash ? (
                                                    <>
                                                        <button onClick={() => handleRestore(item._id!)}
                                                            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-500/20">
                                                            <Check className="w-3.5 h-3.5" /> Restore
                                                        </button>
                                                        <button onClick={() => handleDelete(item._id!, true)}
                                                            className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/20">
                                                            <AlertTriangle className="w-3.5 h-3.5" /> Delete
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => handleEdit(item)}
                                                            className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-500/20">
                                                            <Edit2 className="w-3.5 h-3.5" /> Edit
                                                        </button>
                                                        <button onClick={() => handleDelete(item._id!)}
                                                            className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/20">
                                                            <Trash2 className="w-3.5 h-3.5" /> Trash
                                                        </button>
                                                    </>
                                                )}
                                            </div>
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
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                                className="w-full max-w-2xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
                                <div className="sticky top-0 bg-slate-900 border-b border-slate-800/50 px-6 py-4 flex items-center justify-between z-10">
                                    <h2 className="text-lg font-bold">{editId ? 'Edit Mantra' : 'New Mantra'}</h2>
                                    <button onClick={() => { setShowForm(false); setEditId(null); setFormData(initialFormState); }}
                                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                    <LanguageTabs activeLang={activeLang} onChange={setActiveLang} />

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Mantra Text (Original Script) {activeLang !== 'en' && `(${activeLang.toUpperCase()})`}
                                        </label>
                                        <textarea
                                            value={getFieldValue('text')}
                                            onChange={e => updateField('text', e.target.value)}
                                            rows={2}
                                            required={activeLang === 'en'}
                                            placeholder="ॐ नमः शिवाय"
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-amber-300 text-lg placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Transliteration {activeLang !== 'en' && `(${activeLang.toUpperCase()})`}
                                        </label>
                                        <input
                                            type="text"
                                            value={getFieldValue('transliteration')}
                                            onChange={e => updateField('transliteration', e.target.value)}
                                            placeholder="Om Namah Shivaya"
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white italic placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Meaning {activeLang !== 'en' && `(${activeLang.toUpperCase()})`}
                                        </label>
                                        <textarea
                                            value={getFieldValue('meaning')}
                                            onChange={e => updateField('meaning', e.target.value)}
                                            rows={2}
                                            placeholder="I bow to Lord Shiva, the auspicious one..."
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all resize-none"
                                        />
                                    </div>

                                    {activeLang === 'en' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                                                <select
                                                    value={formData.category || ''}
                                                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all"
                                                >
                                                    <option value="">No Category</option>
                                                    {categories.map(cat => (
                                                        <option key={cat._id} value={cat._id}>{cat.translations?.en?.name || cat.code}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">Linked Event</label>
                                                <select
                                                    value={formData.event_id || ''}
                                                    onChange={e => setFormData(prev => ({ ...prev, event_id: e.target.value }))}
                                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all"
                                                >
                                                    <option value="">No Event (General)</option>
                                                    {events.map(evt => (
                                                        <option key={evt._id} value={evt._id}>{evt.title}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-3 pt-2">
                                        <button type="button" onClick={() => { setShowForm(false); setEditId(null); setFormData(initialFormState); }}
                                            className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                                            Cancel
                                        </button>
                                        <button type="submit"
                                            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl text-sm font-semibold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all hover:scale-[1.02]">
                                            {editId ? 'Update Mantra' : 'Create Mantra'}
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
