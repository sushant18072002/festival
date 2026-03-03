import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { LayoutDashboard, Calendar, Image as ImageIcon, Settings, LogOut, MessageCircle, Quote, BookOpen, Music, Gamepad2, Brain, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const Sidebar = () => {
    const router = useRouter();
    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { name: 'Events', icon: Calendar, path: '/events' },
        { name: 'Images', icon: ImageIcon, path: '/images' },
        { name: 'Greetings', icon: MessageCircle, path: '/greetings' },
        { name: 'Quotes', icon: Quote, path: '/quotes' },
        { name: 'Mantras', icon: BookOpen, path: '/mantras' },
        { name: 'Audio', icon: Music, path: '/audio' },
        { name: 'Quizzes', icon: Brain, path: '/quizzes' },
        { name: 'Trivia', icon: Gamepad2, path: '/trivia' },
        { name: 'Gamification', icon: Trophy, path: '/gamification' },
        { name: 'Settings', icon: Settings, path: '/settings' },
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
                        <p className="text-xs text-slate-400 font-medium">Content Manager</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-6 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = router.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className="block relative group"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeNav"
                                    className="absolute inset-0 bg-blue-600/10 rounded-xl"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <div className={clsx(
                                "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 relative z-10",
                                isActive
                                    ? "text-blue-400 font-semibold"
                                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                            )}>
                                <Icon className={clsx("w-5 h-5 transition-colors", isActive ? "text-blue-400" : "text-slate-400 group-hover:text-slate-300")} />
                                <span>{item.name}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className="absolute right-3 w-1.5 h-1.5 bg-blue-400 rounded-full"
                                    />
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-6 border-t border-slate-800/50">
                <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group">
                    <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Logout</span>
                </button>
                <div className="mt-6 text-center">
                    <p className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Version 1.0.0</p>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
