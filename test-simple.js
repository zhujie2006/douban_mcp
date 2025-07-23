#!/usr/bin/env node

/**
 * 简单测试脚本
 * 直接测试豆瓣 API 服务
 */

import { DoubanApiService } from './src/services/douban-api.js';

async function testDoubanApi() {
  try {
    console.log('🧪 开始测试豆瓣 API 服务...\n');

    const apiService = new DoubanApiService();

    // 测试用例
    const testCases = [
      '水月洞天',
      '肖申克的救赎',
    ];

    for (const query of testCases) {
      console.log(`🔍 搜索: ${query}`);
      console.log('─'.repeat(50));
      
      const result = await apiService.searchMovie({ query });
      
      if (result.success && result.data) {
        const formatted = apiService.formatMovieInfo(result.data);
        console.log(formatted);
      } else {
        console.log(`❌ 搜索失败: ${result.error}`);
      }
      
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
testDoubanApi(); 