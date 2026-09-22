import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

// i18n bootstrap: co-exports a context, a hook, and the provider component.
// react-refresh only fast-refreshes component-only files; that is acceptable
// for an i18n bootstrap module (copy edits rarely need HMR).
/* eslint-disable react-refresh/only-export-components */

export const supportedLocales = ['en', 'zh-CN'] as const;
export type Locale = (typeof supportedLocales)[number];

type MessageParams = Record<string, string | number>;
type Messages = Record<string, string>;

// Legacy workspace screens still contain a number of literal UI strings. This
// bridge keeps them localized while they are incrementally migrated to `t()`.
// It deliberately excludes editors and code blocks so user content, SPARQL,
// rules, identifiers, and ontology data are never rewritten.
const legacyChinese: Record<string, string> = {
  "Entity Diff & Merge": "实体比对与合并", "Compare suspected duplicates side-by-side and reconcile them into a single canonical entity.": "并排比较疑似重复项，并将其整合为单一的规范实体。", "Primary Node ID (keep)": "主节点 ID（保留）", "Duplicate Node ID (remove)": "重复节点 ID（移除）", "Sample preview": "示例预览", "Field": "字段", "Primary (keep)": "主节点（保留）", "Duplicate (remove)": "重复项（移除）", "Confirm Merge": "确认合并", "Merging…": "正在合并…", "diff": "差异",
  "Import & Export": "导入与导出", "Ingest new graph datasets or extract the current knowledge base.": "导入新的图谱数据集，或导出当前知识库。", "Import Entities & Relations": "导入实体与关系", "Drag & drop or click to browse": "拖放文件或点击浏览", "Uploading…": "正在上传…", "Upload to Graph": "上传到图谱", "Export Graph Snapshot": "导出图谱快照", "Format": "格式", "What's included": "包含内容", "Preparing…": "正在准备…", "Download Export": "下载导出文件",
  "Decisions": "决策", "Decision Record": "决策记录", "Causal Chain": "因果链", "No chain steps": "没有链步骤", "No causal chain steps were found for this decision.": "未找到该决策的因果链步骤。", "No decision selected": "未选择决策", "Select a decision from the list to inspect its causal chain and metadata.": "从列表选择一项决策以检查其因果链和元数据。", "Filter by ID, category, outcome…": "按 ID、类别或结果筛选…",
  "Entity Resolution": "实体消歧", "Detect and merge duplicate entities in the knowledge graph": "检测并合并知识图谱中的重复实体", "Similarity Threshold": "相似度阈值", "More results (0.50)": "更多结果（0.50）", "Fewer, higher confidence (0.99)": "更少但置信度更高（0.99）", "Clear all": "清除全部", "Merge": "合并", "Dismiss": "关闭",
  "Document Registry": "文档注册表", "Clear all events": "清除所有事件", "Clear": "清除", "AgentMemory": "智能体记忆", "No AgentMemory items are available.": "没有可用的智能体记忆项目。", "Loading memories…": "正在加载记忆…", "Selected memory": "已选记忆",
  "Templates:": "模板：", "Copy query": "复制查询", "Run Query": "运行查询", "Running…": "正在运行…", "No results": "没有结果", "The query returned 0 rows. Try a broader query or check your data.": "查询返回 0 行。请尝试更宽泛的查询或检查数据。", "Run a query": "运行查询", "Write SPARQL above or pick a template, then click Run Query to see results here.": "在上方编写 SPARQL 或选择模板，然后点击“运行查询”以在此查看结果。",
  "KG Overview": "知识图谱概览", "Node/edge counts, type distributions, and top connected nodes": "节点/边数量、类型分布和连接度最高的节点", "Node Type Breakdown": "节点类型分布", "No data — load the graph first.": "暂无数据——请先加载图谱。", "Edge Type Breakdown": "边类型分布", "Edge type breakdown requires the stats endpoint to return edge_types.": "边类型分布要求统计接口返回 edge_types。", "Top Connected Nodes (by degree)": "连接度最高的节点（按度数）",
  "Ontology Summary": "本体摘要", "Open Full Browser": "打开完整浏览器", "Loading concepts…": "正在加载概念…", "No vocabulary schemes loaded": "尚未加载词汇表方案", "Description": "描述", "Alternative Labels": "替代标签", "PROV-O Lineage": "PROV-O 谱系", "PROV-O Lineage Viewer": "PROV-O 谱系查看器", "Enter a Node ID in the toolbar above and click Trace to view its W3C PROV-O lineage diagram.": "在上方工具栏中输入节点 ID，然后点击“追踪”查看其 W3C PROV-O 谱系图。", "Enter Node ID…": "输入节点 ID…",
  "Content": "内容", "Properties": "属性", "Source Attribution": "来源归属", "Candidate Links": "候选连接", "Run Link Prediction": "运行链接预测", "Target node ID": "目标节点 ID", "Close": "关闭", "Relationship": "关系",
  "Versions & Change Proposals": "版本与变更提案", "No versions found": "未找到版本", "No proposals found": "未找到提案", "Proposal Details": "提案详情", "Compare Versions": "比较版本",
  "SHACL Studio": "SHACL 工作室", "Generate, edit, and validate shapes": "生成、编辑和验证形状", "Ontology": "本体", "Shape library": "形状库", "View all": "查看全部", "No shapes generated yet.": "尚未生成形状。", "Generate strict": "生成严格形状", "Validation report": "验证报告", "No validation violations returned.": "未返回验证违规项。", "Generate or edit SHACL Turtle, then run validation.": "生成或编辑 SHACL Turtle，然后运行验证。",
  "Ontology Health": "本体健康度", "Quality and governance signals": "质量和治理信号", "Computing health dashboard...": "正在计算健康度仪表盘...", "Total health score": "总健康评分", "Export report": "导出报告", "Actionable issues": "可处理问题", "No actionable issues reported for this ontology.": "此本体未报告可处理问题。", "Select an ontology to compute health signals.": "选择本体以计算健康度信号。",
  "Concept Detail": "概念详情", "Loading proposal...": "正在加载提案...", "No changes detected": "未检测到变更", "No comments yet": "暂无评论", "Ontology loaded successfully": "本体加载成功", "Drop a file here or": "将文件拖放到此处或", "browse": "浏览", "Ontology created and opened in the Registry": "本体已创建并在注册表中打开", "Load Ontology": "加载本体", "URL Import": "URL 导入", "File Upload": "文件上传", "Create New": "新建", "Select ontology...": "选择本体...", "Loading ontology structure…": "正在加载本体结构…", "This ontology has no editable classes or properties.": "此本体没有可编辑的类或属性。", "Disabled": "已禁用", "Loading registry…": "正在加载注册表…", "Entity Search": "实体搜索",
  "Alignment Matrix": "对齐矩阵", "Cross-ontology mappings": "跨本体映射", "Pairwise alignment matrix": "成对对齐矩阵", "Click a relation badge to load it into the editor below.": "点击关系徽章以将其加载到下方编辑器。", "Create or update alignment": "创建或更新对齐", "Source entity URI": "源实体 URI", "Target entity URI": "目标实体 URI", "Relation": "关系", "Provenance note": "溯源说明", "Source": "来源", "Reviewer": "审核人", "Suggest alignments": "建议对齐", "Source ontology": "源本体", "Target ontology": "目标本体", "Any ontology": "任意本体", "Run suggestions to review ranked candidate mappings.": "运行建议以审查排序后的候选映射。", "Recorded alignments": "已记录对齐", "No alignments recorded yet.": "尚未记录对齐。",
  "Loading schemes…": "正在加载方案…", "No concept selected": "未选择概念", "Click a concept in the tree to view its properties.": "在树中点击概念以查看其属性。", "Import Successful!": "导入成功！", "Search classes, properties, concepts…": "搜索类、属性和概念…", "Search labels and definitions…": "搜索标签和定义…",
  "Current scrubber state": "当前时间滑块状态", "Current": "当前", "Bounds": "边界", "Active nodes": "活跃节点", "Exploration effects": "探索效果", "Path and focus": "路径与聚焦", "Semantic legend": "语义图例", "Semantic groups": "语义分组", "Legend will populate when the graph metadata is available.": "图谱元数据可用后将显示图例。", "Legend data will populate when graph metadata is available.": "图谱元数据可用后将显示图例数据。", "Regions and intelligence summaries will populate when graph analytics are ready.": "图谱分析准备就绪后将显示区域和智能摘要。", "Semantic regions": "语义区域", "Community anchors": "社区锚点", "Centrality leaders": "中心性领先节点", "Directed pathfinding": "有向路径查找", "Fallback semantic legend": "备用语义图例", "Scene effects": "场景效果", "Graph intelligence": "图谱智能", "Regions and signals": "区域与信号", "Diagnostics": "诊断", "Runtime snapshot": "运行时快照", "Select a node to inspect its local neighborhood.": "选择节点以检查其局部邻域。", "No direct neighbors are available for this node.": "此节点没有可用的直接邻居。",
  "Content view mode": "内容视图模式", "Copy raw content": "复制原始内容", "Copied": "已复制", "Copy": "复制", "Markdown source": "Markdown 源码", "No content available for this node.": "此节点没有可用内容。", "Confidence Decay": "置信度衰减", "Semantic Sim.": "语义相似度", "Path Coherence": "路径连贯性", "Bottleneck": "瓶颈", "No path found between the selected nodes.": "在所选节点之间未找到路径。", "Total weight:": "总权重：", "Selection": "选择", "Selected item is not directly inspectable in the current graph.": "当前图谱中无法直接检查所选项目。", "This grouped item stays display-level until you explicitly enter Focused mode.": "此分组项目会保持在展示层级，直到你明确进入聚焦模式。", "Actions": "操作", "Optional candidate type filter, e.g. disease": "可选的候选类型筛选，例如 disease", "Trace Path": "追踪路径", "Trace Causal Path": "追踪因果路径", "Computing candidate links…": "正在计算候选连接…", "Run link prediction to surface likely next-hop relationships.": "运行链接预测以发现可能的下一跳关系。", "No explicit attribution metadata was found on this node.": "此节点未找到显式归属元数据。", "No additional properties are attached to this node.": "此节点未附加其他属性。",
  "Graph view mode": "图谱视图模式", "Ego depth:": "自我网络深度：", "Distance Intelligence": "距离智能", "Anchor:": "锚点：", "Dismiss search results": "关闭搜索结果", "Add a comment...": "添加评论…", "Ontology URI": "本体 URI", "Leave blank to use ontology title": "留空以使用本体标题", "Optional description": "可选描述", "My Ontology": "我的本体", "Auto-detect": "自动检测", "Re-fetch from source URL": "从源 URL 重新获取", "Remove from registry": "从注册表移除", "Search ontologies by name, URI, or namespace…": "按名称、URI 或命名空间搜索本体…", "Active ontology": "当前本体", "Click to load this shape into the editor": "点击将此形状加载到编辑器", "Remove alignment": "移除对齐", "Refresh memories": "刷新记忆", "Load more memories": "加载更多记忆", "Agent memories": "智能体记忆",
};
const legacyEnglish = Object.fromEntries(Object.entries(legacyChinese).map(([english, chinese]) => [chinese, english]));

const messages: Record<Locale, Messages> = {
  en: {
    'language.label': 'Language',
    'language.en': 'English',
    'language.zh-CN': '简体中文',
    'app.loading': 'Loading workspace…',
    'app.discardDraft': 'Discard the unapplied Markdown draft and leave this resource?',
    'nav.explore.label': 'Knowledge Explorer',
    'nav.explore.hint': 'Graph and vocabulary browsing',
    'nav.analyze.label': 'Analyze',
    'nav.analyze.hint': 'Query and inspect the dataset',
    'nav.decisions.label': 'Decisions',
    'nav.decisions.hint': 'Decision chains and precedent review',
    'nav.enrich.label': 'Enrich',
    'nav.enrich.hint': 'Import, export, and merge workflows',
    'nav.manage.label': 'Manage',
    'nav.manage.hint': 'Lineage and governance tooling',
    'nav.ontology.label': 'Ontology Hub',
    'nav.ontology.hint': 'Schema governance, registry, and vocabulary management',
    'tabs.explorer': 'Semantica Explorer',
    'tabs.memories': 'Memories',
    'tabs.vocabulary': 'Vocabulary Browser',
    'status.checking': 'Connecting…',
    'status.online': 'System Online',
    'status.offline': 'Backend Unreachable',
    'welcome.version': 'Semantica v2 · Semantic Intelligence',
    'welcome.category': 'Knowledge Explorer',
    'welcome.title': 'Navigate knowledge like a living system.',
    'welcome.description': 'Semantica turns dense knowledge graphs into a navigable command center — discovery, reasoning, provenance, distance intelligence, and decision context, all in one interface.',
    'welcome.openExplorer': 'Open Semantica Explorer',
    'welcome.runReasoning': 'Run Reasoning',
    'welcome.search': 'Search command, node, or concept',
    'welcome.searchMeta': 'distance heatmap · focused view · causal path',
    'welcome.entityDossier': 'Entity Dossier',
    'welcome.distanceBand': 'Distance band',
    'welcome.near': 'Near',
    'welcome.pathCoherence': 'Path coherence',
    'welcome.provenance': 'Provenance',
    'welcome.audited': 'Audited',
    'welcome.temporalEvidence': 'Temporal Evidence',
    'welcome.coverage': '{value}% coverage',
    'welcome.nodes': 'Knowledge nodes',
    'welcome.relationships': 'Relationships mapped',
    'welcome.modes': 'Graph modes',
    'welcome.datasetOnline': 'Dataset online',
    'welcome.readyToExplore': 'Ready to explore',
    'welcome.live': 'Live',
    'welcome.ready': 'Ready',
    'welcome.active': 'Active',
    'welcome.standby': 'Standby',
    'welcome.workspaces': 'Workspaces',
    'welcome.primaryWorkspace': 'Primary Workspace',
    'welcome.primaryDescription': 'Full graph, grouped communities, focused neighborhoods, and distance intelligence — all in one canvas.',
    'welcome.vocabulary.description': 'Schemes and terms',
    'welcome.analyze.description': 'Inference and queries',
    'welcome.decisions.description': 'Chains and precedents',
    'welcome.enrich.description': 'Import and resolve',
    'welcome.manage.description': 'Lineage and ontology',
    'welcome.intelligenceLayer': 'Intelligence Layer',
    'welcome.distanceHeatmap': 'Distance Heatmap',
    'welcome.focusedNeighborhood': 'Focused Neighborhood',
    'welcome.groupedCommunities': 'Grouped Communities',
    'welcome.traceCausalPath': 'Trace Causal Path',
    'welcome.provenanceDossier': 'Provenance Dossier',
    'workspace.explore.title': 'Explore',
    'workspace.explore.graphKicker': 'Graph Studio',
    'workspace.explore.memoryKicker': 'Memory Browser',
    'workspace.explore.vocabularyKicker': 'Vocabulary Browser',
    'workspace.explore.memorySubtitle': 'Browse and edit canonical AgentMemory documents.',
    'workspace.explore.vocabularySubtitle': 'Browse the graph and switch views without leaving the workspace.',
    'workspace.analyze.title': 'Analyze',
    'workspace.analyze.subtitle': 'Query the active graph and test inference rules.',
    'workspace.reasoningKicker': 'Reasoning Engine',
    'workspace.sparqlKicker': 'SPARQL Query',
    'workspace.reasoningTab': 'Reasoning Playground',
    'workspace.sparqlTab': 'SPARQL Querying',
    'workspace.decisions.subtitle': 'Inspect decision chains, causal context, and precedent matches.',
    'workspace.decisionKicker': 'Decision Intelligence',
    'workspace.enrich.title': 'Enrich',
    'workspace.enrich.subtitle': 'Import, export, reconcile, and audit graph entities.',
    'workspace.auditKicker': 'Knowledge Audit',
    'workspace.importExportTab': 'Import and Export',
    'workspace.diffMergeTab': 'Diff and Merge',
    'workspace.resolveTab': 'Entity Resolution',
    'workspace.registryTab': 'Registry',
    'workspace.ontology.subtitle': 'Load, browse, edit, and govern ontologies and vocabularies.',
    'workspace.schemaKicker': 'Schema Governance',
    'workspace.manage.title': 'Manage',
    'workspace.manage.subtitle': 'Review provenance, lineage, ontology, and governance context.',
    'workspace.governanceKicker': 'Graph Governance',
    'workspace.kgOverviewTab': 'KG Overview',
    'workspace.lineageTab': 'PROV-O Lineage',
    'workspace.ontologySummaryTab': 'Ontology Summary',
    'error.title': 'Something went wrong in this view.',
    'error.retryExhausted': 'This view continues to encounter a critical error. Please switch to another workspace or reload the page to restore functionality.',
    'error.unexpected': 'An unexpected problem occurred while rendering this workspace. Your data is safe, but this view cannot be displayed.',
    'error.tryAgain': 'Try Again',
    'error.reload': 'Reload Application',
    'graph.searchPlaceholder': 'Search command, node, or concept', 'graph.searchNodes': 'Search graph nodes', 'graph.search': 'Search', 'graph.searchSuggestions': 'Search suggestions',
    'graph.nodeColors': 'Node colors', 'graph.nodeColorsHelp': 'Base semantic colors; selection, zoom, and distance effects can change node appearance.', 'graph.nodeCount': '{count} nodes',
    'graph.fullGraph': 'Full Graph', 'graph.fullGraphHelp': 'Return to the full graph context', 'graph.groupedView': 'Grouped View', 'graph.groupedViewHelp': 'Compress dense structure into detected communities', 'graph.focus': 'Focus', 'graph.focusHelp': 'Inspect the selected node in a focused local graph',
    'graph.camera': 'Camera', 'graph.zoomIn': 'Zoom in', 'graph.zoomInHelp': 'Zoom in (or scroll up on the canvas)', 'graph.zoomOut': 'Zoom out', 'graph.zoomOutHelp': 'Zoom out (or scroll down on the canvas)', 'graph.fit': 'Fit', 'graph.fitHelp': 'Reset the camera to fit the whole graph',
    'graph.layout': 'Layout', 'graph.pause': 'Pause', 'graph.run': 'Run', 'graph.layoutHelp': 'Toggle the layout worker', 'graph.local': 'Local', 'graph.collapse': 'Collapse', 'graph.collapseHelp': 'Hide lower-priority fanout around the selected node', 'graph.expand': 'Expand', 'graph.expandHelp': 'Restore the collapsed local neighborhood',
    'graph.analysis': 'Analysis', 'graph.effects': 'Effects', 'graph.effectsHelp': 'Open exploration effects controls', 'graph.neighbors': 'Neighbors', 'graph.neighborsHelp': 'Toggle neighborhood panel', 'graph.temporal': 'Temporal', 'graph.temporalHelp': 'Toggle temporal context panel', 'graph.utility': 'Utility', 'graph.reload': 'Reload', 'graph.reloadHelp': 'Reload the graph data',
    'graph.active': '{count} active', 'graph.relationships': '{count} relationships', 'graph.stabilizing': 'Stabilizing layout', 'graph.timeline': 'Temporal Scrubber', 'graph.playEvolution': 'Play Evolution', 'graph.pauseEvolution': 'Pause Evolution', 'graph.loadingTimeline': 'Loading timeline…', 'graph.loadingInspector': 'Loading inspector…',
    'reasoning.forwardChaining': 'Forward Chaining', 'reasoning.engine': 'Inference Engine', 'reasoning.quickTemplates': 'Quick Templates', 'reasoning.drugCandidate': 'Drug Candidate', 'reasoning.geneDisease': 'Gene → Disease', 'reasoning.pathwayActivation': 'Pathway Activation', 'reasoning.facts': 'Facts', 'reasoning.factsHelp': 'One fact per line using {syntax} form.', 'reasoning.rules': 'Rules', 'reasoning.rulesHelp': 'Use {syntax} syntax. Falls back to internal matcher if the reasoning server is unavailable.', 'reasoning.writeToGraph': 'Write inferred facts to graph', 'reasoning.writeToGraphHelp': 'Inferred binary facts are added as edges', 'reasoning.running': 'Running…', 'reasoning.run': 'Run Reasoning', 'reasoning.reset': 'Reset to defaults', 'reasoning.results': 'Inference Results', 'reasoning.rulesFired': '{count} rules fired', 'reasoning.edgesAdded': '{count} edges added', 'reasoning.graphUpdated': 'graph updated', 'reasoning.previewOnly': 'preview only', 'reasoning.complete': 'Reasoning complete', 'reasoning.noFacts': 'No new facts were inferred from the current rule set and facts.', 'reasoning.ready': 'Ready to reason', 'reasoning.readyHelp': 'Enter facts and rules on the left, then click Run Reasoning to see inferred statements here.', 'reasoning.failed': 'Reasoning failed', 'reasoning.partialSuccess': 'Warning: Partial success reasoning.',
    'ontology.tab.registry': 'Registry', 'ontology.tab.editor': 'Editor', 'ontology.tab.versions': 'Versions', 'ontology.tab.alignments': 'Alignments', 'ontology.tab.health': 'Health', 'ontology.tab.shacl': 'SHACL',
    'health.kicker': 'Ontology Health', 'health.title': 'Quality and governance signals', 'health.description': 'Score completeness, consistency, SHACL readiness, alignment coverage, and documentation quality for the selected ontology.', 'health.ontology': 'Ontology', 'health.computing': 'Computing health dashboard...', 'health.total': 'Total health score', 'health.export': 'Export report', 'health.issues': 'Actionable issues', 'health.noIssues': 'No actionable issues reported for this ontology.', 'health.select': 'Select an ontology to compute health signals.', 'health.fix': 'Fix in Editor', 'health.failedRegistry': 'Failed to load ontology registry.', 'health.completeness': 'Completeness', 'health.consistency': 'Consistency', 'health.conformance': 'SHACL Conformance', 'health.coverage': 'Alignment Coverage', 'health.documentation': 'Documentation', 'health.ok': 'OK', 'health.warning': 'Warning', 'health.unavailable': 'Unavailable',
    'loader.fromScratch': 'From Scratch', 'loader.fromData': 'From Data', 'loader.fromText': 'From Text', 'loader.displayName': 'Display Name *', 'loader.namespace': 'Namespace URI *', 'loader.description': 'Description', 'loader.tags': 'Tags (comma-separated)', 'loader.sampleData': 'Sample Data (JSON or CSV)', 'loader.schemaRequirements': 'Schema Requirements (natural language)', 'loader.create': 'Create Ontology', 'loader.creating': 'Creating…', 'loader.urlImport': 'URL Import', 'loader.fileUpload': 'File Upload', 'loader.createNew': 'Create New', 'loader.subtitle': 'Import from URL, upload a file, or create a new ontology', 'loader.optionalDescription': 'Optional description', 'loader.tagsExample': 'e.g. internal, draft', 'loader.schemaPlaceholder': 'Describe the ontology you need. E.g.: I need an ontology for a hospital domain with patients, doctors, appointments, and medications.',
    'vocab.title': 'Ontology & Vocabulary', 'vocab.noneLoaded': 'No vocabularies loaded', 'vocab.loadingSchemes': 'Loading schemes…', 'vocab.noneFound': 'No schemes found. Import a .ttl or .rdf file below.', 'vocab.loadingHierarchy': 'Loading hierarchy…', 'vocab.noneConcepts': 'No concepts found in this scheme.', 'vocab.selectScheme': 'Select a scheme to browse concepts.', 'vocab.noConcept': 'No concept selected', 'vocab.noConceptHelp': 'Click a concept in the tree to view its properties.', 'vocab.skosConcept': 'SKOS Concept', 'vocab.altLabels': 'Alternative Labels', 'vocab.narrower': 'Narrower Concepts', 'vocab.leaf': 'Leaf concept — no narrower concepts.', 'vocab.import': 'Import Vocabulary', 'vocab.drop': 'Drop here…', 'vocab.uploading': 'Uploading {file}…', 'vocab.success': 'Import Successful!', 'vocab.uploadFailed': 'Upload failed. Check console.',
  },
  'zh-CN': {
    'language.label': '语言', 'language.en': 'English', 'language.zh-CN': '简体中文',
    'app.loading': '正在加载工作区…', 'app.discardDraft': '要丢弃尚未应用的 Markdown 草稿并离开此资源吗？',
    'nav.explore.label': '知识探索器', 'nav.explore.hint': '浏览图谱和词汇表',
    'nav.analyze.label': '分析', 'nav.analyze.hint': '查询并检查数据集',
    'nav.decisions.label': '决策', 'nav.decisions.hint': '决策链和先例审查',
    'nav.enrich.label': '增强', 'nav.enrich.hint': '导入、导出和合并工作流',
    'nav.manage.label': '管理', 'nav.manage.hint': '溯源和治理工具',
    'nav.ontology.label': '本体中心', 'nav.ontology.hint': '模式治理、注册表和词汇表管理',
    'tabs.explorer': 'Semantica 探索器', 'tabs.memories': '记忆', 'tabs.vocabulary': '词汇表浏览器',
    'status.checking': '正在连接…', 'status.online': '系统在线', 'status.offline': '后端不可用',
    'welcome.version': 'Semantica v2 · 语义智能', 'welcome.category': '知识探索器',
    'welcome.title': '像探索生命系统一样探索知识。',
    'welcome.description': 'Semantica 将密集的知识图谱转化为可导航的指挥中心——发现、推理、溯源、距离智能和决策上下文，尽在一个界面中。',
    'welcome.openExplorer': '打开 Semantica 探索器', 'welcome.runReasoning': '运行推理',
    'welcome.search': '搜索命令、节点或概念', 'welcome.searchMeta': '距离热图 · 聚焦视图 · 因果路径',
    'welcome.entityDossier': '实体档案', 'welcome.distanceBand': '距离区间', 'welcome.near': '近', 'welcome.pathCoherence': '路径连贯性', 'welcome.provenance': '溯源', 'welcome.audited': '已审计',
    'welcome.temporalEvidence': '时序证据', 'welcome.coverage': '覆盖率 {value}%',
    'welcome.nodes': '知识节点', 'welcome.relationships': '已映射关系', 'welcome.modes': '图谱模式', 'welcome.datasetOnline': '数据集在线', 'welcome.readyToExplore': '准备探索', 'welcome.live': '实时', 'welcome.ready': '就绪', 'welcome.active': '活跃', 'welcome.standby': '待命',
    'welcome.workspaces': '工作区', 'welcome.primaryWorkspace': '主工作区',
    'welcome.primaryDescription': '完整图谱、分组社区、聚焦邻域和距离智能——全部汇聚于一个画布。',
    'welcome.vocabulary.description': '概念体系与术语', 'welcome.analyze.description': '推理与查询', 'welcome.decisions.description': '决策链与先例', 'welcome.enrich.description': '导入与消歧', 'welcome.manage.description': '溯源与本体',
    'welcome.intelligenceLayer': '智能层', 'welcome.distanceHeatmap': '距离热图', 'welcome.focusedNeighborhood': '聚焦邻域', 'welcome.groupedCommunities': '分组社区', 'welcome.traceCausalPath': '追踪因果路径', 'welcome.provenanceDossier': '溯源档案',
    'workspace.explore.title': '探索', 'workspace.explore.graphKicker': '图谱工作室', 'workspace.explore.memoryKicker': '记忆浏览器', 'workspace.explore.vocabularyKicker': '词汇表浏览器', 'workspace.explore.memorySubtitle': '浏览和编辑规范的 AgentMemory 文档。', 'workspace.explore.vocabularySubtitle': '无需离开工作区即可浏览图谱和切换视图。',
    'workspace.analyze.title': '分析', 'workspace.analyze.subtitle': '查询当前图谱并测试推理规则。', 'workspace.reasoningKicker': '推理引擎', 'workspace.sparqlKicker': 'SPARQL 查询', 'workspace.reasoningTab': '推理演练场', 'workspace.sparqlTab': 'SPARQL 查询',
    'workspace.decisions.subtitle': '检查决策链、因果上下文和先例匹配。', 'workspace.decisionKicker': '决策智能',
    'workspace.enrich.title': '增强', 'workspace.enrich.subtitle': '导入、导出、协调并审计图谱实体。', 'workspace.auditKicker': '知识审计', 'workspace.importExportTab': '导入和导出', 'workspace.diffMergeTab': '差异与合并', 'workspace.resolveTab': '实体消歧', 'workspace.registryTab': '注册表',
    'workspace.ontology.subtitle': '加载、浏览、编辑和治理本体及词汇表。', 'workspace.schemaKicker': '模式治理',
    'workspace.manage.title': '管理', 'workspace.manage.subtitle': '审查溯源、谱系、本体和治理上下文。', 'workspace.governanceKicker': '图谱治理', 'workspace.kgOverviewTab': '知识图谱概览', 'workspace.lineageTab': 'PROV-O 谱系', 'workspace.ontologySummaryTab': '本体摘要',
    'error.title': '此视图出现问题。', 'error.retryExhausted': '此视图持续发生严重错误。请切换到其他工作区或重新加载页面以恢复功能。', 'error.unexpected': '渲染此工作区时发生意外问题。您的数据安全无虞，但当前视图无法显示。', 'error.tryAgain': '重试', 'error.reload': '重新加载应用',
    'graph.searchPlaceholder': '搜索命令、节点或概念', 'graph.searchNodes': '搜索图谱节点', 'graph.search': '搜索', 'graph.searchSuggestions': '搜索建议',
    'graph.nodeColors': '节点颜色', 'graph.nodeColorsHelp': '语义基础颜色；选择、缩放和距离效果可能改变节点外观。', 'graph.nodeCount': '{count} 个节点',
    'graph.fullGraph': '完整图谱', 'graph.fullGraphHelp': '返回完整图谱上下文', 'graph.groupedView': '分组视图', 'graph.groupedViewHelp': '将密集结构压缩为已检测到的社区', 'graph.focus': '聚焦', 'graph.focusHelp': '在局部图谱中检查选中的节点',
    'graph.camera': '镜头', 'graph.zoomIn': '放大', 'graph.zoomInHelp': '放大（或在画布上向上滚动）', 'graph.zoomOut': '缩小', 'graph.zoomOutHelp': '缩小（或在画布上向下滚动）', 'graph.fit': '适应', 'graph.fitHelp': '重置镜头以适应整个图谱',
    'graph.layout': '布局', 'graph.pause': '暂停', 'graph.run': '运行', 'graph.layoutHelp': '切换布局工作器', 'graph.local': '局部', 'graph.collapse': '折叠', 'graph.collapseHelp': '隐藏所选节点周围优先级较低的分支', 'graph.expand': '展开', 'graph.expandHelp': '恢复已折叠的局部邻域',
    'graph.analysis': '分析', 'graph.effects': '效果', 'graph.effectsHelp': '打开探索效果控制项', 'graph.neighbors': '邻居', 'graph.neighborsHelp': '切换邻域面板', 'graph.temporal': '时序', 'graph.temporalHelp': '切换时序上下文面板', 'graph.utility': '工具', 'graph.reload': '重新加载', 'graph.reloadHelp': '重新加载图谱数据',
    'graph.active': '{count} 个活跃', 'graph.relationships': '{count} 条关系', 'graph.stabilizing': '正在稳定布局', 'graph.timeline': '时序滑块', 'graph.playEvolution': '播放演化', 'graph.pauseEvolution': '暂停演化', 'graph.loadingTimeline': '正在加载时间轴…', 'graph.loadingInspector': '正在加载检查器…',
    'reasoning.forwardChaining': '前向链推理', 'reasoning.engine': '推理引擎', 'reasoning.quickTemplates': '快速模板', 'reasoning.drugCandidate': '药物候选', 'reasoning.geneDisease': '基因 → 疾病', 'reasoning.pathwayActivation': '通路激活', 'reasoning.facts': '事实', 'reasoning.factsHelp': '每行一个事实，采用 {syntax} 形式。', 'reasoning.rules': '规则', 'reasoning.rulesHelp': '使用 {syntax} 语法。推理服务不可用时，将回退到内部匹配器。', 'reasoning.writeToGraph': '将推导事实写入图谱', 'reasoning.writeToGraphHelp': '推导出的二元事实会作为边加入图谱', 'reasoning.running': '正在推理…', 'reasoning.run': '运行推理', 'reasoning.reset': '恢复默认值', 'reasoning.results': '推理结果', 'reasoning.rulesFired': '已触发 {count} 条规则', 'reasoning.edgesAdded': '已新增 {count} 条边', 'reasoning.graphUpdated': '图谱已更新', 'reasoning.previewOnly': '仅预览', 'reasoning.complete': '推理完成', 'reasoning.noFacts': '根据当前规则和事实，未推导出新的事实。', 'reasoning.ready': '准备推理', 'reasoning.readyHelp': '在左侧输入事实和规则，然后点击“运行推理”以在此查看推导出的陈述。', 'reasoning.failed': '推理失败', 'reasoning.partialSuccess': '警告：推理部分成功。',
    'ontology.tab.registry': '注册表', 'ontology.tab.editor': '编辑器', 'ontology.tab.versions': '版本', 'ontology.tab.alignments': '对齐', 'ontology.tab.health': '健康度', 'ontology.tab.shacl': 'SHACL',
    'health.kicker': '本体健康度', 'health.title': '质量和治理信号', 'health.description': '评估所选本体的完整性、一致性、SHACL 就绪度、对齐覆盖度和文档质量。', 'health.ontology': '本体', 'health.computing': '正在计算健康度仪表盘...', 'health.total': '总健康评分', 'health.export': '导出报告', 'health.issues': '可处理问题', 'health.noIssues': '此本体未报告可处理问题。', 'health.select': '选择本体以计算健康度信号。', 'health.fix': '在编辑器中修复', 'health.failedRegistry': '加载本体注册表失败。', 'health.completeness': '完整性', 'health.consistency': '一致性', 'health.conformance': 'SHACL 一致性', 'health.coverage': '对齐覆盖度', 'health.documentation': '文档质量', 'health.ok': '正常', 'health.warning': '警告', 'health.unavailable': '不可用',
    'loader.fromScratch': '从零开始', 'loader.fromData': '从数据创建', 'loader.fromText': '从文本创建', 'loader.displayName': '显示名称 *', 'loader.namespace': '命名空间 URI *', 'loader.description': '描述', 'loader.tags': '标签（以逗号分隔）', 'loader.sampleData': '示例数据（JSON 或 CSV）', 'loader.schemaRequirements': '模式要求（自然语言）', 'loader.create': '创建本体', 'loader.creating': '正在创建…', 'loader.urlImport': 'URL 导入', 'loader.fileUpload': '文件上传', 'loader.createNew': '新建', 'loader.subtitle': '从 URL 导入、上传文件或创建新本体', 'loader.optionalDescription': '可选描述', 'loader.tagsExample': '例如 internal, draft', 'loader.schemaPlaceholder': '描述你需要的本体。例如：我需要一个医院领域本体，其中包含患者、医生、预约和药物。',
    'vocab.title': '本体与词汇表', 'vocab.noneLoaded': '未加载词汇表', 'vocab.loadingSchemes': '正在加载方案…', 'vocab.noneFound': '未找到方案。请在下方导入 .ttl 或 .rdf 文件。', 'vocab.loadingHierarchy': '正在加载层级…', 'vocab.noneConcepts': '此方案中未找到概念。', 'vocab.selectScheme': '选择一个方案以浏览概念。', 'vocab.noConcept': '未选择概念', 'vocab.noConceptHelp': '在树中点击概念以查看其属性。', 'vocab.skosConcept': 'SKOS 概念', 'vocab.altLabels': '替代标签', 'vocab.narrower': '下位概念', 'vocab.leaf': '叶概念——没有下位概念。', 'vocab.import': '导入词汇表', 'vocab.drop': '拖放到此处…', 'vocab.uploading': '正在上传 {file}…', 'vocab.success': '导入成功！', 'vocab.uploadFailed': '上传失败。请检查控制台。',
  },
};

function resolveInitialLocale(): Locale {
  // Default is always 'en' (project decision): only an explicit in-app switch
  // (persisted to localStorage) moves a user to zh-CN. Browser language is
  // deliberately NOT used to auto-select the locale.
  const stored = window.localStorage.getItem('semantica.locale');
  return stored === 'zh-CN' ? 'zh-CN' : 'en';
}

function interpolate(message: string, params?: MessageParams): string {
  return message.replace(/\{(\w+)\}/g, (_, name: string) => String(params?.[name] ?? `{${name}}`));
}

type I18nContextValue = { locale: Locale; setLocale: (locale: Locale) => void; t: (key: string, params?: MessageParams) => string };
const translate = (locale: Locale, key: string, params?: MessageParams) => interpolate(messages[locale][key] ?? messages.en[key] ?? key, params);
export const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  setLocale: () => undefined,
  t: (key, params) => translate('en', key, params),
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(resolveInitialLocale);
  useEffect(() => {
    window.localStorage.setItem('semantica.locale', locale);
    document.documentElement.lang = locale;
  }, [locale]);
  const value = useMemo(() => ({ locale, setLocale, t: (key: string, params?: MessageParams) => translate(locale, key, params) }), [locale]);
  return <I18nContext.Provider value={value}><LegacyTextLocalizer locale={locale} />{children}</I18nContext.Provider>;
}

function LegacyTextLocalizer({ locale }: { locale: Locale }) {
  useEffect(() => {
    const excludedTags = new Set(["CODE", "PRE", "TEXTAREA", "SCRIPT", "STYLE", "OPTION"]);
    const localizeNode = (root: Node) => {
      const dictionary = locale === "zh-CN" ? legacyChinese : legacyEnglish;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const textNodes: Text[] = [];
      while (walker.nextNode()) textNodes.push(walker.currentNode as Text);
      textNodes.forEach((node) => {
        const parent = node.parentElement;
        if (!parent || excludedTags.has(parent.tagName)) return;
        const source = node.nodeValue ?? "";
        const trimmed = source.trim();
        const translated = dictionary[trimmed];
        if (translated) node.nodeValue = source.replace(trimmed, translated);
      });
      if (root instanceof Element || root instanceof Document) {
        const elements = root instanceof Document ? root.querySelectorAll("*") : [root, ...root.querySelectorAll("*")];
        elements.forEach((element) => {
          if (excludedTags.has(element.tagName)) return;
          ["placeholder", "title", "aria-label"].forEach((attribute) => {
            const source = element.getAttribute(attribute);
            const translated = source ? dictionary[source] : undefined;
            if (translated) element.setAttribute(attribute, translated);
          });
        });
      }
    };
    localizeNode(document);
    const observer = new MutationObserver((mutations) => mutations.forEach((mutation) => mutation.addedNodes.forEach(localizeNode)));
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [locale]);
  return null;
}

export function useTranslation() {
  const context = useContext(I18nContext);
  return context;
}
