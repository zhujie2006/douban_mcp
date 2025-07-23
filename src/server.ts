import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { DoubanSearchTool } from './tools/douban-search.js';

/**
 * MCP Server 核心类
 */
export class DoubanMCPServer {
  private server: McpServer;
  private doubanSearchTool: DoubanSearchTool;

  constructor() {
    this.server = new McpServer({
      name: 'douban-mcp-server',
      version: '1.0.0'
    });

    this.doubanSearchTool = new DoubanSearchTool();

    this.setupTools();
  }

  /**
   * 设置工具
   */
  private setupTools(): void {
    // 注册豆瓣搜索工具
    this.server.registerTool('search_douban_movie', {
      title: '豆瓣影视搜索',
      description: '搜索豆瓣影视信息，返回上映年份、评分、类型、简介等详细信息',
      inputSchema: {
        query: z.string().describe('要搜索的影视资源名称'),
      },
    }, async ({ query }) => {
      const result = await this.doubanSearchTool.searchDoubanMovie({ query });
      return {
        content: [
          {
            type: 'text',
            text: result,
          },
        ],
      };
    });
  }

  /**
   * 启动服务器
   */
  async start(): Promise<void> {
    try {
      console.error('🚀 启动豆瓣 MCP Server...');
      
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      
      console.error('✅ 豆瓣 MCP Server 已启动');
    } catch (error) {
      console.error('❌ 启动失败:', error);
      process.exit(1);
    }
  }
} 