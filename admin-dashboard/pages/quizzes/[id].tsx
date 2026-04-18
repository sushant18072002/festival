import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useRouter } from 'next/router';
import { 
    Brain, Plus, Edit2, Trash2, ArrowLeft, Save, X, 
    Smile, Activity, Target, Zap, ShieldCheck, ChevronRight,
    Layout, Database, Palette, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import clsx from 'clsx';

// --- Types ---
interface QuestionOption {
    label: string;
    scores: { [key: string]: number };
}

interface QuizQuestion {
    question: string;
    emoji: string;
    options: QuestionOption[];
}

interface QuizResult {
    code: string;
    name: string;
    emoji: string;
    personality: string;
    description: string;
    primaryColor: string;
    secondaryColor: string;
}

interface QuizData {
    _id: string;
    title: string;
    slug: string;
    questions: QuizQuestion[];
    results: QuizResult[];
}

export default function QuizEditorPage() {
    const router = useRouter();
    const { id } = router.query;

    const [quiz, setQuiz] = useState<QuizData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'questions' | 'results'>('questions');
    const [showQModal, setShowQModal] = useState(false);
    const [showRModal, setShowRModal] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // Form states
    const [qData, setQData] = useState<QuizQuestion>({ question: '', emoji: '', options: [{ label: '', scores: {} }, { label: '', scores: {} }, { label: '', scores: {} }, { label: '', scores: {} }] });
    const [qScoresRaw, setQScoresRaw] = useState<string[]>(['{}', '{}', '{}', '{}']);
    const [rData, setRData] = useState<QuizResult>({ code: '', name: '', emoji: '', personality: '', description: '', primaryColor: '0xFFFFFFFF', secondaryColor: '0xFF000000' });

    // Confirm Modal
    const [modalConfig, setModalConfig] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({ open: false, title: '', message: '', onConfirm: () => {} });

    useEffect(() => { fetchQuiz(); }, [id]);

    const fetchQuiz = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/quizzes?id=${id}`);
            const json = await res.json();
            if (json.success) setQuiz(json.data);
        } catch {
            toast.error('QUIZ_FETCH_ERROR');
        } finally {
            setLoading(false);
        }
    };

    const saveQuiz = async (updatedQuiz: QuizData) => {
        const toastId = toast.loading('SYNCING_VAULT...');
        try {
            const res = await fetch(`/api/quizzes?id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedQuiz)
            });
            const json = await res.json();
            if (json.success) {
                toast.success('MANIFEST_UPDATED', { id: toastId });
                setQuiz(updatedQuiz);
            } else {
                toast.error(json.error || 'SYNC_FAILURE', { id: toastId });
            }
        } catch {
            toast.error('NETWORK_PROTOCOL_ERROR', { id: toastId });
        }
    };

    // --- Question Logic ---
    const handleAddQuestion = () => {
        setEditingIndex(null);
        setQData({ question: '', emoji: '✨', options: [{ label: '', scores: {} }, { label: '', scores: {} }, { label: '', scores: {} }, { label: '', scores: {} }] });
        setQScoresRaw(['{}', '{}', '{}', '{}']);
        setShowQModal(true);
    };

    const handleEditQuestion = (index: number) => {
        setEditingIndex(index);
        const q = quiz!.questions[index];
        setQData({ ...q });
        setQScoresRaw(q.options.map(opt => JSON.stringify(opt.scores || {})));
        setShowQModal(true);
    };

    const confirmDeleteQuestion = (index: number) => {
        setModalConfig({
            open: true,
            title: 'Terminate Question?',
            message: 'This logical node will be removed from the interaction sequence.',
            onConfirm: () => deleteQuestion(index)
        });
    };

    const deleteQuestion = async (index: number) => {
        setModalConfig(prev => ({ ...prev, open: false }));
        const updated = { ...quiz! };
        updated.questions.splice(index, 1);
        await saveQuiz(updated);
    };

    const submitQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const finalOptions = qData.options.map((opt, i) => ({
                label: opt.label,
                scores: JSON.parse(qScoresRaw[i])
            }));
            const finalQ = { ...qData, options: finalOptions };
            const updated = { ...quiz! };
            if (editingIndex !== null) updated.questions[editingIndex] = finalQ;
            else updated.questions.push(finalQ);
            await saveQuiz(updated);
            setShowQModal(false);
        } catch {
            toast.error('INVALID_SCORE_MANIFEST');
        }
    };

    // --- Result Logic ---
    const handleAddResult = () => {
        setEditingIndex(null);
        setRData({ code: '', name: '', emoji: '🏆', personality: '', description: '', primaryColor: '0xFFFFFFFF', secondaryColor: '0xFF000000' });
        setShowRModal(true);
    };

    const handleEditResult = (index: number) => {
        setEditingIndex(index);
        setRData({ ...quiz!.results[index] });
        setShowRModal(true);
    };

    const confirmDeleteResult = (index: number) => {
        setModalConfig({
            open: true,
            title: 'Terminate Outcome?',
            message: 'This outcome path will be effectively closed for all future participants.',
            onConfirm: () => deleteResult(index)
        });
    };

    const deleteResult = async (index: number) => {
        setModalConfig(prev => ({ ...prev, open: false }));
        const updated = { ...quiz! };
        updated.results.splice(index, 1);
        await saveQuiz(updated);
    };

    const submitResult = async (e: React.FormEvent) => {
        e.preventDefault();
        const updated = { ...quiz! };
        if (editingIndex !== null) updated.results[editingIndex] = rData;
        else updated.results.push(rData);
        await saveQuiz(updated);
        setShowRModal(false);
    };

    if (loading || !quiz) {
        return (
            <div className="flex h-screen bg-slate-950 text-white font-sans overflow-hidden">
                <Sidebar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </main>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-950 text-white font-sans overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                
                {/* Header */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-6">
                    <div className="flex items-center gap-5">
                        <button 
                            onClick={() => router.push('/quizzes')}
                            className="p-4 bg-slate-900 hover:bg-slate-800 rounded-2xl border border-slate-800 transition-all active:scale-90"
                        >
                            <ArrowLeft className="w-6 h-6 text-slate-400" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-purple-300 to-indigo-400">
                                {quiz.title}
                            </h1>
                            <p className="text-slate-500 mt-1 uppercase tracking-widest text-[10px] font-bold flex items-center gap-2">
                                <Database size={12} className="text-indigo-500" /> Manifest Editor · Slug: <span className="text-white font-mono">{quiz.slug}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-slate-900/40 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden mb-10">
                    <div className="flex border-b border-slate-800 bg-slate-950/20">
                        <button
                            onClick={() => setActiveTab('questions')}
                            className={clsx(
                                "flex-1 flex items-center justify-center gap-3 py-6 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all",
                                activeTab === 'questions' ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-600 hover:text-slate-300"
                            )}
                        >
                            <Brain className="w-4 h-4" /> Questions Registry ({quiz.questions.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('results')}
                            className={clsx(
                                "flex-1 flex items-center justify-center gap-3 py-6 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all",
                                activeTab === 'results' ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-600 hover:text-slate-300"
                            )}
                        >
                            <Target className="w-4 h-4" /> Logic Outcomes ({quiz.results.length})
                        </button>
                    </div>

                    <div className="p-10">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-tight">{activeTab === 'questions' ? 'Questions Vault' : 'Outcome Paths'}</h2>
                                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1">Configure secure interaction nodes</p>
                            </div>
                            <button
                                onClick={activeTab === 'questions' ? handleAddQuestion : handleAddResult}
                                className="group flex items-center gap-3 bg-white text-slate-950 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-slate-100 transition-all active:scale-95 border border-slate-200"
                            >
                                <Plus size={16} className="transition-transform group-hover:rotate-90" />
                                {activeTab === 'questions' ? 'Initialize Question' : 'Define Path'}
                            </button>
                        </div>

                        {activeTab === 'questions' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {quiz.questions.map((q, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="group relative bg-slate-950 border border-slate-800 rounded-[2rem] p-8 hover:border-indigo-500/40 transition-all shadow-xl"
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-xl shadow-inner border border-indigo-500/20 group-hover:scale-110 transition-transform">
                                                    {q.emoji}
                                                </div>
                                                <div className="text-[9px] font-black text-slate-700 uppercase tracking-widest bg-slate-900 border border-slate-800 px-2 py-1 rounded-md">
                                                    NODE_IDX: {i + 1}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEditQuestion(i)} className="p-2.5 bg-slate-900 border border-slate-800 text-slate-500 hover:text-white hover:border-indigo-500/50 rounded-xl transition-all shadow-lg active:scale-90">
                                                    <Edit2 size={14} />
                                                </button>
                                                <button onClick={() => confirmDeleteQuestion(i)} className="p-2.5 bg-slate-900 border border-slate-800 text-slate-600 hover:text-rose-500 hover:border-rose-500/50 rounded-xl transition-all shadow-lg active:scale-90">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <h4 className="text-white font-black text-base uppercase leading-snug mb-8 group-hover:text-indigo-200 transition-colors line-clamp-2">
                                            {q.question}
                                        </h4>
                                        <div className="space-y-3">
                                            {q.options.map((opt, optIdx) => (
                                                <div key={optIdx} className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50 group/opt hover:bg-slate-900 hover:border-slate-800 transition-all shadow-inner">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{String.fromCharCode(65 + optIdx)}</span>
                                                        <div className="flex flex-wrap gap-1">
                                                            {Object.entries(opt.scores || {}).map(([key, val]) => (
                                                                <span key={key} className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-[8px] font-black rounded-md border border-indigo-500/20 uppercase tracking-tighter">
                                                                    {key}: +{val}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-[11px] font-bold text-slate-300 group-hover/opt:text-white transition-colors">{opt.label}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {quiz.results.map((r, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="group relative bg-slate-950 border border-slate-800 rounded-[2.5rem] p-8 hover:border-indigo-500/40 transition-all shadow-xl overflow-hidden flex flex-col"
                                    >
                                        {/* Color preview background */}
                                        <div 
                                            className="absolute top-0 right-0 w-24 h-24 blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-30 group-hover:opacity-60 transition-all duration-700" 
                                            style={{ backgroundColor: r.primaryColor.replace('0xFF', '#') }} 
                                        />

                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] border border-slate-800 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                                                {r.emoji}
                                            </div>
                                            <div className="flex gap-2 relative z-10">
                                                <button onClick={() => handleEditResult(i)} className="p-2.5 bg-slate-900 border border-slate-800 text-slate-500 hover:text-white hover:border-indigo-500/50 rounded-xl transition-all shadow-lg active:scale-90">
                                                    <Edit2 size={14} />
                                                </button>
                                                <button onClick={() => confirmDeleteResult(i)} className="p-2.5 bg-slate-900 border border-slate-800 text-slate-600 hover:text-rose-500 hover:border-rose-500/50 rounded-xl transition-all shadow-lg active:scale-90">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mb-6 flex-1">
                                            <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                                <ShieldCheck size={10} /> CODE: {r.code}
                                            </div>
                                            <h4 className="text-xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-indigo-200 transition-colors">
                                                {r.personality}
                                            </h4>
                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">
                                                Aligned To: <span className="text-slate-400">{r.name}</span>
                                            </p>
                                            <p className="text-slate-500 text-[10px] font-bold leading-relaxed line-clamp-3 uppercase tracking-wide bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50">
                                                {r.description}
                                            </p>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 py-3 px-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-inner group-hover:bg-slate-900 transition-colors">
                                            <div className="w-3 h-3 rounded-full border border-white/10 shadow-sm" style={{ backgroundColor: r.primaryColor.replace('0xFF', '#') }} />
                                            <div className="w-3 h-3 rounded-full border border-white/10 shadow-sm" style={{ backgroundColor: r.secondaryColor.replace('0xFF', '#') }} />
                                            <span className="text-[8px] font-black text-slate-700 uppercase ml-auto tracking-widest">Protocol Gradient</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Unified Confirmation Modal */}
                <ConfirmationModal 
                    isOpen={modalConfig.open}
                    title={modalConfig.title}
                    message={modalConfig.message}
                    isDestructive={true}
                    confirmLabel="Execute Termination"
                    onConfirm={modalConfig.onConfirm}
                    onCancel={() => setModalConfig(prev => ({ ...prev, open: false }))}
                />

                {/* Question Registry Modal */}
                <AnimatePresence>
                    {showQModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowQModal(false)} />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                                className="relative bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-3xl overflow-hidden shadow-2xl"
                            >
                                <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
                                    <div>
                                        <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                            <Plus className="text-indigo-400" size={24} /> {editingIndex !== null ? 'Entity Modification' : 'Node Registration'}
                                        </h2>
                                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                            <Layout size={12} className="text-emerald-500" /> Interaction Logic Vault · Type: QUERY
                                        </p>
                                    </div>
                                    <button onClick={() => setShowQModal(false)} className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all shadow-xl text-slate-400"><X /></button>
                                </div>

                                <form onSubmit={submitQuestion} className="p-8 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex-[4] space-y-3">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Logical Question String</label>
                                            <input
                                                type="text"
                                                required
                                                value={qData.question}
                                                onChange={e => setQData({ ...qData, question: e.target.value })}
                                                placeholder="E.G. HOW DO YOU PREFER TO LIGHT UP THE HOLI SKY?"
                                                className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black text-white hover:border-indigo-500/30 transition-all outline-none focus:border-indigo-500/50 shadow-inner uppercase tracking-wider placeholder:text-slate-800"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Visual ID</label>
                                            <input
                                                type="text"
                                                required
                                                value={qData.emoji}
                                                onChange={e => setQData({ ...qData, emoji: e.target.value })}
                                                placeholder="✨"
                                                className="w-full text-center py-4 bg-slate-950 border border-slate-800 rounded-2xl text-xl font-black text-white hover:border-indigo-500/30 transition-all outline-none focus:border-indigo-500/50 shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6 pt-4 border-t border-slate-800/30">
                                        <div className="flex items-center justify-between px-1">
                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Response Vectors & Output Matrix</h4>
                                            <div className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[8px] font-black text-indigo-400 uppercase tracking-tighter">JSON_SCORE_MODE</div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {[0, 1, 2, 3].map(i => (
                                                <div key={i} className="p-6 bg-slate-950/50 border border-slate-800 rounded-3xl space-y-4 shadow-inner">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase">{String.fromCharCode(65 + i)}</span>
                                                        <input
                                                            type="text"
                                                            required
                                                            placeholder="RESPONSE LABEL..."
                                                            value={qData.options[i].label}
                                                            onChange={e => {
                                                                const newOpts = [...qData.options];
                                                                newOpts[i].label = e.target.value;
                                                                setQData({ ...qData, options: newOpts });
                                                            }}
                                                            className="flex-1 bg-transparent border-none text-[10px] font-black text-white outline-none uppercase placeholder:text-slate-800 transition-all focus:placeholder:opacity-0"
                                                        />
                                                    </div>
                                                    <textarea 
                                                        rows={2}
                                                        placeholder='{ "archetype": 3 }'
                                                        value={qScoresRaw[i]}
                                                        onChange={e => {
                                                            const newRaw = [...qScoresRaw];
                                                            newRaw[i] = e.target.value;
                                                            setQScoresRaw(newRaw);
                                                        }}
                                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-[9px] font-mono text-indigo-400 placeholder:text-slate-800 outline-none focus:border-indigo-500/30 shadow-inner resize-none transition-all"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-10 border-t border-slate-800/50">
                                        <button type="button" onClick={() => setShowQModal(false)} className="flex-1 py-4 text-slate-600 font-black uppercase tracking-widest text-[10px] hover:text-white transition-all">Abort</button>
                                        <button type="submit" className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-95">Commit Logic Node</button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Result Outcome Modal */}
                <AnimatePresence>
                    {showRModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowRModal(false)} />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                                className="relative bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl"
                            >
                                <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
                                    <div>
                                        <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                            <Target className="text-indigo-400" size={24} /> {editingIndex !== null ? 'Entity Modification' : 'Path Registration'}
                                        </h2>
                                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                            <Globe size={12} className="text-indigo-500" /> Outcome Intelligence Vault · Type: RESULT
                                        </p>
                                    </div>
                                    <button onClick={() => setShowRModal(false)} className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all shadow-xl text-slate-400"><X /></button>
                                </div>

                                <form onSubmit={submitResult} className="p-8 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Path Unique Code</label>
                                            <input
                                                type="text"
                                                required
                                                value={rData.code}
                                                onChange={e => setRData({ ...rData, code: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                                                placeholder="E.G. GANESH"
                                                className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black text-white outline-none focus:border-indigo-500/50 shadow-inner uppercase tracking-wider placeholder:text-slate-800"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Entity Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={rData.name}
                                                onChange={e => setRData({ ...rData, name: e.target.value })}
                                                placeholder="E.G. LORD GANESHA"
                                                className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black text-white outline-none focus:border-indigo-500/50 shadow-inner uppercase tracking-wider placeholder:text-slate-800"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Visual ID</label>
                                            <input
                                                type="text"
                                                required
                                                value={rData.emoji}
                                                onChange={e => setRData({ ...rData, emoji: e.target.value })}
                                                placeholder="🐘"
                                                className="w-full text-center py-4 bg-slate-950 border border-slate-800 rounded-2xl text-xl font-black text-white outline-none focus:border-indigo-500/50 shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-slate-800/30">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Archetype Persona</label>
                                        <input
                                            type="text"
                                            required
                                            value={rData.personality}
                                            onChange={e => setRData({ ...rData, personality: e.target.value })}
                                            placeholder="E.G. THE WISE BEGINNER"
                                            className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black text-white outline-none focus:border-indigo-500/50 shadow-inner uppercase tracking-[0.1em] placeholder:text-slate-800"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800/30">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Primary Signature (0xFF...)</label>
                                            <input
                                                type="text"
                                                required
                                                value={rData.primaryColor}
                                                onChange={e => setRData({ ...rData, primaryColor: e.target.value })}
                                                placeholder="0xFFFFFFFF"
                                                className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black font-mono text-indigo-400 outline-none focus:border-indigo-500/50 shadow-inner uppercase"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Secondary Signature (0xFF...)</label>
                                            <input
                                                type="text"
                                                required
                                                value={rData.secondaryColor}
                                                onChange={e => setRData({ ...rData, secondaryColor: e.target.value })}
                                                placeholder="0xFF000000"
                                                className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black font-mono text-indigo-400 outline-none focus:border-indigo-500/50 shadow-inner uppercase"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-slate-800/30">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Path Descriptive Insight</label>
                                        <textarea
                                            value={rData.description}
                                            onChange={e => setRData({ ...rData, description: e.target.value })}
                                            rows={4}
                                            required
                                            placeholder="ELABORATE ON THE PSYCHOLOGICAL RESONANCE OF THIS OUTCOME..."
                                            className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black text-white placeholder:text-slate-800 outline-none focus:border-indigo-500/40 shadow-inner resize-none uppercase"
                                        />
                                    </div>

                                    <div className="flex gap-4 pt-10 border-t border-slate-800/50">
                                        <button type="button" onClick={() => setShowRModal(false)} className="flex-1 py-4 text-slate-600 font-black uppercase tracking-widest text-[10px] hover:text-white transition-all">Abort</button>
                                        <button type="submit" className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-95">Commit Outcome Path</button>
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
