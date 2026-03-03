import React, { useState } from 'react';
import clsx from 'clsx';
import { Type, Layout, Palette, Box, Grid, AlignLeft, AlignCenter, AlignRight, Italic, Globe } from 'lucide-react';

export interface OverlayConfig {
    // Layout
    position: string;
    padding: number;
    max_width: number;        // % of image width, default 80
    margin_top?: number;
    margin_bottom?: number;
    margin_left?: number;
    margin_right?: number;

    // Typography
    font_size: number;
    font_family: string;
    font_weight: number;
    font_style: 'normal' | 'italic';
    text_align: 'left' | 'center' | 'right';
    letter_spacing: number;   // em units * 100, e.g. 2 = 0.02em
    line_height: number;      // * 10, e.g. 14 = 1.4

    // Color
    color: string;
    shadow: boolean;

    // Background
    glass_bg: boolean;
    glass_opacity: number;
    glass_blur: number;       // backdrop-blur amount

    // Internal (for animations)
    animation: string;
}

interface OverlayConfiguratorProps {
    imageUrl: string;
    greetingText?: string;
    quoteText?: string;
    greetingTranslations?: Record<string, { text?: string }>;
    quoteTranslations?: Record<string, { text?: string }>;
    greetingConfig?: Partial<OverlayConfig>;
    quoteConfig?: Partial<OverlayConfig>;
    onUpdate: (type: 'greeting_config' | 'quote_config', config: Partial<OverlayConfig>) => void;
    /** When true, hides the internal image preview (use when host already provides a preview) */
    hidePreview?: boolean;
}

const POSITIONS = ['top', 'center', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'];
const FONTS = ['DM Serif Display', 'Inter', 'Outfit', 'Playfair Display', 'Poppins', 'Noto Sans', 'Noto Serif'];
const LANG_LABELS: Record<string, string> = {
    en: 'EN', hi: 'HI', mr: 'MR', gu: 'GU', bn: 'BN', ta: 'TA', te: 'TE', kn: 'KN', ml: 'ML'
};

// Maps position string → flexbox classes for the internal preview
const getPositionClasses = (position: string = 'bottom') => {
    switch (position) {
        case 'top': return 'justify-center items-start pt-6';
        case 'center': return 'justify-center items-center';
        case 'bottom': return 'justify-center items-end pb-10';
        case 'top-left': return 'justify-start items-start p-4';
        case 'top-right': return 'justify-end items-start p-4';
        case 'bottom-left': return 'justify-start items-end p-4 pb-10';
        case 'bottom-right': return 'justify-end items-end p-4 pb-10';
        default: return 'justify-center items-end pb-10';
    }
};

const renderPreviewText = (
    text: string,
    conf: Partial<OverlayConfig> | undefined,
    maxWidthPct = 80
) => {
    if (!text) return null;
    const pos = getPositionClasses(conf?.position);

    return (
        <div className={clsx('absolute inset-0 flex flex-col pointer-events-none', pos)}>
            <div
                className={clsx(
                    'transition-all duration-300',
                    conf?.glass_bg && 'border border-white/20 rounded-xl'
                )}
                style={{
                    padding: `${conf?.padding ?? 14}px`,
                    maxWidth: `${conf?.max_width ?? 80}%`,
                    marginTop: `${conf?.margin_top ?? 0}px`,
                    marginBottom: `${conf?.margin_bottom ?? 0}px`,
                    marginLeft: `${conf?.margin_left ?? 0}px`,
                    marginRight: `${conf?.margin_right ?? 0}px`,
                    backgroundColor: conf?.glass_bg
                        ? `rgba(0,0,0,${conf?.glass_opacity ?? 0.25})`
                        : 'transparent',
                    backdropFilter: conf?.glass_bg && conf?.glass_blur ? `blur(${conf.glass_blur}px)` : undefined,
                }}
            >
                <p
                    style={{
                        fontFamily: conf?.font_family || 'DM Serif Display',
                        fontSize: `${conf?.font_size || 22}px`,
                        fontWeight: conf?.font_weight || 400,
                        fontStyle: conf?.font_style || 'normal',
                        textAlign: (conf?.text_align as any) || 'center',
                        letterSpacing: conf?.letter_spacing ? `${conf.letter_spacing / 100}em` : undefined,
                        lineHeight: conf?.line_height ? `${conf.line_height / 10}` : '1.35',
                        color: conf?.color || '#FFFFFF',
                        textShadow: conf?.shadow !== false ? '0px 2px 6px rgba(0,0,0,0.6)' : 'none',
                    }}
                >
                    {text}
                </p>
            </div>
        </div>
    );
};

// ToggleSwitch component
const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={e => onChange(e.target.checked)} />
        <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
    </label>
);

export default function OverlayConfigurator({
    imageUrl,
    greetingText,
    quoteText,
    greetingTranslations,
    quoteTranslations,
    greetingConfig,
    quoteConfig,
    onUpdate,
    hidePreview = false
}: OverlayConfiguratorProps) {
    const [activeTab, setActiveTab] = useState<'greeting' | 'quote'>('greeting');
    const [previewLang, setPreviewLang] = useState<string>('en');

    const config = activeTab === 'greeting' ? greetingConfig : quoteConfig;
    const hasText = activeTab === 'greeting' ? !!greetingText : !!quoteText;

    // Resolve preview text: use translation if available and selected, otherwise English
    const getPreviewText = (lang: string) => {
        if (lang === 'en') return activeTab === 'greeting' ? greetingText : quoteText;
        const translations = activeTab === 'greeting' ? greetingTranslations : quoteTranslations;
        return translations?.[lang]?.text || (activeTab === 'greeting' ? greetingText : quoteText);
    };
    const currentText = getPreviewText(previewLang) || '';

    const handleConfigChange = (key: keyof OverlayConfig, value: any) => {
        onUpdate(activeTab === 'greeting' ? 'greeting_config' : 'quote_config', {
            ...(config || {}),
            [key]: value,
        });
    };

    // Available translation languages (en always included)
    const availableLangs = Object.keys(LANG_LABELS).filter(lang => {
        if (lang === 'en') return true;
        const translations = activeTab === 'greeting' ? greetingTranslations : quoteTranslations;
        return translations && translations[lang]?.text;
    });

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mt-4">
            {/* Header tabs */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
                <div className="flex items-center gap-2">
                    <Layout className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">Live Overlay Configurator</h3>
                </div>
                <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                    <button
                        type="button"
                        onClick={() => setActiveTab('greeting')}
                        className={clsx('px-4 py-1.5 text-xs font-semibold rounded-md transition-colors', activeTab === 'greeting' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:text-white')}
                    >
                        Greeting Overlay
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('quote')}
                        className={clsx('px-4 py-1.5 text-xs font-semibold rounded-md transition-colors', activeTab === 'quote' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:text-white')}
                    >
                        Quote Overlay
                    </button>
                </div>
            </div>

            {/* Internal preview (only shown when hidePreview is false) + Controls */}
            <div className={clsx('grid', hidePreview ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2')}>

                {/* Visual Preview — hidden when host provides its own preview */}
                {!hidePreview && (
                    <div className="bg-slate-950 p-6 flex flex-col items-center gap-4 relative border-r border-slate-800">
                        <div className="relative aspect-[3/4] w-full max-w-[300px] rounded-xl overflow-hidden shadow-2xl bg-black">
                            <img src={imageUrl} alt="Base Image" className="absolute inset-0 w-full h-full object-cover" />

                            {/* Inactive overlay dimmed for context */}
                            {activeTab === 'quote' && greetingText && (
                                <div className="opacity-40 blur-[0.5px]">
                                    {renderPreviewText(greetingText, greetingConfig)}
                                </div>
                            )}
                            {activeTab === 'greeting' && quoteText && (
                                <div className="opacity-40 blur-[0.5px]">
                                    {renderPreviewText(quoteText, quoteConfig)}
                                </div>
                            )}

                            {/* Active text */}
                            {renderPreviewText(currentText, config)}

                            {!hasText && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-20">
                                    <div className="text-center px-6">
                                        <Type className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                                        <p className="text-sm text-slate-400">Select a linked {activeTab} to see the overlay.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Language preview switcher */}
                        {hasText && availableLangs.length > 1 && (
                            <div className="flex flex-wrap gap-1.5 justify-center">
                                <span className="text-[10px] text-slate-500 self-center mr-1 flex items-center gap-1"><Globe className="w-3 h-3" /> Preview in:</span>
                                {availableLangs.map(lang => (
                                    <button
                                        key={lang}
                                        type="button"
                                        onClick={() => setPreviewLang(lang)}
                                        className={clsx(
                                            'px-2 py-0.5 text-[10px] font-bold rounded border uppercase transition-colors',
                                            previewLang === lang
                                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                                        )}
                                    >
                                        {LANG_LABELS[lang]}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Configuration Panel */}
                <div className={clsx('p-6 space-y-5 bg-slate-900 overflow-y-auto max-h-[640px]', !hasText && 'opacity-50 pointer-events-none')}>

                    {/* ── Position ─────────────────────────────────────── */}
                    <div>
                        <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider">
                            <Grid className="w-3.5 h-3.5" /> Position
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                            {POSITIONS.map(pos => (
                                <button
                                    key={pos}
                                    type="button"
                                    onClick={() => handleConfigChange('position', pos)}
                                    className={clsx(
                                        'px-2 py-2 text-[10px] font-medium rounded-lg border transition-all capitalize',
                                        (config?.position || 'bottom') === pos
                                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                                    )}
                                >
                                    {pos.replace('-', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Max Width */}
                    <div>
                        <label className="block text-[10px] text-slate-500 mb-1">
                            Max Width ({config?.max_width ?? 80}% of image)
                        </label>
                        <input
                            type="range" min="40" max="100" step="5"
                            className="w-full accent-emerald-500"
                            value={config?.max_width ?? 80}
                            onChange={e => handleConfigChange('max_width', parseInt(e.target.value))}
                        />
                    </div>

                    <hr className="border-slate-800" />

                    {/* ── Typography ───────────────────────────────────── */}
                    <div>
                        <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider">
                            <Type className="w-3.5 h-3.5" /> Typography
                        </label>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] text-slate-500 mb-1">Font Family</label>
                                <select
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-emerald-500 outline-none"
                                    value={config?.font_family || 'DM Serif Display'}
                                    onChange={e => handleConfigChange('font_family', e.target.value)}
                                >
                                    {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] text-slate-500 mb-1">Size ({config?.font_size || 22}px)</label>
                                    <input
                                        type="range" min="10" max="72"
                                        className="w-full accent-emerald-500"
                                        value={config?.font_size || 22}
                                        onChange={e => handleConfigChange('font_size', parseInt(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-slate-500 mb-1">Weight</label>
                                    <select
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:border-emerald-500 outline-none"
                                        value={config?.font_weight || 400}
                                        onChange={e => handleConfigChange('font_weight', parseInt(e.target.value))}
                                    >
                                        <option value={300}>Light</option>
                                        <option value={400}>Regular</option>
                                        <option value={500}>Medium</option>
                                        <option value={600}>SemiBold</option>
                                        <option value={700}>Bold</option>
                                        <option value={800}>ExtraBold</option>
                                    </select>
                                </div>
                            </div>

                            {/* Alignment + Italic */}
                            <div className="flex items-center gap-3">
                                {/* Text align buttons */}
                                <div className="flex gap-1 bg-slate-950 border border-slate-800 rounded-lg p-1">
                                    {(['left', 'center', 'right'] as const).map(align => (
                                        <button
                                            key={align}
                                            type="button"
                                            onClick={() => handleConfigChange('text_align', align)}
                                            className={clsx(
                                                'p-1.5 rounded transition-colors',
                                                (config?.text_align || 'center') === align
                                                    ? 'bg-emerald-500/20 text-emerald-300'
                                                    : 'text-slate-400 hover:text-white'
                                            )}
                                            title={`Align ${align}`}
                                        >
                                            {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                                            {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                                            {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                                        </button>
                                    ))}
                                </div>

                                {/* Italic toggle */}
                                <button
                                    type="button"
                                    onClick={() => handleConfigChange('font_style', config?.font_style === 'italic' ? 'normal' : 'italic')}
                                    className={clsx(
                                        'p-1.5 rounded-lg border transition-colors flex items-center gap-1.5 text-xs font-medium',
                                        config?.font_style === 'italic'
                                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                                    )}
                                >
                                    <Italic className="w-3.5 h-3.5" />
                                    Italic
                                </button>
                            </div>

                            {/* Letter spacing + Line height */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] text-slate-500 mb-1">
                                        Letter Spacing ({((config?.letter_spacing ?? 0) / 100).toFixed(2)}em)
                                    </label>
                                    <input
                                        type="range" min="-5" max="20" step="1"
                                        className="w-full accent-emerald-500"
                                        value={config?.letter_spacing ?? 0}
                                        onChange={e => handleConfigChange('letter_spacing', parseInt(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-slate-500 mb-1">
                                        Line Height ({((config?.line_height ?? 14) / 10).toFixed(1)})
                                    </label>
                                    <input
                                        type="range" min="10" max="22" step="1"
                                        className="w-full accent-emerald-500"
                                        value={config?.line_height ?? 14}
                                        onChange={e => handleConfigChange('line_height', parseInt(e.target.value))}
                                    />
                                </div>
                            </div>

                            {/* Padding */}
                            {/* Padding & Margins */}
                            <div className="space-y-4 pt-4 border-t border-slate-800">
                                <div>
                                    <label className="block text-[10px] text-slate-500 mb-1 font-bold tracking-wider uppercase">Inner Padding ({config?.padding ?? 14}px)</label>
                                    <input
                                        type="range" min="4" max="48" step="2"
                                        className="w-full accent-emerald-500"
                                        value={config?.padding ?? 14}
                                        onChange={e => handleConfigChange('padding', parseInt(e.target.value))}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] text-slate-500 mb-2 font-bold tracking-wider uppercase">Outer Margins (Offset)</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[9px] text-slate-500 mb-1">Top ({config?.margin_top ?? 0}px)</label>
                                            <input type="range" min="-100" max="200" step="5" className="w-full accent-emerald-500" value={config?.margin_top ?? 0} onChange={e => handleConfigChange('margin_top', parseInt(e.target.value))} />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] text-slate-500 mb-1">Bottom ({config?.margin_bottom ?? 0}px)</label>
                                            <input type="range" min="-100" max="200" step="5" className="w-full accent-emerald-500" value={config?.margin_bottom ?? 0} onChange={e => handleConfigChange('margin_bottom', parseInt(e.target.value))} />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] text-slate-500 mb-1">Left ({config?.margin_left ?? 0}px)</label>
                                            <input type="range" min="-100" max="200" step="5" className="w-full accent-emerald-500" value={config?.margin_left ?? 0} onChange={e => handleConfigChange('margin_left', parseInt(e.target.value))} />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] text-slate-500 mb-1">Right ({config?.margin_right ?? 0}px)</label>
                                            <input type="range" min="-100" max="200" step="5" className="w-full accent-emerald-500" value={config?.margin_right ?? 0} onChange={e => handleConfigChange('margin_right', parseInt(e.target.value))} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-800" />

                    {/* ── Visual Effects ───────────────────────────────── */}
                    <div>
                        <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider">
                            <Palette className="w-3.5 h-3.5" /> Visual Effects
                        </label>

                        {/* Text color */}
                        <div className="mb-4">
                            <label className="block text-[10px] text-slate-500 mb-2">Text Color</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={config?.color || '#FFFFFF'}
                                    onChange={e => handleConfigChange('color', e.target.value)}
                                    className="w-10 h-10 rounded cursor-pointer bg-slate-950 border border-slate-800"
                                />
                                <input
                                    type="text"
                                    value={config?.color || '#FFFFFF'}
                                    onChange={e => handleConfigChange('color', e.target.value)}
                                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-emerald-500 outline-none uppercase font-mono"
                                />
                                {/* Quick colour presets */}
                                {['#FFFFFF', '#1A1A1A', '#FFD700', '#FF6B6B', '#A8E6CF'].map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => handleConfigChange('color', c)}
                                        className="w-7 h-7 rounded-full border-2 border-slate-700 hover:scale-110 transition-transform flex-shrink-0"
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Text shadow */}
                        <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 mb-3">
                            <span className="text-sm font-medium text-slate-300">Text Shadow</span>
                            <Toggle checked={config?.shadow !== false} onChange={v => handleConfigChange('shadow', v)} />
                        </div>

                        {/* Glass background */}
                        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                                    <Box className="w-4 h-4" /> Glass Background
                                </div>
                                <Toggle checked={config?.glass_bg || false} onChange={v => handleConfigChange('glass_bg', v)} />
                            </div>
                            {config?.glass_bg && (
                                <div className="space-y-2 pt-3 border-t border-slate-800/50">
                                    <div>
                                        <label className="block text-[10px] text-slate-500 mb-1">Opacity ({config?.glass_opacity ?? 0.25})</label>
                                        <input
                                            type="range" min="0" max="1" step="0.05"
                                            className="w-full accent-emerald-500"
                                            value={config?.glass_opacity ?? 0.25}
                                            onChange={e => handleConfigChange('glass_opacity', parseFloat(e.target.value))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-slate-500 mb-1">Blur ({config?.glass_blur ?? 8}px)</label>
                                        <input
                                            type="range" min="0" max="24" step="2"
                                            className="w-full accent-emerald-500"
                                            value={config?.glass_blur ?? 8}
                                            onChange={e => handleConfigChange('glass_blur', parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
