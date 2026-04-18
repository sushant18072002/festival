import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import LanguageTabs from '../components/LanguageTabs';
import ConfirmationModal from '../components/ConfirmationModal';
import {
    Plus, Edit2, Trash2, Save, X, Tag, Folder, Settings as SettingsIcon,
    Sparkles, Flag, Circle, MapPin, Globe,
    PartyPopper, Music, Moon, Heart, Sunrise, Sun, Star, Flame,
    Camera, Award, Gift, BookOpen, Leaf, Feather,
    Coffee, Zap, Bell, Crown, Diamond, Anchor,
    Palette, Waves, Wind, Snowflake, Cloud, Mountain,
    Flower2, Activity, Database, ShieldCheck, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import clsx from 'clsx';

// ─── Icon Registry ──────────────────────────────────────────────────────────
const SUPPORTED_ICONS = [
    { name: 'Sparkles', Icon: Sparkles },
    { name: 'Flag', Icon: Flag },
    { name: 'Om', Icon: Circle },
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
    { name: 'Flower', Icon: Flower2 },
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
        <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Icon Representation</label>

            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-4 border border-slate-800 bg-slate-950 rounded-2xl px-4 py-3.5 hover:border-blue-500/50 transition-all shadow-inner group"
            >
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${accent}22`, border: `1px solid ${accent}55` }}
                >
                    {selected
                        ? <selected.Icon className="w-5 h-5" style={{ color: accent }} />
                        : <Sparkles className="w-5 h-5 text-slate-800" />
                    }
                </div>
                <span className="flex-1 text-left text-xs text-white font-black uppercase tracking-widest">
                    {value || <span className="text-slate-800 font-black">Select Vector…</span>}
                </span>
                <ChevronRight className={clsx("text-slate-700 w-4 h-4 transition-transform", open && "rotate-90")} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="border border-slate-800 bg-slate-900 rounded-[2rem] p-5 shadow-2xl relative z-20 max-h-64 overflow-y-auto custom-scrollbar"
                    >
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4 px-1">
                            System Bundled Assets (Flutter Compatible)
                        </p>
                        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
                            {SUPPORTED_ICONS.map(({ name, Icon }) => {
                                const isSelected = name === value;
                                return (
                                    <button
                                        key={name}
                                        type="button"
                                        title={name}
                                        onClick={() => { onChange(name); setOpen(false); }}
                                        className={clsx(
                                            'flex flex-col items-center gap-2 p-3 rounded-xl transition-all active:scale-90',
                                            isSelected
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                                : 'hover:bg-slate-800 text-slate-500 hover:text-white'
                                        )}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="text-[8px] font-black leading-none truncate w-full text-center uppercase tracking-tighter opacity-50">
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
                                className="mt-4 w-full text-[9px] font-black text-slate-600 hover:text-rose-500 py-3 border-t border-slate-800 uppercase tracking-widest"
                            >
                                Terminate selection
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

export default function Settings() {
    const [activeTab, setActiveTab] = useState<'categories' | 'tags' | 'vibes'>('categories');
    const [items, setItems] = useState<TaxonomyItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [baseImageUrl, setBaseImageUrl] = useState<string>('');
    const [formData, setFormData] = useState<TaxonomyItem>(initialItemState);
    const [activeLang, setActiveLang] = useState('en');

    // Modal state
    const [modalConfig, setModalConfig] = useState<{
        open: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ open: false, title: '', message: '', onConfirm: () => {} });

    useEffect(() => { fetchItems(); fetchConfig(); }, [activeTab]);

    const fetchConfig = async () => {
        try {
            const res = await fetch('/api/system/config');
            const data = await res.json();
            if (data.success && data.config) setBaseImageUrl(data.config.base_image_url || '');
        } catch { console.error('Failed to load config'); }
    };

    const updateBaseImageUrl = async () => {
        const toastId = toast.loading('UPDATING_MANIFEST_S3...');
        try {
            const res = await fetch('/api/system/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ base_image_url: baseImageUrl })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('MANIFEST_UPDATED', { id: toastId });
            } else {
                toast.error(data.error || 'MANIFEST_FAILURE', { id: toastId });
            }
        } catch { toast.error('NETWORK_PROTOCOL_ERROR', { id: toastId }); }
    };

    const fetchItems = async () => {
        setLoading(true);
        try {
            const ep = activeTab === 'categories' ? '/api/categories' : activeTab === 'tags' ? '/api/tags' : '/api/vibes';
            const res = await fetch(ep);
            const data = await res.json();
            if (data.success) setItems(data.data);
        } catch { toast.error('MANIFEST_FETCH_ERROR'); }
        finally { setLoading(false); }
    };

    const handleEdit = (item: TaxonomyItem) => {
        setFormData(item); setEditingId(item._id!); setActiveLang('en'); setShowForm(true);
    };

    const confirmDelete = (id: string) => {
        const label = activeTab === 'categories' ? 'Category' : activeTab === 'tags' ? 'Tag' : 'Vibe';
        setModalConfig({
            open: true,
            title: `Terminate ${label}?`,
            message: `Caution: This will permanently remove the taxonomy entity. Reference links in production app may break.`,
            onConfirm: () => handleDelete(id)
        });
    };

    const handleDelete = async (id: string) => {
        setModalConfig(prev => ({ ...prev, open: false }));
        const toastId = toast.loading('TERMINATING_ENTITY...');
        try {
            const ep = activeTab === 'categories' ? '/api/categories' : activeTab === 'tags' ? '/api/tags' : '/api/vibes';
            const res = await fetch(`${ep}?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) { 
                toast.success('ENTITY_TERMINATED', { id: toastId }); 
                fetchItems(); 
            } else {
                toast.error('DELETE_FAILURE', { id: toastId });
            }
        } catch { toast.error('NETWORK_PROTOCOL_ERROR', { id: toastId }); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const toastId = toast.loading('COMMITTING_CHANGES...');
        const ep = activeTab === 'categories' ? '/api/categories' : activeTab === 'tags' ? '/api/tags' : '/api/vibes';
        const body = editingId ? { ...formData, _id: editingId } : formData;
        try {
            const res = await fetch(ep, { method: editingId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            const data = await res.json();
            if (data.success) {
                toast.success(editingId ? 'MANIFEST_UPDATED' : 'ENTITY_REGISTERED', { id: toastId });
                setShowForm(false); setEditingId(null); setFormData(initialItemState); fetchItems();
            } else { toast.error(data.error || 'SYNC_FAILURE', { id: toastId }); }
        } catch { toast.error('NETWORK_PROTOCOL_ERROR', { id: toastId }); }
    };

    const updateName = (value: string) => {
        setFormData({ ...formData, translations: { ...formData.translations, [activeLang]: { name: value } } });
    };

    const getName = () => formData.translations?.[activeLang]?.name || '';

    const getIconComponent = (name?: string) => {
        const entry = SUPPORTED_ICONS.find(i => i.name === name);
        return entry ? entry.Icon : null;
    };

    return (
        <div className="flex h-screen bg-slate-950 font-sans text-white overflow-hidden">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 shadow-inner group">
                            <SettingsIcon className="w-8 h-8 text-blue-400 group-hover:scale-110 group-hover:rotate-45 transition-transform" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-indigo-400">
                                System Settings
                            </h1>
                            <p className="text-slate-500 mt-1 uppercase tracking-widest text-[10px] font-bold flex items-center gap-2">
                                <Database size={12} className="text-emerald-500" /> Operational Core · Global Manifest
                            </p>
                        </div>
                    </div>
                </div>

                {/* Global Infrastructure */}
                <div className="bg-slate-900/40 rounded-[2.5rem] border border-slate-800 p-8 mb-10 shadow-2xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-blue-500/10 transition-all duration-700" />
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                             <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
                                <ShieldCheck className="w-4 h-4 text-blue-400" />
                             </div>
                             <h2 className="text-sm font-black text-slate-100 uppercase tracking-widest">Global Infrastructure Protocol</h2>
                        </div>
                        
                        <div className="flex flex-col xl:flex-row items-end gap-6">
                            <div className="flex-1 space-y-3 w-full">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Asset CDN Base Source (Single Point of Truth)</label>
                                <div className="relative group/input w-full">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-800 group-focus-within/input:text-blue-500 transition-colors" />
                                    <input
                                        type="text"
                                        className="w-full bg-slate-950 border border-slate-800 pl-12 pr-4 py-4 rounded-2xl text-[10px] font-black tracking-widest text-white outline-none focus:border-blue-500/50 shadow-inner transition-all placeholder:text-slate-800"
                                        placeholder="e.g. HTTPS://CDN.UTSAV.IO/FILES/"
                                        value={baseImageUrl}
                                        onChange={(e) => setBaseImageUrl(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button 
                                onClick={updateBaseImageUrl} 
                                className="w-full xl:w-auto h-[52px] px-10 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                <Save className="w-4 h-4" /> Commit Manifest
                            </button>
                        </div>
                        <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest mt-6 bg-slate-950/30 p-3 rounded-xl border border-slate-800/50 w-fit">
                            Warning: This URL is hard-prefixed to all volatile asset paths in the production JSON feed.
                        </p>
                    </div>
                </div>

                {/* Taxonomy Management */}
                <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden mb-10">
                    <div className="flex border-b border-slate-800 bg-slate-950/20">
                        {(['categories', 'tags', 'vibes'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={clsx('flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all active:bg-slate-950/50', activeTab === tab
                                    ? 'border-blue-600 text-blue-400 bg-blue-500/5'
                                    : 'border-transparent text-slate-600 hover:text-slate-300 hover:bg-slate-950/30'
                                )}
                            >
                                {tab === 'categories' ? <Folder className="w-4 h-4" /> : tab === 'tags' ? <Tag className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="p-10">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-tight">{activeTab} Registry</h2>
                                <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mt-1.5">Manage entity taxonomy logic</p>
                            </div>
                            <button
                                onClick={() => { setEditingId(null); setFormData(initialItemState); setShowForm(true); }}
                                className="flex items-center gap-3 bg-white text-slate-950 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-slate-200 transition-all active:scale-95"
                            >
                                <Plus className="w-4 h-4" /> Initialize Entity
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {loading ? (
                                [...Array(6)].map((_, i) => <div key={i} className="h-32 bg-slate-950/50 border border-slate-800 rounded-[2rem] animate-pulse" />)
                            ) : items.map((item) => {
                                const ItemIcon = getIconComponent(item.icon);
                                const accent = item.color?.match(/^#?[0-9A-Fa-f]{6}$/)
                                    ? (item.color.startsWith('#') ? item.color : `#${item.color}`)
                                    : '#64748B';
                                return (
                                    <div key={item._id} className="group relative bg-slate-950 border border-slate-800 p-6 rounded-[2rem] hover:border-blue-500/40 transition-all duration-300 shadow-xl flex items-start gap-4">
                                        {/* Icon preview */}
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform"
                                            style={{ backgroundColor: `${accent}22`, border: `1px solid ${accent}55` }}>
                                            {ItemIcon ? <ItemIcon className="w-5 h-5 shadow-sm" style={{ color: accent }} /> : <Tag className="w-5 h-5 text-slate-800" />}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="font-black text-white uppercase tracking-tight truncate group-hover:text-blue-300 transition-colors">
                                                {item.translations?.['en']?.name || item.code}
                                            </div>
                                            <div className="text-[9px] font-black text-slate-700 uppercase tracking-widest mt-1.5 font-mono truncate">
                                                ID: {item.code}
                                            </div>
                                            {item.icon && (
                                                <div className="inline-flex items-center gap-1.5 mt-3 py-1 px-2.5 bg-slate-900 border border-slate-800 rounded-lg text-[8px] font-black text-slate-600 uppercase tracking-widest">
                                                    <Activity size={10} /> {item.icon}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-2 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => handleEdit(item)} className="p-2.5 bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-lg active:scale-90">
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => confirmDelete(item._id!)} className="p-2.5 bg-rose-600/10 border border-rose-500/20 text-rose-500 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-lg active:scale-90">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Unified Confirmation Modal */}
                <ConfirmationModal 
                    isOpen={modalConfig.open}
                    title={modalConfig.title}
                    message={modalConfig.message}
                    isDestructive={true}
                    confirmLabel="Execute Termination"
                    onConfirm={modalConfig.onConfirm}
                    onCancel={() => setModalConfig(prev => ({ ...prev, open: false }))}
                />

                {/* Registration Modal */}
                <AnimatePresence>
                    {showForm && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0" onClick={() => setShowForm(false)} />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden"
                            >
                                <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
                                    <div>
                                        <h3 className="text-xl font-black text-white uppercase tracking-tight">
                                            {editingId ? 'Modify' : 'Register'} Entity
                                        </h3>
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1.5">
                                            {activeTab === 'categories' ? 'Category' : activeTab === 'tags' ? 'Tag' : 'Vibe'} Logic Definition
                                        </p>
                                    </div>
                                    <button onClick={() => setShowForm(false)} className="p-4 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-2xl transition-all shadow-xl">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                                    <LanguageTabs activeLang={activeLang} onChange={setActiveLang} />

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Identity Display ({activeLang.toUpperCase()})</label>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-[10px] font-black tracking-widest text-white outline-none focus:border-blue-500/50 shadow-inner placeholder:text-slate-800"
                                            placeholder={activeLang === 'en' ? 'E.G. FESTIVAL' : 'PROVIDE STRING TRANSLATION…'}
                                            value={getName()}
                                            onChange={(e) => updateName(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <AnimatePresence>
                                        {activeLang === 'en' && (
                                            <motion.div 
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="space-y-8 pt-4 border-t border-slate-800/50"
                                            >
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 text-rose-500">System Slug (ReadOnly after Commit)</label>
                                                    <div className="relative group/slug">
                                                        <Database className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-800" />
                                                        <input
                                                            type="text"
                                                            disabled={!!editingId}
                                                            className="w-full bg-slate-950 border border-slate-800 pl-12 pr-4 py-4 rounded-2xl text-[10px] font-black tracking-widest text-white outline-none focus:border-blue-500/50 shadow-inner disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                                                            placeholder="E.G. FESTIVAL"
                                                            value={formData.code}
                                                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                {(activeTab === 'categories' || activeTab === 'vibes') && (
                                                    <section className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                                                        <IconPickerField
                                                            value={formData.icon || ''}
                                                            color={formData.color || ''}
                                                            onChange={(name) => setFormData({ ...formData, icon: name })}
                                                        />

                                                        <div className="space-y-3">
                                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Visual Signature (Hue)</label>
                                                            <div className="flex gap-4 items-center">
                                                                <div
                                                                    className="w-14 h-14 rounded-2xl border border-slate-800 flex-shrink-0 shadow-lg"
                                                                    style={{
                                                                        backgroundColor: formData.color?.match(/^#?[0-9A-Fa-f]{6}$/)
                                                                            ? (formData.color.startsWith('#') ? formData.color : `#${formData.color}`)
                                                                            : '#1e293b'
                                                                    }}
                                                                />
                                                                <div className="relative group/hue flex-1">
                                                                    <Palette className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-800 group-focus-within/hue:text-blue-500 transition-colors" />
                                                                    <input
                                                                        type="text"
                                                                        className="w-full bg-slate-950 border border-slate-800 pl-12 pr-4 py-4 rounded-2xl text-[10px] font-black tracking-widest text-white uppercase outline-none focus:border-blue-500/50 shadow-inner placeholder:text-slate-800"
                                                                        placeholder="#FFFFFF OR BRAND_BLUE"
                                                                        value={formData.color || ''}
                                                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </section>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="pt-6 flex justify-end gap-4 border-t border-slate-800/50">
                                        <button type="button" onClick={() => setShowForm(false)} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-white transition-all">
                                            Abort Protocol
                                        </button>
                                        <button type="submit" className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 text-[10px]">
                                            {editingId ? 'Modify Manifest' : 'Register Object'}
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
