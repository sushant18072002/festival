import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Save, Link as LinkIcon, Crop } from 'lucide-react';
import LanguageTabs from './LanguageTabs';
import { getImageUrl } from '../lib/getImageUrl';
import OverlayConfigurator from './OverlayConfigurator';
import clsx from 'clsx';
import { OverlayConfig } from './OverlayConfigurator';

// Helper: absolute CSS for the phone frame inner container (full-width spans + corners)
const getOverlayStyle = (position: string = 'bottom'): React.CSSProperties => {
    switch (position) {
        case 'top': return { top: '5%', left: '4%', right: '4%' };
        case 'center': return { top: '50%', left: '4%', right: '4%', transform: 'translateY(-50%)' };
        case 'bottom': return { bottom: '8%', left: '4%', right: '4%' };
        case 'top-left': return { top: '5%', left: '4%', maxWidth: '60%' };
        case 'top-right': return { top: '5%', right: '4%', maxWidth: '60%' };
        case 'bottom-left': return { bottom: '8%', left: '4%', maxWidth: '60%' };
        case 'bottom-right': return { bottom: '8%', right: '4%', maxWidth: '60%' };
        default: return { bottom: '8%', left: '4%', right: '4%' };
    }
};

// Helper: Infer default text-align
const inferTextAlign = (position: string = 'bottom', configured?: string): React.CSSProperties['textAlign'] => {
    if (configured) return configured as any;
    if (position.includes('right')) return 'right';
    if (position.includes('left')) return 'left';
    return 'center';
};

function PhoneOverlayText({ text, config, scale = 0.60 }: { text: string; config?: Partial<OverlayConfig>; scale?: number }) {
    if (!text) return null;

    return (
        <div
            className={clsx('absolute', config?.glass_bg && 'backdrop-blur-md border border-white/20 rounded-xl')}
            style={{
                ...getOverlayStyle(config?.position),
                padding: `${(config?.padding ?? 14) * scale}px`,
                marginTop: `${(config?.margin_top ?? 0) * scale}px`,
                marginBottom: `${(config?.margin_bottom ?? 0) * scale}px`,
                marginLeft: `${(config?.margin_left ?? 0) * scale}px`,
                marginRight: `${(config?.margin_right ?? 0) * scale}px`,
                backgroundColor: config?.glass_bg ? `rgba(0,0,0,${config?.glass_opacity ?? 0.25})` : 'transparent',
                backdropFilter: config?.glass_bg && config?.glass_blur ? `blur(${config.glass_blur}px)` : undefined,
            }}
        >
            <p
                style={{
                    fontFamily: config?.font_family || 'DM Serif Display',
                    fontSize: `${(config?.font_size ?? 22) * scale}px`,
                    fontWeight: config?.font_weight ?? 400,
                    fontStyle: config?.font_style || 'normal',
                    textAlign: inferTextAlign(config?.position, config?.text_align),
                    letterSpacing: config?.letter_spacing ? `${config.letter_spacing / 100}em` : undefined,
                    lineHeight: config?.line_height ? `${config.line_height / 10}` : '1.35',
                    color: config?.color ?? '#FFFFFF',
                    textShadow: config?.shadow !== false ? '0 2px 8px rgba(0,0,0,0.8), 0 0 16px rgba(0,0,0,0.4)' : 'none',
                }}
            >
                {text}
            </p>
        </div>
    );
}

interface TaxonomyItem {
    _id: string;
    code: string;
    translations: {
        [key: string]: { name: string };
    }
}

interface ImageEditModalProps {
    editingImage: any;
    setEditingImage: (img: any) => void;
    formData: any;
    setFormData: (data: any) => void;
    activeLang: string;
    setActiveLang: (lang: string) => void;
    getFieldValue: (field: string) => string;
    updateField: (field: string, value: any) => void;
    categories: TaxonomyItem[];
    tags: TaxonomyItem[];
    greetings: any[];
    quotes: any[];
    viewMode: 'active' | 'trash';
    handleSubmit: (e: React.FormEvent) => void;
    handleDelete: (id: string, permanent?: boolean) => void;
    handleRestore: (id: string) => void;
}

export default function ImageEditModal({
    editingImage, setEditingImage, formData, setFormData,
    activeLang, setActiveLang, getFieldValue, updateField,
    categories, tags, greetings, quotes,
    viewMode, handleSubmit, handleDelete, handleRestore
}: ImageEditModalProps) {
    if (!editingImage) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] overflow-hidden flex flex-col md:flex-row relative"
                >
                    {/* Close Button */}
                    <button
                        onClick={() => setEditingImage(null)}
                        className="absolute top-4 right-4 z-50 p-2 bg-slate-900/10 hover:bg-slate-900/20 text-white rounded-full backdrop-blur-md transition-colors"
                    >
                        <X className="w-5 h-5 drop-shadow-md" />
                    </button>

                    {/* Image Preview Side — phone frame with live overlay */}
                    <div className="w-full md:w-[42%] bg-[#0a0e1a] flex flex-col items-center justify-between py-6 px-5 relative gap-4">
                        {/* Caption label at top */}
                        <div className="w-full">
                            <p className="text-xs font-semibold text-slate-400 truncate">
                                {formData.caption || editingImage.filename}
                            </p>
                            <p className="text-[10px] text-slate-600 font-mono truncate">{editingImage.filename}</p>
                        </div>

                        {/* Phone frame */}
                        <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
                            <div
                                className="relative w-full max-w-[190px] mx-auto rounded-[2.5rem] border-[6px] border-slate-600 shadow-[0_0_40px_rgba(0,0,0,0.7)] overflow-hidden bg-black"
                                style={{ aspectRatio: '9/19.5' }}
                            >
                                {/* Notch */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-4 bg-slate-700 rounded-b-2xl z-30" />

                                <img
                                    src={getImageUrl(editingImage.s3_key)}
                                    alt={formData.caption || ''}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />

                                {/* Greeting overlay preview */}
                                {formData.has_overlay && formData.greeting_id && (() => {
                                    const gText = greetings.find((g: any) => g._id === formData.greeting_id)?.text;
                                    const gc = formData.greeting_config || {};
                                    if (!gText) return null;
                                    return <PhoneOverlayText text={gText} config={gc} />;
                                })()}

                                {/* Quote overlay preview */}
                                {formData.has_overlay && formData.quote_id && (() => {
                                    const qText = quotes.find((q: any) => q._id === formData.quote_id)?.text;
                                    const qc = formData.quote_config || {};
                                    if (!qText) return null;
                                    return (
                                        <PhoneOverlayText
                                            text={`“${qText?.substring(0, 80)}${qText?.length > 80 ? '…”' : '”'}`}
                                            config={qc}
                                        />
                                    );
                                })()}

                                {/* Watermark */}
                                {formData.show_watermark !== false && (
                                    <div className="absolute bottom-3 right-3 bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5 text-[7px] text-white font-bold z-10">
                                        Utsav Pro
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Stats row */}
                        <div className="flex gap-6 text-slate-400 text-xs">
                            <div className="flex flex-col items-center gap-1">
                                <input
                                    type="number"
                                    className="w-14 bg-slate-900/10 border border-white/20 rounded px-2 py-1 text-center text-white font-bold text-base focus:outline-none focus:border-blue-500"
                                    value={formData.downloads_count || 0}
                                    onChange={(e) => setFormData({ ...formData, downloads_count: parseInt(e.target.value) || 0 })}
                                />
                                <span>Downloads</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <span className="font-bold text-white text-base">{editingImage.shares_count || 0}</span>
                                <span>Shares</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <span className="font-bold text-white text-base">{editingImage.likes_count || 0}</span>
                                <span>Likes</span>
                            </div>
                        </div>
                    </div>

                    {/* Form Side (Light) */}
                    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-white">Edit Details</h2>
                                <p className="text-sm text-slate-400">Update metadata and translations.</p>
                            </div>
                            <LanguageTabs activeLang={activeLang} onChange={setActiveLang} />
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            <form id="image-form" onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 gap-6">
                                    {/* Main Content */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-200 mb-1">Caption</label>
                                            <textarea
                                                className="w-full border border-slate-800 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-slate-900 text-white transition-all"
                                                rows={2}
                                                placeholder={activeLang === 'en' ? "Enter caption..." : "Translate caption..."}
                                                value={getFieldValue('caption')}
                                                onChange={(e) => updateField('caption', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-200 mb-1">Share Text</label>
                                            <textarea
                                                className="w-full border border-slate-800 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-slate-900 text-white transition-all"
                                                rows={3}
                                                placeholder={activeLang === 'en' ? "Text to share..." : "Translate share text..."}
                                                value={getFieldValue('share_text')}
                                                onChange={(e) => updateField('share_text', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Metadata Section */}
                                    <div className={clsx("bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6", activeLang !== 'en' && "opacity-50 pointer-events-none grayscale")}>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Metadata & Taxonomy</h3>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-400 mb-1">Language</label>
                                                <select
                                                    className="w-full border border-slate-800 p-2.5 rounded-lg bg-slate-900 text-sm"
                                                    value={formData.language || 'neutral'}
                                                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                                >
                                                    <option value="neutral">Neutral (No Text)</option>
                                                    <option value="en">English</option>
                                                    <option value="hi">Hindi</option>
                                                    <option value="mr">Marathi</option>
                                                    <option value="gu">Gujarati</option>
                                                    <option value="bn">Bengali</option>
                                                    <option value="ta">Tamil</option>
                                                    <option value="te">Telugu</option>
                                                    <option value="kn">Kannada</option>
                                                    <option value="ml">Malayalam</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-400 mb-1">Credits</label>
                                                <input
                                                    type="text"
                                                    className="w-full border border-slate-800 p-2.5 rounded-lg bg-slate-900 text-sm"
                                                    value={formData.credits || ''}
                                                    onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-400 mb-1">Created At</label>
                                                <div className="w-full border border-slate-800 p-2.5 rounded-lg bg-slate-800 text-sm text-slate-400">
                                                    {formData.created_at ? new Date(formData.created_at).toLocaleDateString() : 'N/A'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Standalone & Overlay Group */}
                                        <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4 mt-2">
                                            <div className="flex flex-col gap-2">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-blue-600 focus:ring-blue-600 focus:ring-offset-slate-950"
                                                        checked={formData.is_standalone || false}
                                                        onChange={(e) => setFormData({ ...formData, is_standalone: e.target.checked })}
                                                    />
                                                    <span className="text-sm font-medium text-slate-200">Is Standalone Image</span>
                                                </label>
                                                {formData.is_standalone && (
                                                    <select
                                                        className="w-full border border-slate-800 p-2.5 rounded-lg bg-slate-900 text-sm mt-1"
                                                        value={formData.standalone_category || ''}
                                                        onChange={(e) => setFormData({ ...formData, standalone_category: e.target.value })}
                                                    >
                                                        <option value="">-- Select Category --</option>
                                                        {['morning', 'spiritual', 'motivational', 'nature', 'gratitude', 'evening', 'weekend'].map(cat => (
                                                            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                                                        ))}
                                                    </select>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center justify-between">
                                                    <label className="flex items-center gap-2 cursor-pointer opacity-90">
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-blue-600 focus:ring-blue-600 focus:ring-offset-slate-950 disabled:opacity-50"
                                                            checked={formData.has_overlay || false}
                                                            disabled={formData.language !== 'neutral'}
                                                            onChange={(e) => setFormData({ ...formData, has_overlay: e.target.checked })}
                                                        />
                                                        <span className="text-sm font-medium text-slate-200">Has Dynamic Overlay</span>
                                                    </label>
                                                    {formData.language !== 'neutral' && (
                                                        <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20">
                                                            Disabled for Language Specific Images
                                                        </span>
                                                    )}
                                                </div>
                                                <label className="flex items-center gap-2 cursor-pointer mt-1">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-blue-600 focus:ring-blue-600 focus:ring-offset-slate-950"
                                                        checked={formData.show_watermark !== false}
                                                        onChange={(e) => setFormData({ ...formData, show_watermark: e.target.checked })}
                                                    />
                                                    <span className="text-sm font-medium text-slate-200">Show Watermark</span>
                                                </label>
                                            </div>
                                            <div className={clsx("col-span-2 grid grid-cols-2 gap-4 transition-opacity duration-300", formData.language !== 'neutral' && "opacity-30 pointer-events-none")}>
                                                <div className="relative">
                                                    <label className="block text-xs font-medium text-slate-400 mb-1">Linked Greeting</label>
                                                    <select
                                                        className="w-full border border-slate-800 p-2.5 rounded-lg bg-slate-900 text-sm disabled:bg-slate-900/50"
                                                        value={(formData.greeting_id as string) || ''}
                                                        onChange={(e) => setFormData({ ...formData, greeting_id: e.target.value || undefined })}
                                                        disabled={formData.language !== 'neutral'}
                                                    >
                                                        <option value="">-- No Greeting --</option>
                                                        {greetings.map(g => (
                                                            <option key={g._id} value={g._id}>{g.text?.substring(0, 40) || `Greeting ${g._id.substring(0, 4)}`}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="relative">
                                                    <label className="block text-xs font-medium text-slate-400 mb-1">Linked Quote</label>
                                                    <select
                                                        className="w-full border border-slate-800 p-2.5 rounded-lg bg-slate-900 text-sm disabled:bg-slate-900/50"
                                                        value={(formData.quote_id as string) || ''}
                                                        onChange={(e) => setFormData({ ...formData, quote_id: e.target.value || undefined })}
                                                        disabled={formData.language !== 'neutral'}
                                                    >
                                                        <option value="">-- No Quote --</option>
                                                        {quotes.map(q => (
                                                            <option key={q._id} value={q._id}>{q.text?.substring(0, 30)}...</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {formData.has_overlay && formData.language === 'neutral' && (
                                                <div className="col-span-2 mt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                                    <OverlayConfigurator
                                                        imageUrl={getImageUrl(editingImage.s3_key)}
                                                        greetingText={greetings.find((g: any) => g._id === formData.greeting_id)?.text}
                                                        quoteText={quotes.find((q: any) => q._id === formData.quote_id)?.text}
                                                        greetingTranslations={greetings.find((g: any) => g._id === formData.greeting_id)?.translations}
                                                        quoteTranslations={quotes.find((q: any) => q._id === formData.quote_id)?.translations}
                                                        greetingConfig={formData.greeting_config}
                                                        quoteConfig={formData.quote_config}
                                                        hidePreview={true}
                                                        onUpdate={(type, conf) => setFormData({ ...formData, [type]: conf })}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Categories & Tags */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-400 mb-2">Categories</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {categories.map(cat => {
                                                        const isSelected = formData.categories?.includes(cat._id);
                                                        return (
                                                            <button
                                                                key={cat._id}
                                                                type="button"
                                                                onClick={() => {
                                                                    const newCats = isSelected
                                                                        ? formData.categories?.filter((c: string) => c !== cat._id)
                                                                        : [...(formData.categories || []), cat._id];
                                                                    setFormData({ ...formData, categories: newCats });
                                                                }}
                                                                className={clsx(
                                                                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                                                                    isSelected ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                                                                )}
                                                            >
                                                                {cat.translations?.['en']?.name || cat.code}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-400 mb-2">Tags</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {tags.map(tag => {
                                                        const isSelected = formData.tags?.includes(tag._id);
                                                        return (
                                                            <button
                                                                key={tag._id}
                                                                type="button"
                                                                onClick={() => {
                                                                    const newTags = isSelected
                                                                        ? formData.tags?.filter((t: string) => t !== tag._id)
                                                                        : [...(formData.tags || []), tag._id];
                                                                    setFormData({ ...formData, tags: newTags });
                                                                }}
                                                                className={clsx(
                                                                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                                                                    isSelected ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                                                                )}
                                                            >
                                                                {tag.translations?.['en']?.name || tag.code}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Technical Details */}
                                        <div className="pt-4 border-t border-slate-800">
                                            <div className="flex items-center justify-between text-xs text-slate-400">
                                                <div className="flex gap-4">
                                                    <span className="flex items-center gap-1">
                                                        <div className={clsx("w-2 h-2 rounded-full", formData.is_optimized ? "bg-green-500" : "bg-yellow-500")} />
                                                        {formData.is_optimized ? "Optimized" : "Pending Optimization"}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <div className={clsx("w-2 h-2 rounded-full", formData.is_s3_uploaded ? "bg-blue-500" : "bg-slate-300")} />
                                                        {formData.is_s3_uploaded ? "On S3" : "Local Only"}
                                                    </span>
                                                </div>
                                                <div className="flex gap-3 font-mono">
                                                    <span>{formData.media_type || 'image'}</span>
                                                    <span>{formData.mime_type}</span>
                                                </div>
                                            </div>

                                            {formData.is_s3_uploaded && (
                                                <div className="mt-3 flex gap-2">
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[10px] font-mono text-slate-400 select-all"
                                                        value={getImageUrl(formData.s3_key)}
                                                    />
                                                    <a
                                                        href={getImageUrl(formData.s3_key)}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 flex-shrink-0"
                                                    >
                                                        <LinkIcon className="w-3 h-3" />
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-slate-800 bg-slate-950 flex justify-between items-center">
                            <button
                                type="button"
                                onClick={() => handleDelete(editingImage._id, viewMode === 'trash')}
                                className="flex items-center gap-2 px-4 py-2.5 text-red-600 font-medium hover:bg-red-50 rounded-xl transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                {viewMode === 'trash' ? 'Delete Forever' : 'Move to Trash'}
                            </button>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setEditingImage(null)}
                                    className="px-6 py-2.5 text-slate-300 font-medium hover:bg-slate-700 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    form="image-form"
                                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                                >
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
