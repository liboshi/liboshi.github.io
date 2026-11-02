# liboshi.github.io

Boush Li 的个人主页与技术博客，使用 [Jekyll](https://jekyllrb.com/) 构建，由 GitHub Pages 发布：<https://liboshi.github.io>。

站点以中文读者为主，同时保留英文文章。界面、导航和元信息使用中文；英文文章通过 `lang` 标记正文语言，读屏软件和搜索引擎可以正确识别。

## 功能

- 首页：个人资料卡 + 可搜索的最新文章列表
- `/posts/`：按年份分组的文章归档
- `/tags/`：标签索引与按标签分组的文章列表
- `/about/`：关于作者与站点说明
- `/feed.xml`：Atom 订阅源；`/sitemap.xml`、`/robots.txt` 供搜索引擎抓取
- 浅色 / 深色主题：默认跟随系统，手动切换后记住选择
- 文章页自动生成目录（至少 3 个二级/三级标题时）和代码复制按钮
- 响应式布局、键盘可操作、可见焦点环、`prefers-reduced-motion` 支持
- 纯静态输出，无前端框架、无外部字体、无统计或追踪脚本

## 技术栈

- Jekyll 3.9 + Liquid 模板
- Markdown：kramdown（GFM 输入）+ Rouge 代码高亮
- 样式：原生 CSS，颜色、圆角、间距、字体等设计令牌集中在 `css/main.css` 的 `:root`
- 脚本：`js/main.js`，负责主题切换、移动端导航、首页搜索、文章目录与代码复制
- 依赖版本见 `Gemfile`

## 目录结构

```text
_config.yml            站点配置（标题、作者、description、permalink 等）
_data/navigation.yml   顶部导航项
_layouts/              页面布局：default / home / page / post
_includes/             可复用片段：head / header / footer / 文章卡片 / 资料卡 / 侧栏
_posts/                博客文章（Markdown，文件名即发布日期）
css/                   样式：main.css 设计令牌与组件、syntax.css 代码高亮
js/                    前端脚本：主题、导航、搜索、目录、代码复制
images/                图片资源（头像、分享封面等）
index.html             首页
about/                 关于页（/about/）
posts/                 文章归档（/posts/）
tags/                  标签页（/tags/）
404.html               404 页面
feed.xml               Atom 订阅源
sitemap.xml            站点地图
robots.txt             抓取规则
docs/                  设计文档：design-system.md
.github/workflows/     GitHub Pages 构建与部署工作流
Gemfile                Ruby 依赖
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
description: 一句话摘要，用于首页卡片、meta description 与订阅源（不超过 120 字符）
tags: [tag-one, tag-two]
lang: zh-CN
---
```

3. `layout: post` 已由 `_config.yml` 对文章设为默认值，显式写上也无妨。
4. 中文文章写 `lang: zh-CN`（或省略，默认跟随站点）；英文文章写 `lang: en`。这会影响 `<article lang>`、`og:locale` 和订阅源的 `xml:lang`，不会改变页面界面语言。
5. `tags` 用 1–3 个小写英文短词，展示在首页卡片、文章页与标签页；新增标签会自动出现在 `/tags/`。
6. `description` 用与正文一致的语言；没有填写时会截取正文开头。
7. 图片放到 `images/`，正文中用 `/images/xxx.png` 引用。
8. 保存后文章会自动出现在首页、`/posts/` 与 `/tags/`。

文章正文以 setext 或 ATX 一级标题开头也可以：布局会去掉正文开头的一级标题，保证页面只有一个一级标题。

## 设计说明

页面采用克制的信息流式布局：浅灰底色、白色圆角卡片、深蓝强调色与系统字体，配合细分割线、轻阴影和主要交互区域 44px 的可点击尺寸；浅色与深色主题各有一套颜色令牌，正文对比度按 WCAG AA 校准。完整规范（颜色、字体、间距、圆角、阴影、组件类名）见 [docs/design-system.md](docs/design-system.md)，令牌定义在 `css/main.css` 的 `:root` 中。

## 部署

仓库使用 GitHub Actions 构建并部署 Pages，工作流为 [`.github/workflows/jekyll.yml`](.github/workflows/jekyll.yml)：

1. 仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
2. 推送到 `main` 后，Actions 会运行 `Deploy Jekyll site to Pages`：安装 Ruby 依赖、执行 `bundle exec jekyll build`、上传并部署 `_site/`。
3. 在 Actions 页面确认最新一次运行成功，再访问 <https://liboshi.github.io> 验证。

`_site/` 是本地构建产物，无需提交。如果 Pages 的 Source 仍设为 “Deploy from a branch”，GitHub 会绕过本工作流直接发布分支内容，容易与 Actions 的构建结果不一致；建议统一使用 GitHub Actions。
