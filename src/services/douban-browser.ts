import { chromium, Browser, Page } from 'playwright';
import { DoubanMovieInfo, SearchParams, SearchResult } from '../types/douban.js';

/**
 * 基于浏览器自动化的豆瓣 API 服务类
 */
export class DoubanBrowserService {
  private browser: Browser | null = null;
  private readonly timeout = parseInt(process.env.REQUEST_TIMEOUT || '30000');
  private readonly headless = false; // 强制显示浏览器

  constructor() {
    // 初始化时不需要立即启动浏览器
  }

  /**
   * 获取浏览器实例
   */
  private async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: this.headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  /**
   * 搜索豆瓣影视信息
   */
  async searchMovie(params: SearchParams): Promise<SearchResult> {
    let page: Page | null = null;
    
    try {
      const { query, category = '1002' } = params;
      
      console.error(`🔍 启动浏览器搜索: ${query}`);
      
      // 获取浏览器实例
      const browser = await this.getBrowser();
      
      // 创建新页面
      page = await browser.newPage();
      
      // 设置视口
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      // 设置用户代理
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'userAgent', {
          get: () => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });
      });
      
      // 构建搜索 URL
      const searchUrl = `https://search.douban.com/movie/subject_search?search_text=${encodeURIComponent(query)}&cat=${category}`;
      
      console.error(`🌐 访问: ${searchUrl}`);
      
      // 导航到搜索页面
      await page.goto(searchUrl, { 
        waitUntil: 'networkidle',
        timeout: this.timeout 
      });
      
      // 等待页面加载完成
      await page.waitForLoadState('networkidle');
      
      // 添加一些延迟，让您看到页面
      await page.waitForTimeout(3000);
      
      // 尝试等待搜索结果加载
      try {
        await page.waitForSelector('.item-root', { timeout: 5000 });
      } catch (error) {
        console.error('未找到 .item-root 元素，尝试其他选择器...');
        // 截图保存，方便调试
        await page.screenshot({ path: 'debug-screenshot.png' });
        console.error('已保存截图到 debug-screenshot.png');
      }
      
      // 解析搜索结果
      const movieInfo = await this.parseSearchResults(page, query);
      
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
    } finally {
      // 关闭页面
      if (page) {
        await page.close();
      }
    }
  }

  /**
   * 解析搜索结果页面
   */
  private async parseSearchResults(page: Page, query: string): Promise<DoubanMovieInfo | null> {
    try {
      // 获取第一个搜索结果
      const firstResult = await page.$('.item-root');
      
      if (!firstResult) {
        return null;
      }

      // 提取基本信息
      const titleText = await firstResult.$eval('.title-text', el => el.textContent?.trim() || '');
      
      // 解析标题和年份
      const titleMatch = titleText.match(/^(.+?)\s*\((\d{4})\)/);
      const title = titleMatch ? titleMatch[1].trim() : titleText;
      const year = titleMatch ? titleMatch[2] : '';

      // 提取评分信息
      const rating = await firstResult.$eval('.rating_nums', el => el.textContent?.trim() || '暂无评分').catch(() => '暂无评分');
      const ratingCountText = await firstResult.$eval('.pl', el => el.textContent?.trim() || '0人评价').catch(() => '0人评价');
      const ratingCount = ratingCountText.replace(/[()]/g, '');

      // 提取类型和地区信息
      const metaText = await firstResult.$eval('.meta.abstract', el => el.textContent?.trim() || '').catch(() => '');
      
      // 解析类型、地区、时长
      const [region, ...typeParts] = metaText.split(' / ');
      const type = typeParts.slice(0, -1).join(' / '); // 排除时长
      const duration = typeParts[typeParts.length - 1] || '';

      // 提取导演和主演信息
      const directorActors = await firstResult.$eval('.meta.abstract_2', el => el.textContent?.trim() || '').catch(() => '');

      // 分离导演和主演
      const directorActorsParts = directorActors.split(' / ');
      const director = directorActorsParts[0] || '';
      const actors = directorActorsParts.slice(1).join(' / ') || '';

      // 提取豆瓣链接
      const doubanUrl = await firstResult.$eval('.title-text', el => el.getAttribute('href') || '').catch(() => '');

      // 提取海报链接
      const posterUrl = await firstResult.$eval('.cover', el => el.getAttribute('src') || '').catch(() => '');

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

  /**
   * 关闭浏览器
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
} 