# En contexte

**Un mot. Un chunk. Un contexte.**

V1 法语语块 Flashcard 原型。Next.js App Router、TypeScript、Tailwind CSS 4、React 与浏览器 localStorage。

## GitHub Pages 发布

项目已准备 `.github/workflows/pages.yml`。把源码上传到 GitHub 仓库的 `main` 分支，在 Settings → Pages → Build and deployment 中选择 **GitHub Actions**。工作流自动检查代码并静态导出、部署网页。仓库名会自动作为网站的路径前缀，本地开发不受影响。

Pages 上的词卡依然只存于当前浏览器；没有账号或云同步。线上域名与本地预览的词库互相独立。

## 本地运行

需要 Node.js 20.9+ 和 pnpm。建议 Node.js 22 或 24。

```sh
pnpm install
pnpm dev
```

打开 http://localhost:3000。生产模式：

```sh
pnpm build
pnpm start
```

本项目明确使用 Webpack：当前 Windows 运行环境的 Turbopack PostCSS 子进程无法连接，Webpack 生产构建已通过。依赖版本由 pnpm-lock.yaml 锁定。

## 页面与流程

- `/` Aujourd’hui：到期数、新词数（属于到期数）、快速复习入口、最近添加的三张词卡。
- `/ajouter` Ajouter：预置词库查询、词卡预览和编辑；未知词汇可手动填写。中文释义、其他搭配与词表默认折叠。
- `/reviser` Réviser：每次一张卡、翻面、评价、完成提示。原型调度：Pas encore → 10 分钟；J’ai compris → 首次 1 天，之后翻倍，上限 30 天。时间为经过的时间，不是午夜截止；不使用 FSRS。
- `/mes-mots` Mes mots：搜索词汇和核心搭配、创建词表、筛选、编辑、带二次确认的删除。

首次个人词库为空。添加页提供快捷示例；可查询全部 20 个预置词条。所有预置例句均为 **Exemple pédagogique**，手动词卡为 **Exemple personnel**。未连接 AI 或实时语料，界面明确说明这一点。

## 目录结构

```text
src/
  app/
    layout.tsx             全局布局
    globals.css            响应式 editorial 设计
    page.tsx               Aujourd’hui
    ajouter/page.tsx       Ajouter
    reviser/page.tsx       Réviser
    mes-mots/page.tsx       Mes mots
  components/
    shell.tsx              导航与页脚
    library-provider.tsx   个人数据与持久化操作
    entry-editor.tsx       通用词卡编辑器
  lib/
    types.ts               领域类型与未来扩展接口
    demo.ts                20 条独立预置教学数据
    storage.ts             本地存储版本、解析与校验
    scheduler.ts           可替换调度接口与原型实现
tests/
  core.test.ts             数据、存储、调度单元测试
  e2e/flows.spec.ts        浏览器核心流程与手机布局
playwright.config.ts
pnpm-lock.yaml
```

## 数据与限制

localStorage 键为 `en-contexte:library:v1`。同一快照中，entries、collections、cards、results 分离保存；一次写入避免跨键部分写入。保存成功后才更新界面，解析失败或写入失败明确提示并阻止假成功；损坏数据不会被静默覆盖。重复词汇检查忽略大小写、重音和直／弯引号。

localStorage 仅属于当前浏览器与当前 origin；localhost 与 127.0.0.1 不共享词库。清除网站数据会清除词卡。当前不支持多设备同步、实时多标签页合并、备份导出或账号登录。只读演示词库与个人词库分离；学习记录不会修改演示数据。删除词卡同时删除其复习历史。

## 检查命令

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
# 先启动 pnpm start（或 pnpm dev），再运行：
pnpm test:e2e
```

浏览器测试默认使用已安装的 Microsoft Edge，运行在独立测试上下文中，不修改日常浏览器词库。其他系统可安装 Chromium 后设置 `PLAYWRIGHT_CHANNEL=chromium`。

```sh
pnpm exec playwright install chromium
```

已验证：四页可打开，375px 布局无横向溢出，已保存词库小屏幕布局、创建词表与筛选、预置和手动词卡添加、编辑、搜索、删除、刷新保留、新词翻面、两种评价、记录保存、空词库与复习完成状态，以及无运行时 pageerror。

最终验收结果：lint、typecheck、Webpack 生产 build 全部通过；3 项单元测试和 4 项浏览器测试全部通过（含重复词、损坏存储不覆盖和写入失败不假报成功）。浏览器测试在生产构建上执行。视觉快照位于 `docs/home-desktop.png` 和 `docs/add-mobile.png`。

## 下一阶段

1. 增加词库 JSON 导入／导出和存储迁移，先保证数据可备份。
2. 将 prototypeScheduler 换成经过测试的 FSRS 适配器。
3. 实现 RecommendationProvider 与 CorpusProvider，保存真实来源、链接、获取日期，保持教学例句与引用语料的明确区分。
4. 用 LibraryRepository 接入 Supabase 多用户持久化，再实现 VocabularyImporter 的 Google Sheets 导入。

本阶段未实现登录、Supabase、AI、实时新闻、Google Sheets、浏览器扩展、FSRS、完整 Repérer → Mémoriser → Réemployer 练习体系。
