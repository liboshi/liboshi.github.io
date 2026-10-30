# liboshi.github.io

Boush Li 的个人主页与技术博客，基于 [Jekyll](https://jekyllrb.com/) 构建的静态站点，由 GitHub Pages 发布：<https://liboshi.github.io>。

- 首页：全屏分栏。左侧是自我介绍、标签筛选与搜索；右侧是一面会自动缓慢滚动的文章卡片墙，也支持鼠标滚轮浏览
- `/posts/`：按年份分组的文章归档
- `/about/`：关于作者
- `/feed.xml`：Atom 订阅源
- 深色默认，可一键切换为暖纸色浅色主题，选择会保存在本地；桌面、平板、手机均适配

## 设计

整站是一套暖白与近黑的双色编辑式视觉：近黑底色 `#070706`、暖白文字 `#F0EDE5`，细线分隔、8px 圆角、等宽小标签和克制的陶土 / 苔绿 / 灰蓝色调。首页借鉴设计作品集式的固定分栏：左栏固定，右侧卡片墙持续缓慢漂移；内容页回到常规文档流，保持适合长文阅读的 720px 正文宽度。

浅色主题是一套暖纸配色（`#F2EFE6` / `#14140F`），不是简单的颜色反转，卡片、代码块和描边都单独调过。所有颜色、字体、间距、圆角均为 CSS 自定义属性，集中定义在 `css/main.css` 的 `:root` 与 `:root[data-theme="light"]` 中。

完整规范见 [docs/design-system.md](docs/design-system.md)。

## 技术栈

- Jekyll 3.9 + Liquid 模板，输出纯静态 HTML，无运行时框架
- Markdown：kramdown（GFM 输入）+ Rouge 代码高亮
- 样式：原生 CSS，设计令牌用 CSS 自定义属性集中管理；不依赖外部字体或 CDN
- 脚本：`js/main.js`，负责主题切换、卡片墙滚动、标签与搜索筛选、键盘快捷键
- 依赖版本见 `Gemfile`

## 目录结构

```text
_config.yml              站点配置（标题、作者、permalink、文章默认布局等）
_data/navigation.yml     顶部导航项
_layouts/                default / home / post
_includes/
  head.html              文档头、SEO / Open Graph、主题预设脚本
  header.html            站内页顶栏（首页隐藏）
  footer.html            站内页页脚（首页隐藏）
  home-rail.html         首页左栏：标题、简介、标签、搜索
  home-mobile.html       移动端首页：标题、搜索、文章列表
  wall.html              桌面端卡片墙（三列滚动轨道）
  tile.html              卡片模板：文章 / 摘录 / 数据 / 资料 / 链接
  chips.html             标签筛选按钮
  search.html            搜索输入框
_posts/                  博客文章（Markdown，文件名即发布日期）
css/main.css             设计令牌、布局与组件样式
css/syntax.css           Rouge 代码高亮配色（明暗两套）
js/main.js               主题、卡片墙、筛选与快捷键
images/                  图片等静态资源
index.html               首页
about/                   关于页面
posts/                   文章归档页（/posts/）
404.html                 404 页面
feed.xml                 Atom 订阅源
docs/design-system.md    设计令牌与组件规范
Gemfile                  Ruby 依赖
```

文章 URL 由 `_config.yml` 中的 permalink 决定，形如 `/2018/05/25/vim-shortcuts.html`；重命名文章文件会改变 URL，已有外链需要同步。

## 本地预览

需要 Ruby 与 Bundler，依赖版本见 `Gemfile`：

```bash
bundle install
bundle exec jekyll serve
```

浏览器打开 <http://127.0.0.1:4000>。`jekyll serve` 会监听源文件变化并自动重建；只构建不启动服务时用 `bundle exec jekyll build`，产物在 `_site/`（已被 `.gitignore` 忽略）。

如果本机 Ruby 版本与 `Gemfile` 中的旧版本依赖不兼容，也可以直接安装 Jekyll 3.9 系列后运行 `jekyll serve`，不经过 Bundler。

## 新增文章

1. 在 `_posts/` 下新建 `YYYY-MM-DD-slug.md`，例如 `2026-01-01-my-note.md`。**日期取自文件名**，也就是文章发布日期与 URL 中的日期，不要在 front matter 里再写 `date`（避免时区导致日期偏移）。
2. 文件头部写 front matter，正文使用 Markdown（GFM）：

```yaml
---
layout: post
title: 文章标题
description: 一句话摘要，用于首页卡片与 meta description（不超过 120 字符）
tags: [tag-one, tag-two]
---
```

3. `layout: post` 已由 `_config.yml` 对文章设为默认值，显式写上也无妨。
4. `tags` 用 1–3 个小写英文短词，展示在首页卡片与文章页；`description` 与正文语言保持一致。
5. 图片放到 `images/`，正文中用 `/images/xxx.png` 引用。
6. 保存后文章会自动出现在首页卡片墙与 `/posts/` 归档。首页卡片的列分布、配色与大小由 `_includes/wall.html` 中的循环规则自动分配，无需手工维护。

## 交互与可访问性

- 主题按钮在首页左栏与站内页顶栏；深色是默认值，浅色选择写入 `localStorage`，刷新后保持
- `/` 或 `Ctrl/⌘ + K` 聚焦搜索框，`Esc` 清空筛选；标签按钮可与关键词叠加过滤
- 首页卡片墙自动缓慢漂移，鼠标悬停时减速，键盘聚焦卡片时暂停并居中显示
- 卡片墙由三段完全相同的列块组成，滚动到边界时无缝回到起点；`prefers-reduced-motion: reduce` 时关闭自动漂移
- 跳转链接、可见焦点环、`aria-current`、卡片墙 `aria-label`；重复的滚动副本使用 `inert` 并从 tab 顺序中移除

## 部署

仓库 Settings → Pages 的 Source 选择 **Deploy from a branch**，分支 `main`、目录 `/ (root)`；之后每次 push 到 `main`，GitHub Pages 会自动构建并发布。`_site/` 是本地构建产物，无需提交。

> 如果 push 后线上仍是旧页面，先确认 Pages 的 Source 与分支设置正确，并查看仓库 Actions / Pages 的构建记录；GitHub Pages 不会读取 `_site/`，它会在服务端重新构建。
