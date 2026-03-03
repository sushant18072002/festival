const fs = require('fs');
const path = require('path');

const files = [
    'pages/index.tsx',
    'pages/events.tsx',
    'pages/images.tsx',
    'pages/settings.tsx',
    'components/Sidebar.tsx',
    'components/ConfirmationModal.tsx'
];

const replacements = [
    { from: /bg-slate-50/g, to: 'bg-slate-950' },
    { from: /bg-white/g, to: 'bg-slate-900' },
    { from: /text-slate-900/g, to: 'text-white' },
    { from: /text-slate-800/g, to: 'text-slate-100' },
    { from: /text-slate-700/g, to: 'text-slate-200' },
    { from: /text-slate-600/g, to: 'text-slate-300' },
    { from: /text-slate-500/g, to: 'text-slate-400' },
    { from: /border-slate-200/g, to: 'border-slate-800' },
    { from: /border-slate-100/g, to: 'border-slate-800' },
    { from: /bg-slate-100/g, to: 'bg-slate-800' },
    { from: /bg-slate-200/g, to: 'bg-slate-700' },
    { from: /hover:bg-slate-50\/g/g, to: 'hover:bg-slate-800/50' },
    { from: /hover:bg-slate-50/g, to: 'hover:bg-slate-800/50' },
    { from: /hover:bg-slate-100/g, to: 'hover:bg-slate-800' },
    { from: /hover:bg-slate-200/g, to: 'hover:bg-slate-700' },
    { from: /hover:text-slate-700/g, to: 'hover:text-slate-200' },
    { from: /hover:text-slate-900/g, to: 'hover:text-white' },
    { from: /shadow-sm/g, to: 'shadow-md shadow-black/20' }
];

const basePath = 'e:/flutter/App festival/admin-dashboard';

files.forEach(file => {
    const filePath = path.join(basePath, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        replacements.forEach(rep => {
            content = content.replace(rep.from, rep.to);
        });
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Converted: ${file}`);
    } else {
        console.log(`Not found: ${filePath}`);
    }
});
