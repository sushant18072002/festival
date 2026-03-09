import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import LanguageTabs from '../components/LanguageTabs';
import {
    Plus, Edit2, Trash2, Search, X, ChevronLeft, ChevronRight,
    Image as ImageIcon, Upload, Save, Tag, Link as LinkIcon,
    RefreshCw, CheckCircle, AlertCircle, Eye, Crop, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getImageUrl } from '../lib/getImageUrl';
import OverlayConfigurator from '../components/OverlayConfigurator';
import ImageCropperModal from '../components/ImageCropperModal';
import ImageEditModal from '../components/ImageEditModal';
import OverlayEditorDialog from '../components/OverlayEditorDialog';
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

interface EventSimple {
    _id: string;
    title: string;
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
    const router = useRouter();

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
        fetchImages();
        fetchMetadata();
    }, [viewMode]);

    const fetchImages = async () => {
        setLoading(true);
        try {
            const query = viewMode === 'trash' ? '?trash=true' : '';
            const res = await fetch(`/api/images${query}`);
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

    const handleDelete = async (id: string, permanent = false) => {
        const msg = permanent
            ? 'Are you sure you want to PERMANENTLY delete this image?'
            : 'Move this image to trash?';

        if (!confirm(msg)) return;

        try {
            const query = permanent ? `?id=${id}&permanent=true` : `?id=${id}`;
            const res = await fetch(`/api/images${query}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                toast.success(permanent ? 'Permanently deleted' : 'Moved to trash');
                fetchImages();
                if (editingImage?._id === id) setEditingImage(null);
            }
        } catch (error) {
            toast.error('Failed to delete');
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
                toast.success('Image restored');
                fetchImages();
            }
        } catch (error) {
            toast.error('Failed to restore');
        }
    };

    const filteredImages = images.filter(img => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (img.caption?.toLowerCase() || '').includes(q) || img.s3_key.toLowerCase().includes(q);
    });

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
        // Convert Blob to File
        const fileToUpload = new File([croppedBlob], cropFile.name, { type: cropFile.type });

        uploadData.append('file', fileToUpload);
        uploadData.append('caption', cropFile.name);

        const toastId = toast.loading('Uploading cropped image to S3...');
        try {
            const res = await fetch('/api/images', {
                method: 'POST',
                body: uploadData,
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Upload successful', { id: toastId });
                fetchImages();
            } else {
                toast.error(data.error || 'Upload failed', { id: toastId });
            }
        } catch (error) {
            toast.error('Upload failed', { id: toastId });
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
                toast.success('Image updated');
                setEditingImage(null);
                fetchImages();
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error('Update failed');
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
        <div className="flex h-screen bg-slate-950 font-sans text-white">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                <ImageIcon className="w-6 h-6 text-emerald-400" />
                            </div>
                            Gallery
                        </h1>
                        <p className="text-slate-400 mt-2">Manage your visual assets and media library.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* View Toggle */}
                        <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex shadow-md shadow-black/20">
                            <button
                                onClick={() => setViewMode('active')}
                                className={clsx(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                    viewMode === 'active' ? "bg-slate-800 text-white shadow-md shadow-black/20" : "text-slate-400 hover:text-slate-200"
                                )}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => setViewMode('trash')}
                                className={clsx(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                                    viewMode === 'trash' ? "bg-red-50 text-red-700 shadow-md shadow-black/20" : "text-slate-400 hover:text-slate-200"
                                )}
                            >
                                <Trash2 className="w-4 h-4" />
                                Trash
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
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                        >
                            <Upload className="w-4 h-4" />
                            <span>Upload Image</span>
                        </button>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 w-fit">
                        <button
                            onClick={() => setViewMode('active')}
                            className={clsx(
                                "px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                viewMode === 'active' ? "bg-blue-50 text-blue-700 shadow-md shadow-black/20" : "text-slate-400 hover:bg-slate-950"
                            )}
                        >
                            Active Media
                        </button>
                        <button
                            onClick={() => setViewMode('trash')}
                            className={clsx(
                                "px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2",
                                viewMode === 'trash' ? "bg-red-50 text-red-700 shadow-md shadow-black/20" : "text-slate-400 hover:bg-slate-950"
                            )}
                        >
                            <Trash2 className="w-4 h-4" />
                            Trash
                        </button>
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search images..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                // Optional: update URL
                                router.replace({
                                    pathname: router.pathname,
                                    query: { ...router.query, search: e.target.value || undefined }
                                }, undefined, { shallow: true });
                            }}
                            className="w-full bg-slate-900 border border-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    router.replace({ pathname: router.pathname }, undefined, { shallow: true });
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Gallery Grid */}
                {filteredImages.length === 0 && !loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                        <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                        <p>No images found {searchQuery ? 'matching your search' : 'in ' + viewMode}.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {loading ? (
                            [...Array(10)].map((_, i) => (
                                <div key={i} className="aspect-[3/4] bg-slate-700 rounded-2xl animate-pulse" />
                            ))
                        ) : filteredImages.map((img) => (
                            <motion.div
                                key={img._id}
                                layoutId={`image-${img._id}`}
                                className="group relative aspect-[3/4] bg-slate-900 rounded-2xl shadow-lg shadow-black/40 border border-slate-800 overflow-hidden hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1.5"
                            >
                                <img
                                    src={getImageUrl(img.s3_key)}
                                    alt={img.caption || ''}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />

                                {/* Crop shortcut (top-left) */}
                                {viewMode === 'active' && (
                                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setCropFile(null); setIsCropperOpen(false); /* note: crop on existing image not yet supported - opens upload */ fileInputRef.current?.click(); }}
                                            className="p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-lg backdrop-blur-sm transition-colors"
                                            title="Re-crop / Upload New"
                                        >
                                            <Crop className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}

                                {/* Status Badges (Top Right) */}
                                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                                    {img.is_optimized && (
                                        <div className="bg-green-500/90 p-1 rounded-full text-white shadow-md shadow-black/20" title="Optimized">
                                            <CheckCircle className="w-3 h-3" />
                                        </div>
                                    )}
                                    {img.is_s3_uploaded && (
                                        <div className="bg-blue-500/90 p-1 rounded-full text-white shadow-md shadow-black/20" title="Uploaded to S3">
                                            <Upload className="w-3 h-3" />
                                        </div>
                                    )}
                                    {img.language && img.language !== 'neutral' && (
                                        <div className="bg-purple-600/90 px-1.5 py-0.5 rounded text-[10px] font-bold text-white shadow-md shadow-black/20 uppercase backdrop-blur-sm">
                                            {img.language}
                                        </div>
                                    )}
                                    {img.has_overlay && (
                                        <div className="bg-emerald-500/90 p-1 rounded-full text-white shadow-md shadow-black/20" title="Has Dynamic Overlay">
                                            <Layers className="w-3 h-3" />
                                        </div>
                                    )}
                                </div>

                                {/* Always-visible bottom info bar */}
                                {(img.caption || img.greeting_id) && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-3 pt-6 pb-2.5 pointer-events-none group-hover:opacity-0 transition-opacity duration-200">
                                        {img.caption && (
                                            <p className="text-white text-[11px] font-semibold leading-tight truncate"
                                                style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
                                                {img.caption}
                                            </p>
                                        )}
                                        {img.has_overlay && img.greeting_id && typeof img.greeting_id === 'object' && (
                                            <p className="text-white/70 text-[9px] italic leading-tight line-clamp-1 mt-0.5"
                                                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                                                ✦ {img.greeting_id?.text?.substring(0, 45)}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Overlay Actions */}
                                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4 z-20">
                                    <p className="text-white font-bold truncate text-sm drop-shadow-md">{img.caption || 'Untitled'}</p>

                                    <div className="flex items-center gap-2 mt-3">
                                        {viewMode === 'active' ? (
                                            <>
                                                <button
                                                    onClick={() => handleEdit(img)}
                                                    className="flex-1 bg-slate-900/20 hover:bg-slate-900/30 text-white py-1.5 rounded-lg text-xs font-medium backdrop-blur-sm transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setOverlayImage(img); }}
                                                    className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-200 rounded-lg backdrop-blur-sm transition-colors"
                                                    title="Overlay Editor"
                                                >
                                                    <Layers className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(img._id); }}
                                                    className="p-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-200 rounded-lg backdrop-blur-sm transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleRestore(img._id)}
                                                    className="flex-1 bg-green-500/80 hover:bg-green-600 text-white py-1.5 rounded-lg text-xs font-medium backdrop-blur-sm transition-colors"
                                                >
                                                    Restore
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(img._id, true)}
                                                    className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg backdrop-blur-sm transition-colors"
                                                    title="Delete Forever"
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
                    handleDelete={handleDelete}
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
