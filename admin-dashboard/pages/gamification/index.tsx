import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import ConfirmationModal from '../../components/ConfirmationModal';
import { 
    Trophy, Star, Edit2, Trash2, Plus, X, Check, 
    AlertTriangle, Zap, Target, ShieldCheck, Activity,
    Crown, Diamond, Award, Medal, ChevronRight, Layout, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import clsx from 'clsx';

// --- Types ---
interface AvatarTier {
    name: string;
    baseKarma: number;
    paths: string[];
}

interface TrophyRule {
    name: string;
    icon: string;
    description: string;
    unlockRuleType: string;
    unlockThreshold: number;
}

interface GamificationConfig {
    _id?: string;
    avatarTiers: AvatarTier[];
    trophies: TrophyRule[];
}

export default function GamificationPage() {
    const [config, setConfig] = useState<GamificationConfig | null>(null);
    const [loading, setLoading] = useState(true);

    const [showAModal, setShowAModal] = useState(false);
    const [showTModal, setShowTModal] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // Form states
    const [aData, setAData] = useState<AvatarTier>({ name: '', baseKarma: 0, paths: [] });
    const [aPathsRaw, setAPathsRaw] = useState('');
    const [tData, setTData] = useState<TrophyRule>({ name: '', icon: '🏆', description: '', unlockRuleType: 'karma', unlockThreshold: 100 });

    // Confirm Modal
    const [modalConfig, setModalConfig] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({ open: false, title: '', message: '', onConfirm: () => {} });

    useEffect(() => { fetchConfig(); }, []);

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/gamification');
            const json = await res.json();
            if (json.success) setConfig(json.data);
        } catch {
            toast.error('GAMIFICATION_SYNC_ERROR');
        } finally {
            setLoading(false);
        }
    };

    const saveConfig = async (updated: GamificationConfig) => {
        const toastId = toast.loading('SYNCING_RULES...');
        try {
            const res = await fetch('/api/gamification', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated),
            });
            const json = await res.json();
            if (json.success) {
                toast.success('RULES_UPDATED', { id: toastId });
                setConfig(updated);
            } else {
                toast.error(json.error || 'SYNC_FAILURE', { id: toastId });
            }
        } catch {
            toast.error('NETWORK_PROTOCOL_ERROR', { id: toastId });
        }
    };

    // --- Avatar Tier Logic ---
    const handleAddTier = () => {
        setEditingIndex(null);
        setAData({ name: '', baseKarma: 0, paths: [] });
        setAPathsRaw('');
        setShowAModal(true);
    };

    const handleEditTier = (index: number) => {
        setEditingIndex(index);
        const tier = config!.avatarTiers[index];
        setAData({ ...tier });
        setAPathsRaw(tier.paths.join('\n'));
        setShowAModal(true);
    };

    const confirmDeleteTier = (index: number) => {
        setModalConfig({
            open: true,
            title: 'Terminate Avatar Tier?',
            message: 'This will remove the progression logic and mapped assets for this tier.',
            onConfirm: () => deleteTier(index)
        });
    };

    const deleteTier = async (index: number) => {
        setModalConfig(prev => ({ ...prev, open: false }));
        const updated = { ...config! };
        updated.avatarTiers.splice(index, 1);
        await saveConfig(updated);
    };

    const submitAvatarForm = async (e: React.FormEvent) => {
        e.preventDefault();
        const paths = aPathsRaw.split('\n').map(p => p.trim()).filter(Boolean);
        const finalTier = { ...aData, paths };
        const updated = { ...config! };
        if (editingIndex !== null) updated.avatarTiers[editingIndex] = finalTier;
        else updated.avatarTiers.push(finalTier);
        await saveConfig(updated);
        setShowAModal(false);
    };

    // --- Trophy Logic ---
    const handleAddTrophy = () => {
        setEditingIndex(null);
        setTData({ name: '', icon: '🏆', description: '', unlockRuleType: 'karma', unlockThreshold: 100 });
        setShowTModal(true);
    };

    const handleEditTrophy = (index: number) => {
        setEditingIndex(index);
        setTData({ ...config!.trophies[index] });
        setShowTModal(true);
    };

    const confirmDeleteTrophy = (index: number) => {
        setModalConfig({
            open: true,
            title: 'Terminate Trophy Rule?',
            message: 'This achievement node will be removed from the global rules engine.',
            onConfirm: () => deleteTrophy(index)
        });
    };

    const deleteTrophy = async (index: number) => {
        setModalConfig(prev => ({ ...prev, open: false }));
        const updated = { ...config! };
        updated.trophies.splice(index, 1);
        await saveConfig(updated);
    };

    const submitTrophyForm = async (e: React.FormEvent) => {
        e.preventDefault();
        const updated = { ...config! };
        if (editingIndex !== null) updated.trophies[editingIndex] = tData;
        else updated.trophies.push(tData);
        await saveConfig(updated);
        setShowTModal(false);
    };

    if (loading || !config) {
        return (
            <div className="flex h-screen bg-slate-950 text-white font-sans overflow-hidden">
                <Sidebar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </main>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-950 text-white font-sans overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                
                {/* Header Section */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 shadow-inner group transition-all">
                            <Trophy className="w-8 h-8 text-amber-400 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-orange-300 to-yellow-500">
                                Rewards Engine
                            </h1>
                            <p className="text-slate-500 mt-1 uppercase tracking-widest text-[10px] font-bold flex items-center gap-2">
                                <Activity size={12} className="text-emerald-500" /> Operational Matrix · Registry: <span className="text-white">{config.avatarTiers.length + config.trophies.length} Rules</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Avatar Tiers Section */}
                <section className="bg-slate-900/40 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden mb-12 relative group/section">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover/section:bg-amber-500/10 transition-all duration-700" />
                    
                    <div className="p-10">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                    <Crown className="text-amber-400" size={24} /> Avatar Progression
                                </h2>
                                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1">Configure evolution logic tiers</p>
                            </div>
                            <button
                                onClick={handleAddTier}
                                className="group flex items-center gap-3 bg-white text-slate-950 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-slate-100 transition-all active:scale-95"
                            >
                                <Plus size={16} className="transition-transform group-hover:rotate-90" />
                                Initialize Evolution Tier
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {config.avatarTiers.map((tier, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="group relative bg-slate-950 border border-slate-800 rounded-[2rem] p-8 hover:border-amber-500/40 transition-all shadow-xl"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-xl shadow-inner border border-amber-500/20 group-hover:scale-110 transition-transform text-amber-500">
                                                <Diamond size={24} />
                                            </div>
                                            <div className="text-[9px] font-black text-slate-700 uppercase tracking-widest bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg">
                                                TIER_IDX: {i + 1}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => handleEditTier(i)} className="p-2.5 bg-slate-900 border border-slate-800 text-slate-500 hover:text-white hover:border-amber-500/50 rounded-xl transition-all shadow-lg active:scale-90">
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => confirmDeleteTier(i)} className="p-2.5 bg-slate-900 border border-slate-800 text-slate-600 hover:text-rose-500 hover:border-rose-500/50 rounded-xl transition-all shadow-lg active:scale-90">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <h4 className="text-xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-amber-200 transition-colors">
                                        {tier.name}
                                    </h4>
                                    <div className="flex items-center gap-2 mb-8">
                                        <Zap size={14} className="text-amber-500" />
                                        <span className="text-[10px] font-black text-amber-500 tracking-[0.2em]">{tier.baseKarma} KARMA THRESHOLD</span>
                                    </div>

                                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/50 shadow-inner group/assets">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Database size={12} /> Mapped Assets ({tier.paths.length})
                                        </p>
                                        <div className="space-y-2">
                                            {tier.paths.slice(0, 2).map((p, idx) => (
                                                <p key={idx} className="text-[9px] text-slate-600 truncate font-mono bg-slate-950 p-2 rounded-lg border border-slate-800/50">{p}</p>
                                            ))}
                                            {tier.paths.length > 2 && (
                                                <p className="text-[9px] text-slate-700 font-bold uppercase tracking-widest mt-2 ml-1 italic group-hover/assets:text-amber-500/50 transition-colors">
                                                    + {tier.paths.length - 2} Additional Asset Manifests
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Trophies Section */}
                <section className="bg-slate-900/20 rounded-[2.5rem] border border-slate-800/50 shadow-2xl overflow-hidden mb-12 relative group/trophy">
                    <div className="p-10">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                    <Award className="text-yellow-500" size={24} /> Trophy Logic Matrix
                                </h2>
                                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1">Define achievement unlock protocols</p>
                            </div>
                            <button
                                onClick={handleAddTrophy}
                                className="group flex items-center gap-3 bg-slate-950 text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-slate-900 transition-all active:scale-95 border border-slate-800"
                            >
                                <Plus size={16} className="transition-transform group-hover:rotate-90 text-yellow-500" />
                                Register Achievement Rule
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {config.trophies.map((trophy, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="group flex items-center gap-6 bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] hover:border-yellow-500/40 transition-all shadow-xl"
                                >
                                    <div className="w-16 h-16 shrink-0 bg-slate-950 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-inner border border-slate-800 group-hover:scale-110 transition-transform">
                                        {trophy.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-black text-white uppercase tracking-tight truncate group-hover:text-yellow-400 transition-colors">{trophy.name}</h4>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide truncate mt-0.5">{trophy.description}</p>
                                        <div className="mt-3 inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[8px] font-black text-slate-400 uppercase tracking-wider group-hover:border-yellow-500/20 transition-colors">
                                            <Target size={10} className="text-yellow-500/50" /> {trophy.unlockRuleType} &gt;= {trophy.unlockThreshold}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button onClick={() => handleEditTrophy(i)} className="p-2 bg-slate-950 border border-slate-800 text-slate-600 hover:text-white hover:border-blue-500/50 rounded-lg transition-all active:scale-90">
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => confirmDeleteTrophy(i)} className="p-2 bg-slate-950 border border-slate-800 text-slate-600 hover:text-rose-500 hover:border-rose-500/50 rounded-lg transition-all active:scale-90">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

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

                {/* Avatar Tier Modal */}
                <AnimatePresence>
                    {showAModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowAModal(false)} />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                                className="relative bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-xl overflow-hidden shadow-2xl"
                            >
                                <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
                                    <div>
                                        <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                            <Activity className="text-amber-400" size={24} /> {editingIndex !== null ? 'Modify Evolution' : 'Initialize Progression'}
                                        </h2>
                                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                            <ShieldCheck size={12} className="text-emerald-500" /> Progression Logic Vault · Type: AVATAR_TIER
                                        </p>
                                    </div>
                                    <button onClick={() => setShowAModal(false)} className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all shadow-xl text-slate-400"><X /></button>
                                </div>

                                <form onSubmit={submitAvatarForm} className="p-8 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Evolution Tier Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={aData.name}
                                                onChange={e => setAData({ ...aData, name: e.target.value })}
                                                placeholder="E.G. NOVICE DISCOVERER"
                                                className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black text-white outline-none focus:border-amber-500/50 shadow-inner uppercase tracking-wider placeholder:text-slate-800"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Threshold Yield</label>
                                            <div className="relative group">
                                                <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-800 group-focus-within:text-amber-400 transition-colors" />
                                                <input
                                                    type="number"
                                                    required
                                                    value={aData.baseKarma}
                                                    onChange={e => setAData({ ...aData, baseKarma: parseInt(e.target.value) })}
                                                    placeholder="0"
                                                    className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black text-white outline-none focus:border-amber-500/50 shadow-inner"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-slate-800/30">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Asset Pipeline (Paths per line)</label>
                                        <textarea
                                            value={aPathsRaw}
                                            onChange={e => setAPathsRaw(e.target.value)}
                                            required
                                            rows={6}
                                            placeholder={'ASSETS/ICON/AVATAR_T1_1.PNG\nASSETS/ICON/AVATAR_T1_2.PNG'}
                                            className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-mono text-amber-400 placeholder:text-slate-800 outline-none focus:border-amber-500/30 shadow-inner resize-none transition-all"
                                        />
                                        <p className="text-[9px] text-slate-700 font-bold uppercase tracking-tight">Direct vault mapping. Ensure Flutter resource compatibility.</p>
                                    </div>

                                    <div className="flex gap-4 pt-6 border-t border-slate-800/50">
                                        <button type="button" onClick={() => setShowAModal(false)} className="flex-1 py-4 text-slate-600 font-black uppercase tracking-widest text-[10px] hover:text-white transition-all">Abort</button>
                                        <button type="submit" className="flex-[2] py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-amber-500/20 transition-all active:scale-95">Commit Tier Logic</button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Trophy Rule Modal */}
                <AnimatePresence>
                    {showTModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowTModal(false)} />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                                className="relative bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-xl overflow-hidden shadow-2xl"
                            >
                                <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
                                    <div>
                                        <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                            <Medal className="text-yellow-500" size={24} /> {editingIndex !== null ? 'Modify Achievement' : 'Initialize Outcome'}
                                        </h2>
                                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                            <Target size={12} className="text-yellow-500" /> Reward Logic Vault · Type: TROPHY_RULE
                                        </p>
                                    </div>
                                    <button onClick={() => setShowTModal(false)} className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all shadow-xl text-slate-400"><X /></button>
                                </div>

                                <form onSubmit={submitTrophyForm} className="p-8 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Achievement Label</label>
                                            <input
                                                type="text"
                                                required
                                                value={tData.name}
                                                onChange={e => setTData({ ...tData, name: e.target.value })}
                                                placeholder="E.G. MASTER EXPLORER"
                                                className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black text-white outline-none focus:border-yellow-500/50 shadow-inner uppercase tracking-wider placeholder:text-slate-800"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Visual ID (Emoji)</label>
                                            <input
                                                type="text"
                                                required
                                                value={tData.icon}
                                                onChange={e => setTData({ ...tData, icon: e.target.value })}
                                                placeholder="🏆"
                                                className="w-full text-center py-4 bg-slate-950 border border-slate-800 rounded-2xl text-xl font-black text-white outline-none focus:border-yellow-500/50 shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-slate-800/30">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Unlock Description Insight</label>
                                        <input
                                            type="text"
                                            required
                                            value={tData.description}
                                            onChange={e => setTData({ ...tData, description: e.target.value })}
                                            placeholder="E.G. EXPLORE 50 SECURE FESTIVAL NODES..."
                                            className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black text-white outline-none focus:border-yellow-500/50 shadow-inner uppercase tracking-widest placeholder:text-slate-800"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800/30">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Logic Metric</label>
                                            <select
                                                value={tData.unlockRuleType}
                                                onChange={e => setTData({ ...tData, unlockRuleType: e.target.value })}
                                                className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black text-white outline-none focus:border-yellow-500/50 shadow-inner uppercase tracking-widest"
                                            >
                                                <option value="karma">KARMA_POINTS</option>
                                                <option value="explore">NODES_EXPLORED</option>
                                                <option value="share">GLOBAL_SHARES</option>
                                                <option value="streak">DAILY_STREAK</option>
                                                <option value="signup">REGISTRATION_EVENT</option>
                                                <option value="time">TEMPORAL_MARKER</option>
                                            </select>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Threshold Logic Value</label>
                                            <input
                                                type="number"
                                                required
                                                value={tData.unlockThreshold}
                                                onChange={e => setTData({ ...tData, unlockThreshold: parseInt(e.target.value) })}
                                                className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black text-white outline-none focus:border-yellow-500/50 shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-10 border-t border-slate-800/50">
                                        <button type="button" onClick={() => setShowTModal(false)} className="flex-1 py-4 text-slate-600 font-black uppercase tracking-widest text-[10px] hover:text-white transition-all">Abort</button>
                                        <button type="submit" className="flex-[2] py-4 bg-yellow-600 hover:bg-yellow-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-yellow-500/20 transition-all active:scale-95">Commit Achievement Rule</button>
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
