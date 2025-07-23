#!/usr/bin/env node

/**
 * 构建脚本
 * 使用 esbuild 构建 TypeScript 项目
 */

import { build } from 'esbuild';
import { readFileSync } from 'fs';
import { join } from 'path';

async function buildProject() {
  try {
    console.log('🔨 开始构建项目...');

    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));

    const result = await build({
      entryPoints: ['src/index.ts'],
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'esm',
      outdir: 'dist',
      external: [
        // 外部依赖，不打包
        '@modelcontextprotocol/sdk',
        'playwright',
        'playwright-core',
        'chromium-bidi',
      ],
      sourcemap: true,
      minify: process.env.NODE_ENV === 'production',
      define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      },
    });

    if (result.errors.length > 0) {
      console.error('❌ 构建错误:', result.errors);
      process.exit(1);
    }

    if (result.warnings.length > 0) {
      console.warn('⚠️ 构建警告:', result.warnings);
    }

    console.log('✅ 构建完成!');
    console.log(`📦 输出文件: dist/index.js`);
    console.log(`📊 包大小: ${(result.outputFiles?.[0]?.contents.length || 0) / 1024} KB`);

  } catch (error) {
    console.error('❌ 构建失败:', error);
    process.exit(1);
  }
}

// 运行构建
buildProject(); 