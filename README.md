# liboshi.github.io

Boush Li 的个人主页与技术博客，基于 [Jekyll](https://jekyllrb.com/) 的静态站点，由 GitHub Pages 构建发布：<https://liboshi.github.io>。

首页展示最新文章，`/posts/` 归档全部文章（按年份分组），`/about/` 介绍作者。站点为 Facebook 蓝色风格，支持深色模式切换。

## 技术栈

- Jekyll 3.9 + Liquid 模板，构建为纯静态 HTML
- Markdown：kramdown（GFM 输入）+ Rouge 代码高亮
- 样式：原生 CSS，设计令牌以 CSS 自定义属性集中管理，无 CSS 框架
- 脚本：`js/main.js` 负责主题切换与移动端导航
- Ruby 依赖见 `Gemfile`；另有 Atom 订阅源 `feed.xml`

## 目录结构

```text
_config.yml            站点配置（标题、作者、permalink、文章默认布局等）
_data/navigation.yml   顶部导航项
_layouts/              页面布局：default / home / page / post
_includes/             可复用片段：head / header / footer / 文章卡片 / 侧栏
_posts/                博客文章（Markdown，文件名即发布日期）
css/                   样式：main.css 主题与设计令牌、syntax.css 代码高亮
js/                    前端脚本：主题切换、移动端导航
images/                图片等静态资源
index.html             首页（最新文章）
about/                 About 页面
posts/                 文章归档页（/posts/，按年份分组）
404.html               404 页面
feed.xml               Atom 订阅源
docs/                  设计文档：design-system.md 记录设计令牌与组件规范
Gemfile                Ruby 依赖
```

## 本地预览

需要 Ruby 与 Bundler，依赖版本见 `Gemfile`：

```bash
bundle install
bundle exec jekyll serve
```

浏览器打开 <http://127.0.0.1:4000>。`jekyll serve` 会监听源文件变化并自动重建；只想构建时用 `bundle exec jekyll build`，产物在 `_site/`（已被 `.gitignore` 忽略）。

## 新增文章

1. 在 `_posts/` 下新建 `YYYY-MM-DD-slug.md`，例如 `2026-01-01-my-note.md`。**日期取自文件名**，也就是文章发布日期与 URL 中的日期，不要在 front matter 再写 `date`（避免时区导致日期偏移）。
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
6. 保存后文章会自动出现在首页与 `/posts/` 归档。

## 设计说明

Facebook 蓝风格的视觉规范（颜色、字体、间距、圆角、阴影、组件类名）见 [docs/design-system.md](docs/design-system.md)；设计令牌以 CSS 自定义属性形式定义在 `css/main.css` 的 `:root` 中，浅色/深色主题各一套。

## 部署

推送到 `main` 分支即可，GitHub Pages 会自动构建并发布。`_site/` 是构建产物，无需提交。
