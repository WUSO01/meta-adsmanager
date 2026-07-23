# AGENTS.md

## 项目概述

这是一个面向 Meta/Facebook Ads Manager 的 Chrome 扩展（Manifest V3）。它会从广告管理器的虚拟滚动表格中抓取广告系列、广告组和广告数据，保存到 `chrome.storage.local`，再通过侧边栏提供跨日期、跨账户的数据查看、汇总和手工修正能力。启用“同步到页面”后，扩展还会把修正值及相应汇总统计回写到当前 Meta 广告管理器页面的 DOM。

这不是通过 Meta API 拉取数据的项目。数据提取和回写高度依赖 Ads Manager 当前的 DOM 结构、`data-surface` 属性和 URL 参数。

## 技术栈与命令

- Node.js 22（与 `.github/workflows/release.yml` 一致）
- React 19、TypeScript、Vite 8
- CRXJS / Chrome Extension Manifest V3
- Ant Design、Tailwind CSS 4
- Zustand + Immer
- Vitest + jsdom

常用命令：

```bash
npm install
npm run dev
npm run build
npm test
npm run test:watch
```

- `npm run dev`：启动 Vite/CRXJS 开发构建；在 Chrome 的 `chrome://extensions/` 中以“加载已解压的扩展程序”方式加载 `dist/`。
- `npm run build`：先执行 TypeScript 严格检查，再构建 `dist/`，并由插件在 `release/` 生成 ZIP。
- `npm test`：运行 `src/**/*.test.ts(x)`。
- 发布流程由 `v*` tag 触发 GitHub Actions。

不要直接修改或提交 `node_modules/`、`dist/`、`release/`。它们都是依赖或生成物，源代码才是事实来源。

## 目录职责

- `manifest.config.ts`：扩展名称、权限、Popup、Side Panel、Service Worker 和 Content Script 注册。
- `src/popup/`：工具栏弹窗；校验当前 Ads Manager 页面和层级，发起抓取，展示已抓取日期，控制同步开关和数据删除。
- `src/content/index.ts`：页面侧核心逻辑；滚动抓取虚拟列表、读取 URL 日期和账户、接收抓取消息、监听 storage、把编辑值及 footer 统计回写到 Meta 页面。
- `src/utils/extract/extract.ts`：从当前可见的 Meta 表格 DOM 中解析统一 `RowData`。
- `src/background/`：Service Worker 消息入口；保存抓取结果和统计快照，在后台完成编辑合并、筛选和统计。
- `src/sidepanel/`：数据管理主界面；账户筛选、日期范围、三个层级的表格和清理操作。
- `src/components/`：共享表格列、可编辑单元格和 footer 汇总。
- `src/store/`：Zustand 状态、`chrome.storage.local` 水合与跨扩展页面同步。
- `src/hooks/useTableData.ts`：向 Service Worker 请求已合并、筛选和聚合后的表格数据。
- `src/utils/merge.ts`：日期范围判断、缺失日期检查、抓取数据与编辑数据合并、多日指标累加。
- `src/shares/`：跨 Popup、Content Script、Service Worker、Side Panel 共用的类型和 storage key。
- `src/utils/extract/*.test.ts`：以 Meta DOM 快照验证解析逻辑。

## 核心数据流

1. Popup 根据当前 URL 的路径判断层级，并向活动标签页发送 `START_SCRAPING`。
2. Content Script 自动滚动 Meta 虚拟列表，反复提取可见行，以广告 ID 去重并保留首次出现顺序。
3. Content Script 向 Service Worker 发送 `SCRAPING_FINISHED`，携带行数据、日期 key、账户、层级和页面 footer 快照。
4. Service Worker 将数据深度合并到 `chrome.storage.local`。
5. Popup 与 Side Panel 启动时水合 Zustand，并通过 `chrome.storage.onChanged` 保持同步。
6. Side Panel 通过 `COMPUTE_TABLE_DATA` 让 Service Worker 合并 edits、按层级/账户筛选并计算统计，避免阻塞 UI。
7. 用户编辑单元格后，变更写入 `edits`；Content Script 监听到变化后，将编辑值和统计差量回写 Meta 页面。

修改消息结构时，必须同时检查：

- `src/shares/types.ts`
- `src/popup/App.tsx` 或消息发送方
- `src/content/index.ts`
- `src/background/service-worker.ts`
- `src/background/message.ts`

## 数据模型与持久化约定

`RowData` 是三个广告层级共用的数据结构，定义在 `src/shares/types.ts`。金额和指标在解析后应保持为 `number`；`budget` 例外，它可以是 `{ value: number; type: string }`，也可以是“使用广告系列预算”一类纯文本。

主要 storage key：

- `data`：`{ [timeKey]: { [adId]: RowData } }`
- `pageStats`：抓取时的页面 footer 快照，key 为 `time__act__level`
- `edits`：`{ [dateOrAll]: { [adId]: Partial<RowData> } }`
- `acts`：已抓取的账户 ID 列表
- `syncEnabled`：是否把编辑结果同步回 Meta 页面

日期语义：

- `all` 表示未限定到可按日管理的范围，或使用了页面预设日期。
- 单日编辑只写入该日；未选日期范围时写入 `edits.all`。
- 多日范围只允许查看和聚合，不允许直接编辑。
- 多日聚合中，`impressions`、`amount_spent`、`click`、`complete_registration` 和 `results.value` 累加；名称、状态、预算等取较新日期的值；比率/单次费用不累加。
- 日期范围解析同时存在于 Popup 和 Content Script。调整规则时必须检查两处是否仍然一致，并特别验证 Meta URL 的结束日期可能是排他的这一行为。

不要随意重命名 storage key 或改变嵌套结构。若确需变更，必须提供兼容旧数据的迁移或清晰处理旧缓存。

## 开发约定

- 保持 TypeScript strict 模式，不用新增 `any` 来绕过数据模型问题。
- 使用 `@/` 导入 `src/` 内模块；跨上下文共享类型放在 `src/shares/`。
- UI 中继续使用中文文案；代码命名和类型名使用英文。
- 可复用的表格列放在 `src/components/tableColumns.tsx`，三个层级表格只保留差异。
- 编辑字段若存在联动计算，统一维护在 `EditItem.tsx` 的 `relationMap`，并使用 `processNumber` 处理两位小数。
- Service Worker 可能随时休眠，不要依赖仅存在于后台内存中的持久状态。
- Chrome 消息处理包含异步响应时，监听器必须同步返回 `true`；新增消息应补全 `Message` 联合类型。
- storage 写入后要考虑 Popup、Side Panel 和 Content Script 的 `chrome.storage.onChanged` 连锁行为，避免循环更新或重复统计。
- 抓取顺序依赖 `RowData.order`；改动去重或合并逻辑时不要破坏页面顺序。
- 保持现有用户改动和脏工作区内容，不要为了完成局部任务重置无关文件。

## DOM 抓取与页面回写注意事项

这是最脆弱也最需要回归验证的区域：

- 优先使用稳定的语义属性（现有代码主要使用 `data-surface`、`data-pagelet`、`geotextcolor`），避免新增仅由混淆 class 定位的选择器。
- Meta 表格是虚拟列表；不能假设所有行同时存在于 DOM，也不能只抓取首屏。
- 修改选择器时同时验证 campaigns、adsets、ads 三种层级。它们的对象标识分别是 `CAMPAIGN_GROUP`、`CAMPAIGN`、`ADGROUP`，广告名称的 DOM 结构另有特例。
- DOM 中的 `—`、货币符号、千分位、纯文本预算都必须安全解析。
- 页面回写只是改显示值，不会调用 Meta API 或真正修改 Meta 后台数据。文案和实现不得暗示已经提交真实广告变更。
- footer 回写采用“原页面/抓取快照 + 编辑后与抓取前的差量”，不要直接用当前可见行总和覆盖页面完整统计。
- `MutationObserver` 和滚动监听会频繁触发；保持批处理/节流行为，避免在每个 DOM 变更中进行无界计算。

## 验证要求

每次改动至少执行与范围相称的检查：

```bash
npm run build
npm test
```

如果测试在改动前已经失败，先确认基线并在交付说明中区分“既有失败”和“本次引入失败”，不要通过降低断言来掩盖实现问题。当前提取测试是大型 DOM fixture；当 `RowData` 的数值规范发生变化时，应同步更新 fixture 断言。

涉及抓取、URL 日期、storage 同步或 DOM 回写时，还需手工验证：

1. 在 `adsmanager.facebook.com` 打开广告系列、广告组和广告三个标签。
2. 分别抓取 `all`、单日和多日/预设范围，确认虚拟滚动后的数量与顺序。
3. 在 Side Panel 中按账户和日期筛选，确认缺失日期提示及汇总。
4. 编辑名称、预算、花费、成效、注册和点击，确认联动字段计算正确。
5. 开关“同步到页面”，确认行、footer、滚动后新渲染行以及刷新后的行为。
6. 清缓存、撤销编辑和删除单个日期，确认三个扩展上下文同步更新。

仅改 UI 且不触及浏览器 API 时可缩小手工范围，但 `npm run build` 仍是最低要求。
