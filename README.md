# Makedang Markdown 编辑器

基于 [markdown.com.cn/editor](https://markdown.com.cn/editor/) 的本地复刻，纯静态前端，可部署到 GitHub Pages。

## 本地预览

```bash
npm start
```

打开 http://localhost:3000

## 部署到 GitHub Pages

GitHub Pages「Deploy from a branch」**仅支持** `/ (root)` 或 **`/docs`**，不支持 `/editor` 等自定义目录。

本仓库站点文件在 **`docs/`** 目录，请按下列步骤启用：

1. 打开 **Settings → Pages**
2. **Source** 选 **Deploy from a branch**
3. **Branch** 选 **`main`**
4. **Folder** 选 **`/docs`**
5. 点击 **Save**

部署完成后访问：**https://wanglaoshi.github.io/Makedang/**

> 仓库根目录与 `docs/` 下均有 `.nojekyll`，避免 Jekyll 忽略 `vendor` 等目录。

## 项目结构

```
docs/
├── index.html
├── css/style.css
├── js/                     # ES 模块（入口 main.js）
└── vendor/                 # 第三方库（见 ref.md）
```

## 修改代码后

无构建步骤。改完 `docs/` 内文件后 `git push`，Pages 约 1～3 分钟更新；本地改完刷新浏览器即可。

## 文档

- [ref.md](./ref.md) — 依赖清单与技术说明
