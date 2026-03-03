import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import clsx from 'clsx';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmationModal({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    isDestructive = false,
    onConfirm,
    onCancel
}: ConfirmationModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={clsx("p-2 rounded-xl", isDestructive ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600")}>
                                            <AlertTriangle className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-lg font-bold text-white">{title}</h3>
                                    </div>
                                    <button onClick={onCancel} className="text-slate-400 hover:text-slate-300 transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <p className="text-slate-300 mb-8 leading-relaxed">
                                    {message}
                                </p>

                                <div className="flex gap-3 justify-end">
                                    <button
                                        onClick={onCancel}
                                        className="px-5 py-2.5 rounded-xl font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                                    >
                                        {cancelLabel}
                                    </button>
                                    <button
                                        onClick={onConfirm}
                                        className={clsx(
                                            "px-5 py-2.5 rounded-xl font-medium text-white shadow-lg transition-all active:scale-95",
                                            isDestructive
                                                ? "bg-red-600 hover:bg-red-700 shadow-red-600/20"
                                                : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
                                        )}
                                    >
                                        {confirmLabel}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
