const fs = require('fs');
const path = require('path');

const colors = ['blue', 'purple', 'green', 'yellow', 'orange', 'red', 'gray'];

function replaceInFile(filePath) {
    const fullPath = path.join(__dirname, filePath);
    if (!fs.existsSync(fullPath)) return;
    
    let content = fs.readFileSync(fullPath, 'utf8');
    const original = content;

    for (const color of colors) {
        // Regex to replace hover:bg-X-100 IF it doesn't already have dark:hover:bg-
        const regex = new RegExp(`hover:bg-${color}-100(?! dark:hover:bg-)`, 'g');
        content = content.replace(regex, `hover:bg-${color}-100 dark:hover:bg-${color}-800/40`);
    }

    if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated hovers in ${filePath}`);
    }
}

const filesToCheck = [
    'src/app/dashboard/page.tsx',
    'src/app/profile/[id]/page.tsx',
    'src/app/profile/edit/page.tsx'
];

filesToCheck.forEach(replaceInFile);
console.log('Hover dark modes applied.');
