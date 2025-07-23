# 豆瓣影视搜索 MCP Server

## 项目概述

这是一个基于 TypeScript + MCP SDK 开发的豆瓣影视搜索 MCP Server，通过模拟浏览器访问豆瓣网站，为 AI 模型提供影视资源信息查询能力。

## 功能特性

### 核心功能
- **影视搜索**: 根据资源名称搜索豆瓣影视信息
- **详细信息**: 返回上映年份、评分、类型、简介等完整信息
- **多类型支持**: 支持电影、电视剧、纪录片等多种影视类型
- **智能匹配**: 自动匹配最相关的搜索结果

### 返回信息
- 影视名称和年份
- 豆瓣评分和评价人数
- 影视类型和地区
- 导演和主演信息
- 时长和简介
- 豆瓣链接

## 技术架构

### 技术栈
- **语言**: TypeScript
- **框架**: MCP SDK (@modelcontextprotocol/sdk)
- **浏览器自动化**: Playwright
- **构建工具**: esbuild
- **包管理**: npm

### 项目结构
```
douban-mcp-server/
├── src/
│   ├── index.ts              # 主入口文件
│   ├── server.ts             # MCP Server 核心
│   ├── tools/
│   │   └── douban-search.ts  # 豆瓣搜索工具
│   ├── services/
│   │   └── douban-api.ts     # 豆瓣 API 服务
│   └── types/
│       └── douban.ts         # 类型定义
├── dist/                     # 构建输出
├── package.json
├── tsconfig.json
├── build.js                  # 构建脚本
└── README.md
```

## API 设计

### 工具定义
```typescript
{
  name: "search_douban_movie",
  description: "搜索豆瓣影视信息，返回上映年份、评分、类型、简介等详细信息",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "要搜索的影视资源名称"
      }
    },
    required: ["query"]
  }
}
```

### 返回数据结构
```typescript
interface DoubanMovieInfo {
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
```

## 实现方案

### 1. 浏览器自动化
- 使用 Playwright 启动真实浏览器
- 模拟用户真实访问行为
- 支持 JavaScript 执行和动态内容

### 2. 页面交互
- 自动导航到搜索页面
- 等待页面元素加载完成
- 提取页面中的影视信息

### 3. 错误处理
- 网络请求异常处理
- 解析失败处理
- 搜索结果为空处理

### 4. 性能优化
- 请求缓存机制
- 并发请求控制
- 超时处理

## 快速开始

### 本地开发

1. **安装依赖**:
```bash
npm install
```

2. **构建项目**:
```bash
npm run build
```

3. **运行服务器**:
```bash
npm start
```

4. **开发模式**:
```bash
npm run dev
```

5. **测试功能**:
```bash
npm test
```

6. **浏览器测试**:
```bash
npm run test:browser
```

### Cherry Studio 集成

1. **发布到 npm** (可选):
```bash
npm publish
```

2. **在 Cherry Studio 中配置**:
```json
{
  "mcpServers": {
    "douban-search": {
      "command": "npx",
      "args": ["douban-mcp-server"],
      "env": {
        "NODE_ENV": "production",
        "REQUEST_TIMEOUT": "10000",
        "MAX_RETRIES": "3"
      }
    }
  }
}
```

3. **重启 Cherry Studio** 使配置生效

## 部署配置

### Cherry Studio 配置
```json
{
  "mcpServers": {
    "douban-search": {
      "command": "npx",
      "args": ["@your-org/douban-mcp-server"],
      "env": {
        "NODE_ENV": "production",
        "REQUEST_TIMEOUT": "10000",
        "MAX_RETRIES": "3"
      }
    }
  }
}
```

### 环境变量
- `REQUEST_TIMEOUT`: 请求超时时间 (默认: 10000ms)
- `MAX_RETRIES`: 最大重试次数 (默认: 3)
- `CACHE_DURATION`: 缓存时间 (默认: 3600s)

## 开发计划

### 第一阶段: 基础框架 ✅
- [x] 项目结构设计
- [x] TypeScript 项目初始化
- [x] MCP SDK 集成
- [x] 基础工具定义

### 第二阶段: 核心功能 ✅
- [x] 豆瓣搜索 API 实现
- [x] HTML 解析逻辑
- [x] 数据提取和格式化
- [x] 错误处理机制

### 第三阶段: 优化完善 ✅
- [x] 基础缓存机制
- [x] 性能优化
- [x] 测试用例
- [x] 文档完善

### 第四阶段: 部署发布 🔄
- [x] 构建脚本
- [ ] npm 包发布
- [ ] Cherry Studio 集成测试
- [x] 使用文档

## 使用示例

### 工具调用
```json
{
  "name": "search_douban_movie",
  "arguments": {
    "query": "水月洞天"
  }
}
```

### 返回结果
```json
{
  "content": [
    {
      "type": "text",
      "text": "影视信息：\n\n🎬 水月洞天 (2004)\n⭐ 豆瓣评分：8.6 (56379人评价)\n📺 类型：中国大陆 / 动作 / 奇幻 / 古装\n⏱️ 时长：46分钟\n🎭 导演：梁国冠 / 李达超\n👥 主演：于波 / 蔡少芬 / 杨俊毅 / 陈法蓉 / 张晋 / 杨光 / 徐少强 / 张茜\n🔗 豆瓣链接：https://movie.douban.com/subject/1864236/"
    }
  ]
}
```

## 注意事项

1. **合规使用**: 仅用于学习和研究目的，遵守豆瓣使用条款
2. **请求频率**: 控制请求频率，避免对服务器造成压力
3. **数据准确性**: 搜索结果可能存在时效性问题
4. **错误处理**: 网络异常或页面结构变化时的处理

## 许可证

MIT License 