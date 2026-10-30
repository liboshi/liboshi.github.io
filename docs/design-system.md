# 设计系统 —— 编辑式深色主页

本站采用「近黑底 + 暖白字 + 细线 + 卡片墙」的编辑式视觉：首页是一块固定分栏的画布，左栏负责身份与导航，右侧是持续漂移的文章卡片墙；内容页回到常规文档流，保证长文阅读。所有颜色、字体、间距、圆角与动效都通过 CSS 自定义属性集中管理，定义在 [`css/main.css`](../css/main.css) 的 `:root` 与 `:root[data-theme="light"]` 中。

## 1. 颜色令牌

### 深色（默认）

| 令牌 | 值 | 用途 |
| --- | --- | --- |
| `--bg` | `#070706` | 页面与卡片墙底色 |
| `--bg-veil` | `rgba(7, 7, 6, .86)` | 顶栏毛玻璃、遮罩 |
| `--surface` | `#101010` | 卡片、代码块外层 |
| `--surface-2` | `#1a1a18` | 搜索框、次级表面 |
| `--surface-3` | `#232320` | 悬停、按下态 |
| `--code-bg` | `#0c0c0b` | 代码块底色 |
| `--text` | `#f0ede5` | 主文本、主标题 |
| `--text-2` | `rgba(240, 237, 229, .66)` | 简介、摘要、次要文本（约 7.6:1） |
| `--text-3` | `rgba(240, 237, 229, .55)` | 等宽标签、辅助信息（约 5.5:1） |
| `--line` | `rgba(240, 237, 229, .12)` | 发丝分割线、卡片描边 |
| `--line-2` | `rgba(240, 237, 229, .24)` | 输入框描边、强调分割线 |
| `--focus` | `rgba(240, 237, 229, .9)` | 键盘焦点环 |
| `--tint-1…5` | 陶土 / 苔绿 / 灰蓝 / 沙金 / 砖红，16–30% 透明度 | 文章卡片的低饱和底色 |

### 浅色（暖纸色）

| 令牌 | 值 | 用途 |
| --- | --- | --- |
| `--bg` | `#f2efe6` | 页面与卡片墙底色 |
| `--surface` | `#faf8f1` | 卡片、顶栏 |
| `--surface-2` | `#eae5d8` | 搜索框、次级表面 |
| `--surface-3` | `#e1dbcc` | 悬停、按下态 |
| `--code-bg` | `#ece7da` | 代码块底色 |
| `--text` | `#14140f` | 主文本、主标题 |
| `--text-2` | `rgba(20, 20, 15, .72)` | 简介、摘要（约 6.9:1） |
| `--text-3` | `rgba(20, 20, 15, .68)` | 等宽标签、辅助信息（约 6.0:1） |
| `--line` | `rgba(20, 20, 15, .14)` | 发丝分割线、卡片描边 |
| `--line-2` | `rgba(20, 20, 15, .3)` | 输入框描边 |
| `--tint-1…5` | 同色系加深，16–18% 透明度 | 卡片底色 |

### 反色卡片

深色主题里少数文章卡片使用暖白底、深色字，形成「印刷海报」的节奏点；浅色主题里它们反转为深底暖白字，保持对比。由 `--paper-bg` / `--paper-ink` / `--paper-line` 控制，对应 `.tile--paper`。

### 代码高亮

`css/syntax.css` 与主色板共用一套暖色变量：关键字 `#d9a97c`、字符串 `#a8b98c`、注释 `#6f6c63`、函数 `#c9b184` 等；浅色主题下切换为低饱和深色版本，避免纯黑与高亮色冲撞。

## 2. 字体

```css
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue",
  Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
--font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas,
  "Liberation Mono", "Courier New", monospace;
```

全部使用系统字体，无外部字体请求。中文正文依赖系统黑体，字号与行高按中文阅读习惯调过。

| 角色 | 字号 / 行高 / 字重 |
| --- | --- |
| 首页主标题 `.rail__title` | 32px / 1.14 / 400，中文标题可带斜体强调 |
| 首页简介 `.rail__sub` | 14px / 1.75 / 400 |
| 等宽标签 `.mono` | 10px / 1.5 / 400，大写，字距 `.08em` |
| 卡片标题 `.tile__title` | 20px / 1.3 / 400（大卡 26px，窄屏 19px） |
| 资料卡数值 `.tile__big` | 44px / 1 / 300 |
| 内页标题 `.article-title` | `clamp(30px, 4.2vw, 42px)` / 1.18 / 400 |
| 归档页标题 `.page-title` | `clamp(32px, 5vw, 46px)` / 1.12 / 400 |
| 正文 `.prose` | 15.5px / 1.85 / 400，议论文宽度 720px |
| 文章摘要 `.article-desc` | 16px / 1.7 / 400，颜色 `--text-2` |

## 3. 间距、圆角、布局

- 间距刻度：`4 / 8 / 12 / 16 / 20 / 24 / 32 / 48 / 64`，由具体组件直接使用数值，常用值保持 4 的倍数。
- 圆角：卡片与输入框 `8px`（`--radius`），小控件 `6px`（`--radius-sm`），标签为胶囊形 `999px`。
- 布局变量：`--rail-w: 408px`（左栏）、`--head-h: 64px`、`--max-w: 1200px`、`--reading-w: 720px`。
- 首页 `.home__stage` 使用 `grid-template-columns: var(--rail-w) minmax(0, 1fr)` 固定满屏；`< 1200px` 时切换为普通滚动的移动端首页。
- 内容页最大宽度 1200px，文章正文 720px；归档页 900px。
- 阴影几乎不用，层次主要由底色、描边与留白建立。

## 4. 组件

| 组件 | 类名 | 说明 |
| --- | --- | --- |
| 站内页顶栏 | `.site-head` / `.site-head__inner` | sticky、`--bg-veil` + `backdrop-filter`、底部发丝线；首页隐藏 |
| 字标 | `.wordmark` / `.wordmark__mark` | 方形描边标记 + 姓名 + 「个人主页」小字 |
| 导航 | `.site-nav` / `.site-nav a[aria-current]` | 小号无衬线，当前页用暖白与下划线区分 |
| 主题按钮 | `.js-theme-toggle` / `.theme-btn` | 月亮 / 太阳图标，首页左栏与内页顶栏各一个 |
| 首页左栏 | `.rail` / `.rail__hero` / `.rail__bottom` | 固定 408px，上：品牌行、主标题、两段简介、标签；下：搜索与站点状态 |
| 标签筛选 | `.chip` | 11px 胶囊，`aria-pressed` 表示选中 |
| 搜索框 | `.search` / `.search__field` | 图标 + 输入框 + `/` 快捷键提示 |
| 卡片墙 | `.wall` / `.wall__track` / `.wall__cols` / `.wall__col` | 三列网格，纵向滚动；渲染三段相同列块实现无缝循环 |
| 卡片墙遮罩 | `.wall__fade--top` / `.wall__fade--bottom` | 上下渐变，让边缘卡片淡出 |
| 筛选结果 | `.wall__results` | 筛选时替换卡片墙的等高网格，显示去重后的结果 |
| 卡片 | `.tile` + `.tile--post` / `--post-lg` / `--quote` / `--stat` / `--profile` / `--link` | 统一 `8px` 圆角、`1px` 发丝描边、`16px` 内边距 |
| 卡片配色 | `.tile--p1…p5` / `.tile--paper` | 五组低饱和底色 + 反色纸卡 |
| 文章页 | `.article-shell` / `.article-kicker` / `.article-title` / `.article-desc` / `.prose` | 720px 正文，日期与标签在标题上方，细线分隔 |
| 正文 | `.prose` | h2/h3 带顶部细线，代码块横向滚动，表格在窄屏内滚动 |
| 归档 | `.archive` / `.archive-year` / `.archive-list` | 年份分组，等宽日期 + 标题行 |
| 关于页 | `.about` / `.mark-box` / `.about-section` | 大号首字母标记与分段介绍 |
| 404 | `.not-found` | 超大 `404` + 返回首页 / 归档的胶囊按钮 |
| 页脚 | `.site-foot` | 字标、导航、RSS 与 GitHub；首页隐藏 |
| 移动首页 | `.m-home` / `.m-hero` / `.m-feed` | `< 1200px` 显示，单列（≥720px 双列）卡片流 |

## 5. 动效

- 卡片墙以约 `9px/s` 的速度向上漂移；鼠标移入降到 `0.12×`，键盘聚焦时暂停并居中当前卡片。
- 卡片与按钮的 hover 只改变底色与描边，过渡 `180ms`，曲线 `cubic-bezier(.22,.61,.36,1)`。
- 主题切换时给 `<html>` 临时加 `theme-switching`，全局关闭过渡，避免新旧主题颜色在同一帧混用。
- `prefers-reduced-motion: reduce` 时关闭卡片墙自动漂移与所有过渡；原生滚动仍可用。

## 6. 响应式断点

| 宽度 | 行为 |
| --- | --- |
| `≥ 1280px` | 左栏 408px，三列卡片墙，卡片标题 20 / 26px |
| `1200–1279px` | 左栏 380px，三列卡片墙，卡片标题 19 / 24px |
| `< 1200px` | 隐藏固定分栏，改为顶栏 + 移动首页：大标题、搜索、卡片列表（720–1199px 双列） |
| `≤ 760px` | 顶栏 58px，隐藏 GitHub 链接，内容左右 18px，正文 15px |
| `≤ 420px` | 导航与主标题进一步缩小 |

## 7. 可访问性

- 语义化结构：`header / nav / main / article / aside / footer`，每页唯一 `h1`；文章正文若自带同名 H1，会在渲染时移除，避免重复。
- 跳过导航链接、`:focus-visible` 焦点环、`aria-current="page"`、卡片墙 `aria-label`。
- 重复的卡片墙列块使用 `aria-hidden="true"` + `inert`，并从 tab 顺序中移除；键盘只会停在可见卡片上。
- 文本对比度：深色主题主文本 17.2:1、次要 7.6:1、辅助 5.5:1；浅色主题主文本 16:1、次要 6.9:1、辅助 6.0:1，均满足 WCAG AA。
- 主题切换、筛选、搜索均可用键盘完成：`/` 或 `Ctrl/⌘ + K` 聚焦搜索，`Esc` 清空；卡片墙支持滚轮、触控板与键盘滚动。
- 不依赖外部字体、CDN、统计脚本或第三方运行时。
