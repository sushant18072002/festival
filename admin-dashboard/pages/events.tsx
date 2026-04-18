import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import LanguageTabs from '../components/LanguageTabs';
import {
    Plus, Edit2, Trash2, Search, X, ChevronLeft, ChevronRight,
    Calendar as CalendarIcon, Filter, MoreVertical, Save, AlertCircle, Settings,
    Globe, List, Tag, Image as ImageIcon, Check, RefreshCw, AlertTriangle, Link as LinkIcon,
    Music, Sparkles, Utensils, ArrowUpRight, Activity, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { getImageUrl } from '../lib/getImageUrl';
import EventEditModal from '../components/EventEditModal';
import ConfirmationModal from '../components/ConfirmationModal';

const JsonTextarea = ({ label, value, onChange, placeholder }: any) => {
    const [text, setText] = useState(() => JSON.stringify(value, null, 2));
    const [error, setError] = useState('');

    useEffect(() => {
        setText(JSON.stringify(value, null, 2));
    }, [value]);

    const handleBlur = () => {
        try {
            const parsed = JSON.parse(text);
            setError('');
            onChange(parsed);
        } catch (e) {
            setError('Invalid JSON');
        }
    };

    return (
        <div className="space-y-1">
            <label className="text-sm font-medium text-slate-200">{label}</label>
            <textarea
                className={clsx("w-full border p-3 rounded-xl bg-slate-900 text-white font-mono text-xs focus:ring-2 focus:ring-blue-500/20 outline-none transition-shadow", error ? "border-red-500" : "border-slate-800")}
                rows={4}
                placeholder={placeholder}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onBlur={handleBlur}
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    );
};

// --- Types ---
interface FactTranslation {
    fact: string;
}

interface LocalizedContent {
    title: string;
    description: string;
}

interface HistoricalFact {
    year: number;
    fact: string;
    source?: string;
    translations?: {
        [key: string]: FactTranslation;
    };
}

interface ImageData {
    _id: string;
    s3_key: string;
    caption?: string;
    event_id?: string; // Linked Event ID
}

interface TaxonomyItem {
    _id: string;
    code: string;
    translations: {
        [key: string]: { name: string };
    };
}

interface EventData {
    _id?: string;
    slug?: string;
    title: string; // English (Default)
    description?: string; // English (Default)
    category: string; // ID of Category
    date?: string; // Single date (legacy/primary)
    dates?: { year: number; date: string }[]; // Multiple dates
    priority: number;
    tags?: string[]; // IDs of Tags
    is_active?: boolean;
    is_deleted?: boolean;
    deleted_at?: string;
    lottie_overlay?: string; // ID of LottieOverlay
    notification_templates?: {
        discovery?: string;
        countdown?: string;
        eve?: string;
        day_of?: string;
    };
    vibes?: string[]; // IDs of Vibes
    mantras?: string[]; // IDs of Mantras
    historical_significance?: HistoricalFact[];

    // New Fields
    ritual_steps?: any[];
    muhurat?: any;
    ambient_audio?: string;
    countdown_config?: any;
    recipes?: any[];
    dress_guide?: string;
    playlist_links?: string[];

    translations?: {
        [key: string]: LocalizedContent;
    };
}

// --- Initial State ---
const initialFormState: EventData = {
    title: '',
    slug: '',
    category: '', // Empty initially
    date: '',
    dates: [],
    priority: 0,
    tags: [],
    is_active: true,
    is_deleted: false,
    vibes: [],
    mantras: [],
    lottie_overlay: '',
    notification_templates: {},
    description: '',
    historical_significance: [],
    translations: {}
};

interface LottieOverlayItem {
    _id: string;
    title: string;
    filename: string;
}

export default function Events() {
    const [events, setEvents] = useState<EventData[]>([]);
    const [categories, setCategories] = useState<TaxonomyItem[]>([]);
    const [tags, setTags] = useState<TaxonomyItem[]>([]);
    const [vibes, setVibes] = useState<TaxonomyItem[]>([]);
    const [mantras, setMantras] = useState<any[]>([]);
    const [lotties, setLotties] = useState<LottieOverlayItem[]>([]);
    const [audios, setAudios] = useState<any[]>([]);
    const [relatedImages, setRelatedImages] = useState<ImageData[]>([]); // Images linked to THIS event
    const [availableImages, setAvailableImages] = useState<ImageData[]>([]); // All images for picker

    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Image Picker State
    const [showImagePicker, setShowImagePicker] = useState(false);
    const [pickerSearch, setPickerSearch] = useState('');
    const [selectedImages, setSelectedImages] = useState<string[]>([]); // IDs selected in picker

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalEvents, setTotalEvents] = useState(0);

    // Filter State
    const [viewMode, setViewMode] = useState<'active' | 'trash'>('active');

    // Form State
    const [formData, setFormData] = useState<EventData>(initialFormState);
    const [activeLang, setActiveLang] = useState('en');
    const [activeTab, setActiveTab] = useState<'content' | 'settings'>('content');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        isDestructive: false
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1); // Reset to page 1 on search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchEvents(page, debouncedSearch);
        fetchTaxonomy();
        fetchImages();
    }, [page, viewMode, debouncedSearch]);

    useEffect(() => {
        if (editingId) {
            // Fetch images linked to this event
            fetchRelatedImages(editingId);
        } else {
            setRelatedImages([]);
        }
    }, [editingId]);

    const fetchEvents = async (pageNum: number, search?: string) => {
        setLoading(true);
        try {
            const trashQuery = viewMode === 'trash' ? '&trash=true' : '';
            const searchQuery = search ? `&search=${encodeURIComponent(search)}` : '';
            const res = await fetch(`/api/events?page=${pageNum}&limit=10${trashQuery}${searchQuery}`);
            const data = await res.json();
            if (data.success) {
                setEvents(data.data);
                setTotalPages(data.pagination.pages);
                setTotalEvents(data.pagination.total);
            } else {
                toast.error('Failed to load events');
            }
        } catch (error) {
            toast.error('Network error');
        } finally {
            setLoading(false);
        }
    };

    const fetchTaxonomy = async () => {
        try {
            const [catRes, tagRes, vibeRes, lottieRes, audioRes, mantraRes] = await Promise.all([
                fetch('/api/categories'),
                fetch('/api/tags'),
                fetch('/api/vibes'),
                fetch('/api/lotties'),
                fetch('/api/audio?limit=500'),
                fetch('/api/mantras?limit=500')
            ]);
            const catData = await catRes.json();
            const tagData = await tagRes.json();
            const vibeData = await vibeRes.json();
            const lottieData = await lottieRes.json();
            const audioData = await audioRes.json();
            const mantraData = await mantraRes.json();
            if (catData.success) setCategories(catData.data);
            if (tagData.success) setTags(tagData.data);
            if (vibeData.success) setVibes(vibeData.data);
            if (lottieData.success) setLotties(lottieData.data);
            if (audioData.items) setAudios(audioData.items);
            if (mantraData.success) setMantras(mantraData.data);
        } catch (error) {
            console.error('Failed to load taxonomy');
        }
    };

    const fetchImages = async () => {
        try {
            const res = await fetch('/api/images');
            const data = await res.json();
            if (data.success) setAvailableImages(data.data);
        } catch (error) {
            console.error('Failed to load images');
        }
    };

    const fetchRelatedImages = async (eventId: string) => {
        try {
            const res = await fetch(`/api/images?event_id=${eventId}`);
            const data = await res.json();
            if (data.success) setRelatedImages(data.data);
        } catch (error) {
            console.error('Failed to load related images');
        }
    };

    const handleEdit = (evt: EventData) => {
        setFormData({
            ...evt,
            date: evt.date ? new Date(evt.date).toISOString().split('T')[0] : '',
            dates: evt.dates || [],
            tags: evt.tags || [],
            vibes: evt.vibes || [],
            mantras: evt.mantras || [],
            lottie_overlay: evt.lottie_overlay || '',
            notification_templates: evt.notification_templates as { discovery?: string; countdown?: string; eve?: string; day_of?: string; } || {},
            is_active: evt.is_active !== undefined ? evt.is_active : true,

            ritual_steps: evt.ritual_steps || [],
            muhurat: evt.muhurat || {},
            ambient_audio: evt.ambient_audio || '',
            countdown_config: evt.countdown_config || {},
            recipes: evt.recipes || [],
            dress_guide: evt.dress_guide || '',
            playlist_links: evt.playlist_links || [],

            translations: evt.translations || {},
            historical_significance: evt.historical_significance || []
        });
        setEditingId(evt._id!);
        setActiveLang('en');
        setActiveTab('content');
        setShowForm(true);
    };

    // Soft Delete (Move to Trash)
    const handleSoftDelete = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Move to Trash?',
            message: 'This event will be moved to the trash and hidden from the mobile feed. You can restore it later if needed.',
            isDestructive: true,
            onConfirm: async () => {
                try {
                    const res = await fetch(`/api/events?id=${id}`, { method: 'DELETE' });
                    const data = await res.json();
                    if (data.success) {
                        toast.success('Event moved to trash');
                        fetchEvents(page);
                    } else {
                        toast.error(data.error);
                    }
                } catch (error) {
                    toast.error('Failed to delete');
                }
            }
        });
    };

    // Restore from Trash
    const handleRestore = async (id: string) => {
        try {
            const res = await fetch(`/api/events`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _id: id, is_deleted: false })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Event restored successfully');
                fetchEvents(page);
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error('Failed to restore');
        }
    };

    // Permanent Delete
    const handlePermanentDelete = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Permanently?',
            message: 'Caution: This action cannot be undone. All associated image links will be broken and metadata purged from the system.',
            isDestructive: true,
            onConfirm: async () => {
                try {
                    const res = await fetch(`/api/events?id=${id}&permanent=true`, { method: 'DELETE' });
                    const data = await res.json();
                    if (data.success) {
                        toast.success('Event permanently deleted');
                        fetchEvents(page);
                    } else {
                        toast.error(data.error);
                    }
                } catch (error) {
                    toast.error('Failed to delete permanently');
                }
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editingId ? 'PUT' : 'POST';
        const body = editingId ? { ...formData, _id: editingId } : formData;

        const promise = fetch('/api/events', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        }).then(async (res) => {
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return data;
        });

        toast.promise(promise, {
            loading: editingId ? 'Updating event...' : 'Creating event...',
            success: editingId ? 'Event updated!' : 'Event created!',
            error: (err) => `Error: ${err.message}`,
        });

        try {
            await promise;
            setShowForm(false);
            setEditingId(null);
            setFormData(initialFormState);
            fetchEvents(page);
        } catch (error) {
            console.error(error);
        }
    };

    // --- Helper to update form data based on language ---
    const updateField = (field: string, value: any) => {
        if (activeLang === 'en') {
            setFormData({ ...formData, [field]: value });
        } else {
            setFormData({
                ...formData,
                translations: {
                    ...formData.translations,
                    [activeLang]: {
                        ...(formData.translations?.[activeLang] || { title: '', description: '' }),
                        [field]: value
                    }
                }
            });
        }
    };

    const getFieldValue = (field: string) => {
        if (activeLang === 'en') return (formData as any)[field];
        return formData.translations?.[activeLang]?.[field as keyof LocalizedContent] || '';
    };

    // --- Helper for Historical Facts ---
    const updateFact = (index: number, field: string, value: any) => {
        const newFacts = [...(formData.historical_significance || [])];
        if (activeLang === 'en') {
            newFacts[index] = { ...newFacts[index], [field]: value };
        } else {
            const currentFact = newFacts[index];
            const currentTrans = currentFact.translations || {};
            newFacts[index] = {
                ...currentFact,
                translations: {
                    ...currentTrans,
                    [activeLang]: {
                        ...(currentTrans[activeLang] || { fact: '' }),
                        [field]: value
                    }
                }
            };
        }
        setFormData({ ...formData, historical_significance: newFacts });
    };

    const addFact = () => {
        if (activeLang !== 'en') {
            toast('Please switch to English to add new facts.', { icon: 'ℹ️' });
            return;
        }
        setFormData({
            ...formData,
            historical_significance: [...(formData.historical_significance || []), { year: new Date().getFullYear(), fact: '', source: '' }]
        });
    };

    const removeFact = (index: number) => {
        if (activeLang !== 'en') {
            toast('Please switch to English to delete facts.', { icon: 'ℹ️' });
            return;
        }
        const newFacts = [...(formData.historical_significance || [])];
        newFacts.splice(index, 1);
        setFormData({ ...formData, historical_significance: newFacts });
    };

    // --- Helper for Notifications Object ---
    const updateNotification = (key: string, value: string) => {
        setFormData({
            ...formData,
            notification_templates: {
                ...(formData.notification_templates || {}),
                [key]: value
            } as any
        });
    };

    // --- Helper for Dates Array ---
    const addDate = () => {
        setFormData({
            ...formData,
            dates: [...(formData.dates || []), { year: new Date().getFullYear(), date: '' }]
        });
    };

    const updateDate = (index: number, field: string, value: any) => {
        const newDates = [...(formData.dates || [])];
        newDates[index] = { ...newDates[index], [field]: value };
        setFormData({ ...formData, dates: newDates });
    };

    const removeDate = (index: number) => {
        const newDates = [...(formData.dates || [])];
        newDates.splice(index, 1);
        setFormData({ ...formData, dates: newDates });
    };

    // --- Image Linking Logic ---
    const handleUnlinkImage = (imageId: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Unlink Image?',
            message: 'This will remove the association between this image and the current event. The image will remain in the general gallery.',
            isDestructive: true,
            onConfirm: async () => {
                try {
                    const res = await fetch(`/api/images`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ _id: imageId, event_id: null })
                    });
                    const data = await res.json();
                    if (data.success) {
                        toast.success('Image unlinked');
                        fetchRelatedImages(editingId!);
                        fetchImages(); // Refresh available list
                    } else {
                        toast.error('Failed to unlink');
                    }
                } catch (error) {
                    toast.error('Network error');
                }
            }
        });
    };

    const handleLinkSelectedImages = async () => {
        if (selectedImages.length === 0) return;
        try {
            const promises = selectedImages.map(id =>
                fetch(`/api/images`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ _id: id, event_id: editingId })
                })
            );

            await Promise.all(promises);
            toast.success(`Linked ${selectedImages.length} images`);
            fetchRelatedImages(editingId!);
            fetchImages();
            setShowImagePicker(false);
            setSelectedImages([]);
        } catch (error) {
            toast.error('Failed to link images');
        }
    };

    const getCategoryName = (catId: string) => {
        const cat = categories.find(c => c._id === catId);
        return cat ? (cat.translations?.[activeLang]?.name || cat.translations?.['en']?.name || cat.code) : 'Uncategorized';
    };

    const filteredImages = availableImages.filter(img => {
        if (img.event_id === editingId) return false;
        if (pickerSearch) {
            const searchLower = pickerSearch.toLowerCase();
            return img.caption?.toLowerCase().includes(searchLower) || img.s3_key.toLowerCase().includes(searchLower);
        }
        return true;
    });

    return (
        <div className="flex h-screen bg-slate-950 font-sans text-white overflow-hidden">
            <Sidebar />
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                isDestructive={confirmModal.isDestructive}
                onConfirm={() => {
                    confirmModal.onConfirm();
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }}
                onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
            />

            <main className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-slate-950">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20 shadow-inner group">
                            <CalendarIcon className="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-indigo-400">
                                Festival Operations
                            </h1>
                            <p className="text-slate-500 mt-1 uppercase tracking-widest text-[10px] font-bold flex items-center gap-2">
                                <Activity size={12} className="text-emerald-500" /> System: Stable · Registry: <span className="text-white">{totalEvents} Entities</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                setEditingId(null);
                                setFormData(initialFormState);
                                setShowForm(true);
                            }}
                            className="group flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3.5 rounded-2xl font-black shadow-lg shadow-blue-600/20 transition-all active:scale-95 uppercase tracking-widest text-xs"
                        >
                            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                            <span>Register Event</span>
                        </button>
                    </div>
                </div>

                {/* Status Bar: Tabs & Search */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8 bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
                    <div className="flex gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 w-fit shadow-inner">
                        <button
                            onClick={() => { setViewMode('active'); setPage(1); }}
                            className={clsx(
                                "px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                                viewMode === 'active' ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-500 hover:text-slate-300 hover:bg-slate-900"
                            )}
                        >
                            Active Feed
                        </button>
                        <button
                            onClick={() => { setViewMode('trash'); setPage(1); }}
                            className={clsx(
                                "px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2",
                                viewMode === 'trash' ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20" : "text-slate-500 hover:text-slate-300 hover:bg-slate-900"
                            )}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Trash Vault
                        </button>
                    </div>

                    <div className="relative w-full xl:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="QUERY SYSTEM BY TITLE OR SLUG..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 pl-12 pr-12 py-4 rounded-[1.5rem] text-[10px] font-black text-white uppercase tracking-widest focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-slate-700 shadow-inner"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Catalog Grid View */}
                <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-800 overflow-hidden mb-12">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-950/40 border-b border-slate-800 backdrop-blur-md sticky top-0 z-10">
                                <tr>
                                    <th className="p-6 font-black tracking-[0.2em] uppercase text-slate-500 text-[9px]">Identity</th>
                                    <th className="p-6 font-black tracking-[0.2em] uppercase text-slate-500 text-[9px]">Taxonomy</th>
                                    <th className="p-6 font-black tracking-[0.2em] uppercase text-slate-500 text-[9px]">Temporal Data</th>
                                    <th className="p-6 font-black tracking-[0.2em] uppercase text-slate-500 text-[9px]">Integrity Coverage</th>
                                    <th className="p-6 font-black tracking-[0.2em] uppercase text-slate-500 text-[9px] text-right">Ops</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="p-6"><div className="h-4 bg-slate-800 rounded-lg w-3/4"></div></td>
                                            <td className="p-6"><div className="h-6 bg-slate-800 rounded-xl w-20"></div></td>
                                            <td className="p-6"><div className="h-4 bg-slate-800 rounded-lg w-24"></div></td>
                                            <td className="p-6"><div className="h-4 bg-slate-800 rounded-lg w-32"></div></td>
                                            <td className="p-6"></td>
                                        </tr>
                                    ))
                                ) : events.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-20 text-center">
                                            <div className="flex flex-col items-center gap-4 text-slate-600">
                                                <Activity className="w-12 h-12 opacity-10" />
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Entities Detected in current Sector</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : events.map((evt) => (
                                    <motion.tr
                                        key={evt._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-slate-950/40 transition-all group"
                                    >
                                        <td className="p-6">
                                            <div className="font-black text-white uppercase tracking-tight text-sm group-hover:text-blue-400 transition-colors">{evt.title}</div>
                                            {evt.slug && <div className="text-[9px] text-slate-600 font-black mt-1.5 uppercase tracking-widest">{evt.slug}</div>}
                                            {viewMode === 'trash' && evt.deleted_at && (
                                                <div className="text-[9px] text-rose-500/70 font-black mt-2 uppercase tracking-widest flex items-center gap-1">
                                                    <AlertTriangle size={10} /> Purged: {new Date(evt.deleted_at).toLocaleDateString()}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <span className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] border bg-slate-950 text-slate-400 border-slate-800">
                                                    {getCategoryName(evt.category)}
                                                </span>
                                                {!evt.is_active && viewMode === 'active' && (
                                                    <span className="px-2 py-0.5 rounded-lg text-[8px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-tighter">Offline</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-tight">
                                                <Clock size={12} className="text-slate-600" />
                                                {evt.date ? new Date(evt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Cyclical/Recurring'}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <CoverageIcon icon={<Globe size={12} />} count={Object.keys(evt.translations || {}).length} label="Langs" />
                                                <CoverageIcon icon={<List size={12} />} count={evt.historical_significance?.length || 0} label="Facts" />
                                                {evt.ambient_audio && <Music size={14} className="text-emerald-500/50" />}
                                                {(evt.recipes?.length ?? 0) > 0 && <Utensils size={14} className="text-amber-500/50" />}
                                                {(evt.ritual_steps?.length ?? 0) > 0 && <Sparkles size={14} className="text-purple-500/50" />}
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                                {viewMode === 'active' ? (
                                                    <>
                                                        <button onClick={() => handleEdit(evt)} className="p-3 text-slate-400 hover:text-white hover:bg-blue-600 rounded-2xl transition-all shadow-xl active:scale-90" title="Modify Record">
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleSoftDelete(evt._id!)} className="p-3 text-slate-400 hover:text-white hover:bg-rose-600 rounded-2xl transition-all shadow-xl active:scale-90" title="Purge to Trash">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => handleRestore(evt._id!)} className="p-3 text-slate-400 hover:text-white hover:bg-emerald-600 rounded-2xl transition-all shadow-xl active:scale-90" title="Restore Data">
                                                            <RefreshCw className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handlePermanentDelete(evt._id!)} className="p-3 text-slate-400 hover:text-white hover:bg-rose-700 rounded-2xl transition-all shadow-xl active:scale-90" title="Terminal Deletion">
                                                            <AlertTriangle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Interface */}
                    <div className="p-6 border-t border-slate-800 flex justify-between items-center bg-slate-950/40 backdrop-blur-sm">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Sector {page} / {totalPages} · <span className="text-slate-500">{totalEvents} Records Registered</span></span>
                        <div className="flex gap-3">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="p-3 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl active:scale-90"
                            >
                                <ChevronLeft className="w-4 h-4 text-white" />
                            </button>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="p-3 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl active:scale-90"
                            >
                                <ChevronRight className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Registry Management Modal */}
                <EventEditModal
                    showForm={showForm}
                    setShowForm={setShowForm}
                    editingId={editingId}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    activeLang={activeLang}
                    setActiveLang={setActiveLang}
                    formData={formData}
                    setFormData={setFormData}
                    handleSubmit={handleSubmit}
                    getFieldValue={getFieldValue}
                    updateField={updateField}
                    categories={categories}
                    tags={tags}
                    vibes={vibes}
                    mantras={mantras}
                    lotties={lotties}
                    audios={audios}
                    relatedImages={relatedImages}
                    handleUnlinkImage={handleUnlinkImage}
                    setShowImagePicker={setShowImagePicker}
                    updateFact={updateFact}
                    addFact={addFact}
                    removeFact={removeFact}
                    updateNotification={updateNotification}
                    updateDate={updateDate}
                    addDate={addDate}
                    removeDate={removeDate}
                />

                {/* Asset Integration Picker */}
                {/* Asset Integration Picker */}
                <AnimatePresence>
                    {showImagePicker && (
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-[95vw] lg:max-w-[85vw] max-h-[90vh] flex flex-col overflow-hidden"
                            >
                                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                                    <h3 className="text-xl font-bold text-white">Select Media to Link to Event</h3>
                                    <button onClick={() => setShowImagePicker(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-4 border-b border-slate-800 bg-slate-950 flex flex-col sm:flex-row gap-4 justify-between items-center">
                                    <div className="relative w-full sm:w-96">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            className="w-full pl-10 pr-4 py-2 border border-slate-800 bg-slate-900 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-white"
                                            placeholder="Search by caption or phrase..."
                                            value={pickerSearch}
                                            onChange={(e) => setPickerSearch(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-950/50">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                        {filteredImages.map((img) => {
                                            const isSelected = selectedImages.includes(img._id);
                                            return (
                                                <div
                                                    key={img._id}
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            setSelectedImages(prev => prev.filter(id => id !== img._id));
                                                        } else {
                                                            setSelectedImages(prev => [...prev, img._id]);
                                                        }
                                                    }}
                                                    className={clsx(
                                                        "relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer border hover:-translate-y-1 hover:shadow-xl transition-all block group",
                                                        isSelected ? "border-blue-500 ring-2 ring-blue-500/20 shadow-blue-500/20" : "border-slate-800 hover:border-slate-600 shadow-xl shadow-black/20"
                                                    )}
                                                >
                                                    <img
                                                        src={`/api/image-proxy?key=${img.s3_key}`}
                                                        className="w-full h-full object-cover"
                                                        alt={img.caption || 'Image'}
                                                        loading="lazy"
                                                    />

                                                    {/* Status Badges Overlay */}
                                                    <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-10">
                                                        {(img as any).language && (img as any).language !== 'neutral' && (
                                                            <div className="bg-purple-600/90 text-white text-[10px] px-1.5 py-0.5 rounded shadow-md uppercase font-bold backdrop-blur-sm">
                                                                {(img as any).language}
                                                            </div>
                                                        )}
                                                        {(img as any).has_overlay && (
                                                            <div className="bg-emerald-500/90 text-white text-[10px] px-1.5 py-0.5 rounded shadow-md font-bold backdrop-blur-sm">
                                                                DYN
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Bottom Caption Overlay */}
                                                    <div className={clsx(
                                                        "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 pt-6 pb-2.5 transition-all z-10",
                                                        isSelected ? "bg-blue-900/60" : ""
                                                    )}>
                                                        <p className="text-white text-[11px] font-semibold leading-tight truncate">
                                                            {(img as any).caption || 'Untitled Media'}
                                                        </p>
                                                    </div>

                                                    {isSelected && (
                                                        <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center z-20">
                                                            <div className="bg-blue-600 text-white rounded-full p-2 shadow-lg shadow-black/50 scale-125">
                                                                <Check className="w-6 h-6" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {filteredImages.length === 0 && (
                                            <div className="col-span-full text-center py-10 text-slate-400 text-sm">
                                                No matching images found.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 border-t border-slate-800 flex justify-between items-center bg-slate-950">
                                    <span className="text-sm text-slate-400">{selectedImages.length} images selected</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowImagePicker(false)}
                                            className="px-4 py-2 text-slate-300 font-medium hover:bg-slate-700 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleLinkSelectedImages}
                                            disabled={selectedImages.length === 0}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                                        >
                                            Link Selected
                                        </button>
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

function CoverageIcon({ icon, count, label }: { icon: React.ReactNode, count: number, label: string }) {
    return (
        <div className="flex items-center gap-2 group/icon" title={`${count} ${label}`}>
            <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-600 group-hover/icon:text-blue-400 transition-colors">
                {icon}
            </div>
            <span className="text-[10px] font-black text-slate-500 group-hover/icon:text-slate-300 transition-colors">{count}</span>
        </div>
    );
}
