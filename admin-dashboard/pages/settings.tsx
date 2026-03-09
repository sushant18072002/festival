import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import LanguageTabs from '../components/LanguageTabs';
import {
    Plus, Edit2, Trash2, Save, X, Tag, Folder, Settings as SettingsIcon,
    Sparkles, Flag, Circle, MapPin, Globe,
    PartyPopper, Music, Moon, Heart, Sunrise, Sun, Star, Flame,
    Camera, Award, Gift, BookOpen, Leaf, Feather,
    Coffee, Zap, Bell, Crown, Diamond, Anchor,
    Palette, Waves, Wind, Snowflake, Cloud, Mountain,
    Flower2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import clsx from 'clsx';

// ─── Icon Registry ──────────────────────────────────────────────────────────
// ⚠️  This list MUST stay in sync with TaxonomyIconResolver._iconMap in Flutter.
// Each entry: { name: 'LucideIconName', Icon: LucideComponent }
// The `name` is what gets stored in MongoDB and what Flutter resolves.
const SUPPORTED_ICONS = [
    { name: 'Sparkles', Icon: Sparkles },
    { name: 'Flag', Icon: Flag },
    { name: 'Om', Icon: Circle }, // Mapped to Circle — Lucide has no Om
    { name: 'MapPin', Icon: MapPin },
    { name: 'Globe', Icon: Globe },
    { name: 'PartyPopper', Icon: PartyPopper },
    { name: 'Music', Icon: Music },
    { name: 'Moon', Icon: Moon },
    { name: 'Heart', Icon: Heart },
    { name: 'Sunrise', Icon: Sunrise },
    { name: 'Sun', Icon: Sun },
    { name: 'Star', Icon: Star },
    { name: 'Flame', Icon: Flame },
    { name: 'Camera', Icon: Camera },
    { name: 'Award', Icon: Award },
    { name: 'Gift', Icon: Gift },
    { name: 'BookOpen', Icon: BookOpen },
    { name: 'Leaf', Icon: Leaf },
    { name: 'Feather', Icon: Feather },
    { name: 'Flower', Icon: Flower2 }, // Flutter maps 'Flower' → LucideIcons.flower
    { name: 'Coffee', Icon: Coffee },
    { name: 'Zap', Icon: Zap },
    { name: 'Bell', Icon: Bell },
    { name: 'Crown', Icon: Crown },
    { name: 'Diamond', Icon: Diamond },
    { name: 'Anchor', Icon: Anchor },
    { name: 'Palette', Icon: Palette },
    { name: 'Waves', Icon: Waves },
    { name: 'Wind', Icon: Wind },
    { name: 'Snowflake', Icon: Snowflake },
    { name: 'Cloud', Icon: Cloud },
    { name: 'Mountain', Icon: Mountain },
] as const;

// ─── IconPickerField ────────────────────────────────────────────────────────
function IconPickerField({
    value,
    color,
    onChange,
}: {
    value: string;
    color: string;
    onChange: (name: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const selected = SUPPORTED_ICONS.find(i => i.name === value);
    const accent = color && color.match(/^#?[0-9A-Fa-f]{6}$/)
        ? (color.startsWith('#') ? color : `#${color}`)
        : '#8B5CF6';

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Icon</label>

            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-3 border border-slate-700 bg-slate-950 rounded-xl px-3 py-2.5 hover:border-blue-500 transition-colors"
            >
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${accent}22`, border: `1px solid ${accent}55` }}
                >
                    {selected
                        ? <selected.Icon className="w-4 h-4" style={{ color: accent }} />
                        : <Sparkles className="w-4 h-4 text-slate-500" />
                    }
                </div>
                <span className="flex-1 text-left text-sm text-white font-mono">
                    {value || <span className="text-slate-500 font-sans">Select an icon…</span>}
                </span>
                <span className="text-slate-500 text-xs">{open ? '▲' : '▼'}</span>
            </button>

            {/* Icon Grid Dropdown */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="border border-slate-700 bg-slate-900 rounded-xl p-3 shadow-xl"
                    >
                        <p className="text-xs text-slate-500 mb-2 px-1">
                            These icons are bundled in the Flutter app. Select one to ensure it renders correctly.
                        </p>
                        <div className="grid grid-cols-6 gap-1.5">
                            {SUPPORTED_ICONS.map(({ name, Icon }) => {
                                const isSelected = name === value;
                                return (
                                    <button
                                        key={name}
                                        type="button"
                                        title={name}
                                        onClick={() => { onChange(name); setOpen(false); }}
                                        className={clsx(
                                            'flex flex-col items-center gap-1 p-2 rounded-lg transition-all',
                                            isSelected
                                                ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                                                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                                        )}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="text-[9px] font-mono leading-none truncate w-full text-center opacity-70">
                                            {name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        {value && (
                            <button
                                type="button"
                                onClick={() => { onChange(''); setOpen(false); }}
                                className="mt-2 w-full text-xs text-slate-500 hover:text-red-400 py-1"
                            >
                                ✕ Clear icon
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface LocalizedString { name: string; }
interface TaxonomyItem {
    _id?: string;
    code: string;
    icon?: string;
    color?: string;
    translations: { [key: string]: LocalizedString };
}
const initialItemState: TaxonomyItem = { code: '', translations: {} };

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function Settings() {
    const [activeTab, setActiveTab] = useState<'categories' | 'tags' | 'vibes'>('categories');
    const [items, setItems] = useState<TaxonomyItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [baseImageUrl, setBaseImageUrl] = useState<string>('');
    const [formData, setFormData] = useState<TaxonomyItem>(initialItemState);
    const [activeLang, setActiveLang] = useState('en');

    useEffect(() => { fetchItems(); fetchConfig(); }, [activeTab]);

    const fetchConfig = async () => {
        try {
            const res = await fetch('/api/system/config');
            const data = await res.json();
            if (data.success && data.config) setBaseImageUrl(data.config.base_image_url || '');
        } catch { console.error('Failed to load config'); }
    };

    const updateBaseImageUrl = async () => {
        try {
            const res = await fetch('/api/system/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ base_image_url: baseImageUrl })
            });
            const data = await res.json();
            data.success ? toast.success('Base image URL updated') : toast.error(data.error || 'Failed');
        } catch { toast.error('Failed to update URL'); }
    };

    const fetchItems = async () => {
        setLoading(true);
        try {
            const ep = activeTab === 'categories' ? '/api/categories' : activeTab === 'tags' ? '/api/tags' : '/api/vibes';
            const res = await fetch(ep);
            const data = await res.json();
            if (data.success) setItems(data.data);
        } catch { toast.error('Failed to load items'); }
        finally { setLoading(false); }
    };

    const handleEdit = (item: TaxonomyItem) => {
        setFormData(item); setEditingId(item._id!); setActiveLang('en'); setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        const label = activeTab === 'categories' ? 'Category' : activeTab === 'tags' ? 'Tag' : 'Vibe';
        if (!confirm(`Delete this ${label}?`)) return;
        try {
            const ep = activeTab === 'categories' ? '/api/categories' : activeTab === 'tags' ? '/api/tags' : '/api/vibes';
            const res = await fetch(`${ep}?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) { toast.success('Deleted'); fetchItems(); }
        } catch { toast.error('Failed to delete'); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const ep = activeTab === 'categories' ? '/api/categories' : activeTab === 'tags' ? '/api/tags' : '/api/vibes';
        const body = editingId ? { ...formData, _id: editingId } : formData;
        try {
            const res = await fetch(ep, { method: editingId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            const data = await res.json();
            if (data.success) {
                toast.success(editingId ? 'Updated' : 'Created');
                setShowForm(false); setEditingId(null); setFormData(initialItemState); fetchItems();
            } else { toast.error(data.error); }
        } catch { toast.error('Operation failed'); }
    };

    const updateName = (value: string) => {
        setFormData({ ...formData, translations: { ...formData.translations, [activeLang]: { name: value } } });
    };

    const getName = () => formData.translations?.[activeLang]?.name || '';

    // Resolve a stored icon name → lucide component for preview in cards
    const getIconComponent = (name?: string) => {
        const entry = SUPPORTED_ICONS.find(i => i.name === name);
        return entry ? entry.Icon : null;
    };

    return (
        <div className="flex h-screen bg-slate-950 font-sans">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <SettingsIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
                            <p className="text-slate-400 mt-1">Manage taxonomy and global configurations.</p>
                        </div>
                    </div>
                </div>

                {/* Global Infrastructure */}
                <div className="bg-slate-900 rounded-2xl shadow-md shadow-black/20 border border-slate-800 p-6 mb-6 flex flex-col gap-4">
                    <h2 className="text-lg font-bold text-slate-100">Global Infrastructure</h2>
                    <div className="flex items-end gap-4">
                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-medium text-slate-200">Base Image URL (Single Source of Truth)</label>
                            <input
                                type="text"
                                className="w-full border border-slate-800 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-white font-mono text-sm"
                                placeholder="e.g. https://cdn.utsav.com/"
                                value={baseImageUrl}
                                onChange={(e) => setBaseImageUrl(e.target.value)}
                            />
                        </div>
                        <button onClick={updateBaseImageUrl} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors h-[46px] flex items-center justify-center gap-2">
                            <Save className="w-4 h-4" /> Save
                        </button>
                    </div>
                    <p className="text-xs text-slate-400">
                        This URL is automatically prefixed to all relative image paths when generating the app's JSON feed.
                    </p>
                </div>

                {/* Taxonomy Tabs */}
                <div className="bg-slate-900 rounded-2xl shadow-md shadow-black/20 border border-slate-800 overflow-hidden mb-6">
                    <div className="flex border-b border-slate-800">
                        {(['categories', 'tags', 'vibes'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={clsx('flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors capitalize', activeTab === tab
                                    ? 'border-blue-600 text-blue-400 bg-blue-950/30'
                                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-950'
                                )}
                            >
                                {tab === 'categories' ? <Folder className="w-4 h-4" /> : tab === 'tags' ? <Tag className="w-4 h-4" /> : <SettingsIcon className="w-4 h-4" />}
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-slate-100 capitalize">{activeTab}</h2>
                            <button
                                onClick={() => { setEditingId(null); setFormData(initialItemState); setShowForm(true); }}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Add New
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {loading ? (
                                [...Array(6)].map((_, i) => <div key={i} className="h-24 bg-slate-800 rounded-xl animate-pulse" />)
                            ) : items.map((item) => {
                                const ItemIcon = getIconComponent(item.icon);
                                const accent = item.color?.match(/^#?[0-9A-Fa-f]{6}$/)
                                    ? (item.color.startsWith('#') ? item.color : `#${item.color}`)
                                    : '#64748B';
                                return (
                                    <div key={item._id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex justify-between items-start group hover:border-blue-300 transition-colors">
                                        <div className="flex items-start gap-3">
                                            {/* Icon preview badge */}
                                            {ItemIcon && (
                                                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                                                    style={{ backgroundColor: `${accent}22`, border: `1px solid ${accent}55` }}>
                                                    <ItemIcon className="w-4 h-4" style={{ color: accent }} />
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-bold text-white">{item.translations?.['en']?.name || item.code}</div>
                                                <div className="text-xs text-slate-400 font-mono mt-0.5">{item.code}</div>
                                                {item.icon && <div className="text-xs text-slate-500 mt-0.5">{item.icon}</div>}
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEdit(item)} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-900/40 rounded-lg">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(item._id!)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-900/40 rounded-lg">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Modal Form */}
                <AnimatePresence>
                    {showForm && (
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                            >
                                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-white">
                                        {editingId ? 'Edit' : 'Create'} {activeTab === 'categories' ? 'Category' : activeTab === 'tags' ? 'Tag' : 'Vibe'}
                                    </h3>
                                    <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-200">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                                    <LanguageTabs activeLang={activeLang} onChange={setActiveLang} />

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-200">Name ({activeLang.toUpperCase()})</label>
                                        <input
                                            type="text"
                                            className="w-full border border-slate-800 bg-slate-950 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-white"
                                            placeholder={activeLang === 'en' ? 'e.g. Festival' : 'Translate name…'}
                                            value={getName()}
                                            onChange={(e) => updateName(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className={clsx('space-y-4', activeLang !== 'en' && 'hidden')}>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-200">Code (Slug)</label>
                                            <input
                                                type="text"
                                                className="w-full border border-slate-800 bg-slate-950 p-3 rounded-xl text-white font-mono text-sm outline-none focus:border-blue-500"
                                                placeholder="e.g. festival"
                                                value={formData.code}
                                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                                required
                                            />
                                            <p className="text-xs text-slate-400">Unique identifier used in code. Cannot change after creation.</p>
                                        </div>

                                        {(activeTab === 'categories' || activeTab === 'vibes') && (
                                            <div className="space-y-4">
                                                {/* Visual Icon Picker */}
                                                <IconPickerField
                                                    value={formData.icon || ''}
                                                    color={formData.color || ''}
                                                    onChange={(name) => setFormData({ ...formData, icon: name })}
                                                />

                                                {/* Color Field with swatch preview */}
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-200">Color (Hex)</label>
                                                    <div className="flex gap-2 items-center">
                                                        <div
                                                            className="w-10 h-10 rounded-lg border border-slate-700 flex-shrink-0"
                                                            style={{
                                                                backgroundColor: formData.color?.match(/^#?[0-9A-Fa-f]{6}$/)
                                                                    ? (formData.color.startsWith('#') ? formData.color : `#${formData.color}`)
                                                                    : '#64748b'
                                                            }}
                                                        />
                                                        <input
                                                            type="text"
                                                            className="flex-1 border border-slate-800 bg-slate-950 p-3 rounded-xl text-white font-mono text-sm outline-none focus:border-blue-500"
                                                            placeholder="e.g. #8b5cf6 or purple"
                                                            value={formData.color || ''}
                                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-slate-400">Named colors also work: purple, orange, red, blue, green, pink, teal, indigo, rose, amber, cyan.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-2 flex justify-end gap-3">
                                        <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-300 font-medium hover:bg-slate-800 rounded-lg">
                                            Cancel
                                        </button>
                                        <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                                            Save
                                        </button>
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
