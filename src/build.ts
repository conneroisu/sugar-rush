import * as esbuild from 'esbuild';
import * as fs from 'fs';
import * as path from 'path';

const isWatch = process.argv.includes('--watch');

const buildOptions: esbuild.BuildOptions = {
  entryPoints: ['src/main.ts'],
  bundle: true,
  outfile: 'main.js',
  external: ['obsidian', 'electron', '@codemirror/*'],
  format: 'cjs',
  platform: 'node',
  target: 'es2018',
  logLevel: 'info',
  sourcemap: isWatch ? 'inline' : false,
  treeShaking: true,
  minify: !isWatch,
};

function copyStyles() {
  const srcPath = path.join('src', 'styles.css');
  const destPath = 'styles.css';

  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log('Copied styles.css');
  }
}

async function build() {
  if (isWatch) {
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
    copyStyles();
    console.log('Watching for changes...');
  } else {
    await esbuild.build(buildOptions);
    copyStyles();
    console.log('Build complete');
  }
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
