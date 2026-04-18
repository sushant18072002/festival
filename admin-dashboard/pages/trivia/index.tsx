import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import ConfirmationModal from '../../components/ConfirmationModal';
import { 
    Lightbulb, Plus, Edit2, Trash2, Search, X, Check, 
    AlertTriangle, Sparkles, Target, Zap, Clock, ShieldCheck, Activity 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import clsx from 'clsx';

// --- Types ---
interface TriviaData {
    _id?: string;
    question: string;
    options: string[];
    correctAnswerIndex: number;
    karmaReward: number;
    tags: string[];
    isActive: boolean;
    translations?: { [key: string]: any };
}

const initialFormState: TriviaData = {
    question: '',
    options: ['', '', '', ''],
    correctAnswerIndex: 0,
    karmaReward: 10,
    tags: [],
    isActive: true,
    translations: {}
};

export default function TriviaPage() {
    const [data, setData] = useState<TriviaData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<TriviaData>(initialFormState);
    const [tagsInput, setTagsInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [translationsRaw, setTranslationsRaw] = useState('');

    // Modal state
    const [modalConfig, setModalConfig] = useState<{
        open: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ open: false, title: '', message: '', onConfirm: () => {} });

    useEffect(() => { fetchTrivia(); }, []);

    const fetchTrivia = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/trivia');
            const json = await res.json();
            if (json.success) setData(json.data);
        } catch {
            toast.error('TRIVIA_SYNC_ERROR');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (record: TriviaData) => {
        setFormData(record);
        setEditingId(record._id || null);
        setTagsInput(record.tags.join(', '));
        setTranslationsRaw(record.translations ? JSON.stringify(record.translations, null, 2) : '');
        setShowForm(true);
    };

    const confirmDelete = (id: string) => {
        setModalConfig({
            open: true,
            title: 'Terminate Trivia?',
            message: 'This question will be archived and removed from the live production feed.',
            onConfirm: () => handleDelete(id)
        });
    };

    const handleDelete = async (id: string) => {
        setModalConfig(prev => ({ ...prev, open: false }));
        const toastId = toast.loading('TERMINATING_NODE...');
        try {
            const res = await fetch(`/api/trivia?id=${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                toast.success('NODE_TERMINATED', { id: toastId });
                fetchTrivia();
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

        const tagsArr = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
        const payload = { ...formData, tags: tagsArr, translations: parsedTranslations };
        const toastId = toast.loading('COMMITTING_CHANGES...');
        
        try {
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `/api/trivia?id=${editingId}` : '/api/trivia';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const json = await res.json();
            if (json.success) {
                toast.success(editingId ? 'MANIFEST_UPDATED' : 'ENTITY_CREATED', { id: toastId });
                setShowForm(false);
                setEditingId(null);
                setFormData(initialFormState);
                setTagsInput('');
                fetchTrivia();
            } else {
                toast.error(json.error || 'SYNC_FAILURE', { id: toastId });
            }
        } catch {
            toast.error('NETWORK_PROTOCOL_ERROR', { id: toastId });
        }
    };

    const filteredData = data.filter(item => 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="flex h-screen bg-slate-950 text-white font-sans overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                
                {/* Header Section */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-inner group transition-all">
                            <Lightbulb className="w-8 h-8 text-emerald-400 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-emerald-200 via-teal-300 to-emerald-400">
                                Trivia Protocol
                            </h1>
                            <p className="text-slate-500 mt-1 uppercase tracking-widest text-[10px] font-bold flex items-center gap-2">
                                <Activity size={12} className="text-emerald-500" /> Active Insight Stream · Total: <span className="text-white">{data.length} Nodes</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => { setShowForm(true); setEditingId(null); setFormData(initialFormState); setTagsInput(''); setTranslationsRaw(''); }}
                        className="group flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-7 py-3.5 rounded-2xl font-black shadow-lg shadow-emerald-500/20 transition-all active:scale-95 uppercase tracking-widest text-[10px]"
                    >
                        <Plus size={16} className="transition-transform group-hover:rotate-90" />
                        Deploy Trivia
                    </button>
                </div>

                {/* Search Bar */}
                <div className="bg-slate-900/40 p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl mb-10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    
                    <div className="relative z-10 w-full xl:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-emerald-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="QUERY NODES BY CONTENT OR TAG..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-[1.5rem] text-[10px] font-black text-white uppercase tracking-widest focus:outline-none focus:border-emerald-500/50 shadow-inner placeholder:text-slate-800 transition-all"
                        />
                    </div>
                </div>

                {/* Content Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {[...Array(4)].map((_, i) => (
                             <div key={i} className="h-64 bg-slate-900/50 rounded-[2.5rem] animate-pulse border border-slate-800" />
                        ))}
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="text-center py-24 bg-slate-900/20 border border-slate-800/50 border-dashed rounded-[3rem]">
                        <Lightbulb size={48} className="mx-auto mb-4 text-slate-800 opacity-50" />
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Grid Empty: No Insight Detected</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <AnimatePresence mode="popLayout">
                            {filteredData.map((item, i) => (
                                <motion.div
                                    key={item._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: i * 0.02 }}
                                    className="group relative bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 hover:border-emerald-500/40 transition-all duration-300 flex flex-col shadow-2xl overflow-hidden hover:-translate-y-1"
                                >
                                    {/* Action Header */}
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className={clsx(
                                                "w-2 h-2 rounded-full",
                                                item.isActive ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-slate-700"
                                            )} />
                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                                {item.isActive ? 'Live' : 'Standby'}
                                            </span>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => handleEdit(item)} className="p-2.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-emerald-500/50 rounded-xl transition-all active:scale-90">
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => confirmDelete(item._id!)} className="p-2.5 bg-slate-950 border border-slate-800 text-slate-600 hover:text-rose-500 hover:border-rose-500/50 rounded-xl transition-all active:scale-90">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Question */}
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4 group-hover:text-emerald-200 transition-colors leading-relaxed">
                                        {item.question}
                                    </h3>

                                    {/* Tags */}
                                    {item.tags && item.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-8">
                                            {item.tags.map(tag => (
                                                <span key={tag} className="px-2.5 py-1 bg-slate-950 text-slate-600 text-[9px] font-black rounded-lg border border-slate-800 uppercase tracking-widest">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Options Matrix */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                                        {item.options.map((opt, optIdx) => {
                                            const isCorrect = optIdx === item.correctAnswerIndex;
                                            return (
                                                <div 
                                                    key={optIdx} 
                                                    className={clsx(
                                                        "p-4 rounded-2xl border transition-all flex items-center gap-4 relative overflow-hidden",
                                                        isCorrect 
                                                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-inner" 
                                                            : "bg-slate-950 border-slate-800 text-slate-500"
                                                    )}
                                                >
                                                    <div className={clsx(
                                                        "w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0",
                                                        isCorrect ? "bg-emerald-500 text-slate-950" : "bg-slate-900 text-slate-700"
                                                    )}>
                                                        {String.fromCharCode(65 + optIdx)}
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-wide truncate">{opt || 'Null Option'}</span>
                                                    {isCorrect && <Check size={14} className="absolute right-4 text-emerald-500 animate-in fade-in zoom-in" />}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Footer Stats */}
                                    <div className="mt-auto pt-6 border-t border-slate-800/50 flex items-center justify-between">
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                                            <Zap size={14} className="text-yellow-500" />
                                            <span className="text-[10px] font-black text-yellow-500">+{item.karmaReward} KARMA</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {['hi', 'mr', 'gu', 'bn', 'ta', 'te', 'kn', 'ml'].map(lang => (
                                                <div
                                                    key={lang}
                                                    title={lang.toUpperCase()}
                                                    className={clsx(
                                                        "w-5 h-5 rounded-md flex items-center justify-center text-[7px] font-black uppercase tracking-tighter",
                                                        (item.translations as any)?.[lang]?.question
                                                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                                                            : "bg-slate-950 text-slate-800 border border-slate-800/50"
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

                {/* Unified Confirmation Modal */}
                <ConfirmationModal 
                    isOpen={modalConfig.open}
                    title={modalConfig.title}
                    message={modalConfig.message}
                    isDestructive={true}
                    confirmLabel="Archiving Node"
                    onConfirm={modalConfig.onConfirm}
                    onCancel={() => setModalConfig(prev => ({ ...prev, open: false }))}
                />

                {/* Deployment Modal */}
                <AnimatePresence>
                    {showForm && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowForm(false)} />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                                className="relative bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl"
                            >
                                <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
                                    <div>
                                        <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                            <Sparkles className="text-emerald-400" size={24} /> {editingId ? 'Modify Insight' : 'Node Registration'}
                                        </h2>
                                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                            <ShieldCheck size={12} className="text-emerald-500" /> Secure Feed Protocol · ID: {editingId || 'AUTO_GEN'}
                                        </p>
                                    </div>
                                    <button onClick={() => setShowForm(false)} className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all shadow-xl text-slate-400"><X /></button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto max-h-[75vh] custom-scrollbar">
                                    
                                    {/* Question Input */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Logical Insight String (Question)</label>
                                        <textarea
                                            value={formData.question}
                                            onChange={e => setFormData({ ...formData, question: e.target.value })}
                                            required
                                            rows={2}
                                            placeholder="E.G. WHAT IS THE HIDDEN SYMBOLISM BEHIND THE HOLI COLORS?"
                                            className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-[11px] font-black text-white placeholder:text-slate-800 outline-none focus:border-emerald-500/40 shadow-inner resize-none uppercase tracking-wide"
                                        />
                                    </div>

                                    {/* Options Matrix */}
                                    <div className="space-y-6 pt-4 border-t border-slate-800/30">
                                        <div className="flex items-center justify-between px-1">
                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Response Matrix (Options A-D)</h4>
                                            <div className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[8px] font-black text-emerald-400 uppercase tracking-tighter">SINGLE_ANSWER_MODE</div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {[0, 1, 2, 3].map(i => (
                                                <div key={i} className="group flex items-center gap-4 bg-slate-950 border border-slate-800 p-4 rounded-2xl shadow-inner focus-within:border-emerald-500/30 transition-all">
                                                    <div className={clsx(
                                                        "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-colors shrink-0 cursor-pointer",
                                                        formData.correctAnswerIndex === i ? "bg-emerald-500 text-slate-950" : "bg-slate-900 text-slate-700 hover:text-emerald-500"
                                                    )} onClick={() => setFormData({ ...formData, correctAnswerIndex: i })}>
                                                        {String.fromCharCode(65 + i)}
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={formData.options[i]}
                                                        onChange={e => {
                                                            const newOpts = [...formData.options];
                                                            newOpts[i] = e.target.value;
                                                            setFormData({ ...formData, options: newOpts });
                                                        }}
                                                        required={i < 2}
                                                        placeholder={`OPTION ${String.fromCharCode(65 + i)} LABEL...`}
                                                        className="flex-1 bg-transparent border-none text-[10px] font-black text-white outline-none uppercase placeholder:text-slate-800"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Config Group */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-800/30">
                                        {/* Karma & Status */}
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Insight Completion Yield</label>
                                                <div className="relative group">
                                                    <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-800 group-focus-within:text-yellow-500 transition-colors" />
                                                    <input
                                                        type="number"
                                                        value={formData.karmaReward}
                                                        onChange={e => setFormData({ ...formData, karmaReward: parseInt(e.target.value) })}
                                                        required
                                                        min={0}
                                                        className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black text-white outline-none focus:border-emerald-500/40 shadow-inner"
                                                    />
                                                </div>
                                            </div>
                                            {/* Deployment Status */}
                                            <div className="flex items-center justify-between p-5 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
                                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Active Discovery</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                                                    className={clsx(
                                                        "relative w-12 h-6 rounded-full transition-all duration-300",
                                                        formData.isActive ? "bg-emerald-500/40" : "bg-slate-800"
                                                    )}
                                                >
                                                    <div className={clsx(
                                                        "absolute top-1 w-4 h-4 rounded-full transition-all duration-300",
                                                        formData.isActive ? "left-7 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "left-1 bg-slate-600"
                                                    )} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Tags & Localized Logic */}
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Context Tags (CSV)</label>
                                                <div className="relative group">
                                                    <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-800 group-focus-within:text-emerald-500 transition-colors" />
                                                    <input
                                                        type="text"
                                                        value={tagsInput}
                                                        onChange={e => setTagsInput(e.target.value)}
                                                        placeholder="E.G. HOLI, COLORS, SPIRITUAL"
                                                        className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black text-white outline-none focus:border-emerald-500/40 shadow-inner uppercase tracking-widest placeholder:text-slate-800"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Localization Payload (JSON)</label>
                                                <textarea
                                                    value={translationsRaw}
                                                    onChange={e => setTranslationsRaw(e.target.value)}
                                                    rows={3}
                                                    placeholder='{ "hi": { "question": "..." } }'
                                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-[9px] font-mono text-emerald-400 placeholder:text-slate-800 outline-none focus:border-emerald-500/30 shadow-inner resize-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Footer */}
                                    <div className="flex gap-4 pt-10 border-t border-slate-800/50">
                                        <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setFormData(initialFormState); setTagsInput(''); }} className="flex-1 py-4 text-slate-600 font-black uppercase tracking-widest text-[10px] hover:text-white transition-all">
                                            Abort Deployment
                                        </button>
                                        <button type="submit" className="flex-[2] py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-emerald-500/20 transition-all active:scale-95">
                                            {editingId ? 'Modify Manifest' : 'Confirm Registration'}
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
