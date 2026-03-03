import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface LanguageTabsProps {
    activeLang: string;
    onChange: (lang: string) => void;
}

const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
    { code: 'mr', label: 'Marathi', flag: '🚩' },
    { code: 'gu', label: 'Gujarati', flag: '🕉️' },
    { code: 'bn', label: 'Bengali', flag: '🐅' },
    { code: 'ta', label: 'Tamil', flag: '🛕' },
    { code: 'te', label: 'Telugu', flag: '🌶️' },
    { code: 'kn', label: 'Kannada', flag: '🐘' },
    { code: 'ml', label: 'Malayalam', flag: '🌴' },
];

export default function LanguageTabs({ activeLang, onChange }: LanguageTabsProps) {
    return (
        <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    type="button"
                    onClick={() => onChange(lang.code)}
                    className={clsx(
                        "relative px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2",
                        activeLang === lang.code
                            ? "text-white bg-indigo-500 shadow-lg shadow-indigo-500/20"
                            : "text-slate-400 bg-slate-800 hover:bg-slate-700"
                    )}
                >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                    {activeLang === lang.code && (
                        <motion.div
                            layoutId="activeLangTab"
                            className="absolute inset-0 rounded-full border-2 border-white/20"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                </button>
            ))}
        </div>
    );
}
