# Makedang Markdown 编辑器

基于 [markdown.com.cn/editor](https://markdown.com.cn/editor/) 的本地复刻，纯静态前端，可部署到 GitHub Pages。

## 本地预览

```bash
npm start
```

打开 http://localhost:3000

## 部署到 GitHub Pages

### 方式一：以 `editor` 为站点根目录（推荐）

1. 将本仓库推送到 GitHub
2. **Settings → Pages → Build and deployment**
3. **Source** 选 **Deploy from a branch**
4. **Branch** 选 `main`，**Folder** 选 **`/editor`**
5. 保存后访问：`https://<用户名>.github.io/<仓库名>/`

### 方式二：使用 `docs` 目录

若希望站点在仓库根路径 `https://<用户名>.github.io/<仓库名>/`：

```bash
# 将 editor 内容同步到 docs（发布前执行）
rsync -a --delete editor/ docs/
```

Pages 设置 **Folder** 为 **`/docs`**。

> 仓库已包含 `.nojekyll`，避免 Jekyll 忽略 `vendor` 等目录。

## 项目结构

```
editor/
├── index.html              # 页面
├── css/style.css
├── js/
│   ├── main.js             # 入口
│   ├── config.js           # 配置与资源路径（GitHub Pages 兼容）
│   ├── context.js          # DOM 与状态
│   ├── default-content.js  # 默认示例文档
│   ├── markdown.js         # Marked 渲染、TOC、脚注
│   ├── mermaid-helper.js   # Mermaid 加载
│   ├── preview.js          # 预览区更新
│   ├── files.js            # 多文件与 localStorage
│   ├── toolbar.js          # 工具栏插入
│   ├── theme.js            # 主题
│   ├── sync-scroll.js      # 同步滚动
│   ├── line-numbers.js     # 行号
│   ├── resizer.js          # 分栏拖拽
│   ├── export-io.js        # 导入导出
│   ├── events.js           # 事件与快捷键
│   ├── tooltip.js
│   └── utils.js
└── vendor/                 # 第三方库（见 ref.md）
```

## 修改代码后

无构建步骤。改完 `js/*.js` 或 `index.html` 后：

- 本地：刷新浏览器（必要时强刷）
- GitHub Pages：`git push` 后等待 Pages 更新（通常 1～3 分钟）

## 文档

- [ref.md](./ref.md) — 依赖清单与技术说明
