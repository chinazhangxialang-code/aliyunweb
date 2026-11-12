---
template: home.html
title: 首页
hide:
  - navigation
  - toc
---

<!-- 标语和两个按钮已经移到首屏动画里（overrides/home.html），这里从卡片开始。 -->

<div class="grid cards" markdown>

-   :material-database:{ .lg .middle } **数仓成果**

    ---

    短剧 App 数仓：投放归因与 ROI、留存与 LTV、看板重构、湖仓规划。另有制造业数据中心建设项目。

    [:octicons-arrow-right-24: 查看](data-warehouse.md)

-   :material-brain:{ .lg .middle } **大模型学习**

    ---

    按"基础概念 → 检索与 RAG → Agent 与工作流 → 工程落地"四块整理，每块写清优势和劣势。

    [:octicons-arrow-right-24: 查看](llm/learning.md)

-   :material-robot:{ .lg .middle } **Text2SQL 智能问数**

    ---

    LangGraph 工作流 + 向量与全文混合检索 + SQL 校验纠错，用 FastAPI 提供流式问数服务。

    [:octicons-arrow-right-24: 查看](llm/text2sql.md)

</div>

---

## 关于我

![张夏浪](images/avatar.jpg){ width="140" align=right style="border-radius:6px; margin-left:16px" }

你好，我是**张夏浪**，在杭州做数据仓库开发。

目前在短剧行业做数仓，日常工作是投放归因和 ROI、留存与 LTV、会员和广告变现这些报表的建模与交付，以及数据链路的稳定性保障。最近在系统学习大模型和 Agent 开发，想把数仓里积累的元数据、指标口径和数据质量经验，用到"让业务直接用自然语言取数"这件事上。

### 技能

| 方向 | 用过的技术 |
|---|---|
| 业务领域 | 短剧 / 小说 App：投放归因、ROI、留存与 LTV、会员签约、广告变现、推荐特征 |
| 数仓建模 | 维度建模、ODS / DIM / DWD / DWS / ADS 分层、指标口径治理 |
| 计算与存储 | StarRocks、MaxCompute、Iceberg、MinIO、Paimon（规划中） |
| 数据接入与调度 | Flink CDC、Kafka、DataWorks、DolphinScheduler、k8s |
| BI 可视化 | Quick BI、DataEase、FineReport、SuperSet |
| 大模型与 Agent | LangChain、LangGraph、Deep Agents、RAG、向量检索（Qdrant）、全文检索（Elasticsearch） |
| 服务开发 | Python、FastAPI、SQLAlchemy（异步）、Docker Compose |

### 教育经历

| 时间 | 学校 | 专业 |
|---|---|---|
| 2021.09 – 2023.06 | 湖北科技学院 | 电气工程及其自动化（本科，全日制） |

### 联系方式

- GitHub：[chinazhangxialang-code](https://github.com/chinazhangxialang-code)
<!-- 需要的话在这里补邮箱。不建议在公开网站放手机号。 -->
