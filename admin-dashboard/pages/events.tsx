import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import LanguageTabs from '../components/LanguageTabs';
import {
    Plus, Edit2, Trash2, Search, X, ChevronLeft, ChevronRight,
    Calendar as CalendarIcon, Filter, MoreVertical, Save, AlertCircle, Settings,
    Globe, List, Tag, Image as ImageIcon, Check, RefreshCw, AlertTriangle, Link as LinkIcon,
    Music, Sparkles, Utensils
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { getImageUrl } from '../lib/getImageUrl';
import EventEditModal from '../components/EventEditModal';

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
    notification_templates?: string[];
    vibes?: string[]; // IDs of Vibes
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
    lottie_overlay: '',
    notification_templates: [],
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

    useEffect(() => {
        fetchEvents(page);
        fetchTaxonomy();
        fetchImages();
    }, [page, viewMode]);

    useEffect(() => {
        if (editingId) {
            // Fetch images linked to this event
            fetchRelatedImages(editingId);
        } else {
            setRelatedImages([]);
        }
    }, [editingId]);

    const fetchEvents = async (pageNum: number) => {
        setLoading(true);
        try {
            const trashQuery = viewMode === 'trash' ? '&trash=true' : '';
            const res = await fetch(`/api/events?page=${pageNum}&limit=10${trashQuery}`);
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
            const [catRes, tagRes, vibeRes, lottieRes, audioRes] = await Promise.all([
                fetch('/api/categories'),
                fetch('/api/tags'),
                fetch('/api/vibes'),
                fetch('/api/lotties'),
                fetch('/api/audio?limit=500')
            ]);
            const catData = await catRes.json();
            const tagData = await tagRes.json();
            const vibeData = await vibeRes.json();
            const lottieData = await lottieRes.json();
            const audioData = await audioRes.json();
            if (catData.success) setCategories(catData.data);
            if (tagData.success) setTags(tagData.data);
            if (vibeData.success) setVibes(vibeData.data);
            if (lottieData.success) setLotties(lottieData.data);
            if (audioData.items) setAudios(audioData.items);
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
            lottie_overlay: evt.lottie_overlay || '',
            notification_templates: evt.notification_templates || [],
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
    const handleSoftDelete = async (id: string) => {
        if (!confirm('Move this event to trash?')) return;
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
    };

    // Restore from Trash
    const handleRestore = async (id: string) => {
        try {
            // We reuse the PUT endpoint but set is_deleted to false
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
    const handlePermanentDelete = async (id: string) => {
        if (!confirm('PERMANENTLY DELETE this event? This cannot be undone and will unlink all associated images.')) return;
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

    // --- Helper for Notifications Array ---
    const addNotification = () => {
        setFormData({
            ...formData,
            notification_templates: [...(formData.notification_templates || []), '']
        });
    };

    const updateNotification = (index: number, value: string) => {
        const newNotifs = [...(formData.notification_templates || [])];
        newNotifs[index] = value;
        setFormData({ ...formData, notification_templates: newNotifs });
    };

    const removeNotification = (index: number) => {
        const newNotifs = [...(formData.notification_templates || [])];
        newNotifs.splice(index, 1);
        setFormData({ ...formData, notification_templates: newNotifs });
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
    const handleUnlinkImage = async (imageId: string) => {
        if (!confirm('Unlink this image from the event?')) return;
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
    };

    const handleLinkSelectedImages = async () => {
        if (selectedImages.length === 0) return;
        try {
            // We need to update each image. For now, do it in parallel.
            // Ideally, the API should support bulk updates.
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

    // Filter available images for the picker
    const filteredImages = availableImages.filter(img => {
        // Exclude already linked images
        if (img.event_id === editingId) return false;

        // Language Filter (Optional: Strict or Loose?)
        // For now, show 'neutral' images AND images matching the active language (if not 'en')
        // OR show all if activeLang is 'en' (admin default)
        // Let's make it simple: Show all, but sort/highlight matching ones?
        // User asked to "ensure hindi text image... will show on hindi select event"
        // So we should probably filter by language if a search/filter is active.

        // Search filter
        if (pickerSearch) {
            const searchLower = pickerSearch.toLowerCase();
            return img.caption?.toLowerCase().includes(searchLower) || img.s3_key.toLowerCase().includes(searchLower);
        }
        return true;
    });

    return (
        <div className="flex h-screen bg-slate-950 font-sans">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                            <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20">
                                <CalendarIcon className="w-6 h-6 text-purple-400" />
                            </div>
                            Events
                        </h1>
                        <p className="text-slate-400 mt-2">Manage your festival calendar and content.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                setEditingId(null);
                                setFormData(initialFormState);
                                setShowForm(true);
                            }}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Event</span>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-slate-900 p-1 rounded-xl border border-slate-800 w-fit">
                    <button
                        onClick={() => { setViewMode('active'); setPage(1); }}
                        className={clsx(
                            "px-4 py-2 text-sm font-medium rounded-lg transition-all",
                            viewMode === 'active' ? "bg-blue-50 text-blue-700 shadow-md shadow-black/20" : "text-slate-400 hover:bg-slate-950"
                        )}
                    >
                        Active Events
                    </button>
                    <button
                        onClick={() => { setViewMode('trash'); setPage(1); }}
                        className={clsx(
                            "px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2",
                            viewMode === 'trash' ? "bg-red-50 text-red-700 shadow-md shadow-black/20" : "text-slate-400 hover:bg-slate-950"
                        )}
                    >
                        <Trash2 className="w-4 h-4" />
                        Trash
                    </button>
                </div>

                {/* Table Section */}
                <div className="bg-slate-900 rounded-2xl shadow-md shadow-black/20 border border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-950/80 border-b border-slate-800 backdrop-blur-md sticky top-0 z-10">
                                <tr>
                                    <th className="p-5 font-bold tracking-wider uppercase text-slate-400 text-xs text-left">Title</th>
                                    <th className="p-5 font-bold tracking-wider uppercase text-slate-400 text-xs text-left">Category</th>
                                    <th className="p-5 font-bold tracking-wider uppercase text-slate-400 text-xs text-left">Date</th>
                                    <th className="p-5 font-bold tracking-wider uppercase text-slate-400 text-xs text-left">Stats</th>
                                    <th className="p-5 font-bold tracking-wider uppercase text-slate-400 text-xs text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="p-5"><div className="h-4 bg-slate-800 rounded w-3/4"></div></td>
                                            <td className="p-5"><div className="h-6 bg-slate-800 rounded-full w-20"></div></td>
                                            <td className="p-5"><div className="h-4 bg-slate-800 rounded w-24"></div></td>
                                            <td className="p-5"><div className="h-4 bg-slate-800 rounded w-8"></div></td>
                                            <td className="p-5"></td>
                                        </tr>
                                    ))
                                ) : events.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-10 text-center text-slate-400">
                                            No events found in {viewMode}.
                                        </td>
                                    </tr>
                                ) : events.map((evt) => (
                                    <motion.tr
                                        key={evt._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-slate-950/80 transition-colors group"
                                    >
                                        <td className="p-5">
                                            <div className="font-medium text-white">{evt.title}</div>
                                            {evt.slug && <div className="text-xs text-slate-400 font-mono mt-1">{evt.slug}</div>}
                                            {viewMode === 'trash' && evt.deleted_at && (
                                                <div className="text-xs text-red-500 mt-1">
                                                    Deleted: {new Date(evt.deleted_at).toLocaleDateString()}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-5">
                                            <span className="px-3 py-1 rounded-full text-xs font-medium border bg-slate-800 text-slate-300 border-slate-800">
                                                {getCategoryName(evt.category)}
                                            </span>
                                            {!evt.is_active && viewMode === 'active' && (
                                                <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-400">INACTIVE</span>
                                            )}
                                        </td>
                                        <td className="p-5 text-slate-400 text-sm">
                                            {evt.date ? new Date(evt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recurring'}
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-3 text-xs text-slate-400">
                                                <div className="flex items-center gap-1" title="Translations">
                                                    <Globe className="w-3 h-3" />
                                                    <span>{Object.keys(evt.translations || {}).length}</span>
                                                </div>
                                                <div className="flex items-center gap-1" title="Facts">
                                                    <List className="w-3 h-3" />
                                                    <span>{evt.historical_significance?.length || 0}</span>
                                                </div>
                                                {evt.ambient_audio && (
                                                    <div className="flex items-center gap-1 text-emerald-400" title="Has Ambient Audio">
                                                        <Music className="w-3.5 h-3.5" />
                                                    </div>
                                                )}
                                                {evt.recipes && evt.recipes.length > 0 && (
                                                    <div className="flex items-center gap-1 text-amber-500" title={`${evt.recipes.length} Recipes`}>
                                                        <Utensils className="w-3.5 h-3.5" />
                                                    </div>
                                                )}
                                                {evt.ritual_steps && evt.ritual_steps.length > 0 && (
                                                    <div className="flex items-center gap-1 text-purple-400" title={`${evt.ritual_steps.length} Ritual Steps`}>
                                                        <Sparkles className="w-3.5 h-3.5" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {viewMode === 'active' ? (
                                                    <>
                                                        <button onClick={() => handleEdit(evt)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleSoftDelete(evt._id!)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Move to Trash">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => handleRestore(evt._id!)} className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Restore">
                                                            <RefreshCw className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handlePermanentDelete(evt._id!)} className="p-2 text-slate-400 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors" title="Delete Forever">
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

                    {/* Pagination */}
                    <div className="p-4 border-t border-slate-800 flex justify-between items-center bg-slate-950/50">
                        <span className="text-sm text-slate-400">Page {page} of {totalPages}</span>
                        <div className="flex gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="p-2 border border-slate-800 rounded-lg hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 text-slate-300" />
                            </button>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="p-2 border border-slate-800 rounded-lg hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 text-slate-300" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modal Form */}
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
                    lotties={lotties}
                    relatedImages={relatedImages}
                    handleUnlinkImage={handleUnlinkImage}
                    setShowImagePicker={setShowImagePicker}
                    updateFact={updateFact}
                    addFact={addFact}
                    removeFact={removeFact}
                    updateNotification={updateNotification}
                    addNotification={addNotification}
                    removeNotification={removeNotification}
                    updateDate={updateDate}
                    addDate={addDate}
                    removeDate={removeDate}
                />

                {/* IMAGE PICKER MODAL */}
                <AnimatePresence>
                    {
                        showImagePicker && (
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
                        )
                    }
                </AnimatePresence>
            </main>
        </div>
    );
}
