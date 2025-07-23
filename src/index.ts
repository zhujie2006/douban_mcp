#!/usr/bin/env node

/**
 * 豆瓣影视搜索 MCP Server
 * 主入口文件
 */

import { DoubanMCPServer } from './server.js';
import { DoubanSearchTool } from './tools/douban-search.js';

// 导出工具类供测试使用
export { DoubanSearchTool };

/**
 * 主函数
 */
async function main(): Promise<void> {
  try {
    const server = new DoubanMCPServer();
    await server.start();
  } catch (error) {
    console.error('❌ 程序启动失败:', error);
    process.exit(1);
  }
}

// 启动程序
main().catch((error) => {
  console.error('❌ 未捕获的错误:', error);
  process.exit(1);
}); 