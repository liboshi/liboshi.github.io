# liboshi.github.io

Boush Li 的个人主页与技术博客，基于 [Jekyll](https://jekyllrb.com/) 构建的静态站点，由 GitHub Pages 发布：<https://liboshi.github.io>。

- 首页：个人资料卡 + 最新文章信息流，每篇文章显示摘要、标签与阅读入口
- `/posts/`：按年份分组的文章归档
- `/about/`：关于作者
- `/feed.xml`：Atom 订阅源
- 浅色 / 深色双主题，跟随系统并可手动切换；桌面、平板、手机均适配

## 技术栈

- Jekyll 3.9 + Liquid 模板，输出纯静态 HTML，无运行时框架
- Markdown：kramdown（GFM 输入）+ Rouge 代码高亮
- 样式：原生 CSS，颜色、圆角、间距、字体等设计令牌用 CSS 自定义属性集中管理
- 脚本：`js/main.js`，负责主题切换与移动端导航
- 依赖版本见 `Gemfile`

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
6. 保存后文章会自动出现在首页与 `/posts/` 归档。

## 设计说明

页面采用现代信息流式布局：浅灰底色、白色圆角卡片、蓝色强调色与系统字体，配合克制的阴影和分割线；浅色与深色主题各有一套颜色令牌。完整规范（颜色、字体、间距、圆角、阴影、组件类名）见 [docs/design-system.md](docs/design-system.md)，令牌定义在 `css/main.css` 的 `:root` 中。

## 部署

仓库 Settings → Pages 的 Source 选择 **Deploy from a branch**，分支 `main`、目录 `/ (root)`；之后每次 push 到 `main`，GitHub Pages 会自动构建并发布。`_site/` 是本地构建产物，无需提交。
