import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
    Music,
    Upload,
    Play,
    Pause,
    Square,
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
    Smile,
} from 'lucide-react';

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
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterMood, setFilterMood] = useState('');
    const [filterUploaded, setFilterUploaded] = useState('');
    const [showUpload, setShowUpload] = useState(false);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
    const [uploadSuccess, setUploadSuccess] = useState('');
    const [uploadError, setUploadError] = useState('');

    useEffect(() => {
        fetchAudio();
    }, [filterCategory, filterMood, filterUploaded]);

    const fetchAudio = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ limit: '50' });
            if (filterCategory) params.set('category', filterCategory);
            if (filterMood) params.set('mood', filterMood);
            if (filterUploaded) params.set('is_uploaded', filterUploaded);

            const res = await fetch(`/api/audio?${params}`);
            const data = await res.json();
            setAudioList(data.items || []);
            setTotal(data.total || 0);
        } catch (e) {
            setError('Failed to load audio library');
        } finally {
            setLoading(false);
        }
    };

    const handlePlay = (audio: AudioRecord) => {
        if (!audio.is_s3_uploaded) return;

        if (playingId === audio._id) {
            audioRef.current?.pause();
            setPlayingId(null);
        } else {
            if (audioRef.current) audioRef.current.pause();
            audioRef.current = new Audio(audio.s3_key);
            audioRef.current.volume = audio.default_volume;
            audioRef.current.play();
            audioRef.current.onended = () => setPlayingId(null);
            setPlayingId(audio._id);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Soft-delete this audio? It can be restored later.')) return;
        await fetch(`/api/audio?id=${id}`, { method: 'DELETE' });
        fetchAudio();
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);
        setUploadError('');
        setUploadSuccess('');

        const formData = new FormData();
        Object.entries(uploadForm).forEach(([k, v]) => formData.append(k, String(v)));
        if (uploadFile) formData.append('audio_file', uploadFile);

        try {
            const res = await fetch('/api/audio', { method: 'POST', body: formData });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Upload failed');
            }
            setUploadSuccess(`✅ "${uploadForm.title}" created${uploadFile ? ' and uploaded to S3' : ''} successfully!`);
            setShowUpload(false);
            fetchAudio();
        } catch (err: unknown) {
            setUploadError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const filteredList = audioList.filter(a =>
        !search ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.slug.toLowerCase().includes(search.toLowerCase()) ||
        a.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <>
            <Head>
                <title>Ambient Audio Library | Admin</title>
            </Head>

            <div className="min-h-screen bg-gray-950 text-white p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 bg-purple-500/20 rounded-xl border border-purple-500/30">
                                <Music className="text-purple-400" size={22} />
                            </div>
                            <h1 className="text-2xl font-bold text-white">Ambient Audio Library</h1>
                        </div>
                        <p className="text-gray-400 text-sm ml-12">
                            {total} audio tracks · Stream directly to festival events
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={fetchAudio}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm transition-colors"
                        >
                            <RefreshCw size={14} /> Refresh
                        </button>
                        <button
                            onClick={() => setShowUpload(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm font-medium transition-colors"
                        >
                            <Plus size={14} /> Add Audio
                        </button>
                    </div>
                </div>

                {/* Success message */}
                {uploadSuccess && (
                    <div className="mb-4 p-3 bg-green-900/30 border border-green-700/50 rounded-xl text-green-300 text-sm flex items-center gap-2">
                        <CheckCircle size={16} /> {uploadSuccess}
                        <button onClick={() => setUploadSuccess('')} className="ml-auto text-green-500 hover:text-green-300">✕</button>
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <div className="relative flex-1 min-w-48">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by title, slug, tag..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                        />
                    </div>
                    <select
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                        className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                    >
                        <option value="">All Categories</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select
                        value={filterMood}
                        onChange={e => setFilterMood(e.target.value)}
                        className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                    >
                        <option value="">All Moods</option>
                        {MOODS.map(m => <option key={m} value={m}>{MOOD_ICONS[m]} {m}</option>)}
                    </select>
                    <select
                        value={filterUploaded}
                        onChange={e => setFilterUploaded(e.target.value)}
                        className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                    >
                        <option value="">All Status</option>
                        <option value="true">✅ On S3</option>
                        <option value="false">⏳ Pending</option>
                    </select>
                </div>

                {/* Audio Grid */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-purple-500" />
                    </div>
                ) : filteredList.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <Music size={48} className="mx-auto mb-3 opacity-30" />
                        <p>No audio found.</p>
                        <p className="text-sm mt-1">Run <code className="bg-gray-800 px-2 py-0.5 rounded">npm run seed:audio</code> to populate the library.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredList.map(audio => (
                            <div
                                key={audio._id}
                                className={`flex items-center gap-4 p-4 bg-gray-900 border rounded-2xl transition-all ${playingId === audio._id
                                        ? 'border-purple-500/60 bg-purple-950/30'
                                        : 'border-gray-800 hover:border-gray-700'
                                    }`}
                            >
                                {/* Play Button */}
                                <button
                                    onClick={() => handlePlay(audio)}
                                    disabled={!audio.is_s3_uploaded}
                                    className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${audio.is_s3_uploaded
                                            ? 'bg-purple-600 hover:bg-purple-500 cursor-pointer'
                                            : 'bg-gray-800 cursor-not-allowed opacity-50'
                                        }`}
                                    title={audio.is_s3_uploaded ? 'Preview audio' : 'Not uploaded to S3 yet'}
                                >
                                    {playingId === audio._id ? (
                                        <Pause size={20} className="text-white" />
                                    ) : (
                                        <Play size={20} className="text-white ml-0.5" />
                                    )}
                                </button>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-white truncate">{audio.title}</span>
                                        <span
                                            className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium"
                                            style={{
                                                background: `${CATEGORY_COLORS[audio.category]}22`,
                                                color: CATEGORY_COLORS[audio.category],
                                                border: `1px solid ${CATEGORY_COLORS[audio.category]}44`,
                                            }}
                                        >
                                            {audio.category}
                                        </span>
                                        <span className="flex-shrink-0 text-xs text-gray-400">
                                            {MOOD_ICONS[audio.mood]} {audio.mood}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span className="font-mono text-gray-600">{audio.slug}</span>
                                        {audio.duration_seconds > 0 && (
                                            <span className="flex items-center gap-1">
                                                <Clock size={11} /> {formatDuration(audio.duration_seconds)}
                                            </span>
                                        )}
                                        {audio.file_size_bytes > 0 && (
                                            <span>{formatFileSize(audio.file_size_bytes)}</span>
                                        )}
                                        {audio.linked_events.length > 0 && (
                                            <span className="flex items-center gap-1 text-blue-400">
                                                <Link2 size={11} /> {audio.linked_events.length} event{audio.linked_events.length !== 1 ? 's' : ''}
                                            </span>
                                        )}
                                        {audio.plays_count > 0 && (
                                            <span className="flex items-center gap-1">
                                                <Volume2 size={11} /> {audio.plays_count} plays
                                            </span>
                                        )}
                                    </div>
                                    {audio.tags.length > 0 && (
                                        <div className="flex gap-1 mt-1.5 flex-wrap">
                                            {audio.tags.slice(0, 6).map(tag => (
                                                <span key={tag} className="text-xs px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded-md">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Status & Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {audio.is_s3_uploaded ? (
                                        <span className="flex items-center gap-1 text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded-lg border border-green-700/30">
                                            <CheckCircle size={11} /> S3
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-900/20 px-2 py-1 rounded-lg border border-yellow-700/30">
                                            <XCircle size={11} /> Pending
                                        </span>
                                    )}
                                    <button
                                        onClick={() => handleDelete(audio._id)}
                                        className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Upload Modal */}
                {showUpload && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-xl overflow-y-auto max-h-[90vh]">
                            <div className="flex items-center justify-between p-5 border-b border-gray-800">
                                <h2 className="font-semibold text-white flex items-center gap-2">
                                    <Upload size={16} className="text-purple-400" /> Add Audio
                                </h2>
                                <button onClick={() => setShowUpload(false)} className="text-gray-500 hover:text-white">✕</button>
                            </div>

                            <form onSubmit={handleUpload} className="p-5 space-y-4">
                                {uploadError && (
                                    <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-xl text-red-300 text-sm">{uploadError}</div>
                                )}

                                {/* Audio file drop zone */}
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-700 hover:border-purple-500 rounded-xl p-6 text-center cursor-pointer transition-colors"
                                >
                                    <Music className="mx-auto mb-2 text-gray-500" size={28} />
                                    {uploadFile ? (
                                        <div>
                                            <p className="text-purple-300 font-medium">{uploadFile.name}</p>
                                            <p className="text-gray-500 text-sm">{formatFileSize(uploadFile.size)}</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-gray-400 text-sm">Drop audio file here or click to browse</p>
                                            <p className="text-gray-600 text-xs mt-1">AAC, MP3, OGG, WAV · Max 50MB</p>
                                            <p className="text-gray-600 text-xs">Or leave empty to register metadata only (upload later via CLI)</p>
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
                                            setUploadFile(f);
                                            if (!uploadForm.slug) {
                                                const name = f.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
                                                setUploadForm(u => ({ ...u, slug: name }));
                                            }
                                        }}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Slug *</label>
                                        <input
                                            required value={uploadForm.slug}
                                            onChange={e => setUploadForm(u => ({ ...u, slug: e.target.value }))}
                                            placeholder="diwali-lakshmi-aarti"
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Title *</label>
                                        <input
                                            required value={uploadForm.title}
                                            onChange={e => setUploadForm(u => ({ ...u, title: e.target.value }))}
                                            placeholder="Lakshmi Aarti – Diwali"
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Description</label>
                                    <input
                                        value={uploadForm.description}
                                        onChange={e => setUploadForm(u => ({ ...u, description: e.target.value }))}
                                        placeholder="Brief description of this audio"
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Category</label>
                                        <select
                                            value={uploadForm.category}
                                            onChange={e => setUploadForm(u => ({ ...u, category: e.target.value }))}
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                                        >
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Mood</label>
                                        <select
                                            value={uploadForm.mood}
                                            onChange={e => setUploadForm(u => ({ ...u, mood: e.target.value }))}
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                                        >
                                            {MOODS.map(m => <option key={m} value={m}>{MOOD_ICONS[m]} {m}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Language</label>
                                        <select
                                            value={uploadForm.language}
                                            onChange={e => setUploadForm(u => ({ ...u, language: e.target.value }))}
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                                        >
                                            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Duration (seconds)</label>
                                        <input
                                            type="number" value={uploadForm.duration_seconds}
                                            onChange={e => setUploadForm(u => ({ ...u, duration_seconds: e.target.value }))}
                                            placeholder="180"
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Default Volume (0–1)</label>
                                        <input
                                            type="number" step="0.1" min="0" max="1" value={uploadForm.default_volume}
                                            onChange={e => setUploadForm(u => ({ ...u, default_volume: e.target.value }))}
                                            placeholder="0.6"
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Tags (comma-separated)</label>
                                    <input
                                        value={uploadForm.tags}
                                        onChange={e => setUploadForm(u => ({ ...u, tags: e.target.value }))}
                                        placeholder="diwali, aarti, bells, puja"
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Attribution / Credit</label>
                                    <input
                                        value={uploadForm.attribution}
                                        onChange={e => setUploadForm(u => ({ ...u, attribution: e.target.value }))}
                                        placeholder="Traditional Indian music, public domain"
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={uploadForm.is_loopable}
                                        onChange={e => setUploadForm(u => ({ ...u, is_loopable: e.target.checked }))}
                                        className="rounded"
                                    />
                                    <span className="text-sm text-gray-300">Loop audio seamlessly</span>
                                </label>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowUpload(false)}
                                        className="flex-1 py-2.5 border border-gray-700 rounded-xl text-sm text-gray-400 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-xl text-sm font-medium transition-colors"
                                    >
                                        {uploading ? (uploadFile ? 'Uploading to S3...' : 'Creating...') : (uploadFile ? 'Create & Upload' : 'Create Record')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* CLI hint at bottom */}
                <div className="mt-8 p-4 bg-gray-900 border border-gray-800 rounded-xl text-xs text-gray-500">
                    <p className="font-medium text-gray-400 mb-1">💡 CLI Commands</p>
                    <div className="grid grid-cols-2 gap-1 font-mono">
                        <span><code className="text-purple-400">npm run seed:audio</code> — populate library from catalog</span>
                        <span><code className="text-purple-400">npm run upload:audio</code> — push pending files to S3</span>
                        <span><code className="text-purple-400">npm run seed:audio:clean</code> — reset and re-seed</span>
                        <span><code className="text-purple-400">npm run upload:audio:force</code> — re-upload all</span>
                    </div>
                    <p className="mt-2">Place audio files in <code className="text-gray-400">backend/assets/audio/</code> before running upload.</p>
                </div>
            </div>
        </>
    );
}
