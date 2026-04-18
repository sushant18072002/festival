import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useRouter } from 'next/router';
import { 
    Brain, Plus, Edit2, Trash2, Settings, Target, Zap, Clock, 
    Search, X, Check, AlertTriangle, ArrowRight, ShieldCheck, Activity 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import clsx from 'clsx';

// --- Types ---
interface QuizData {
    _id?: string;
    title: string;
    slug: string;
    description?: string;
    karmaReward: number;
    isActive: boolean;
    questions?: any[];
    results?: any[];
    translations?: { [key: string]: any };
}

const initialFormState: QuizData = {
    title: '',
    slug: '',
    description: '',
    karmaReward: 25,
    isActive: true,
    translations: {}
};

export default function QuizzesPage() {
    const [data, setData] = useState<QuizData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<QuizData>(initialFormState);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeLang, setActiveLang] = useState('en');
    const [translationsRaw, setTranslationsRaw] = useState('');
    const router = useRouter();

    // Modal state
    const [modalConfig, setModalConfig] = useState<{
        open: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ open: false, title: '', message: '', onConfirm: () => {} });

    useEffect(() => { fetchQuizzes(); }, []);

    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/quizzes');
            const json = await res.json();
            if (json.success) setData(json.data);
        } catch {
            toast.error('QUIZ_MANIFEST_ERROR');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (record: QuizData) => {
        setFormData(record);
        setEditingId(record._id || null);
        setTranslationsRaw(record.translations ? JSON.stringify(record.translations, null, 2) : '');
        setShowForm(true);
    };

    const confirmDelete = (id: string) => {
        setModalConfig({
            open: true,
            title: 'Terminate Quiz?',
            message: 'This operation will remove the quiz and all associated questions/results from the production feed.',
            onConfirm: () => handleDelete(id)
        });
    };

    const handleDelete = async (id: string) => {
        setModalConfig(prev => ({ ...prev, open: false }));
        const toastId = toast.loading('TERMINATING_QUIZ...');
        try {
            const res = await fetch(`/api/quizzes?id=${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                toast.success('QUIZ_TERMINATED', { id: toastId });
                fetchQuizzes();
            } else {
                toast.error('DELETE_FAILURE', { id: toastId });
            }
        } catch {
            toast.error('NETWORK_PROTOCOL_ERROR', { id: toastId });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let parsedTranslations = {};
        if (translationsRaw) {
            try {
                parsedTranslations = JSON.parse(translationsRaw);
            } catch (err) {
                toast.error('INVALID_TRANSLATION_JSON');
                return;
            }
        }

        const payload = { ...formData, translations: parsedTranslations };
        const toastId = toast.loading('SYNCING_CHANGES...');
        
        try {
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `/api/quizzes?id=${editingId}` : '/api/quizzes';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const json = await res.json();
            if (json.success) {
                toast.success(editingId ? 'MANIFEST_UPDATED' : 'QUIZ_REGISTERED', { id: toastId });
                setShowForm(false);
                setEditingId(null);
                setFormData(initialFormState);
                fetchQuizzes();
            } else {
                toast.error(json.error || 'SYNC_FAILURE', { id: toastId });
            }
        } catch {
            toast.error('NETWORK_PROTOCOL_ERROR', { id: toastId });
        }
    };

    const filteredData = data.filter(quiz => 
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        quiz.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-slate-950 text-white font-sans overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                
                {/* Header Section */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-inner group transition-all">
                            <Brain className="w-8 h-8 text-indigo-400 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-purple-300 to-indigo-400">
                                Personality Library
                            </h1>
                            <p className="text-slate-500 mt-1 uppercase tracking-widest text-[10px] font-bold flex items-center gap-2">
                                <Activity size={12} className="text-emerald-500" /> Interaction Module · Total: <span className="text-white">{data.length} Manifests</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => { setShowForm(true); setEditingId(null); setFormData(initialFormState); setTranslationsRaw(''); }}
                        className="group flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-7 py-3.5 rounded-2xl font-black shadow-lg shadow-indigo-500/20 transition-all active:scale-95 uppercase tracking-widest text-[10px]"
                    >
                        <Plus size={16} className="transition-transform group-hover:rotate-90" />
                        Initialize Quiz
                    </button>
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-slate-900/40 p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl mb-10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    
                    <div className="relative z-10 w-full xl:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="SEARCH QUIZZES BY SLUG OR TITLE..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-[1.5rem] text-[10px] font-black text-white uppercase tracking-widest focus:outline-none focus:border-indigo-500/50 shadow-inner placeholder:text-slate-800 transition-all"
                        />
                    </div>
                </div>

                {/* Content Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                             <div key={i} className="h-64 bg-slate-900/50 rounded-[2.5rem] animate-pulse border border-slate-800" />
                        ))}
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="text-center py-24 bg-slate-900/20 border border-slate-800/50 border-dashed rounded-[3rem]">
                        <Brain size={48} className="mx-auto mb-4 text-slate-800 opacity-50" />
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Library Empty: No Entities Detected</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {filteredData.map((quiz, i) => (
                                <motion.div
                                    key={quiz._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: i * 0.02 }}
                                    className="group relative bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 hover:border-indigo-500/40 transition-all duration-300 flex flex-col shadow-2xl overflow-hidden hover:-translate-y-1"
                                >
                                    {/* Status Header */}
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2">
                                            <div className={clsx(
                                                "w-2 h-2 rounded-full",
                                                quiz.isActive ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-slate-700"
                                            )} />
                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                                {quiz.isActive ? 'Live Status' : 'Draft / Off'}
                                            </span>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => handleEdit(quiz)} className="p-2.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-indigo-500/50 rounded-xl transition-all active:scale-90">
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => confirmDelete(quiz._id!)} className="p-2.5 bg-slate-950 border border-slate-800 text-slate-600 hover:text-rose-500 hover:border-rose-500/50 rounded-xl transition-all active:scale-90">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-indigo-300 transition-colors line-clamp-1">
                                            {quiz.title}
                                        </h3>
                                        <div className="inline-flex items-center gap-2 px-2 py-1 bg-slate-950/50 rounded-lg border border-slate-800/80 mb-4">
                                            <code className="text-[9px] font-black text-indigo-400 tracking-wider">#{quiz.slug}</code>
                                        </div>
                                        <p className="text-slate-500 text-[11px] font-bold leading-relaxed line-clamp-2 mb-8 uppercase tracking-wide">
                                            {quiz.description || 'No description provided in manifest.'}
                                        </p>

                                        {/* Activity Stats */}
                                        <div className="grid grid-cols-3 gap-3 mb-8">
                                            <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50 text-center shadow-inner group/stat hover:bg-slate-950 transition-colors">
                                                <span className="block text-lg font-black text-white mb-0.5 group-hover/stat:scale-110 transition-transform">{quiz.questions?.length || 0}</span>
                                                <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest">Queries</span>
                                            </div>
                                            <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50 text-center shadow-inner group/stat hover:bg-slate-950 transition-colors">
                                                <span className="block text-lg font-black text-white mb-0.5 group-hover/stat:scale-110 transition-transform">{quiz.results?.length || 0}</span>
                                                <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest">Outcomes</span>
                                            </div>
                                            <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50 text-center shadow-inner group/stat hover:bg-slate-950 transition-colors">
                                                <span className="block text-lg font-black text-yellow-500 mb-0.5 group-hover/stat:scale-110 transition-transform">+{quiz.karmaReward}</span>
                                                <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest">Karma</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Footer */}
                                    <button
                                        onClick={() => router.push(`/quizzes/${quiz._id}`)}
                                        className="w-full flex items-center justify-center gap-3 py-4 bg-slate-950 hover:bg-white hover:text-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl"
                                    >
                                        <Settings size={14} /> Configure logic vault
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Unified Confirmation Modal */}
                <ConfirmationModal 
                    isOpen={modalConfig.open}
                    title={modalConfig.title}
                    message={modalConfig.message}
                    isDestructive={true}
                    confirmLabel="Terminate Entity"
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
                                            <Brain className="text-indigo-400" size={24} /> {editingId ? 'Entity Modification' : 'Quiz Registration'}
                                        </h2>
                                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                            <ShieldCheck size={12} className="text-emerald-500" /> Secure Feed Protocol · ID: {editingId || 'AUTO_GEN'}
                                        </p>
                                    </div>
                                    <button onClick={() => setShowForm(false)} className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all shadow-xl text-slate-400"><X /></button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
                                    <section className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Title */}
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Quiz Manifest Title</label>
                                                <input
                                                    type="text"
                                                    value={formData.title}
                                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                    required
                                                    placeholder="E.G. DIWALI SPIRIT GUIDE"
                                                    className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder:text-slate-800 text-[10px] font-black uppercase outline-none focus:border-indigo-500/40 shadow-inner"
                                                />
                                            </div>
                                            {/* Slug */}
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">System Slug (Unique Identifier)</label>
                                                <input
                                                    type="text"
                                                    value={formData.slug}
                                                    onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                                    required
                                                    disabled={!!editingId}
                                                    placeholder="E.G. DIWALI-GUIDE"
                                                    className={clsx(
                                                        "w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder:text-slate-800 text-[10px] font-black uppercase outline-none focus:border-indigo-500/40 shadow-inner transition-all",
                                                        editingId && "opacity-50 cursor-not-allowed"
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Manifest Description</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                rows={3}
                                                placeholder="DESCRIBE THE CORE PSYCHOLOGY OF THIS INTERACTION..."
                                                className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder:text-slate-800 text-[10px] font-black uppercase outline-none focus:border-indigo-500/40 shadow-inner resize-none"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Karma Reward */}
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Completion Karma Yield</label>
                                                <div className="relative group">
                                                    <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-800 group-focus-within:text-yellow-500 transition-colors" />
                                                    <input
                                                        type="number"
                                                        value={formData.karmaReward}
                                                        onChange={e => setFormData({ ...formData, karmaReward: parseInt(e.target.value) })}
                                                        required
                                                        min={0}
                                                        className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white text-[10px] font-black uppercase outline-none focus:border-indigo-500/40 shadow-inner"
                                                    />
                                                </div>
                                            </div>
                                            {/* Active Toggle */}
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Deployment Status</label>
                                                <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Rotation</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                                                        className={clsx(
                                                            "relative w-12 h-6 rounded-full transition-all duration-300",
                                                            formData.isActive ? "bg-indigo-500/40" : "bg-slate-800"
                                                        )}
                                                    >
                                                        <div className={clsx(
                                                            "absolute top-1 w-4 h-4 rounded-full transition-all duration-300",
                                                            formData.isActive ? "left-7 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" : "left-1 bg-slate-600"
                                                        )} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Translations Raw */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Localization Manifest (JSON)</label>
                                            <textarea
                                                value={translationsRaw}
                                                onChange={e => setTranslationsRaw(e.target.value)}
                                                rows={5}
                                                placeholder='{ "hi": { "title": "..." } }'
                                                className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder:text-slate-800 text-[10px] font-black font-mono outline-none focus:border-indigo-500/40 shadow-inner resize-none"
                                            />
                                            <p className="text-[9px] text-slate-700 font-bold uppercase tracking-tight">Direct vault editing. Ensure valid JSON syntax.</p>
                                        </div>
                                    </section>

                                    {/* Action Footer */}
                                    <div className="flex gap-4 pt-10 border-t border-slate-800/50">
                                        <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setFormData(initialFormState); }} className="flex-1 py-4 text-slate-600 font-black uppercase tracking-widest text-[10px] hover:text-white transition-all">
                                            Abort Protocol
                                        </button>
                                        <button type="submit" className="flex-[2] py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
                                            {editingId ? 'Modify Manifest' : 'Finalize Registration'}
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
