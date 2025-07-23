#!/usr/bin/env node

/**
 * 测试脚本
 * 用于测试豆瓣搜索功能
 */

import { DoubanSearchTool } from './dist/index.js';

async function testDoubanSearch() {
  try {
    console.log('🧪 开始测试豆瓣搜索功能...\n');

    const searchTool = new DoubanSearchTool();

    // 测试用例
    const testCases = [
      '水月洞天',
      '肖申克的救赎',
      '泰坦尼克号',
    ];

    for (const query of testCases) {
      console.log(`🔍 搜索: ${query}`);
      console.log('─'.repeat(50));
      
      const result = await searchTool.searchDoubanMovie({ query });
      console.log(result);
      console.log('\n');
      
      // 等待一下，避免请求过于频繁
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('✅ 测试完成!');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testDoubanSearch(); 