import React, { useState, useEffect, useRef, memo } from 'react';
import Sidebar from '../components/Sidebar';
import ConfirmationModal from '../components/ConfirmationModal';
import {
    Plus, Trash2, Search, X, Layers,
    CheckCircle2, AlertCircle, Upload, FileJson, Clock,
    Monitor, Play, Info, Eye, ExternalLink, Activity, ArrowUpRight,
    RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import dynamic from 'next/dynamic';

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

interface LottieRecord {
    _id: string;
    name: string;
    filename: string;
    description?: string;
    is_active: boolean;
    createdAt: string;
}

// Small, memoized component for card previews to prevent re-renders
const LottieThumbnail = memo(({ filename }: { filename: string }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isMounted = true;
        
        const fetchThumbnail = async () => {
            try {
                const res = await fetch(`/api/image-proxy?key=Utsav/stage/lotties/${filename}`);
                if (!res.ok) throw new Error();
                const json = await res.json();
                
                // Safety check for valid Lottie-ness
                if (json && json.layers && Array.isArray(json.layers)) {
                    if (isMounted) setData(json);
                } else {
                    throw new Error();
                }
            } catch (e) {
                if (isMounted) setError(true);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchThumbnail();
        return () => { isMounted = false; };
    }, [filename]);

    if (loading) return (
        <div className="w-16 h-16 bg-slate-950/50 rounded-2xl border border-slate-800 animate-pulse flex items-center justify-center shadow-inner">
            <div className="w-4 h-4 border border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
    );

    if (error || !data) return (
        <div className="w-16 h-16 bg-slate-950/50 rounded-2xl border border-slate-800 flex items-center justify-center text-slate-700 shadow-inner">
            <FileJson size={24} />
        </div>
    );

    return (
        <div className="w-16 h-16 flex items-center justify-center p-2 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 shadow-inner overflow-hidden group-hover:border-indigo-500/30 transition-all">
            <Lottie animationData={data} loop={true} autoplay={true} />
        </div>
    );
});

LottieThumbnail.displayName = 'LottieThumbnail';

export default function LottiesPage() {
    const [lotties, setLotties] = useState<LottieRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState('');
    
    // Modal state for better UX
    const [modalConfig, setModalConfig] = useState<{
        open: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ open: false, title: '', message: '', onConfirm: () => {} });

    // Preview state
    const [selectedLottie, setSelectedLottie] = useState<LottieRecord | null>(null);
    const [lottieData, setLottieData] = useState<any>(null);

    // Upload form state
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchLotties();
    }, []);

    const fetchLotties = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/lotties');
            const data = await res.json();
            if (data.success) setLotties(data.data);
        } catch (e) {
            toast.error('Failed to load lottie library');
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (id: string) => {
        setModalConfig({
            open: true,
            title: 'Purge Animation?',
            message: 'Caution: This will permanently remove the Lottie asset. Any events currently referencing this filename will fail to render over-lays.',
            onConfirm: () => handleDelete(id)
        });
    };

    const handleDelete = async (id: string) => {
        setModalConfig(prev => ({ ...prev, open: false }));
        try {
            const res = await fetch(`/api/lotties?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                toast.success('Asset Purged from S3');
                setLotties(prev => prev.filter(l => l._id !== id));
            }
        } catch (e) {
            toast.error('Terminal Delete failed');
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadFile) return toast.error('Please select a JSON file');
        
        setUploading(true);
        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('lottie_file', uploadFile);

        const toastId = toast.loading('S3 ASSET SYNC: UPLOADING...');
        try {
            const res = await fetch('/api/lotties', { method: 'POST', body: data });
            const json = await res.json();
            if (json.success) {
                toast.success('PAYLOAD DEPLOYED SUCCESSFULLY', { id: toastId });
                setShowForm(false);
                setFormData({ name: '', description: '' });
                setUploadFile(null);
                fetchLotties();
            } else {
                toast.error(json.error || 'Upload failed', { id: toastId });
            }
        } catch (e) {
            toast.error('Network error during sync', { id: toastId });
        } finally {
            setUploading(false);
        }
    };

    const openPreview = async (lottie: LottieRecord) => {
        setSelectedLottie(lottie);
        setLottieData(null);
        try {
            const res = await fetch(`/api/image-proxy?key=Utsav/stage/lotties/${lottie.filename}`);
            if (!res.ok) throw new Error('Asset not found');
            const data = await res.json();
            
            if (!data || !data.layers || !Array.isArray(data.layers)) {
                throw new Error('Invalid animation format');
            }
            setLottieData(data);
        } catch (e: any) {
            toast.error(e.message || 'Failed to hydrate animation');
            setSelectedLottie(null);
        }
    };

    const filteredList = lotties.filter(l => {
        const nameMatch = (l.name || '').toLowerCase().includes(search.toLowerCase());
        const fileMatch = (l.filename || '').toLowerCase().includes(search.toLowerCase());
        return nameMatch || fileMatch;
    });

    return (
        <div className="flex h-screen bg-slate-950 text-white font-sans overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-inner group">
                            <Layers className="w-8 h-8 text-indigo-400 group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-indigo-400">
                                Motion Library
                            </h1>
                            <p className="text-slate-500 mt-1 uppercase tracking-widest text-[10px] font-bold flex items-center gap-2">
                                <Activity size={12} className="text-emerald-500" /> System: Online · Registry: <span className="text-white">{lotties.length} Vectors</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="group flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3.5 rounded-2xl font-black shadow-lg shadow-indigo-600/20 transition-all active:scale-95 uppercase tracking-widest text-xs"
                    >
                        <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                        <span>Register Animation</span>
                    </button>
                </div>

                {/* Status Bar */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8 bg-slate-900/40 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                             <FileJson size={16} className="text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Active Manifest</p>
                            <p className="text-sm font-black text-white uppercase tracking-tight">Lottie v5 Core Registry</p>
                        </div>
                    </div>

                    <div className="relative w-full xl:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="QUERY SYSTEM BY NAME OR KEY..."
                            className="w-full bg-slate-950 border border-slate-800 pl-12 pr-4 py-4 rounded-[1.5rem] text-[10px] font-black text-white uppercase tracking-widest focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-slate-700 shadow-inner"
                        />
                    </div>
                </div>

                {/* Grid View */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                             <div key={i} className="h-64 bg-slate-900/50 rounded-[2.5rem] animate-pulse border border-slate-800" />
                        ))}
                    </div>
                ) : filteredList.length === 0 ? (
                    <div className="text-center py-24 bg-slate-900/20 border border-slate-800/50 border-dashed rounded-[3rem]">
                        <Monitor size={48} className="mx-auto mb-4 text-slate-800 animate-pulse" />
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Grid Empty: No Objects Detected</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {filteredList.map((lottie) => (
                            <motion.div
                                key={lottie._id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="group relative bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 hover:border-indigo-500/40 hover:shadow-indigo-500/10 transition-all duration-500 flex flex-col shadow-2xl overflow-hidden hover:-translate-y-1"
                            >
                                {/* Decorative Gradient */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/10 transition-all" />

                                <div className="flex justify-between items-start mb-6">
                                    <LottieThumbnail filename={lottie.filename} />
                                    <div className="flex gap-2 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                        <button
                                            onClick={() => openPreview(lottie)}
                                            className="p-3 bg-slate-950 border border-slate-800 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50 rounded-2xl transition-all shadow-xl active:scale-90"
                                            title="Deep Inspect"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            onClick={() => confirmDelete(lottie._id)}
                                            className="p-3 bg-slate-950 border border-slate-800 text-slate-600 hover:text-rose-500 hover:border-rose-500/50 rounded-2xl transition-all shadow-xl active:scale-90"
                                            title="Archival Purge"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight group-hover:text-indigo-300 transition-colors">
                                        {lottie.name || lottie.filename.replace('.json', '').replace(/_/g, ' ')}
                                    </h3>
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                        <RefreshCw size={10} /> {lottie.filename}
                                    </p>
                                </div>
                                
                                {lottie.description && (
                                    <p className="text-slate-400 text-xs mt-4 line-clamp-2 h-8 italic font-medium leading-relaxed">
                                        "{lottie.description}"
                                    </p>
                                )}

                                <div className="mt-8 pt-6 border-t border-slate-800/50 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/5 border border-emerald-400/10 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-inner">
                                        <CheckCircle2 size={10} /> Live Binary
                                    </div>
                                    <div className="text-[9px] text-slate-600 font-black uppercase tracking-widest">
                                        {new Date(lottie.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Confirmation Modal */}
                <ConfirmationModal 
                    isOpen={modalConfig.open}
                    title={modalConfig.title}
                    message={modalConfig.message}
                    isDestructive={true}
                    confirmLabel="Execute Purge"
                    onConfirm={modalConfig.onConfirm}
                    onCancel={() => setModalConfig(prev => ({ ...prev, open: false }))}
                />

                {/* Registration Modal */}
                <AnimatePresence>
                    {showForm && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                exit={{ opacity: 0 }} 
                                className="absolute inset-0 bg-black/80 backdrop-blur-md" 
                                onClick={() => setShowForm(false)} 
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl"
                            >
                                <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
                                    <div>
                                        <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                            <Upload className="text-indigo-400" size={20} /> Asset Registration
                                        </h2>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">S3 Binary Injection Protocol</p>
                                    </div>
                                    <button onClick={() => setShowForm(false)} className="p-3 hover:bg-slate-800 rounded-2xl transition-colors"><X /></button>
                                </div>

                                <form onSubmit={handleUpload} className="p-8 space-y-6">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-slate-800 hover:border-indigo-500/40 rounded-[2rem] p-10 text-center cursor-pointer transition-all bg-slate-950 shadow-inner group"
                                    >
                                        <FileJson className="mx-auto mb-3 text-slate-800 group-hover:text-indigo-500 group-hover:scale-110 transition-all duration-300" size={48} />
                                        {uploadFile ? (
                                            <div className="animate-in fade-in zoom-in duration-300">
                                                <p className="text-indigo-300 font-black text-sm uppercase tracking-tight">{uploadFile.name}</p>
                                                <p className="text-slate-600 text-[10px] font-black mt-1 uppercase">{(uploadFile.size / 1024).toFixed(1)} KB PAYLOAD</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Select Lottie JSON Buffer</p>
                                                <div className="w-12 h-1 bg-slate-900 rounded-full mx-auto mt-4" />
                                            </div>
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".json,application/json"
                                            className="hidden"
                                            onChange={e => {
                                                const file = e.target.files?.[0] || null;
                                                setUploadFile(file);
                                                if (file && !formData.name) {
                                                    setFormData(f => ({ ...f, name: file.name.replace('.json', '').replace(/-/g, ' ') }));
                                                }
                                            }}
                                        />
                                    </div>

                                    <div className="space-y-5">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2.5 block ml-1">Entity Identifier</label>
                                            <input
                                                required
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="DIWALI_SPARKLE_OVERLAY_V1"
                                                className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:border-indigo-500/40 transition-all font-black text-xs uppercase tracking-widest shadow-inner placeholder:text-slate-800"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2.5 block ml-1">Context / Log Metadata</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="DESCRIBE ASSET USE CASE..."
                                                rows={3}
                                                className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-400 text-xs outline-none focus:border-indigo-500/40 transition-all resize-none shadow-inner placeholder:text-slate-800 font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowForm(false)}
                                            className="flex-1 py-4 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:text-white transition-all shadow-xl rounded-2xl"
                                        >
                                            Abort
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={uploading}
                                            className="flex-[2] py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 rounded-2xl text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-blue-600/20 transform transition-all active:scale-95"
                                        >
                                            {uploading ? 'Synching...' : 'Commit Protocol'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Deep Inspect Modal */}
                <AnimatePresence>
                    {selectedLottie && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-8">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={() => setSelectedLottie(null)} />
                           <motion.div 
                               initial={{ opacity: 0, scale: 0.9, y: 30 }}
                               animate={{ opacity: 1, scale: 1, y: 0 }}
                               exit={{ opacity: 0, scale: 0.9, y: 30 }}
                               className="relative bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-5xl h-[85vh] flex flex-col items-stretch shadow-2xl overflow-hidden"
                           >
                                <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
                                    <div>
                                        <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                            <Play className="text-indigo-400 fill-indigo-400/20" size={24} /> {selectedLottie.name}
                                        </h2>
                                        <p className="text-[10px] text-slate-600 mt-1.5 font-black uppercase tracking-widest flex items-center gap-2">
                                            <RefreshCw size={10} /> KEY: {selectedLottie.filename}
                                        </p>
                                    </div>
                                    <button onClick={() => setSelectedLottie(null)} className="p-4 bg-slate-800 hover:bg-rose-600 rounded-2xl text-slate-400 hover:text-white transition-all shadow-xl"><X /></button>
                                </div>

                                <div className="flex-1 min-h-0 flex bg-slate-950/20">
                                    {/* Animation Stage */}
                                    <div className="flex-[3] flex items-center justify-center p-12 border-r border-slate-800/50 bg-[#020617] relative overflow-hidden">
                                        {/* Grid Background */}
                                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                                        
                                        {lottieData ? (
                                            <div className="w-full h-full max-w-lg max-h-lg relative z-10 filter drop-shadow-[0_0_50px_rgba(99,102,241,0.2)]">
                                                <Lottie animationData={lottieData} loop={true} />
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-6 relative z-10">
                                                <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin shadow-2xl shadow-indigo-500/20" />
                                                <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Hydrating Manifest...</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Animation Info Sidebar */}
                                    <div className="w-96 p-8 space-y-10 bg-slate-900/30 overflow-y-auto custom-scrollbar">
                                        <section>
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 block">System Integrity</label>
                                            <div className="space-y-4">
                                                <StatusLine icon={<CheckCircle2 size={14} />} label="S3 Cloud Master" status="Synced" color="emerald" />
                                                <StatusLine icon={<CheckCircle2 size={14} />} label="Global CDN" status="Active" color="emerald" />
                                                <StatusLine icon={<Info size={14} />} label="Schema Version" status="Lottie v5.7" color="indigo" />
                                            </div>
                                        </section>

                                        <section>
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 block">Composition Data</label>
                                            <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase">Frames</span>
                                                    <span className="text-sm font-black text-white">{lottieData?.op || '--'}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase">Framerate</span>
                                                    <span className="text-sm font-black text-white">{lottieData?.fr || '--'} FPS</span>
                                                </div>
                                            </div>
                                        </section>

                                        <div className="pt-8 border-t border-slate-800">
                                            <button 
                                                onClick={() => window.open(`/api/image-proxy?key=Utsav/stage/lotties/${selectedLottie.filename}`, '_blank')}
                                                className="w-full flex items-center justify-center gap-3 py-5 bg-indigo-600 hover:bg-indigo-500 rounded-[1.5rem] text-[10px] font-black text-white transition-all shadow-lg shadow-indigo-600/20 active:scale-95 uppercase tracking-widest"
                                            >
                                                <ExternalLink size={14} /> Fetch Raw Manifest
                                            </button>
                                        </div>
                                    </div>
                                </div>
                           </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </main>
        </div>
    );
}

function StatusLine({ icon, label, status, color }: any) {
    return (
        <div className="flex items-center justify-between group/line">
            <div className="flex items-center gap-3">
                <div className={clsx("p-1.5 rounded-lg border", color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400')}>
                    {icon}
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight group-hover/line:text-slate-300 transition-colors">{label}</span>
            </div>
            <span className={clsx("text-[10px] font-black uppercase tracking-widest", color === 'emerald' ? 'text-emerald-500' : 'text-indigo-400')}>{status}</span>
        </div>
    );
}
