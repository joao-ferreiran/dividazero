import fs from 'fs';
import path from 'path';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Add cursor-pointer to all simple string classNames in <button>
  content = content.replace(/className="([^"]+)"/g, (match, p1) => {
    // only if it looks like a button or something interactive, but the user said "Coloca em tudo que de para clicar".
    // We can just add cursor-pointer to any className that has "hover:"
    if (p1.includes('hover:') && !p1.includes('cursor-pointer') && !p1.includes('cursor-not-allowed')) {
      changed = true;
      return `className="${p1} cursor-pointer"`;
    }
    return match;
  });

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log('Updated', filePath);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (full.endsWith('.tsx')) processFile(full);
  }
}

walk('src');
