import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Eye, CheckCircle, Edit2 } from 'lucide-react';
import LanguageTabs from './LanguageTabs';
import { getImageUrl } from '../lib/getImageUrl';
import clsx from 'clsx';
// Types are handled via any for decoupled components temporarily or via @festival/models

// Since models aren't fully exported in a shared types file yet, we'll use any or redefine minimum types
// But we can just use `any` or minimal interfaces to decouple it.

interface EventEditModalProps {
    showForm: boolean;
    setShowForm: (val: boolean) => void;
    editingId: string | null;
    activeTab: 'content' | 'settings';
    setActiveTab: (tab: 'content' | 'settings') => void;
    activeLang: string;
    setActiveLang: (lang: string) => void;
    formData: any;
    setFormData: (data: any) => void;
    handleSubmit: (e: React.FormEvent) => void;
    getFieldValue: (field: string) => string;
    updateField: (field: string, value: any) => void;
    categories: any[];
    tags: any[];
    vibes: any[];
    lotties: any[];
    relatedImages: any[];
    handleUnlinkImage: (id: string) => void;
    setShowImagePicker: (val: boolean) => void;

    // Form helpers
    updateFact: (index: number, field: string, value: any) => void;
    addFact: () => void;
    removeFact: (index: number) => void;
    updateNotification: (index: number, value: string) => void;
    addNotification: () => void;
    removeNotification: (index: number) => void;
    updateDate: (index: number, field: string, value: any) => void;
    addDate: () => void;
    removeDate: (index: number) => void;
    JsonTextarea?: React.FC<any>;
}

// Inline JsonTextarea component to avoid prop drilling if it's small, or pass it in. 
// We will pass it in or define it here. Actually, it uses nothing from the parent but its own state.
function JsonTextarea({ label, value, onChange, placeholder }: any) {
    const [localValue, setLocalValue] = React.useState('');
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        setLocalValue(value ? JSON.stringify(value, null, 2) : '');
    }, [value]);

    const handleBlur = () => {
        try {
            if (!localValue.trim()) {
                onChange(null);
                setError('');
                return;
            }
            const parsed = JSON.parse(localValue);
            onChange(parsed);
            setError('');
        } catch (e: any) {
            setError(e.message);
        }
    };

    return (
        <div className="col-span-full">
            <label className="block text-sm font-medium text-slate-200 mb-1">{label}</label>
            <textarea
                className={clsx(
                    "w-full border p-3 rounded-xl focus:ring-2 outline-none bg-slate-900 text-white font-mono text-sm transition-all min-h-[150px]",
                    error ? "border-red-500 focus:ring-red-500/20" : "border-slate-800 focus:ring-blue-500/20 focus:border-blue-500"
                )}
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onBlur={handleBlur}
                placeholder={placeholder}
            />
            {error ? (
                <p className="text-red-500 text-xs mt-1">Invalid JSON: {error}</p>
            ) : (
                <p className="text-slate-500 text-xs mt-1">Valid JSON format</p>
            )}
        </div>
    );
}

export default function EventEditModal({
    showForm, setShowForm, editingId, activeTab, setActiveTab,
    activeLang, setActiveLang, formData, setFormData, handleSubmit,
    getFieldValue, updateField, categories, tags, vibes, lotties,
    relatedImages, handleUnlinkImage, setShowImagePicker,
    updateFact, addFact, removeFact,
    updateNotification, addNotification, removeNotification,
    updateDate, addDate, removeDate
}: EventEditModalProps) {
    const [previewImage, setPreviewImage] = React.useState<any | null>(null);

    if (!showForm) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                >
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900 z-10">
                        <div>
                            <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Event' : 'Create New Event'}</h2>
                            <p className="text-sm text-slate-400">Manage details and translations.</p>
                        </div>
                        <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-300">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Tabs Header */}
                    <div className="flex border-b border-slate-800 px-6">
                        <button
                            onClick={() => setActiveTab('content')}
                            className={clsx("px-6 py-3 text-sm font-medium border-b-2 transition-colors", activeTab === 'content' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-200")}
                        >
                            Localized Content
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={clsx("px-6 py-3 text-sm font-medium border-b-2 transition-colors", activeTab === 'settings' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-200")}
                        >
                            Settings & Media
                        </button>
                    </div>

                    <div className="overflow-y-auto p-6 md:p-8 flex-1">
                        <form id="event-form" onSubmit={handleSubmit} className="space-y-8">

                            {/* TAB 1: LOCALIZED CONTENT */}
                            {activeTab === 'content' && (
                                <div className="space-y-6">
                                    {/* Language Switcher */}
                                    <div className="sticky top-0 bg-slate-900 z-20 pb-4 border-b border-slate-800 mb-6">
                                        <LanguageTabs activeLang={activeLang} onChange={setActiveLang} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="col-span-full">
                                            <label className="block text-sm font-medium text-slate-200 mb-1">Title <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                className="w-full border border-slate-800 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-slate-900 text-white transition-all text-lg font-medium"
                                                placeholder={activeLang === 'en' ? "Event Title" : "Translate Title..."}
                                                value={getFieldValue('title')}
                                                onChange={(e) => updateField('title', e.target.value)}
                                                required={activeLang === 'en'}
                                            />
                                        </div>

                                        {activeLang === 'en' && (
                                            <div className="col-span-full">
                                                <label className="block text-sm font-medium text-slate-200 mb-1">Slug / URL Path</label>
                                                <input
                                                    type="text"
                                                    className="w-full border border-slate-800 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-slate-950 text-slate-400 transition-all font-mono text-sm"
                                                    disabled
                                                    placeholder="auto-generated-from-title"
                                                    value={formData.slug || ''}
                                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                                    title="Auto-generated. Will be created on save if empty."
                                                />
                                            </div>
                                        )}

                                        <div className="col-span-full">
                                            <label className="block text-sm font-medium text-slate-200 mb-1">Description</label>
                                            <textarea
                                                className="w-full border border-slate-800 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-slate-900 text-white transition-all min-h-[120px]"
                                                placeholder={activeLang === 'en' ? "Detailed description of the event..." : "Translate description..."}
                                                value={getFieldValue('description')}
                                                onChange={(e) => updateField('description', e.target.value)}
                                            />
                                        </div>

                                        {/* Historical Significance Facts */}
                                        <div className="col-span-full border border-slate-800 rounded-2xl p-6 bg-slate-950">
                                            <div className="flex justify-between items-center mb-4">
                                                <div>
                                                    <h3 className="text-sm font-bold text-white">Historical Facts</h3>
                                                    <p className="text-xs text-slate-400">Timelines or significance associated with this event.</p>
                                                </div>
                                                {activeLang === 'en' && (
                                                    <button type="button" onClick={addFact} className="flex items-center gap-1.5 text-xs bg-blue-600/10 text-blue-500 hover:bg-blue-600/20 px-3 py-1.5 rounded-lg transition-colors font-medium">
                                                        <Plus className="w-3.5 h-3.5" /> Add Fact
                                                    </button>
                                                )}
                                            </div>

                                            <div className="space-y-4">
                                                {formData.historical_significance?.map((fact: any, index: number) => {
                                                    const currentFactText = activeLang === 'en' ? fact.fact : (fact.translations?.[activeLang]?.fact || '');
                                                    return (
                                                        <div key={index} className="flex gap-4 items-start p-4 border border-slate-800 bg-slate-900 rounded-xl relative group">
                                                            {activeLang === 'en' && (
                                                                <input
                                                                    type="number"
                                                                    placeholder="Year"
                                                                    className="w-24 bg-slate-950 border border-slate-800 p-2 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 text-center"
                                                                    value={fact.year || ''}
                                                                    onChange={(e) => {
                                                                        const updated = [...formData.historical_significance];
                                                                        updated[index].year = parseInt(e.target.value) || 0;
                                                                        setFormData({ ...formData, historical_significance: updated });
                                                                    }}
                                                                />
                                                            )}
                                                            <div className="flex-1 space-y-2">
                                                                <textarea
                                                                    placeholder={activeLang === 'en' ? "Fact text..." : "Translate fact..."}
                                                                    className="w-full bg-slate-950 border border-slate-800 p-2 text-sm rounded-lg text-white focus:outline-none focus:border-blue-500 min-h-[60px]"
                                                                    value={currentFactText}
                                                                    onChange={(e) => updateFact(index, 'fact', e.target.value)}
                                                                />
                                                                {activeLang === 'en' && (
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Source / Citation (Optional)"
                                                                        className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded-lg text-slate-400 focus:outline-none focus:border-blue-500"
                                                                        value={fact.source || ''}
                                                                        onChange={(e) => {
                                                                            const updated = [...formData.historical_significance];
                                                                            updated[index].source = e.target.value;
                                                                            setFormData({ ...formData, historical_significance: updated });
                                                                        }}
                                                                    />
                                                                )}
                                                            </div>
                                                            {activeLang === 'en' && (
                                                                <button type="button" onClick={() => removeFact(index)} className="text-slate-500 hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                                {(!formData.historical_significance || formData.historical_significance.length === 0) && (
                                                    <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl text-slate-500 text-sm">
                                                        No historical facts added yet.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}


                            {/* TAB 2: SETTINGS & DETAILS (English Only essentially) */}
                            {activeTab === 'settings' && (
                                <div className={clsx("space-y-8", activeLang !== 'en' && "opacity-50 pointer-events-none grayscale")}>

                                    {activeLang !== 'en' && (
                                        <div className="bg-amber-500/10 text-amber-500 p-4 rounded-xl text-sm border border-amber-500/20">
                                            <strong>Note:</strong> Configuration settings apply globally. Switch to English to edit taxonomy, dates, and media.
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Core Config */}
                                        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                                            <h3 className="text-sm font-bold text-white mb-4">Core Settings</h3>

                                            <div>
                                                <label className="block text-xs font-medium text-slate-400 mb-1">Primary Category</label>
                                                <select
                                                    className="w-full border border-slate-800 p-2.5 rounded-lg bg-slate-900 text-sm text-white focus:outline-none focus:border-blue-500"
                                                    value={formData.category}
                                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                    required
                                                >
                                                    <option value="">-- Select Category --</option>
                                                    {categories.map(cat => (
                                                        <option key={cat._id} value={cat._id}>{cat.translations?.['en']?.name || cat.code}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-400 mb-1">Primary Date (YYYY-MM-DD)</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. 2026-10-31"
                                                        className="w-full border border-slate-800 p-2.5 rounded-lg bg-slate-900 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                                                        value={formData.date || ''}
                                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-400 mb-1">Priority (1-100)</label>
                                                    <input
                                                        type="number"
                                                        className="w-full border border-slate-800 p-2.5 rounded-lg bg-slate-900 text-sm text-white focus:outline-none focus:border-blue-500"
                                                        value={formData.priority || 0}
                                                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-slate-400 mb-1">Lottie Overlay (Optional)</label>
                                                <select
                                                    className="w-full border border-slate-800 p-2.5 rounded-lg bg-slate-900 text-sm text-white focus:outline-none focus:border-blue-500"
                                                    value={formData.lottie_overlay || ''}
                                                    onChange={(e) => setFormData({ ...formData, lottie_overlay: e.target.value })}
                                                >
                                                    <option value="">-- No Overlay --</option>
                                                    {lotties.map((l: any) => (
                                                        <option key={l._id} value={l._id}>{l.title}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Taxonomy (Tags & Vibes) */}
                                        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
                                            <h3 className="text-sm font-bold text-white">Taxonomy</h3>

                                            <div>
                                                <label className="block text-xs font-medium text-slate-400 mb-2">Vibes (Multi-select)</label>
                                                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar p-1">
                                                    {vibes.map((vibe: any) => {
                                                        const isSelected = formData.vibes?.includes(vibe._id);
                                                        return (
                                                            <button
                                                                type="button"
                                                                key={vibe._id}
                                                                onClick={() => {
                                                                    const current = formData.vibes || [];
                                                                    const next = isSelected ? current.filter((id: string) => id !== vibe._id) : [...current, vibe._id];
                                                                    setFormData({ ...formData, vibes: next });
                                                                }}
                                                                className={clsx(
                                                                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                                                                    isSelected ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                                                                )}
                                                            >
                                                                {vibe.translations?.['en']?.name || vibe.code}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-slate-400 mb-2">Tags (Multi-select)</label>
                                                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar p-1">
                                                    {tags.map((tag: any) => {
                                                        const isSelected = formData.tags?.includes(tag._id);
                                                        return (
                                                            <button
                                                                type="button"
                                                                key={tag._id}
                                                                onClick={() => {
                                                                    const current = formData.tags || [];
                                                                    const next = isSelected ? current.filter((id: string) => id !== tag._id) : [...current, tag._id];
                                                                    setFormData({ ...formData, tags: next });
                                                                }}
                                                                className={clsx(
                                                                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                                                                    isSelected ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                                                                )}
                                                            >
                                                                {tag.translations?.['en']?.name || tag.code}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Multi-Year Dates */}
                                        <div className="col-span-full border border-slate-800 rounded-2xl p-6 bg-slate-950">
                                            <div className="flex justify-between items-center mb-4">
                                                <div>
                                                    <h3 className="text-sm font-bold text-white">Future / Historical Dates</h3>
                                                    <p className="text-xs text-slate-400">Map dates for specific years to handle shifting calendars.</p>
                                                </div>
                                                <button type="button" onClick={addDate} className="flex items-center gap-1.5 text-xs bg-blue-600/10 text-blue-500 hover:bg-blue-600/20 px-3 py-1.5 rounded-lg transition-colors font-medium">
                                                    <Plus className="w-3.5 h-3.5" /> Add Year Mapping
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {formData.dates?.map((d: any, index: number) => (
                                                    <div key={index} className="flex items-center gap-2 bg-slate-900 p-2 rounded-lg border border-slate-800 relative group">
                                                        <input
                                                            type="number"
                                                            className="w-16 bg-transparent text-sm text-white focus:outline-none focus:border-blue-500 font-mono text-center border-r border-slate-700 pr-2"
                                                            value={d.year || ''}
                                                            onChange={(e) => updateDate(index, 'year', e.target.value)}
                                                            placeholder="YYYY"
                                                        />
                                                        <input
                                                            type="text"
                                                            className="flex-1 bg-transparent text-sm text-slate-300 focus:outline-none pl-1 font-mono"
                                                            value={d.date || ''}
                                                            onChange={(e) => updateDate(index, 'date', e.target.value)}
                                                            placeholder="YYYY-MM-DD"
                                                        />
                                                        <button type="button" onClick={() => removeDate(index)} className="absolute -right-2 -top-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                                {(!formData.dates || formData.dates.length === 0) && (
                                                    <div className="col-span-full text-center py-4 border border-dashed border-slate-800 rounded-xl text-slate-500 text-sm">
                                                        No year mappings added.
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Notifications & Push Config */}
                                        <div className="col-span-full border border-slate-800 rounded-2xl p-6 bg-slate-950">
                                            <div className="flex justify-between items-center mb-4">
                                                <div>
                                                    <h3 className="text-sm font-bold text-white">Push Notification Templates</h3>
                                                    <p className="text-xs text-slate-400">Templates to use for engagement triggers.</p>
                                                </div>
                                                <button type="button" onClick={addNotification} className="flex items-center gap-1.5 text-xs bg-blue-600/10 text-blue-500 hover:bg-blue-600/20 px-3 py-1.5 rounded-lg transition-colors font-medium">
                                                    <Plus className="w-3.5 h-3.5" /> Add Template
                                                </button>
                                            </div>

                                            <div className="space-y-3">
                                                {formData.notification_templates?.map((tmpl: string, index: number) => (
                                                    <div key={index} className="flex gap-2 items-center">
                                                        <input
                                                            type="text"
                                                            className="flex-1 border border-slate-800 bg-slate-900 p-2.5 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                                                            value={tmpl || ''}
                                                            onChange={(e) => updateNotification(index, e.target.value)}
                                                            placeholder="e.g. Wishing you a joyous %EventName%!"
                                                        />
                                                        <button type="button" onClick={() => removeNotification(index)} className="p-2.5 text-slate-500 hover:text-red-500 bg-slate-900 border border-slate-800 rounded-lg hover:border-red-500/30 transition-colors">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                                {(!formData.notification_templates || formData.notification_templates.length === 0) && (
                                                    <div className="text-center py-4 border border-dashed border-slate-800 rounded-xl text-slate-500 text-sm">
                                                        No notification templates added.
                                                    </div>
                                                )}
                                            </div>
                                        </div>


                                        {/* Advanced JSON Configuration (for esoteric properties) */}
                                        <div className="col-span-full border border-slate-800 rounded-2xl p-6 bg-slate-950">
                                            <h3 className="text-sm font-bold text-white mb-4">Advanced Configuration (JSON)</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <JsonTextarea
                                                    label="Countdown Config"
                                                    value={formData.countdown_config}
                                                    onChange={(val: any) => setFormData({ ...formData, countdown_config: val })}
                                                    placeholder={`{\n  "bg_color": "#FF0000",\n  "text_color": "#FFFFFF"\n}`}
                                                />
                                                <JsonTextarea
                                                    label="Muhurat / Timings"
                                                    value={formData.muhurat}
                                                    onChange={(val: any) => setFormData({ ...formData, muhurat: val })}
                                                    placeholder={`{\n  "start_time": "12:00 PM",\n  "end_time": "02:00 PM"\n}`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Associated Media Section (only in settings tab, and only if editing existing event) */}
                    {activeTab === 'settings' && activeLang === 'en' && editingId && (
                        <div className="p-6 border-t border-slate-800 bg-slate-900">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold text-white">Linked Media</h3>
                                <button
                                    type="button"
                                    onClick={() => setShowImagePicker(true)}
                                    className="flex items-center gap-1.5 text-xs bg-blue-600/10 text-blue-500 hover:bg-blue-600/20 px-3 py-1.5 rounded-lg transition-colors font-medium border border-blue-500/20"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Link Existing Image
                                </button>
                            </div>

                            {relatedImages.length === 0 ? (
                                <div className="text-center py-6 bg-slate-950 border border-slate-800 rounded-xl">
                                    <p className="text-slate-500 text-sm">No images linked to this event yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                                    {relatedImages.map(img => (
                                        <div
                                            key={img._id}
                                            className="relative aspect-square sm:aspect-[3/4] rounded-xl overflow-hidden border border-slate-700 group hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all cursor-pointer bg-slate-950"
                                            onClick={() => setPreviewImage(img)}
                                        >
                                            <img
                                                src={getImageUrl(img.s3_key)}
                                                className="w-full h-full object-cover"
                                                alt={img.caption || ''}
                                            />
                                            {/* Show caption at bottom always */}
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-2 pt-6 pb-2">
                                                <p className="text-white text-[11px] font-semibold truncate leading-tight drop-shadow-md">
                                                    {img.caption || 'Untitled Media'}
                                                </p>
                                            </div>

                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); handleUnlinkImage(img._id); }}
                                                    className="bg-red-500/90 backdrop-blur-sm text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-md"
                                                    title="Unlink Image"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    )}

                    <div className="p-6 border-t border-slate-800 bg-slate-950 flex justify-end gap-3 z-20 sticky bottom-0">
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-6 py-2.5 text-slate-300 font-medium hover:bg-slate-700 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="event-form"
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                        >
                            {editingId ? 'Update Event' : 'Create Event'}
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Image Preview Modal */}
            <AnimatePresence>
                {previewImage && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-800 flex flex-col md:flex-row max-h-[90vh]"
                        >
                            {/* Left Side: Image */}
                            <div className="md:w-1/2 bg-slate-950 relative flex items-center justify-center group overflow-hidden border-r border-slate-800 p-6">
                                <img
                                    src={getImageUrl(previewImage.s3_key)}
                                    alt={previewImage.caption || ''}
                                    className="max-w-full max-h-full object-contain drop-shadow-2xl rounded"
                                />
                                {/* Action buttons over image */}
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <a
                                        href={getImageUrl(previewImage.s3_key)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-2 bg-black/50 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm transition-colors"
                                        title="View Original"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>

                            {/* Right Side: Details */}
                            <div className="md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2 leading-tight pr-4">{previewImage.caption || 'Untitled Media'}</h3>
                                        <p className="text-xs font-mono text-slate-500 break-all">{previewImage.s3_key}</p>
                                    </div>
                                    <button onClick={() => setPreviewImage(null)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 transition-colors flex-shrink-0">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="space-y-6 flex-1">
                                    <div>
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Primary Language</span>
                                        <div className="inline-flex bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-lg text-sm text-indigo-400 uppercase font-bold">
                                            {previewImage.language || 'Neutral'}
                                        </div>
                                    </div>

                                    <div>
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Overlay Configuration</span>
                                        <div className="flex flex-col gap-2 text-sm text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800">
                                            {previewImage.has_overlay ? (
                                                <span className="flex items-center gap-2 text-emerald-400 font-medium my-1">
                                                    <CheckCircle className="w-4 h-4" /> Dynamic Text Overlay Enabled
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2 text-slate-400 my-1">
                                                    <X className="w-4 h-4" /> Static Image (No Overlay)
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
                                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mb-2">Optimization</span>
                                            <span className={clsx("text-sm font-bold", previewImage.is_optimized ? "text-green-500" : "text-amber-500")}>
                                                {previewImage.is_optimized ? 'Optimized WebP' : 'Original Raw'}
                                            </span>
                                        </div>
                                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
                                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mb-2">S3 Delivery</span>
                                            <span className={clsx("text-sm font-bold", previewImage.is_s3_uploaded ? "text-blue-500" : "text-slate-500")}>
                                                {previewImage.is_s3_uploaded ? 'Live on CDN' : 'Local Only'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 mt-4 border-t border-slate-800/50">
                                    {/* Link the user to the media library tab searching for this specific media */}
                                    <button
                                        onClick={() => {
                                            setPreviewImage(null);
                                            window.open('/images?search=' + encodeURIComponent(previewImage.caption || previewImage.s3_key), '_blank');
                                        }}
                                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-900/20 px-4 py-3.5 rounded-xl font-bold transition-all active:scale-[0.98]"
                                        title="Lied to image model"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        <span>Manage Full Details in Media Library</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AnimatePresence>
    );

}
