import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
    Music,
    Upload,
    Play,
    Pause,
    Trash2,
    Link2,
    Plus,
    Search,
    Volume2,
    RefreshCw,
    CheckCircle,
    XCircle,
    Clock,
    Tag,
    X,
    ChevronLeft,
    ChevronRight,
    Activity
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ConfirmationModal from '../components/ConfirmationModal';
import { getAudioUrl } from '../lib/getImageUrl';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface AudioRecord {
    _id: string;
    slug: string;
    title: string;
    description?: string;
    attribution?: string;
    filename: string;
    s3_key: string;
    mime_type: string;
    file_size_bytes: number;
    duration_seconds: number;
    is_s3_uploaded: boolean;
    category: string;
    mood: string;
    language: string;
    tags: string[];
    is_loopable: boolean;
    default_volume: number;
    plays_count: number;
    linked_events: string[];
    createdAt: string;
}

const CATEGORIES = ['devotional', 'folk', 'classical', 'nature', 'mantras', 'instrumental', 'celebration'];
const MOODS = ['peaceful', 'joyful', 'spiritual', 'festive', 'meditative'];
const LANGUAGES = ['neutral', 'hi', 'mr', 'sa', 'ta', 'te', 'kn', 'ml', 'gu', 'bn'];

const CATEGORY_COLORS: Record<string, string> = {
    devotional: '#f59e0b',
    folk: '#10b981',
    classical: '#8b5cf6',
    nature: '#06b6d4',
    mantras: '#ec4899',
    instrumental: '#6366f1',
    celebration: '#ef4444',
};

const MOOD_ICONS: Record<string, string> = {
    peaceful: '🕊️',
    joyful: '🎉',
    spiritual: '🙏',
    festive: '🎊',
    meditative: '🧘',
};

function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function AudioPage() {
    const [audioList, setAudioList] = useState<AudioRecord[]>([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterMood, setFilterMood] = useState('');
    const [filterUploaded, setFilterUploaded] = useState('');
    const [showUpload, setShowUpload] = useState(false);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Upload form state
    const [uploadForm, setUploadForm] = useState({
        slug: '',
        title: '',
        description: '',
        attribution: '',
        category: 'devotional',
        mood: 'spiritual',
        language: 'neutral',
        duration_seconds: '',
        tags: '',
        is_loopable: true,
        default_volume: '0.6',
    });
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        fetchAudio();
    }, [filterCategory, filterMood, filterUploaded, debouncedSearch, pagination.page]);

    const fetchAudio = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ 
                limit: '20',
                page: (pagination.page - 1).toString() 
            });
            if (filterCategory) params.set('category', filterCategory);
            if (filterMood) params.set('mood', filterMood);
            if (filterUploaded) params.set('is_uploaded', filterUploaded);
            if (debouncedSearch) params.set('search', debouncedSearch);

            const res = await fetch(`/api/audio?${params}`);
            const data = await res.json();
            setAudioList(data.items || []);
            setPagination({ 
                total: data.total || 0, 
                page: (data.page || 0) + 1, 
                pages: Math.ceil((data.total || 0) / 20) 
            });
        } catch (e) {
            toast.error('Failed to load audio library');
        } finally {
            setLoading(false);
        }
    };

    const handlePlay = (audio: AudioRecord) => {
        if (!audio.is_s3_uploaded && !audio.filename) return;

        if (playingId === audio._id) {
            audioRef.current?.pause();
            setPlayingId(null);
        } else {
            if (audioRef.current) audioRef.current.pause();
            const audioSrc = getAudioUrl(audio.s3_key || `audio/originals/${audio.filename}`);
            audioRef.current = new Audio(audioSrc);
            audioRef.current.volume = Number(audio.default_volume);
            audioRef.current.play();
            audioRef.current.onended = () => setPlayingId(null);
            setPlayingId(audio._id);
        }
    };

    const confirmDelete = (id: string) => {
        setDeleteId(id);
        setModalOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        const tid = toast.loading('Deleting audio...');
        try {
            const res = await fetch(`/api/audio?id=${deleteId}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Audio moved to trash', { id: tid });
                fetchAudio();
            } else {
                toast.error('Failed to delete', { id: tid });
            }
        } catch (e) {
            toast.error('Network error', { id: tid });
        } finally {
            setModalOpen(false);
            setDeleteId(null);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);
        const tid = toast.loading('Uploading audio...');

        const formData = new FormData();
        Object.entries(uploadForm).forEach(([k, v]) => formData.append(k, String(v)));
        if (uploadFile) formData.append('audio_file', uploadFile as any);

        try {
            const res = await fetch('/api/audio', { method: 'POST', body: formData });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Upload failed');
            }
            toast.success('Audio created successfully!', { id: tid });
            setShowUpload(false);
            fetchAudio();
        } catch (err: any) {
            toast.error(err.message || 'Upload failed', { id: tid });
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Ambient Audio | Mission Control</title>
            </Head>

            <div className="flex h-screen bg-slate-950 font-sans text-white overflow-hidden">
                <Sidebar />
                <ConfirmationModal
                    isOpen={modalOpen}
                    onCancel={() => setModalOpen(false)}
                    onConfirm={handleDelete}
                    title="Delete Audio"
                    message="Are you sure you want to soft-delete this audio track? It can be restored later from the database."
                    isDestructive
                />

                <main className="flex-1 flex flex-col overflow-hidden">
                    {/* Header Section */}
                    <div className="bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 p-8 z-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20 shadow-inner group">
                                    <Music className="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black tracking-tight text-white">Audio Library</h1>
                                    <p className="text-slate-500 mt-1 uppercase tracking-widest text-[10px] font-bold">
                                        {pagination.total} Tracks · Mission Control Ready
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => fetchAudio()}
                                    className="p-3 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-all text-slate-400 hover:text-white"
                                >
                                    <RefreshCw size={20} className={clsx(loading && "animate-spin")} />
                                </button>
                                <button
                                    onClick={() => setShowUpload(true)}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-sm font-black text-white shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 transition-all hover:scale-[1.02] flex items-center gap-2"
                                >
                                    <Plus size={18} /> ADD AUDIO
                                </button>
                            </div>
                        </div>

                        {/* Search & Filter Bar */}
                        <div className="mt-8 flex flex-wrap gap-4">
                            <div className="relative flex-1 min-w-[300px] group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={20} />
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search tracks by title, slug, or tags..."
                                    className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/50 transition-all"
                                />
                                {search && (
                                    <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white">
                                        <X size={18} />
                                    </button>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <select
                                    value={filterCategory}
                                    onChange={e => setFilterCategory(e.target.value)}
                                    className="px-4 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-sm text-slate-400 focus:outline-none focus:border-purple-500/50 transition-all appearance-none cursor-pointer min-w-[150px]"
                                >
                                    <option value="">Categories</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <select
                                    value={filterMood}
                                    onChange={e => setFilterMood(e.target.value)}
                                    className="px-4 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-sm text-slate-400 focus:outline-none focus:border-purple-500/50 transition-all appearance-none cursor-pointer min-w-[140px]"
                                >
                                    <option value="">Moods</option>
                                    {MOODS.map(m => <option key={m} value={m}>{MOOD_ICONS[m]} {m}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-950 pb-32">
                        {loading && audioList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 gap-4">
                                <Activity className="w-12 h-12 text-purple-500 animate-pulse" />
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Scanning Audio Archives...</p>
                            </div>
                        ) : audioList.length === 0 ? (
                            <div className="text-center py-32 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800">
                                <Music size={64} className="mx-auto mb-6 text-slate-700 opacity-20" />
                                <h3 className="text-xl font-black text-slate-400">No Audio Tracks Found</h3>
                                <p className="text-slate-600 text-sm mt-2 font-medium">Try adjusting your filters or search query</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                <AnimatePresence mode="popLayout">
                                    {audioList.map((audio) => (
                                        <motion.div
                                            key={audio._id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className={clsx(
                                                "group relative bg-slate-900 border rounded-[2rem] p-6 transition-all duration-300",
                                                playingId === audio._id
                                                    ? "border-purple-500/50 bg-slate-900 ring-4 ring-purple-500/10 shadow-2xl"
                                                    : "border-slate-800 hover:border-slate-700 hover:bg-slate-900/80"
                                            )}
                                        >
                                            <div className="flex gap-6 items-start">
                                                {/* Play Button Stage */}
                                                <button
                                                    onClick={() => handlePlay(audio)}
                                                    disabled={!audio.is_s3_uploaded}
                                                    className={clsx(
                                                        "w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-xl active:scale-90",
                                                        audio.is_s3_uploaded
                                                            ? playingId === audio._id
                                                                ? "bg-purple-600 text-white"
                                                                : "bg-slate-950 text-purple-400 hover:bg-purple-500 hover:text-white"
                                                            : "bg-slate-950 text-slate-700 cursor-not-allowed opacity-50"
                                                    )}
                                                >
                                                    {playingId === audio._id ? (
                                                        <Pause size={28} />
                                                    ) : (
                                                        <Play size={28} className="translate-x-0.5" />
                                                    )}
                                                </button>

                                                {/* Info Block */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-lg font-black text-white truncate group-hover:text-purple-400 transition-colors uppercase tracking-tight">{audio.title}</h3>
                                                        <span
                                                            className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border"
                                                            style={{
                                                                backgroundColor: `${CATEGORY_COLORS[audio.category]}10`,
                                                                color: CATEGORY_COLORS[audio.category],
                                                                borderColor: `${CATEGORY_COLORS[audio.category]}30`,
                                                            }}
                                                        >
                                                            {audio.category}
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
                                                        <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                                            <Clock size={12} className="text-purple-500" /> {formatDuration(audio.duration_seconds)}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                                            <Volume2 size={12} className="text-indigo-500" /> {audio.plays_count} Plays
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                                            <span>{MOOD_ICONS[audio.mood]} {audio.mood}</span>
                                                        </div>
                                                        {audio.linked_events.length > 0 && (
                                                            <div className="flex items-center gap-1.5 text-blue-400 text-[10px] font-bold uppercase tracking-widest">
                                                                <Link2 size={12} /> {audio.linked_events.length} Events
                                                            </div>
                                                        )}
                                                    </div>

                                                    <p className="text-slate-500 text-xs font-mono mb-4 truncate italic">/{audio.slug}</p>

                                                    {audio.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {audio.tags.map(tag => (
                                                                <span key={tag} className="px-2 py-0.5 bg-slate-950 border border-slate-800 text-[9px] font-bold text-slate-500 rounded-md uppercase tracking-tighter">
                                                                    #{tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Actions Area */}
                                                <div className="flex flex-col items-end gap-3 self-stretch">
                                                    {audio.is_s3_uploaded ? (
                                                        <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest">
                                                            <CheckCircle size={10} /> S3 LIVE
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/20 text-[9px] font-black uppercase tracking-widest">
                                                            <Activity size={10} className="animate-pulse" /> PENDING
                                                        </div>
                                                    )}
                                                    <div className="flex-1" />
                                                    <button
                                                        onClick={() => confirmDelete(audio._id)}
                                                        className="p-3 text-slate-700 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
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
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Page <span className="text-white">{pagination.page}</span> of <span className="text-white">{pagination.pages}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                                disabled={pagination.page === 1}
                                className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div className="flex gap-1">
                                {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                                    const pageNum = i + 1; // Simplistic view, usually need smarter logic
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                                            className={clsx(
                                                "w-10 h-10 rounded-xl text-xs font-black transition-all",
                                                pagination.page === pageNum
                                                    ? "bg-purple-600 text-white"
                                                    : "bg-slate-900 text-slate-500 hover:text-white hover:border-slate-700 border border-slate-800"
                                            )}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                                disabled={pagination.page === pagination.pages}
                                className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </main>

                {/* Upload Modal */}
                <AnimatePresence>
                    {showUpload && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
                        >
                            <motion.div 
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                            >
                                <div className="flex items-center justify-between p-8 border-b border-slate-800">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-purple-500/10 rounded-2xl">
                                            <Upload size={24} className="text-purple-400" />
                                        </div>
                                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Post Audio Asset</h2>
                                    </div>
                                    <button onClick={() => setShowUpload(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleUpload} className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                                    {/* Audio file drop zone */}
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-slate-800 hover:border-purple-500/50 rounded-3xl p-10 text-center cursor-pointer transition-all bg-slate-950/50 group"
                                    >
                                        <Music className="mx-auto mb-4 text-slate-700 group-hover:text-purple-400 transition-colors" size={48} />
                                        {uploadFile ? (
                                            <div className="space-y-1">
                                                <p className="text-purple-400 font-black uppercase tracking-tight text-sm">{uploadFile.name}</p>
                                                <p className="text-slate-600 text-[10px] font-bold">{formatFileSize(uploadFile.size)}</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Drop audio file or click to browse</p>
                                                <p className="text-slate-600 text-[10px]">AAC, MP3, OGG, WAV · Max 50MB</p>
                                            </div>
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="audio/*"
                                            className="hidden"
                                            onChange={e => {
                                                const f = e.target.files?.[0];
                                                if (!f) return;
                                                setUploadFile(f as any);
                                                if (!uploadForm.slug) {
                                                    const name = f.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
                                                    setUploadForm(u => ({ ...u, slug: name }));
                                                }
                                            }}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Asset Slug</label>
                                            <input
                                                required value={uploadForm.slug}
                                                onChange={e => setUploadForm(u => ({ ...u, slug: e.target.value }))}
                                                placeholder="diwali-aarti"
                                                className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Asset Title</label>
                                            <input
                                                required value={uploadForm.title}
                                                onChange={e => setUploadForm(u => ({ ...u, title: e.target.value }))}
                                                placeholder="Lakshmi Aarti"
                                                className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
                                            <select
                                                value={uploadForm.category}
                                                onChange={e => setUploadForm(u => ({ ...u, category: e.target.value }))}
                                                className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all outline-none appearance-none"
                                            >
                                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mood</label>
                                            <select
                                                value={uploadForm.mood}
                                                onChange={e => setUploadForm(u => ({ ...u, mood: e.target.value }))}
                                                className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all outline-none appearance-none"
                                            >
                                                {MOODS.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Language</label>
                                            <select
                                                value={uploadForm.language}
                                                onChange={e => setUploadForm(u => ({ ...u, language: e.target.value }))}
                                                className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all outline-none appearance-none"
                                            >
                                                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tags (Comma Sep)</label>
                                            <input
                                                value={uploadForm.tags}
                                                onChange={e => setUploadForm(u => ({ ...u, tags: e.target.value }))}
                                                placeholder="diwali, aarti, bells"
                                                className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-2xl px-5 h-full self-end">
                                            <input
                                                type="checkbox"
                                                id="loopable"
                                                checked={uploadForm.is_loopable}
                                                onChange={e => setUploadForm(u => ({ ...u, is_loopable: e.target.checked }))}
                                                className="w-5 h-5 rounded-lg border-slate-700 bg-slate-900 text-purple-600 focus:ring-purple-500/40"
                                            />
                                            <label htmlFor="loopable" className="text-xs font-bold text-slate-400 uppercase tracking-widest cursor-pointer">Loop Enabled</label>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowUpload(false)}
                                            className="flex-1 py-4 border border-slate-800 rounded-2xl text-xs font-black text-slate-500 hover:text-white hover:bg-slate-800 transition-all uppercase tracking-widest"
                                        >
                                            Discard
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={uploading}
                                            className="flex-[2] py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl text-xs font-black text-white shadow-xl shadow-purple-600/20 hover:shadow-purple-600/40 transition-all active:scale-95 uppercase tracking-widest disabled:opacity-50"
                                        >
                                            {uploading ? "S3 BUFFERING..." : "COMMIT TO CLOUD"}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
