import { DoubanBrowserService } from '../services/douban-browser.js';
import { DoubanSearchToolParams } from '../types/douban.js';

/**
 * 豆瓣搜索工具
 */
export class DoubanSearchTool {
  private browserService: DoubanBrowserService;

  constructor() {
    this.browserService = new DoubanBrowserService();
  }

  /**
   * 搜索豆瓣影视信息
   */
  async searchDoubanMovie(params: DoubanSearchToolParams): Promise<string> {
    try {
      const { query } = params;

      if (!query || query.trim().length === 0) {
        return '❌ 错误：请提供要搜索的影视资源名称';
      }

      console.error(`🔍 搜索豆瓣影视: ${query}`);

      // 调用豆瓣浏览器服务搜索
      const result = await this.browserService.searchMovie({ query: query.trim() });

      if (!result.success) {
        return `❌ 搜索失败: ${result.error}`;
      }

      if (!result.data) {
        return `❌ 未找到 "${query}" 的相关影视信息`;
      }

      // 格式化返回结果
      const formattedResult = this.browserService.formatMovieInfo(result.data);
      
      console.error(`✅ 搜索成功: ${result.data.title}`);
      
      return `影视信息：\n\n${formattedResult}`;

    } catch (error) {
      console.error('豆瓣搜索工具错误:', error);
      return `❌ 搜索过程中发生错误: ${error instanceof Error ? error.message : '未知错误'}`;
    }
  }
} 