/**
 * Script to copy necessary files to the dist folder after building .exe
 */
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const distDir = 'dist';
const filesToCopy = [
  { src: '.env.example', dest: '.env.example' },
  { src: 'config.example.json', dest: 'config.example.json' },
  { src: 'scripts/README-dist.md', dest: 'README.md' }
];

// Ensure dist directory exists
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

// Copy files
console.log('📦 Copying files to dist folder...');
filesToCopy.forEach(({ src, dest }) => {
  try {
    copyFileSync(src, join(distDir, dest));
    console.log(`✅ Copied: ${src} -> dist/${dest}`);
  } catch (error) {
    console.error(`❌ Failed to copy ${src}:`, error.message);
  }
});

console.log('✨ Build files copied successfully!');
