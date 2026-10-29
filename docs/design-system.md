# 设计系统 —— Facebook 风格

本站视觉参考 Facebook（2024–2025）桌面与移动端界面：浅灰页面底色 `#F0F2F5`、白色圆角卡片、`#1877F2` 品牌蓝、系统字体、克制的 1px 阴影与 8px 圆角。所有颜色、圆角、间距、字体均通过 CSS 自定义属性集中管理，定义在 [`css/main.css`](../css/main.css) 的 `:root` 中。

## 1. 颜色令牌

### 浅色（默认）

| 令牌 | 值 | 用途 |
| --- | --- | --- |
| `--color-bg` | `#F0F2F5` | 页面底色（Facebook 经典浅灰） |
| `--color-surface` | `#FFFFFF` | 卡片、顶栏、弹层 |
| `--color-surface-hover` | `#F2F3F5` | 列表行 / 导航项悬停 |
| `--color-surface-pressed` | `#E4E6EB` | 次级按钮、按下态 |
| `--color-primary` | `#1877F2` | 品牌蓝：主按钮、链接、选中态 |
| `--color-primary-hover` | `#166FE5` | 主按钮悬停 |
| `--color-primary-pressed` | `#1464CC` | 主按钮按下 |
| `--color-primary-soft` | `#E7F3FF` | 选中导航底色、标签底色 |
| `--color-text` | `#050505` | 主文本 |
| `--color-text-secondary` | `#65676B` | 次要文本、日期、说明 |
| `--color-text-tertiary` | `#6E7175` | 辅助文本、占位符（对白底 5.1:1，满足 AA） |
| `--color-divider` | `#CED0D4` | 分割线 |
| `--color-border` | `#DADDE1` | 输入框 / 卡片描边 |
| `--color-success` | `#31A24C` | 成功状态 |
| `--color-danger` | `#E41E3F` | 错误、404 强调 |
| `--color-link` | `#1877F2` | 正文链接 |

### 深色（跟随系统，可用右上角按钮切换）

| 令牌 | 值 | 用途 |
| --- | --- | --- |
| `--color-bg` | `#18191A` | 页面底色（Facebook 深色模式） |
| `--color-surface` | `#242526` | 卡片、顶栏 |
| `--color-surface-hover` | `#3A3B3C` | 悬停 / 输入框 |
| `--color-surface-pressed` | `#4E4F50` | 按下态 |
| `--color-primary` | `#2D88FF` | 深色模式品牌蓝（更亮） |
| `--color-primary-soft` | `rgba(45, 136, 255, .16)` | 选中背景 |
| `--color-text` | `#E4E6EB` | 主文本 |
| `--color-text-secondary` | `#B0B3B8` | 次要文本 |
| `--color-text-tertiary` | `#8A8D91` | 辅助文本 |
| `--color-divider` | `#3E4042` | 分割线 |
| `--color-border` | `#3E4042` | 描边 |

## 2. 字体

```css
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
  "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB",
  "Microsoft YaHei", sans-serif;
--font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas,
  "Liberation Mono", "Courier New", monospace;
```

| 角色 | 字号 / 行高 / 字重 |
| --- | --- |
| 正文 / UI | 15px / 1.5 / 400 |
| 小字（日期、meta） | 13px / 1.4 / 400 |
| 卡片标题 | 17px / 1.35 / 600 |
| 区块标题 h2 | 20px / 1.3 / 700 |
| 页面主标题 h1 | 28px / 1.25 / 700（移动端 24px） |
| 首页姓名 | 32px / 1.2 / 700（移动端 26px） |
| 正文排版 `.prose` | 16px / 1.7 |

## 3. 间距、圆角、阴影

- 间距刻度：`4 / 8 / 12 / 16 / 20 / 24 / 32 / 48`（`--space-*`）。
- 圆角：卡片 `8px`、按钮/输入框 `6px`、标签/导航 pill `999px`。
- 阴影：
  - 卡片：`0 1px 2px rgba(0,0,0,.10), 0 2px 4px rgba(0,0,0,.04)`
  - 顶栏：`0 1px 2px rgba(0,0,0,.12)`
  - 聚焦环：`0 0 0 3px rgba(24,119,242,.35)`
- 过渡：`120ms ease`；`prefers-reduced-motion: reduce` 时全部关闭。
- 布局宽度：内容区 `1100px`，文章正文 `780px`，顶栏高度 `56px`。

## 4. 组件规格

| 组件 | 类名 | 说明 |
| --- | --- | --- |
| 顶栏 | `.topbar` / `.topbar__inner` | 白底、56px 高、sticky、1px 阴影；移动端折叠为下拉菜单 |
| 品牌标 | `.brand` / `.brand__mark` | 36px 品牌蓝圆形 + 白色首字母，替代旧的红色位图 logo（保留其作为头像） |
| 导航 pill | `.topnav__link` | 悬停浅灰底；选中 `--color-primary-soft` 底 + 深蓝字 |
| 按钮 | `.btn` + `.btn--primary` / `.btn--secondary` / `.btn--ghost` | 主按钮品牌蓝白字；次级 `#E4E6EB` 底；ghost 描边 |
| 图标按钮 | `.icon-btn` | 40px 圆形，用于主题切换 / 移动菜单 |
| 卡片 | `.card` | 白底、8px 圆角、1px 阴影、16px 内边距 |
| 封面 | `.profile-cover` | 品牌蓝渐变（`#0866FF → #1877F2 → #0C4DA2`）+ 柔光，替代旧 `navigation_bg.png` |
| 头像 | `.avatar` / `.avatar--xl` | 圆形；首页 168px，带 4px 白描边并上移压住封面 |
| 页签 | `.tabs` / `.tab` | 白底水平页签，选中态 3px 品牌蓝下划线 |
| 文章卡片 | `.post-card` | 作者行（小头像 + 姓名 + 日期）→ 标题 → 摘要 → 底部操作行 |
| 标签 | `.tag` | pill 形，`--color-primary-soft` 底 + 深蓝字 |
| 正文 | `.prose` | h1–h4、列表、引用、表格、行内代码、代码块、分割线排版 |
| 上一篇/下一篇 | `.post-nav` | 两张并排卡片，移动端纵向堆叠 |
| 页脚 | `.footer` | 细分割线 + 次要文本，无第三方统计脚本 |
| 404 | `.not-found` | 大号 `404` + 返回首页/归档按钮 |

## 5. 迁移映射（旧 → 新）

| 旧实现 | 新实现 |
| --- | --- |
| Bootstrap 3 CDN（CSS/JS/theme） | 删除，改为手写语义化 CSS（零外部依赖） |
| 红色主色 `#ce2812` | 品牌蓝 `#1877F2` |
| `navigation_bg.png` 固定顶栏 | 白色 sticky 顶栏 + 阴影 |
| 三套重复的 layout 模板 | `default` 基础骨架 + `home` / `post` / `page` 三个内容布局 |
| 硬编码导航（含 3 个 404 链接：`/downloads`、`/docs`、`/libraries`） | `_data/navigation.yml` 驱动，仅保留真实页面 |
| Baidu 统计 JS（http 混合内容） | 删除 |
| `site.posts` 侧栏重复列表 | 首页信息流卡片 + `/posts/` 归档页 |
| `pygments: true`（已废弃） | `kramdown` + `rouge` 语法高亮 |

## 6. 可访问性约定

- 语义化结构：`header / nav / main / article / aside / footer`，每页唯一 `h1`。
- 跳转链接 `.skip-link`、可见 `:focus-visible` 聚焦环、`aria-current="page"`。
- 图片必须有 `alt`；装饰性封面用 `role="img"` + `aria-label`。
- 正文对比度：主文本 19:1、次要文本 5.9:1、辅助文本 5.1:1（均满足 AA）。品牌蓝 `#1877F2` 用于按钮与链接（与 Facebook 原色一致，白底对比度 4.2:1，仅用于加粗/较大的 UI 文本，正文链接带下划线）。
- 支持 `prefers-color-scheme` 与 `prefers-reduced-motion`。
