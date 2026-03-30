const fs = require('fs');
const path = require('path');

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const original = content;

      // Smart replacements for standard classes that do not already have a dark variant applied
      // Look for the class bounded by word boundaries or quotes/spaces
      
      const replacements = [
        { regex: /(?<!dark:)\bbg-white\b(?! dark:bg-)/g, replacement: 'bg-white dark:bg-gray-800' },
        { regex: /(?<!dark:)\bbg-gray-50\b(?! dark:bg-)/g, replacement: 'bg-gray-50 dark:bg-gray-900' },
        { regex: /(?<!dark:)\bbg-gray-100\b(?! dark:bg-)/g, replacement: 'bg-gray-100 dark:bg-gray-800' },
        { regex: /(?<!dark:)\bbg-gray-200\b(?! dark:bg-)/g, replacement: 'bg-gray-200 dark:bg-gray-700' },
        
        { regex: /(?<!dark:)\btext-gray-900\b(?! dark:text-)/g, replacement: 'text-gray-900 dark:text-white' },
        { regex: /(?<!dark:)\btext-gray-800\b(?! dark:text-)/g, replacement: 'text-gray-800 dark:text-gray-100' },
        { regex: /(?<!dark:)\btext-gray-700\b(?! dark:text-)/g, replacement: 'text-gray-700 dark:text-gray-200' },
        { regex: /(?<!dark:)\btext-gray-600\b(?! dark:text-)/g, replacement: 'text-gray-600 dark:text-gray-300' },
        { regex: /(?<!dark:)\btext-gray-500\b(?! dark:text-)/g, replacement: 'text-gray-500 dark:text-gray-400' },
        
        { regex: /(?<!dark:)\bborder-gray-200\b(?! dark:border-)/g, replacement: 'border-gray-200 dark:border-gray-700' },
        { regex: /(?<!dark:)\bborder-gray-300\b(?! dark:border-)/g, replacement: 'border-gray-300 dark:border-gray-600' },
        { regex: /(?<!dark:)\bborder-gray-100\b(?! dark:border-)/g, replacement: 'border-gray-100 dark:border-gray-800' },
        
        { regex: /\bborder\b(?!-)(?! dark:border-)/g, replacement: 'border dark:border-gray-700' },
        { regex: /\bborder-b\b(?!-)(?! dark:border-)/g, replacement: 'border-b dark:border-gray-700' },
        { regex: /\bborder-t\b(?!-)(?! dark:border-)/g, replacement: 'border-t dark:border-gray-700' },
        { regex: /\bshadow-md\b(?! dark:shadow-)/g, replacement: 'shadow-md dark:shadow-none' },
        { regex: /\bshadow-lg\b(?! dark:shadow-)/g, replacement: 'shadow-lg dark:shadow-none' }
      ];

      for (const { regex, replacement } of replacements) {
        content = content.replace(regex, replacement);
      }

      // Cleanup any accidental double spaces created
      content = content.replace(/  +/g, ' ');

      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'src'));
console.log('Dark mode classes applied successfully.');
