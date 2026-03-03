import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from 'react-hot-toast';
import { Inter } from 'next/font/google';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  return (
    <div className={`${inter.variable} font-sans antialiased min-h-screen bg-slate-950 text-slate-200`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={router.route}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="min-h-screen flex flex-col"
        >
          <Component {...pageProps} />
        </motion.div>
      </AnimatePresence>
      <Toaster position="top-right" />
    </div>
  );
}
