# Semantica Explorer 前端 i18n 接入开发计划

目标：为 Knowledge Explorer（explorer/ 前端）接入国际化，默认英文（en），界面可一键切换中文（zh）。

## 范围与边界（已拍板）

- **默认语言**：en。界面右上角提供语言切换器，可切 zh；选择持久化到 localStorage。
- **只翻译 UI 文案**：按钮、标签、提示、空态、加载态、导航、错误信息等。
- **数据不翻译**：图谱节点标签、SPARQL 查询结果、ontology 术语（SKOS prefLabel 等）、导入的数据内容一律保持原样，属于数据层，不进 i18n。
- **后端接口文案保持英文**：API 返回体、错误码、文档描述不改；前端对未知后端错误原文展示，已知的在 common.errors.* 做兜底映射。
- **数字/日期本地化**：toLocaleString() 等按当前 locale 渲染，但不改变数据本身。

## 现状盘点

- 技术栈：Vite 6 + React 19 + TypeScript，约 91 个 ts/tsx 文件，其中 24 个含 UI 文案。
- 目前 **无任何 i18n 基础设施**：package.json / lockfile 中无 i18next、react-intl、intl-messageformat，代码中无 locale 引用。
- 文案分布（集中度高）：
  - src/App.tsx（主导航、Landing 指标卡，约 31 条）
  - src/workspaces/OntologyWorkspace/（子 tab 最多，约 70 条）
  - src/ui/primitives.tsx（公共组件，约 20 条）
  - 其余 10 个 workspace + 24 处 placeholder / aria-label
  - 全量估算 **300~500 个 key**
- **测试基线坑**：现有测试直接断言英文文案，i18n 落地时须同步处理：
  - tests/explorerCapabilities.test.tsx：getByRole("button", { name: "Memories" })
  - tests/graphColorLegend.e2e.ts / tests/deterministicExplorerRendering.e2e.ts："Zoom In"、"Node colors"、"Reload graph data" 等
  - index.html 的 <title>Semantica Knowledge Explorer</title>（运行时用 document.title 本地化）

## 技术选型

采用 **i18next + react-i18next**。

- 文案量大且有插值需求（metric 数字、节点数等），i18next 的命名空间、插值、默认文案兜底（key 缺失时回退英文原文）对"英文原文为基准、中文为补充"的双语场景最省事。
- 不选 react-intl：ICU MessageFormat 学习成本更高，且本场景只有两语言、无复数规则需求。

**Key 命名**：按模块分命名空间——common（按钮/空态/加载）、nav、graph、ontology、decisions、enrich、manage、analyze（SPARQL + 推理）、memory。

**文件布局**：

```
explorer/src/i18n/
  index.ts          # i18next 初始化 + 资源装配
  I18nProvider.tsx  # Provider + 语言切换 hook（useT / useChangeLocale）
  LanguageSwitcher.tsx
  locales/
    en.json         # 英文（兜底/基准，可仅存需覆盖的 key）
    zh.json         # 中文翻译
```

默认 language = "en"，切换器状态 + localStorage 持久化；语言变化时更新 document.title 与 <html lang>。

## 任务拆分（每阶段可独立验收）

| 阶段 | 内容 | 验收标准 |
|---|---|---|
| **P0 基建** | 安装 i18next / react-i18next；建 src/i18n/（provider、hook、切换器、持久化）；在 main.tsx 挂载；配置 ESLint 规则禁止新代码直接写字面量文案 | pnpm lint 通过；语言切换器可见，刷新后保持选择 |
| **P1 外壳** | App.tsx 导航 / Landing / 页脚、ExploreWorkspaceTabs、ui/primitives.tsx 公共组件全部走 t() | 切中文后主框架无英文残留（数据类除外） |
| **P2 各 workspace** | 按文案量从大到小逐模块替换：Ontology → Graph → Enrich（Import/Resolve）→ Decisions → Manage → SPARQL/推理 → 其余小模块 | 每模块可单独提 PR，切语言后该模块文案全中文 |
| **P3 边角** | placeholder、aria-label、document.title、toLocaleString 数字/日期本地化；API 错误信息映射策略（common.errors.* 兜底，未知错误原样展示） | 表单可访问性正常；加载/错误态文案中文 |
| **P4 测试与文档** | 测试默认锁定 en（注入 locale），e2e 补一条"切中文后关键文案变化"断言；更新 README 语言切换说明 | 全量 pnpm test:graph-workspace + 两个 e2e 通过 |

**P2 涉及文件**（按文案量排序，供逐模块认领）：

- Ontology：AlignmentsTab、OntologyLoader、ShaclStudio、HealthTab、VersionsTab、SKOSVocabularyManager、OntologySummaryTab、OntologyManager、ProposalReview、OntologyEditor、OntologySearch、index.tsx
- Graph：GraphInspectorPanel、GraphCanvas、TimelinePanel、GraphWorkspace、GraphLoadingOverlay、MarkdownContentViewer、SigmaSceneAdapter、plugins/*
- Enrich：ImportExportWorkspace、DiffMergeWorkspace、RegistryTab、EntityResolutionTab
- Decisions：DecisionWorkspace
- Manage：KGOverviewTab、OntologySummaryTab、LineageDiagram
- Analyze：SparqlWorkspace、ReasoningWorkspace
- 其余：MemoryWorkspace、VocabularyWorkspace/*

## 测试基线处理

- 现有单测 / e2e 直接断言英文文案。统一做法：**测试运行时注入 locale = "en"**（在 test setup 或各用例前 i18n.changeLanguage("en") + await i18n.ready），保证现有断言不改也能过。
- 新增一条 e2e：切换 zh 后关键文案（如 "Zoom In" → 对应中文）出现，验证切换链路。
- index.html 静态 title 保持英文；运行态 title 由 i18n 控制，测试按 en 基准断言。

## 预计节奏

P0+P1 约 0.5~1 天；P2 约 3~4 天（每天 2~3 个模块，每模块独立可验证、可回滚）；P3+P4 约 1 天。总计约一周内可完成，且每阶段结束都是可运行、可回滚状态。

## 风险与注意事项

- **测试文案漂移**：i18n 后所有依赖英文硬编码文案的测试都会失败；必须先落地"测试锁定 en"策略再开始 P1。
- **公共组件文案外溢**：ui/primitives.tsx 是全局复用组件，需在 P1 完成，否则 P2 各模块仍会散落英文。
- **动态拼接文案**：带插值的提示（如"共 N 个节点"）要用 i18next 插值 t('graph.nodeCount', { count: n })，不要字符串拼接，避免中文语序问题。
- **后端错误映射**：仅对已知错误码做中文兜底，未知错误原样展示，避免误翻业务数据。
