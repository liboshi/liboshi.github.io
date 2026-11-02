# 设计系统

本站采用克制的现代信息流风格：浅灰页面底色、白色圆角卡片、深蓝强调色、系统字体，以及细分割线与轻阴影。所有颜色、字体、间距、圆角和阴影通过 CSS 自定义属性集中管理，定义在 [`css/main.css`](../css/main.css) 的 `:root`，深色主题在 `@media (prefers-color-scheme: dark)` 和 `:root[data-theme="dark"]` 中覆盖。

主题策略：默认跟随系统；用户点击右上角按钮后，选择写入 `localStorage`，并在页面头部脚本中尽早恢复，避免主题闪烁。

## 1. 颜色令牌

### 浅色

| 令牌 | 值 | 用途 |
| --- | --- | --- |
| `--color-bg` | `#F0F2F5` | 页面底色 |
| `--color-surface` | `#FFFFFF` | 卡片、顶栏、弹层 |
| `--color-surface-hover` | `#F2F3F5` | 列表行、导航项悬停 |
| `--color-surface-pressed` | `#E4E6EB` | 次级按钮、按下态 |
| `--color-primary` | `#0B5FCC` | 链接、选中态、描边 |
| `--color-primary-hover` | `#084FAE` | 链接悬停 |
| `--color-primary-pressed` | `#063F8C` | 链接按下 |
| `--color-primary-soft` | `#E7F3FF` | 选中导航、标签底色 |
| `--color-primary-solid` | `#0B5FCC` | 实心主按钮底色 |
| `--color-primary-solid-hover` | `#084FAE` | 实心主按钮悬停 |
| `--color-primary-solid-pressed` | `#063F8C` | 实心主按钮按下 |
| `--color-primary-ink` | `#08427A` | 浅蓝底上的深色文字 |
| `--color-text` | `#050505` | 主文本 |
| `--color-text-secondary` | `#65676B` | 次要文本、日期、说明 |
| `--color-text-tertiary` | `#5F6368` | 辅助文本、占位符 |
| `--color-divider` | `#CED0D4` | 分割线 |
| `--color-border` | `#DADDE1` | 输入框、卡片描边 |
| `--color-code-bg` | `#F5F6F7` | 行内代码与代码块底色 |
| `--color-success` | `#31A24C` | 成功状态 |
| `--color-danger` | `#E41E3F` | 错误、404 强调 |

### 深色

| 令牌 | 值 | 用途 |
| --- | --- | --- |
| `--color-bg` | `#18191A` | 页面底色 |
| `--color-surface` | `#242526` | 卡片、顶栏 |
| `--color-surface-hover` | `#3A3B3C` | 悬停、输入框 |
| `--color-surface-pressed` | `#4E4F50` | 按下态 |
| `--color-primary` | `#8BC0FF` | 深色模式链接（更亮） |
| `--color-primary-soft` | `rgba(139, 192, 255, .14)` | 选中背景、标签底色 |
| `--color-primary-ink` | `#B7D8FF` | 深色标签文字 |
| `--color-primary-solid` | `#1266D6` | 实心主按钮底色 |
| `--color-primary-solid-hover` | `#0F5BBF` | 实心主按钮悬停 |
| `--color-primary-solid-pressed` | `#0B4B9E` | 实心主按钮按下 |
| `--color-text` | `#E4E6EB` | 主文本 |
| `--color-text-secondary` | `#B0B3B8` | 次要文本 |
| `--color-text-tertiary` | `#A0A3A8` | 辅助文本 |
| `--color-divider` | `#3E4042` | 分割线 |
| `--color-border` | `#3E4042` | 描边 |
| `--color-code-bg` | `#1C1D1F` | 代码底色 |

强调色拆成 `--color-primary`（文字/链接/描边）与 `--color-primary-solid`（实心按钮底色），这样链接可以保持较高亮度，而按钮上的白字仍能达到对比度要求。

## 2. 字体

```css
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
  "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB",
  "Microsoft YaHei", sans-serif;
--font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas,
  "Liberation Mono", "Courier New", monospace;
```

不加载外部字体或字体 CDN，避免额外请求和隐私问题。

| 角色 | 字号 / 行高 / 字重 |
| --- | --- |
| 正文 / UI | 15px / 1.5 / 400 |
| 小字（日期、meta） | 12–13px / 1.4–1.5 / 400–600 |
| 卡片标题 | 20px / 1.35 / 700 |
| 区块标题 h2 | 20px / 1.3 / 700 |
| 页面主标题 h1 | 28px / 1.25 / 700（移动端 24px） |
| 首页姓名 | 32px / 1.2 / 700（移动端 26px） |
| 文章标题 | 30px / 1.25 / 700（移动端 25px） |
| 正文排版 `.prose` | 16px / 1.75 |

## 3. 间距、圆角、阴影

- 间距刻度：`4 / 8 / 12 / 16 / 20 / 24 / 32 / 48`（`--space-1` 到 `--space-12`）。
- 圆角：卡片与代码块 `8px`，按钮/输入框 `6px`，大卡片 `12px`，标签与导航 pill `999px`。
- 阴影：
  - 卡片：`0 1px 2px rgba(0,0,0,.10), 0 2px 4px rgba(0,0,0,.04)`
  - 卡片悬停：`0 2px 8px rgba(0,0,0,.14)`
  - 顶栏：`0 1px 2px rgba(0,0,0,.12)`
  - 聚焦环：`0 0 0 3px rgba(11,95,204,.35)`；深色为 `rgba(139,192,255,.4)`
- 过渡：`120ms ease`；`prefers-reduced-motion: reduce` 时关闭动画与平滑滚动。
- 布局：内容区 `1100px`，文章/表单窄栏 `780px`，顶栏高度 `56px`。

## 4. 组件规格

| 组件 | 类名 | 说明 |
| --- | --- | --- |
| 顶栏 | `.topbar` / `.topbar__inner` | 白/深色底、56px 高、sticky、细阴影；移动端折叠为下拉菜单 |
| 品牌 | `.brand` / `.brand__mark` | 36px 蓝色圆形 B 标记 + 姓名；链接本身至少 44px 高 |
| 导航 | `.topnav__link` | 悬停浅色底；当前页 `--color-primary-soft` 底 + 深色字；每项至少 44×44 |
| 按钮 | `.btn` + `.btn--primary` / `.btn--secondary` / `.btn--ghost` | 主按钮实心蓝白字；次级浅灰底；ghost 描边；最小高度 44px |
| 图标按钮 | `.icon-btn` | 44px 圆形，用于主题切换 / 移动菜单 |
| 卡片 | `.card` | 白/深色底、8px 圆角、1px 阴影、16–20px 内边距 |
| 首页资料卡 | `.profile` / `.profile__cover` / `.profile__avatar` | 蓝色渐变封面、168px 圆形头像、姓名、简介、GitHub 与文章数、两个主按钮、四个页签 |
| 头像 | `.avatar` / `.avatar--xl` / `.avatar--lg` | 圆形；使用 192px/400px 两档 `srcset` |
| 页签 | `.tabs` / `.tab` | 水平导航，选中态底部 3px 强调色 |
| 文章卡片 | `.post-card` / `.post-card__link` | 整张卡片是单一链接：日期 → 标题 → 摘要 → 标签与“阅读全文” |
| 标签 | `.tag` / `.tag--link` | pill 形；标签索引项至少 44px 高；文章头部行内标签保持紧凑 |
| 搜索 | `.search` / `.search__input` | 首页按标题、摘要、标签即时过滤，状态用 `aria-live` 播报 |
| 文章布局 | `.article` / `.article__head` / `.article__title` | 返回链接、日期、标签、唯一 h1、摘要、正文、页脚、上一篇/下一篇 |
| 目录 | `.article-toc` / `.article-toc__summary` | `<details>` 折叠；桌面默认展开、两列，移动端默认收起；至少 3 个 h2/h3 才生成 |
| 代码复制 | `.code-copy` | 每个代码块右上角按钮，复制成功短暂提示 |
| 归档 | `.archive` / `.archive-year` / `.archive-list` | 按年份分组，日期本地化 |
| 标签页 | `.tag-index` / `.tag-group` | 顶部索引跳转 + 按标签分组的文章列表 |
| 关于页 | `.about-card` / `.about-body` / `.about-links` | 头像、身份、短介绍与外部链接 |
| 页脚 | `.footer` / `.footer__nav` / `.footer__note` | 细分割线、导航、版权与订阅入口 |
| 404 | `.not-found` / `.page-404` | 大号 404、说明与返回首页/归档按钮，页面垂直居中 |

## 5. 交互与响应式

- 断点：`960px`（文章侧栏/布局收敛）、`900px`（首页信息流与侧栏改为单列）、`760px`（移动导航、文章目录单列）、`600px` / `560px`（小屏间距与字号）。
- 移动导航：点击菜单后焦点进入第一个导航链接；`Tab` 焦点限制在顶栏内；`Esc` 关闭并把焦点还给菜单按钮；点击外部或跨度变化时关闭。
- 首页搜索：输入即时过滤；`/` 聚焦搜索框，`Esc` 清空并还原列表；状态文本通过 `aria-live="polite"` 更新。
- 文章工具：目录和复制按钮由 `js/main.js` 渐进增强；禁用 JavaScript 时正文、导航和链接仍完整可用。
- 主题切换：按钮同步 `aria-pressed`、`aria-label` 和 `meta[name="theme-color"]`；切换瞬间临时禁用过渡，避免颜色闪烁。

## 6. 可访问性约定

- 语义化结构：`header / nav / main / article / aside / footer`，每页唯一 `h1`；文章正文语言用 `<article lang>` 标记。
- 跳转链接 `.skip-link`、可见 `:focus-visible` 聚焦环、当前导航 `aria-current="page"`。
- 图片必须有 `alt`；装饰性封面使用 `aria-hidden="true"`；图标使用 `aria-hidden="true"` 并由文字或 `aria-label` 提供名称。
- 颜色对比度：用浏览器计算样式逐层合成背景后实测，浅色与深色主题各页面均无低于 4.5:1 的文本；正文、链接、按钮、标签均满足 WCAG AA。
- 可点击区域：导航、按钮、图标按钮、页脚链接、资料卡链接与标签索引项至少 44px；文章头部的行内标签是例外，高度约 28px，仍高于 WCAG 2.2 的 24px 最低要求。
- 支持 `prefers-color-scheme`、`prefers-reduced-motion`；无第三方统计、追踪脚本或外部字体请求。
