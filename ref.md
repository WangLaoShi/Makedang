# 技术参考：markdown.com.cn/editor 复刻

本文档说明本复刻与原版 [在线 Markdown 编辑器](https://markdown.com.cn/editor/) 的对应关系、目录结构、依赖库及实现要点。

---

## 1. 原版站点信息

| 项目 | 说明 |
|------|------|
| 地址 | https://markdown.com.cn/editor/ |
| 类型 | 纯前端单页应用（SPA），无后端 API |
| 数据存储 | 浏览器 `localStorage` |
| 构建方式 | 无打包工具，静态 HTML + CSS + JS + CDN |

---

## 2. 本仓库文件与原版对应

| 本仓库路径 | 原版 URL | 说明 |
|------------|----------|------|
| `docs/index.html` | `/editor/index.html` | 页面结构、工具栏、侧边栏、弹窗 |
| `docs/css/style.css` | `/editor/css/style.css` | 布局、主题变量、预览区样式 |
| `docs/js/main.js` + 模块 | `/editor/js/app.js` | 业务逻辑（由原单文件拆分为 ES 模块） |
| `docs/favicon.ico` | `/editor/favicon.ico` | 站点图标 |
| `docs/vendor/*` | 各 CDN 地址 | 见下文「第三方依赖」 |

### 2.1 JavaScript 模块职责

| 文件 | 职责 |
|------|------|
| `main.js` | 应用入口、初始化流程 |
| `config.js` | localStorage 键名、`asset()` 资源 URL（适配 GitHub Pages 子路径） |
| `context.js` | DOM 引用与全局 `state` |
| `default-content.js` | 首次打开的示例 Markdown |
| `utils.js` | `escapeHtml`、标题 id、front matter 等工具函数 |
| `markdown.js` | 配置 Marked、TOC、脚注、HTML 消毒 |
| `mermaid-helper.js` | Mermaid 动态 import |
| `preview.js` | 预览渲染、KaTeX、代码复制按钮 |
| `files.js` | 多文件侧边栏与持久化 |
| `toolbar.js` | 工具栏插入与注释 |
| `theme.js` | 深色/浅色主题 |
| `sync-scroll.js` | 编辑区与预览区同步滚动 |
| `line-numbers.js` | 行号显示 |
| `resizer.js` | 左右分栏宽度拖拽 |
| `export-io.js` | 导入/导出 `.md`、`.html` |
| `events.js` | 键盘快捷键、粘贴/拖拽图片 |
| `tooltip.js` | 工具栏 tooltip |

**本地化改动（功能等价）：**

- 将 CDN 脚本/样式改为 `docs/vendor/` 下本地文件
- Mermaid 使用完整 `node_modules/mermaid/dist` 拷贝（含 `chunks/`，否则 ESM 无法加载）
- `app.js` 中 Mermaid、Highlight、KaTeX 的 URL 指向本地路径

---

## 3. 第三方依赖清单

以下均为原版实际使用或等价的库；版本与原版 CDN 对齐。

### 3.1 Marked — Markdown 解析

| 属性 | 值 |
|------|-----|
| 项目 | [markedjs/marked](https://github.com/markedjs/marked) |
| 版本 | **12.0.0** |
| 许可证 | MIT |
| 本仓库路径 | `docs/vendor/marked/marked.min.js` |
| 原版 CDN | `https://fastly.jsdelivr.net/npm/marked@12.0.0/marked.min.js` |
| 用途 | 将 Markdown 转为 HTML；自定义 `Renderer`（代码块、表格、标题 id、Callout、==高亮== 扩展） |

### 3.2 DOMPurify — HTML 消毒

| 属性 | 值 |
|------|-----|
| 项目 | [cure53/DOMPurify](https://github.com/cure53/DOMPurify) |
| 版本 | **3.x**（本仓库为 3.2.4 构建） |
| 许可证 | Apache-2.0 / MPL-2.0 |
| 本仓库路径 | `docs/vendor/dompurify/purify.min.js` |
| 原版 CDN | `https://fastly.jsdelivr.net/npm/dompurify@3/dist/purify.min.js` |
| 用途 | 预览 HTML 消毒；为 KaTeX 输出放行 `mjx-*`、`math` 等标签 |

### 3.3 Highlight.js — 代码高亮

| 属性 | 值 |
|------|-----|
| 项目 | [highlightjs/highlight.js](https://github.com/highlightjs/highlight.js) |
| 版本 | **11.9.0** |
| 许可证 | BSD-3-Clause |
| 本仓库路径 | `docs/vendor/highlight.js/highlight.min.js` |
| 主题 CSS | `github.min.css` / `github-dark.min.css` |
| 原版 CDN | `@highlightjs/cdn-assets@11.9.0`（jsdelivr）；主题曾用 bootcdn |
| 用途 | fenced code 块语法高亮；预览区「复制」按钮 |

### 3.4 KaTeX — 数学公式

| 属性 | 值 |
|------|-----|
| 项目 | [KaTeX/KaTeX](https://github.com/KaTeX/KaTeX) |
| 版本 | **0.16.9** |
| 许可证 | MIT |
| 本仓库路径 | `docs/vendor/katex/katex.min.css`、`katex.min.js`、`auto-render.min.js` |
| 原版 CDN | `fastly.jsdelivr.net/npm/katex@0.16.9/...` |
| 用途 | 行内 `$...$` 与块级 `$$...$$` 公式渲染（`renderMathInElement`） |

### 3.5 Mermaid — 图表

| 属性 | 值 |
|------|-----|
| 项目 | [mermaid-js/mermaid](https://github.com/mermaid-js/mermaid) |
| 版本 | **11.15.0** |
| 许可证 | MIT |
| 本仓库路径 | `docs/vendor/mermaid/`（完整 `dist`，含 `mermaid.esm.min.mjs` 与 `chunks/`） |
| 原版 CDN | `cdn.jsdelivr.net/npm/mermaid@11.15.0/dist/mermaid.esm.min.mjs`（动态 `import()`） |
| 用途 | flowchart、sequence、gantt、class、state、pie、mindmap 等；支持 `seq`/`gantt` 别名与简化时序语法 |

> **注意：** Mermaid 11.x 的 ESM 入口依赖大量 `./chunks/*.mjs`，必须整包拷贝，不能只下载单个 `mermaid.esm.min.mjs`。

### 3.6 浏览器原生 API（非 npm 包）

| API | 用途 |
|-----|------|
| `localStorage` | 单文档内容、多文件列表、主题、同步滚动、行号开关 |
| `FileReader` | 导入 `.md` / 粘贴、拖拽图片转 Base64 |
| `Blob` / `URL.createObjectURL` | 导出 `.md` / `.html` 下载 |
| `navigator.clipboard` | 复制代码块 |
| `matchMedia('(prefers-color-scheme: dark)')` | 首次访问默认深色主题 |

---

## 4. 不依赖第三方库的自研逻辑（均在 `app.js`）

| 模块 | 功能 |
|------|------|
| 文件系统 | 多文件 CRUD，`md_editor_files` / `md_editor_content` |
| 工具栏 | `insertMarkdown` 包裹选区 |
| 目录 `[TOC]` | 解析标题生成锚点目录（跳过代码块内 `#`） |
| 脚注 | `[^n]` 与 `[^n]:` 预处理 |
| Callout | `> [!INFO]` 等 blockquote 扩展 |
| 同步滚动 | 编辑区↔预览区，基于标题锚点插值 |
| 行号 | 与 textarea 滚动同步 |
| 主题 | `data-theme` + Highlight 主题切换 |
| 导出 HTML | 内联 hljs + KaTeX CSS，嵌入已渲染 Mermaid SVG |
| Service Worker 清理 | `index.html` 底部注销旧 `/editor/` SW |

---

## 5. localStorage 键名

| 键 | 说明 |
|----|------|
| `md_editor_content` | 当前文档内容（兼容旧版单文件） |
| `md_editor_files` | 多文件 JSON 数组 `{ id, name, content, updatedAt }` |
| `md_editor_theme` | `dark` / `light` |
| `md_editor_sync_scroll` | `on` / `off` |
| `md_editor_line_numbers` | 行号显示（若实现中有使用） |

---

## 6. 原版 CDN 与本地化对照表

| 库 | 原版地址 | 本地路径 |
|----|----------|----------|
| KaTeX CSS | fastly.jsdelivr …/katex@0.16.9/dist/katex.min.css | vendor/katex/katex.min.css |
| KaTeX JS | …/katex.min.js | vendor/katex/katex.min.js |
| auto-render | …/contrib/auto-render.min.js | vendor/katex/auto-render.min.js |
| Highlight JS | …/@highlightjs/cdn-assets@11.9.0/highlight.min.js | vendor/highlight.js/highlight.min.js |
| Highlight 主题 | github.min.css / github-dark.min.css | vendor/highlight.js/*.min.css |
| Marked | …/marked@12.0.0/marked.min.js | vendor/marked/marked.min.js |
| DOMPurify | …/dompurify@3/dist/purify.min.js | vendor/dompurify/purify.min.js |
| Mermaid ESM | …/mermaid@11.15.0/dist/mermaid.esm.min.mjs + chunks | vendor/mermaid/ |

---

## 7. Mermaid 支持的语言别名（代码块）

`app.js` 中 `mermaidLangs` 包含：

`mermaid`, `graph`, `flowchart`, `sequencediagram`, `classdiagram`, `state`, `er`, `journey`, `gitgraph`, `pie`, `requirementdiagram`, `c4context`, `mindmap`, `timeline`, `sankey`, `xychart`, `block`, `packet`, `kanban`

另：`seq` → 转换为 `sequenceDiagram`；`gantt` → 自动加 `gantt` 头。

---

## 8. 运行与部署

1. **开发：** `npm start` → 静态服务 `docs/` 目录  
2. **GitHub Pages：** Settings → Pages → Branch `main`，Folder **`/docs`**（GitHub 仅支持 `/` 或 `/docs`）  
3. **资源路径：** `config.js` 中 `asset()` / `MERMAID_MODULE` 使用 `import.meta.url` 解析，自动适配 `https://user.github.io/RepoName/` 子目录，无需手写 base path

---

## 9. 相关外链（原版 UI 保留）

| 链接 | 说明 |
|------|------|
| https://markdown.com.cn/ | Logo 返回首页 |
| https://markdown.com.cn/wechat/ | 微信排版工具 |

可在 `docs/index.html` 中改为自有域名。

---

## 10. 许可证与合规

- 各 `vendor/` 库遵循其各自开源许可证（见上文）。
- `index.html`、`style.css`、`app.js` 来自对公开页面的抓取与本地化，仅供学习；商用或公开分发请自行确认与原站授权关系。
- 默认示例文档中的图片 URL 指向 markdown.com.cn，离线时可能无法显示，可替换为本地资源。

---

## 11. 可选：重新生成 vendor/mermaid

若需升级 Mermaid 版本：

```bash
npm install mermaid@<version> --no-save
rm -rf docs/vendor/mermaid
cp -R node_modules/mermaid/dist docs/vendor/mermaid
```

并同步修改 `app.js` 中的 `import()` 路径（若文件名变更）。

---

*文档随本复刻仓库维护，对应原版站点访问日期：2026-06-04。*
