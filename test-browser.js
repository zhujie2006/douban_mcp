#!/usr/bin/env node

/**
 * 浏览器版本测试脚本
 * 测试基于 Playwright 的豆瓣搜索功能
 */

import { DoubanBrowserService } from './src/services/douban-browser.js';

async function testDoubanBrowser() {
  const browserService = new DoubanBrowserService();
  
  try {
    console.log('🧪 开始测试豆瓣浏览器搜索功能...\n');

    // 测试用例
    const testCases = [
      '水月洞天',
      '肖申克的救赎',
    ];

    for (const query of testCases) {
      console.log(`🔍 搜索: ${query}`);
      console.log('─'.repeat(50));
      
      const result = await browserService.searchMovie({ query });
      
      if (result.success && result.data) {
        const formatted = browserService.formatMovieInfo(result.data);
        console.log(formatted);
      } else {
        console.log(`❌ 搜索失败: ${result.error}`);
      }
      
      console.log('\n');
      
      // 等待一下，避免请求过于频繁
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    console.log('✅ 测试完成!');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    // 关闭浏览器
    await browserService.close();
  }
}

// 运行测试
testDoubanBrowser(); 