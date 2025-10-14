#!/usr/bin/env bun
/**
 * Script to copy necessary files to the dist folder after building .exe
 * Uses Bun Shell for cross-platform compatibility
 */
import { $ } from 'bun';

const distDir = 'dist';
const filesToCopy = [
  { src: '.env.example', dest: '.env' },
  { src: 'config.example.json', dest: 'config.json' },
  { src: 'scripts/README-dist.md', dest: 'README.md' },
];

console.log('📦 Copying files to dist folder...');

// Ensure dist directory exists
await $`mkdir -p ${distDir}`;

// Copy files using Bun Shell
for (const { src, dest } of filesToCopy) {
  try {
    await $`cp ${src} ${distDir}/${dest}`;
    console.log(`✅ Copied: ${src} -> dist/${dest}`);
  } catch (error) {
    console.error(
      `❌ Failed to copy ${src}:`,
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

console.log('✨ Build files copied successfully!');
