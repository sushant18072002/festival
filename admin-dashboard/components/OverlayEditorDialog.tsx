/**
 * OverlayEditorDialog.tsx
 * Full-screen split-view overlay editor.
 * Left: live phone-sized preview (single source of truth)
 * Right: greeting/quote selectors + overlay configurator (controls only)
 */
import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { X, Save, Layers, Link as LinkIcon } from 'lucide-react';
import { getImageUrl } from '../lib/getImageUrl';
import OverlayConfigurator, { OverlayConfig } from './OverlayConfigurator';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface OverlayEditorDialogProps {
    image: any;
    greetings: any[];
    quotes: any[];
    onClose: () => void;
    onSave: (updates: Partial<any>) => Promise<void>;
}

// Maps position string → absolute CSS for the phone frame inner container
// CRITICAL: top/center/bottom MUST span full width using left+right, NOT a floating centered box
const getOverlayStyle = (position: string = 'bottom'): React.CSSProperties => {
    switch (position) {
        // Full-width spans — text fills phone horizontally, padding handles gutters
        case 'top': return { top: '5%', left: '4%', right: '4%' };
        case 'center': return { top: '50%', left: '4%', right: '4%', transform: 'translateY(-50%)' };
        case 'bottom': return { bottom: '8%', left: '4%', right: '4%' };
        // Corner anchors — text starts or ends at corner, limited width
        case 'top-left': return { top: '5%', left: '4%', maxWidth: '60%' };
        case 'top-right': return { top: '5%', right: '4%', maxWidth: '60%' };
        case 'bottom-left': return { bottom: '8%', left: '4%', maxWidth: '60%' };
        case 'bottom-right': return { bottom: '8%', right: '4%', maxWidth: '60%' };
        default: return { bottom: '8%', left: '4%', right: '4%' };
    }
};

// Infer default text-align from position if not explicitly set
const inferTextAlign = (position: string = 'bottom', configured?: string): React.CSSProperties['textAlign'] => {
    if (configured) return configured as any;
    if (position.includes('right')) return 'right';
    if (position.includes('left')) return 'left';
    return 'center'; // top, center, bottom all default to center
};

interface PhoneOverlayTextProps {
    text: string;
    config: Partial<OverlayConfig> | undefined;
    scale?: number;
}

function PhoneOverlayText({ text, config, scale = 0.60 }: PhoneOverlayTextProps) {
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
                backgroundColor: config?.glass_bg
                    ? `rgba(0,0,0,${config?.glass_opacity ?? 0.25})`
                    : 'transparent',
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

export default function OverlayEditorDialog({
    image, greetings, quotes, onClose, onSave
}: OverlayEditorDialogProps) {
    const [greetingId, setGreetingId] = useState<string>(image.greeting_id?._id || image.greeting_id || '');
    const [quoteId, setQuoteId] = useState<string>(image.quote_id?._id || image.quote_id || '');
    const [hasOverlay, setHasOverlay] = useState<boolean>(image.has_overlay || false);
    const [showWatermark, setShowWatermark] = useState<boolean>(image.show_watermark !== false);
    const [greetingConfig, setGreetingConfig] = useState<Partial<OverlayConfig>>(image.greeting_config || {});
    const [quoteConfig, setQuoteConfig] = useState<Partial<OverlayConfig>>(image.quote_config || {});
    const [saving, setSaving] = useState(false);

    const selectedGreeting = greetings.find(g => g._id === greetingId);
    const selectedQuote = quotes.find(q => q._id === quoteId);

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave({
                _id: image._id,
                greeting_id: greetingId || undefined,
                quote_id: quoteId || undefined,
                has_overlay: hasOverlay,
                show_watermark: showWatermark,
                greeting_config: greetingConfig,
                quote_config: quoteConfig,
            });
            toast.success('Overlay settings saved!');
            onClose();
        } catch {
            toast.error('Failed to save overlay settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] bg-slate-950/98 backdrop-blur-sm flex flex-col">

                {/* ── Topbar ─────────────────────────────────────────── */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <Layers className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Overlay Editor</h2>
                            <p className="text-xs text-slate-400 font-mono">{image.filename}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-60"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving…' : 'Save Overlay'}
                        </button>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* ── Body ───────────────────────────────────────────── */}
                <div className="flex flex-1 overflow-hidden">

                    {/* ── LEFT: Phone Preview ────────────────────────── */}
                    <div className="w-[290px] flex-shrink-0 bg-[#080c18] border-r border-slate-800 flex flex-col items-center py-4 px-3 gap-3 overflow-hidden">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest self-start flex-shrink-0">Live Preview</p>

                        {/* Phone frame: HEIGHT-driven — flex-1 min-h-0 fills remaining space, width follows aspect-ratio */}
                        <div className="flex-1 min-h-0 w-full flex items-center justify-center">
                            <div
                                className="relative h-full max-h-full mx-auto rounded-[2.8rem] border-[7px] border-slate-600 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden bg-black"
                                style={{ aspectRatio: '9/19.5' }}
                            >
                                {/* iPhone Dynamic Island */}
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[30%] h-[3%] bg-black rounded-full z-30 border border-slate-700" />

                                <img
                                    src={getImageUrl(image.s3_key)}
                                    alt={image.caption || ''}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />

                                {hasOverlay && selectedGreeting && (
                                    <PhoneOverlayText text={selectedGreeting.text} config={greetingConfig} />
                                )}
                                {hasOverlay && selectedQuote && (
                                    <PhoneOverlayText
                                        text={`\u201c${selectedQuote.text?.substring(0, 80)}${selectedQuote.text?.length > 80 ? '\u2026\u201d' : '\u201d'}`}
                                        config={quoteConfig}
                                    />
                                )}
                                {hasOverlay && !selectedGreeting && !selectedQuote && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                                        <p className="text-[9px] text-slate-300 text-center px-4 leading-relaxed">Select a greeting or quote →</p>
                                    </div>
                                )}
                                {showWatermark && (
                                    <div className="absolute bottom-3 right-3 bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5 text-[7px] text-white font-bold tracking-wide z-10">
                                        Utsav Pro
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Compact horizontal toggles */}
                        <div className="flex gap-2 w-full flex-shrink-0">
                            <label className="flex-1 flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 cursor-pointer hover:border-emerald-500/30 transition-colors">
                                <span className="text-xs font-medium text-slate-200">Overlay</span>
                                <input type="checkbox" checked={hasOverlay} onChange={e => setHasOverlay(e.target.checked)} className="w-3.5 h-3.5 accent-emerald-500" />
                            </label>
                            <label className="flex-1 flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 cursor-pointer hover:border-slate-600 transition-colors">
                                <span className="text-xs font-medium text-slate-200">Watermark</span>
                                <input type="checkbox" checked={showWatermark} onChange={e => setShowWatermark(e.target.checked)} className="w-3.5 h-3.5 accent-emerald-500" />
                            </label>
                        </div>
                    </div>

                    {/* ── RIGHT: Content + Configurator ──────────────── */}
                    <div className="flex-1 overflow-y-auto bg-slate-900">

                        {/* Greeting + Quote selectors */}
                        <div className="p-6 border-b border-slate-800">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <LinkIcon className="w-3.5 h-3.5" /> Link Content to This Image
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Greeting</label>
                                    <select
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:border-emerald-500 outline-none transition-colors"
                                        value={greetingId}
                                        onChange={e => setGreetingId(e.target.value)}
                                    >
                                        <option value="">— No Greeting —</option>
                                        {greetings.map(g => (
                                            <option key={g._id} value={g._id}>
                                                {g.text?.substring(0, 55) || `Greeting ${g._id.substring(0, 4)}`}
                                            </option>
                                        ))}
                                    </select>
                                    {selectedGreeting && (
                                        <p className="mt-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 italic leading-relaxed">
                                            "{selectedGreeting.text}"
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Quote</label>
                                    <select
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:border-emerald-500 outline-none transition-colors"
                                        value={quoteId}
                                        onChange={e => setQuoteId(e.target.value)}
                                    >
                                        <option value="">— No Quote —</option>
                                        {quotes.map(q => (
                                            <option key={q._id} value={q._id}>
                                                {q.text?.substring(0, 55) || `Quote ${q._id.substring(0, 4)}`}
                                            </option>
                                        ))}
                                    </select>
                                    {selectedQuote && (
                                        <p className="mt-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 italic leading-relaxed">
                                            "{selectedQuote.text?.substring(0, 100)}"
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Overlay Configurator — controls only (hidePreview=true) */}
                        <div className={clsx('transition-opacity duration-300', !hasOverlay && 'opacity-40 pointer-events-none')}>
                            {!hasOverlay && (
                                <div className="mx-6 mt-6 p-4 bg-slate-800/50 border border-slate-700 rounded-xl text-center text-sm text-slate-400">
                                    Enable <strong className="text-white">"Dynamic Overlay"</strong> on the left to configure text styles.
                                </div>
                            )}
                            <OverlayConfigurator
                                imageUrl={getImageUrl(image.s3_key)}
                                greetingText={selectedGreeting?.text}
                                quoteText={selectedQuote?.text}
                                greetingTranslations={selectedGreeting?.translations}
                                quoteTranslations={selectedQuote?.translations}
                                greetingConfig={greetingConfig}
                                quoteConfig={quoteConfig}
                                hidePreview={true}
                                onUpdate={(type, conf) => {
                                    if (type === 'greeting_config') setGreetingConfig(conf);
                                    else setQuoteConfig(conf);
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AnimatePresence>
    );
}
