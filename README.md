# Liow Ming Kuan — Portfolio

A static site made of plain HTML, CSS and JS. There is no build step: edit a file, save it, and refresh the browser.

## 文件结构

```
index.html        首页（所有文字、作品、链接都在这里）
css/style.css     样式（颜色、字体在最上面的 :root）
js/main.js        动效：平滑滚动、入场动画、悬停预览、视频弹窗
favicon.svg       标签页图标
assets/           放你自己的视频和图片（可选，见下方）
work/             案例页（下一步做）
```

## 常见修改

| 想改什么 | 去哪里 |
|---|---|
| 名字、介绍、项目标题和描述 | `index.html`，直接改文字 |
| 某个作品的视频 | 卡片上的 `data-yt="..."`、`href` 和 `img` 里的 YouTube ID |
| 加一个作品 | 复制一整段 `<article class="card">…</article>`，改 ID 和文字 |
| 删一个作品 | 删掉那一整段 `<article>` |
| 首页背景视频 | `.hero-reel` 上的 `data-youtube="ID"`，或者 `data-mp4="assets/video/showreel.mp4"`（推荐） |
| 主色 | `css/style.css` 里的 `--accent: #FF5A1F;` |
| 邮箱 / LinkedIn | `index.html` 的 Contact 区块 |

YouTube ID 是链接里 `v=` 后面的那一串，比如 `youtube.com/watch?v=XCIFLyZvHjY` 里的 `XCIFLyZvHjY`。

## 建议准备的素材（让网站更快更高级）

- **Showreel 背景**：`assets/video/showreel.mp4`，1920×1080，15–30 秒，无声，H.264，文件小于 8MB。用 mp4 不会出现 YouTube 的标题栏，加载也更快。
- **悬停预览**（可选）：每个作品一段 6–8 秒的循环，720p，小于 2MB，例如 `assets/video/previews/proposal.mp4`。然后在卡片的 `<a>` 上加 `data-preview="assets/video/previews/proposal.mp4"`。有了 mp4，手机上滑到卡片时也会自动播放。
- **KV 图片**：目前直接引用 Strikingly 上的图片。建议把原图导出成 WebP（宽 1600px）放进 `assets/img/kv/`，再替换 `src` 和 `data-img`。

## 本地预览

在这个文件夹里运行：

```bash
python -m http.server 5173
```

然后打开 http://localhost:5173

## 免费部署

**Netlify（最简单，推荐）**
1. 打开 https://app.netlify.com/drop
2. 把整个文件夹拖进去，就会得到一个网址。
3. 在 Site settings 里可以改成 `mingkuan.netlify.app`，或者绑定自己的域名。

**Vercel**
1. 把文件夹上传到 GitHub 仓库。
2. 在 https://vercel.com/new 导入这个仓库，Framework 选 "Other"，然后点 Deploy。

**GitHub Pages**
1. 把文件夹上传到 GitHub 仓库。
2. 打开 Settings → Pages → Source，选 "Deploy from a branch"，分支选 `main`，目录选 `/ (root)`。

以后每次更新：Netlify Drop 重新拖一次文件夹；Vercel 和 GitHub Pages 推送到 GitHub 后会自动更新。
