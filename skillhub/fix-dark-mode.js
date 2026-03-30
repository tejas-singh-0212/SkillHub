const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    const fullPath = path.join(__dirname, filePath);
    if (!fs.existsSync(fullPath)) return;
    
    let content = fs.readFileSync(fullPath, 'utf8');
    const original = content;

    for (const { regex, replacement } of replacements) {
        content = content.replace(regex, replacement);
    }

    if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${filePath}`);
    }
}

// 1. Explore page drop-downs
replaceInFile('src/app/search/page.tsx', [
    { regex: /className="flex-1 min-w-\[200px\] border dark:border-gray-700/g, replacement: 'className="flex-1 min-w-[200px] border dark:border-gray-700 bg-white dark:bg-gray-800' },
    { regex: /className="border dark:border-gray-700 rounded-lg px-3 py-2"/g, replacement: 'className="border dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2"' }
]);

// 2. Dash quick actions
replaceInFile('src/app/dashboard/page.tsx', [
    { regex: /bg-blue-50/g, replacement: 'bg-blue-50 dark:bg-blue-900/30' },
    { regex: /bg-purple-50/g, replacement: 'bg-purple-50 dark:bg-purple-900/30' },
    { regex: /bg-green-50/g, replacement: 'bg-green-50 dark:bg-green-900/30' },
    { regex: /bg-yellow-50/g, replacement: 'bg-yellow-50 dark:bg-yellow-900/30' },
    { regex: /bg-orange-50/g, replacement: 'bg-orange-50 dark:bg-orange-900/30' },
    
    { regex: /text-blue-700/g, replacement: 'text-blue-700 dark:text-blue-300' },
    { regex: /text-purple-700/g, replacement: 'text-purple-700 dark:text-purple-300' },
    { regex: /text-green-700/g, replacement: 'text-green-700 dark:text-green-300' },
    { regex: /text-yellow-700/g, replacement: 'text-yellow-700 dark:text-yellow-300' },
    { regex: /text-orange-700/g, replacement: 'text-orange-700 dark:text-orange-300' },
    
    { regex: /text-yellow-600/g, replacement: 'text-yellow-600 dark:text-yellow-400' },
    { regex: /text-orange-600/g, replacement: 'text-orange-600 dark:text-orange-400' }
]);

// 3. Profile & Profile Edit - specific colors needed/offered
const profileReplacements = [
    { regex: /bg-blue-50(?! dark)/g, replacement: 'bg-blue-50 dark:bg-blue-900/30' },
    { regex: /bg-red-50(?! dark)/g, replacement: 'bg-red-50 dark:bg-red-900/30' },
    { regex: /bg-green-50(?! dark)/g, replacement: 'bg-green-50 dark:bg-green-900/30' },
    
    { regex: /text-blue-700(?! dark)/g, replacement: 'text-blue-700 dark:text-blue-300' },
    { regex: /text-blue-600(?! dark)/g, replacement: 'text-blue-600 dark:text-blue-400' },
    { regex: /text-red-700(?! dark)/g, replacement: 'text-red-700 dark:text-red-300' },
    { regex: /text-red-600(?! dark)/g, replacement: 'text-red-600 dark:text-red-400' },
    
    { regex: /border-blue-200(?! dark)/g, replacement: 'border-blue-200 dark:border-blue-800' },
    { regex: /border-red-200(?! dark)/g, replacement: 'border-red-200 dark:border-red-800' }
];

replaceInFile('src/app/profile/[id]/page.tsx', profileReplacements);
replaceInFile('src/app/profile/edit/page.tsx', profileReplacements);

console.log('Fixed requested elements.');
