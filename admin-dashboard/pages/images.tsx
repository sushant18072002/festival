import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import LanguageTabs from '../components/LanguageTabs';
import {
    Plus, Edit2, Trash2, Search, X, ChevronLeft, ChevronRight,
    Image as ImageIcon, Upload, Save, Tag, Link as LinkIcon,
    RefreshCw, CheckCircle, AlertCircle, Eye, Crop, Layers,
    Maximize2, ArrowUpRight, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getImageUrl } from '../lib/getImageUrl';
import OverlayConfigurator from '../components/OverlayConfigurator';
import ImageCropperModal from '../components/ImageCropperModal';
import ImageEditModal from '../components/ImageEditModal';
import OverlayEditorDialog from '../components/OverlayEditorDialog';
import ConfirmationModal from '../components/ConfirmationModal';
import clsx from 'clsx';
import { useRouter } from 'next/router';

// --- Types ---
interface LocalizedImageContent {
    caption?: string;
    share_text?: string;
    alt_text?: string;
}

interface TaxonomyItem {
    _id: string;
    code: string;
    translations: {
        [key: string]: { name: string };
    };
}

interface ImageData {
    _id: string;
    filename: string;
    s3_key: string;
    tags?: string[];
    categories?: string[];
    media_type: 'image' | 'video' | 'gif';
    mime_type?: string;
    is_optimized?: boolean;
    is_s3_uploaded?: boolean;
    is_deleted?: boolean;

    // Metrics
    downloads_count: number;
    shares_count: number;
    likes_count: number;

    // Content
    caption?: string;
    share_text?: string;
    credits?: string;
    language: string; // Added language field

    // Standalone & Overlay
    is_standalone?: boolean;
    standalone_category?: string;
    has_overlay?: boolean;
    show_watermark?: boolean;
    greeting_id?: string | any;
    greeting_config?: any;
    quote_id?: string | any;
    quote_config?: any;

    created_at?: string; // Added created_at

    translations?: {
        [key: string]: LocalizedImageContent;
    };
}

// --- Initial State ---
const initialFormState: Partial<ImageData> = {
    caption: '',
    share_text: '',
    credits: '',
    tags: [], categories: [], media_type: 'image', language: 'neutral',
    is_standalone: false, has_overlay: false,
    translations: {}
};

export default function Images() {
    const [images, setImages] = useState<ImageData[]>([]);
    const [categories, setCategories] = useState<TaxonomyItem[]>([]);
    const [tags, setTags] = useState<TaxonomyItem[]>([]);
    const [greetings, setGreetings] = useState<any[]>([]);
    const [quotes, setQuotes] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [editingImage, setEditingImage] = useState<ImageData | null>(null);
    const [viewMode, setViewMode] = useState<'active' | 'trash'>('active');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const router = useRouter();

    // Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        id: '',
        title: '',
        message: '',
        permanent: false
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Form State
    const [formData, setFormData] = useState<Partial<ImageData>>(initialFormState);
    const [activeLang, setActiveLang] = useState('en');

    // Overlay Editor State
    const [overlayImage, setOverlayImage] = useState<ImageData | null>(null);

    // Cropper State
    const [cropFile, setCropFile] = useState<File | null>(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);

    // Upload Ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (router.isReady) {
            const initialSearch = router.query.search as string;
            if (initialSearch) {
                setSearchQuery(initialSearch);
            }
        }
    }, [router.isReady, router.query.search]);

    useEffect(() => {
        fetchImages(debouncedSearch);
        fetchMetadata();
    }, [viewMode, debouncedSearch]);

    const fetchImages = async (search?: string) => {
        setLoading(true);
        try {
            const trashQuery = viewMode === 'trash' ? 'trash=true' : '';
            const searchQueryParam = search ? `search=${encodeURIComponent(search)}` : '';
            const queryString = [trashQuery, searchQueryParam].filter(Boolean).join('&');
            const res = await fetch(`/api/images${queryString ? '?' + queryString : ''}`);
            const data = await res.json();
            if (data.success) setImages(data.data);
        } catch (error) {
            toast.error('Failed to load images');
        } finally {
            setLoading(false);
        }
    };

    const fetchMetadata = async () => {
        try {
            const [catRes, tagRes, greetRes, quoteRes] = await Promise.all([
                fetch('/api/categories'),
                fetch('/api/tags'),
                fetch('/api/greetings?limit=100'),
                fetch('/api/quotes?limit=100')
            ]);
            const catData = await catRes.json();
            const tagData = await tagRes.json();
            const greetData = await greetRes.json();
            const quoteData = await quoteRes.json();

            if (catData.success) setCategories(catData.data);
            if (tagData.success) setTags(tagData.data);
            if (greetData.success) setGreetings(greetData.data);
            if (quoteData.success) setQuotes(quoteData.data);
        } catch (error) {
            console.error('Failed to load metadata');
        }
    };

    const handleEdit = (img: ImageData) => {
        setEditingImage(img);

        let greetingId = img.greeting_id;
        if (typeof greetingId === 'object' && greetingId !== null) {
            greetingId = (greetingId as any)._id;
        }

        let quoteId = img.quote_id;
        if (typeof quoteId === 'object' && quoteId !== null) {
            quoteId = (quoteId as any)._id;
        }

        setFormData({
            ...img,
            greeting_id: greetingId as string,
            quote_id: quoteId as string,
            show_watermark: img.show_watermark !== undefined ? img.show_watermark : true,
            tags: (img.tags || []).map(t => (typeof t === 'object' && t !== null) ? (t as any)._id : t),
            categories: (img.categories || []).map(c => (typeof c === 'object' && c !== null) ? (c as any)._id : c),
            translations: img.translations || {}
        });
        setActiveLang('en');
    };

    const triggerDeleteModal = (id: string, permanent = false) => {
        setConfirmModal({
            isOpen: true,
            id,
            title: permanent ? 'Purge Image Permanently?' : 'Archive to Trash?',
            message: permanent 
                ? 'Warning: This action is final. The asset metadata and binary links will be purged from the registry.' 
                : 'The image will be moved to the trash and hidden from system feeds. You can restore it from the Trash vault.',
            permanent
        });
    };

    const handleConfirmDelete = async () => {
        const { id, permanent } = confirmModal;
        try {
            const query = permanent ? `?id=${id}&permanent=true` : `?id=${id}`;
            const res = await fetch(`/api/images${query}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                toast.success(permanent ? 'Asset Purged' : 'Asset Archived');
                fetchImages();
                if (editingImage?._id === id) setEditingImage(null);
            }
        } catch (error) {
            toast.error('Deletion Protocol Failure');
        } finally {
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
    };

    const handleRestore = async (id: string) => {
        try {
            const res = await fetch('/api/images', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _id: id, is_deleted: false }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Asset Restored');
                fetchImages();
            }
        } catch (error) {
            toast.error('Restoration Protocol Failure');
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCropFile(file);
        setIsCropperOpen(true);
        if (fileInputRef.current) fileInputRef.current.value = ''; // Reset to allow re-selection
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        setIsCropperOpen(false);
        if (!cropFile) return;

        const uploadData = new FormData();
        const fileToUpload = new File([croppedBlob], cropFile.name, { type: cropFile.type });

        uploadData.append('file', fileToUpload);
        uploadData.append('caption', cropFile.name);

        const toastId = toast.loading('S3 BUCKET SYNC: UPLOADING...');
        try {
            const res = await fetch('/api/images', {
                method: 'POST',
                body: uploadData,
            });
            const data = await res.json();
            if (data.success) {
                toast.success('STORAGE SYNC COMPLETE', { id: toastId });
                fetchImages();
            } else {
                toast.error(data.error || 'UPLOADER FAILURE', { id: toastId });
            }
        } catch (error) {
            toast.error('TERMINAL SYNC ERROR', { id: toastId });
        } finally {
            setCropFile(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingImage) return;

        try {
            const res = await fetch('/api/images', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, _id: editingImage._id }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Asset Registry Updated');
                setEditingImage(null);
                fetchImages();
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error('Registry Update Failure');
        }
    };

    const updateField = (field: string, value: any) => {
        if (activeLang === 'en') {
            setFormData({ ...formData, [field]: value });
        } else {
            setFormData({
                ...formData,
                translations: {
                    ...formData.translations,
                    [activeLang]: {
                        ...(formData.translations?.[activeLang] || {}),
                        [field]: value
                    }
                }
            });
        }
    };

    const getFieldValue = (field: string) => {
        if (activeLang === 'en') return (formData as any)[field];
        return formData.translations?.[activeLang]?.[field as keyof LocalizedImageContent] || '';
    };

    return (
        <div className="flex h-screen bg-slate-950 font-sans text-white overflow-hidden">
            <Sidebar />
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                isDestructive={true}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
            />

            <main className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-slate-950">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-inner group">
                            <ImageIcon className="w-8 h-8 text-emerald-400 group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-emerald-200 to-teal-400">
                                Visual Repository
                            </h1>
                            <p className="text-slate-500 mt-1 uppercase tracking-widest text-[10px] font-bold flex items-center gap-2">
                                <Activity size={12} className="text-emerald-500" /> S3 BUCKET: ACTIVE · ASSETS: <span className="text-white">{images.length} Objects</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* View Toggle */}
                        <div className="bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 flex shadow-inner">
                            <button
                                onClick={() => setViewMode('active')}
                                className={clsx(
                                    "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    viewMode === 'active' ? "bg-slate-950 text-white shadow-lg border border-slate-800" : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                Active Feed
                            </button>
                            <button
                                onClick={() => setViewMode('trash')}
                                className={clsx(
                                    "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                    viewMode === 'trash' ? "bg-rose-600/20 text-rose-500 shadow-lg border border-rose-500/30" : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Trash vault
                            </button>
                        </div>

                        {/* Upload Button */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleUpload}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="group flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3.5 rounded-2xl font-black shadow-lg shadow-blue-600/20 transition-all active:scale-95 uppercase tracking-widest text-xs"
                        >
                            <Upload className="w-4 h-4 transition-transform group-hover:-translate-y-1" />
                            <span>Inbound Sync</span>
                        </button>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-10 bg-slate-900/40 p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                             <Tag size={16} className="text-slate-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Global Taxonomy</p>
                            <p className="text-sm font-black text-white uppercase">{categories.length} Categories Integrated</p>
                        </div>
                    </div>

                    <div className="relative w-full xl:w-[32rem] group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="QUERY REPOSITORY BY CAPTION OR KEY..."
                            value={searchQuery}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSearchQuery(val);
                                router.replace({
                                    pathname: router.pathname,
                                    query: val ? { ...router.query, search: val } : { ...router.query, search: undefined }
                                }, undefined, { shallow: true });
                            }}
                            className="w-full bg-slate-950 border border-slate-800 pl-12 pr-12 py-4 rounded-[1.5rem] text-[10px] font-black text-white uppercase tracking-widest focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-slate-700 shadow-inner"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    router.replace({ pathname: router.pathname }, undefined, { shallow: true });
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Gallery Grid */}
                {images.length === 0 && !loading ? (
                    <div className="flex flex-col items-center justify-center p-32 bg-slate-900/20 rounded-[3rem] border border-slate-800 border-dashed">
                        <ImageIcon className="w-16 h-16 mb-6 text-slate-800 animate-pulse" />
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Grid Empty: No Objects Detected</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                        {loading ? (
                            [...Array(12)].map((_, i) => (
                                <div key={i} className="aspect-[3/4] bg-slate-800/50 rounded-[2rem] animate-pulse border border-slate-800" />
                            ))
                        ) : images.map((img) => (
                            <motion.div
                                key={img._id}
                                layoutId={`image-${img._id}`}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="group relative aspect-[3/4] bg-slate-900 rounded-[2.2rem] shadow-2xl border border-slate-800 overflow-hidden hover:border-emerald-500/40 hover:shadow-emerald-500/10 transition-all duration-500 hover:-translate-y-2"
                            >
                                <img
                                    src={getImageUrl(img.s3_key)}
                                    alt={img.caption || ''}
                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110"
                                    loading="lazy"
                                />

                                {/* Crop shortcut (top-left) */}
                                {viewMode === 'active' && (
                                    <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0 z-10">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                            className="p-2.5 bg-slate-950/80 border border-slate-800 hover:border-blue-500/50 text-white rounded-xl backdrop-blur-md shadow-2xl transition-all active:scale-90"
                                            title="Replace Source"
                                        >
                                            <RefreshCw className="w-3.5 h-3.5 font-bold" />
                                        </button>
                                    </div>
                                )}

                                {/* Status Badges (Top Right) */}
                                <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
                                    {img.language && img.language !== 'neutral' && (
                                        <div className="bg-purple-600/80 border border-purple-500/30 px-2 py-0.5 rounded-lg text-[8px] font-black text-white shadow-2xl uppercase backdrop-blur-md tracking-widest">
                                            {img.language}
                                        </div>
                                    )}
                                    <div className="flex gap-1.5 translate-x-[10px] opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                        {img.is_optimized && (
                                            <div className="bg-emerald-500/20 border border-emerald-500/40 p-1.5 rounded-lg text-emerald-400 backdrop-blur-md" title="Optimized">
                                                <CheckCircle className="w-3 h-3" />
                                            </div>
                                        )}
                                        {img.has_overlay && (
                                            <div className="bg-blue-500/20 border border-blue-500/40 p-1.5 rounded-lg text-blue-400 backdrop-blur-md" title="Layer Configuration Active">
                                                <Layers className="w-3 h-3" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Bottom Info Bar (Always visible but fades on hover) */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent px-5 pt-10 pb-5 pointer-events-none group-hover:opacity-0 transition-all duration-300">
                                    <p className="text-white text-[11px] font-black uppercase tracking-widest leading-none truncate">
                                        {img.caption || 'UNSYNCHRONIZED'}
                                    </p>
                                    <div className="flex items-center gap-3 mt-3">
                                        <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                                            <ImageIcon size={10} /> {img.media_type || 'IMG'}
                                        </div>
                                        <div className="w-1 h-1 bg-slate-800 rounded-full" />
                                        <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                                            <Maximize2 size={10} /> 1:1 SQR
                                        </div>
                                    </div>
                                </div>

                                {/* Hover Actions Overlay */}
                                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6 z-20">
                                    <div className="mb-auto">
                                         <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">Entity Details</p>
                                         <h4 className="text-sm font-black text-white uppercase tracking-tight leading-tight line-clamp-2">{img.caption || 'Registered Object'}</h4>
                                    </div>

                                    <div className="flex items-center gap-2 mt-6">
                                        {viewMode === 'active' ? (
                                            <>
                                                <button
                                                    onClick={() => handleEdit(img)}
                                                    className="flex-1 bg-white text-slate-950 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl"
                                                >
                                                    Modify
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setOverlayImage(img); }}
                                                    className="p-2.5 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-emerald-400 rounded-xl transition-all shadow-xl active:scale-90"
                                                    title="Layer Config"
                                                >
                                                    <Layers className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); triggerDeleteModal(img._id); }}
                                                    className="p-2.5 bg-slate-900 border border-slate-800 hover:border-rose-500/50 text-rose-500 rounded-xl transition-all shadow-xl active:scale-90"
                                                    title="Archival Purge"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleRestore(img._id)}
                                                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl"
                                                >
                                                    Restore
                                                </button>
                                                <button
                                                    onClick={() => triggerDeleteModal(img._id, true)}
                                                    className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-rose-600 text-rose-500 hover:text-white rounded-xl transition-all shadow-xl active:scale-90"
                                                    title="Terminal Erasure"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Edit Modal Component */}
                <ImageEditModal
                    editingImage={editingImage}
                    setEditingImage={setEditingImage}
                    formData={formData}
                    setFormData={setFormData}
                    activeLang={activeLang}
                    setActiveLang={setActiveLang}
                    getFieldValue={getFieldValue}
                    updateField={updateField}
                    categories={categories}
                    tags={tags}
                    greetings={greetings}
                    quotes={quotes}
                    viewMode={viewMode}
                    handleSubmit={handleSubmit}
                    handleDelete={(id) => triggerDeleteModal(id)}
                    handleRestore={handleRestore}
                />

                <ImageCropperModal
                    isOpen={isCropperOpen}
                    imageFile={cropFile}
                    onClose={() => {
                        setIsCropperOpen(false);
                        setCropFile(null);
                    }}
                    onCropComplete={handleCropComplete}
                />

                {/* Overlay Editor Dialog (full-screen) */}
                {overlayImage && (
                    <OverlayEditorDialog
                        image={overlayImage}
                        greetings={greetings}
                        quotes={quotes}
                        onClose={() => setOverlayImage(null)}
                        onSave={async (updates) => {
                            const res = await fetch('/api/images', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(updates),
                            });
                            const data = await res.json();
                            if (!data.success) throw new Error(data.error);
                            fetchImages();
                        }}
                    />
                )}
            </main>
        </div>
    );
}

