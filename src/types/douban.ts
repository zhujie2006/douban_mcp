/**
 * 豆瓣影视信息接口
 */
export interface DoubanMovieInfo {
  title: string;           // 影视名称
  year: string;           // 上映年份
  rating: string;         // 豆瓣评分
  ratingCount: string;    // 评价人数
  type: string;          // 影视类型
  region: string;        // 地区
  duration: string;      // 时长
  director: string;      // 导演
  actors: string;        // 主演
  abstract: string;      // 简介
  doubanUrl: string;     // 豆瓣链接
  posterUrl?: string;    // 海报链接
}

/**
 * 搜索参数接口
 */
export interface SearchParams {
  query: string;         // 搜索关键词
  category?: string;     // 分类 (movie, tv, etc.)
}

/**
 * 搜索结果接口
 */
export interface SearchResult {
  success: boolean;
  data?: DoubanMovieInfo;
  error?: string;
}

/**
 * 豆瓣搜索工具参数
 */
export interface DoubanSearchToolParams {
  query: string;
} 