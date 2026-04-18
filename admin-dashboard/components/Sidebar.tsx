import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { LayoutDashboard, Calendar, Image as ImageIcon, Settings, LogOut, MessageCircle, Quote, BookOpen, Music, Gamepad2, Brain, Trophy, Sunrise, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const Sidebar = () => {
    const router = useRouter();
    const menuGroups = [
        {
            title: 'Festival Core',
            items: [
                { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
                { name: 'Events', icon: Calendar, path: '/events' },
                { name: 'Images', icon: ImageIcon, path: '/images' },
                { name: 'Settings', icon: Settings, path: '/settings' },
            ]
        },
        {
            title: 'Content Library',
            items: [
                { name: 'Greetings', icon: MessageCircle, path: '/greetings' },
                { name: 'Home Greetings', icon: Sunrise, path: '/home-greetings' },
                { name: 'Quotes', icon: Quote, path: '/quotes' },
                { name: 'Mantras', icon: BookOpen, path: '/mantras' },
                { name: 'Audio', icon: Music, path: '/audio' },
                { name: 'Lotties', icon: Layers, path: '/lotties' },
            ]
        },
        {
            title: 'Engagement Hub',
            items: [
                { name: 'Quizzes', icon: Brain, path: '/quizzes' },
                { name: 'Trivia', icon: Gamepad2, path: '/trivia' },
                { name: 'Gamification', icon: Trophy, path: '/gamification' },
            ]
        }
    ];

    return (
        <div className="w-72 bg-slate-950 h-full shadow-2xl flex flex-col text-white border-r border-slate-800">
            {/* Logo Section */}
            <div className="p-8 border-b border-slate-800/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <span className="font-bold text-xl text-white">U</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white">Utsav Admin</h1>
                        <p className="text-xs text-slate-400 font-medium tracking-tight">System Control</p>
                    </div>
                </div>
            </div>

            {/* Navigation - Scrollable with custom scrollbar */}
            <nav className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar scrollbar-hide">
                {menuGroups.map((group) => (
                    <div key={group.title} className="space-y-3">
                        <h3 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                            {group.title}
                        </h3>
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                const isActive = router.pathname === item.path;

                                return (
                                    <Link key={item.path} href={item.path} className="block relative group">
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeNav"
                                                className="absolute inset-0 bg-blue-600/10 rounded-xl border border-blue-500/20"
                                                initial={false}
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                        <div className={clsx(
                                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative z-10",
                                            isActive
                                                ? "text-blue-400 font-bold"
                                                : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/30"
                                        )}>
                                            <Icon className={clsx(
                                                "w-5 h-5 transition-all duration-300", 
                                                isActive ? "text-blue-400 scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "text-slate-400 group-hover:text-slate-200"
                                            )} />
                                            <span className="text-sm tracking-tight">{item.name}</span>
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeIndicator"
                                                    className="absolute right-3 w-1 h-3 bg-blue-500 rounded-full"
                                                />
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-6 border-t border-slate-800/50 bg-slate-950/50 backdrop-blur-md">
                <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all duration-300 group">
                    <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span className="font-bold text-xs uppercase tracking-widest">Terminate Session</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
