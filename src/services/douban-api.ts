import axios, { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';
import { DoubanMovieInfo, SearchParams, SearchResult } from '../types/douban.js';

/**
 * 豆瓣 API 服务类
 */
export class DoubanApiService {
  private client: AxiosInstance;
  private readonly baseUrl = 'https://search.douban.com';
  private readonly timeout = parseInt(process.env.REQUEST_TIMEOUT || '10000');
  private readonly maxRetries = parseInt(process.env.MAX_RETRIES || '3');

  constructor() {
    this.client = axios.create({
      timeout: this.timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });
  }

  /**
   * 搜索豆瓣影视信息
   */
  async searchMovie(params: SearchParams): Promise<SearchResult> {
    try {
      const { query, category = '1002' } = params;
      
      // 构建搜索 URL
      const searchUrl = `${this.baseUrl}/movie/subject_search`;
      const encodedQuery = encodeURIComponent(query);
      
      const response = await this.client.get(searchUrl, {
        params: {
          search_text: encodedQuery,
          cat: category,
        },
      });

      if (response.status !== 200) {
        return {
          success: false,
          error: `HTTP ${response.status}: 请求失败`,
        };
      }

      // 解析 HTML 内容
      const movieInfo = this.parseSearchResults(response.data, query);
      
      if (!movieInfo) {
        return {
          success: false,
          error: `未找到 "${query}" 的相关影视信息`,
        };
      }

      return {
        success: true,
        data: movieInfo,
      };

    } catch (error) {
      console.error('豆瓣搜索错误:', error);
      return {
        success: false,
        error: `搜索失败: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  }

  /**
   * 解析搜索结果页面
   */
  private parseSearchResults(html: string, query: string): DoubanMovieInfo | null {
    try {
      const $ = cheerio.load(html);
      
      // 查找第一个搜索结果
      const firstResult = $('.item-root').first();
      
      if (firstResult.length === 0) {
        return null;
      }

      // 提取基本信息
      const titleElement = firstResult.find('.title-text');
      const titleText = titleElement.text().trim();
      
      // 解析标题和年份
      const titleMatch = titleText.match(/^(.+?)\s*\((\d{4})\)/);
      const title = titleMatch ? titleMatch[1].trim() : titleText;
      const year = titleMatch ? titleMatch[2] : '';

      // 提取评分信息
      const ratingElement = firstResult.find('.rating_nums');
      const rating = ratingElement.text().trim() || '暂无评分';
      
      const ratingCountElement = firstResult.find('.pl');
      const ratingCountText = ratingCountElement.text().trim();
      const ratingCount = ratingCountText.replace(/[()]/g, '') || '0人评价';

      // 提取类型和地区信息
      const metaElements = firstResult.find('.meta.abstract');
      const metaText = metaElements.text().trim();
      
      // 解析类型、地区、时长
      const [region, ...typeParts] = metaText.split(' / ');
      const type = typeParts.slice(0, -1).join(' / '); // 排除时长
      const duration = typeParts[typeParts.length - 1] || '';

      // 提取导演和主演信息
      const abstract2Element = firstResult.find('.meta.abstract_2');
      const directorActors = abstract2Element.text().trim();

      // 分离导演和主演
      const directorActorsParts = directorActors.split(' / ');
      const director = directorActorsParts[0] || '';
      const actors = directorActorsParts.slice(1).join(' / ') || '';

      // 提取豆瓣链接
      const linkElement = firstResult.find('.title-text');
      const doubanUrl = linkElement.attr('href') || '';

      // 提取海报链接
      const posterElement = firstResult.find('.cover');
      const posterUrl = posterElement.attr('src') || '';

      // 构建简介
      const abstract = `${title}是一部${type}作品，由${director}执导，${actors}等主演。`;

      return {
        title,
        year,
        rating,
        ratingCount,
        type,
        region,
        duration,
        director,
        actors,
        abstract,
        doubanUrl,
        posterUrl,
      };

    } catch (error) {
      console.error('解析搜索结果错误:', error);
      return null;
    }
  }

  /**
   * 格式化影视信息为可读文本
   */
  formatMovieInfo(movieInfo: DoubanMovieInfo): string {
    const lines = [
      `🎬 ${movieInfo.title} (${movieInfo.year})`,
      `⭐ 豆瓣评分：${movieInfo.rating} (${movieInfo.ratingCount})`,
      `📺 类型：${movieInfo.region} / ${movieInfo.type}`,
    ];

    if (movieInfo.duration) {
      lines.push(`⏱️ 时长：${movieInfo.duration}`);
    }

    if (movieInfo.director) {
      lines.push(`🎭 导演：${movieInfo.director}`);
    }

    if (movieInfo.actors) {
      lines.push(`👥 主演：${movieInfo.actors}`);
    }

    if (movieInfo.abstract) {
      lines.push(`📝 简介：${movieInfo.abstract}`);
    }

    if (movieInfo.doubanUrl) {
      lines.push(`🔗 豆瓣链接：${movieInfo.doubanUrl}`);
    }

    return lines.join('\n');
  }
} 