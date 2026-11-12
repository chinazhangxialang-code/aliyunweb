---
hide:
  - navigation
  - toc
---

# 大模型学习路线

我是做数仓出身的。学大模型时，每个技术点我都会先问"它解决什么问题"，再写下**我做出来的成果、它的优势和劣势**，最后用一句**总结**说明为什么还要学下一个。下面 12 个里程碑按学习顺序排列，前一个的短板就是后一个出现的原因。

<div class="ms-legend">
  <span class="ms-tag ms-s1">基础概念</span>
  <span class="ms-tag ms-s2">检索与 RAG</span>
  <span class="ms-tag ms-s3">Agent 与工作流</span>
  <span class="ms-tag ms-s4">工程落地</span>
</div>

<div class="ms-timeline">

<div class="ms-item ms-s1">
  <div class="ms-dot">01</div>
  <div class="ms-card">
    <div class="ms-head"><span class="ms-tag ms-s1">基础概念</span><h3>Prompt 提示词</h3></div>
    <p class="ms-q">解决什么问题：告诉模型要做什么、按什么格式输出。</p>
    <dl>
      <dt class="ms-ok">成果</dt><dd>Deep Agents 主智能体汇总时会"纠正"子智能体的结果，还编造了天气。在提示词里加上"原样转述、不准修改、不准编造"的汇总规则后，三项结果都原样输出。</dd>
      <dt class="ms-up">优势</dt><dd>成本最低，改一句话立刻生效，不用改代码。</dd>
      <dt class="ms-down">劣势</dt><dd>只是软约束。同一个问题，模型有时调用 <code>write_todos</code>，有时不调用；上下文一长，效果就下降。</dd>
      <dt class="ms-sum">总结</dt><dd>Prompt 能管住模型"怎么说"，但模型不知道你的私有数据。要让它理解公司的表和字段，先得让机器能比较文字的意思 → <b>Embedding</b>。</dd>
    </dl>
  </div>
</div>

<div class="ms-item ms-s1">
  <div class="ms-dot">02</div>
  <div class="ms-card">
    <div class="ms-head"><span class="ms-tag ms-s1">基础概念</span><h3>Embedding 向量化</h3></div>
    <p class="ms-q">解决什么问题：把文字转成向量，按语义判断两段话像不像。</p>
    <dl>
      <dt class="ms-ok">成果</dt><dd>用 TEI 在本地部署 <code>bge-large-zh-v1.5</code>，输出 1024 维向量。实测批量请求的返回顺序和输入顺序一致；查明 LangChain 调用时要设 <code>check_embedding_ctx_length=False</code>，否则发过去的是 OpenAI 分词后的 token id，BGE 认不出来。</dd>
      <dt class="ms-up">优势</dt><dd>说法不同、意思相同的内容能匹配上，比如"销售额"能找到 <code>order_amount</code>。</dd>
      <dt class="ms-down">劣势</dt><dd>只会判断相似，不会推理；意思相近但不能混用的值会被当成一样的。</dd>
      <dt class="ms-sum">总结</dt><dd>有了向量，还需要一个能存几十万条、按相似度快速查找的地方 → <b>向量库</b>。</dd>
    </dl>
  </div>
</div>

<div class="ms-item ms-s2">
  <div class="ms-dot">03</div>
  <div class="ms-card">
    <div class="ms-head"><span class="ms-tag ms-s2">检索与 RAG</span><h3>向量库 Qdrant</h3></div>
    <p class="ms-q">解决什么问题：存向量，按相似度检索字段和指标。</p>
    <dl>
      <dt class="ms-ok">成果</dt><dd>建了字段集合（98 个点）和指标集合（8 个点）。发现构建脚本每跑一次就多一批重复数据，4 次后从 98 涨到 400；把点 id 从 <code>uuid4</code> 改成 <code>uuid5</code>，重跑后计数稳定在 98。</dd>
      <dt class="ms-up">优势</dt><dd>检索快，支持按 payload 过滤，自带管理界面方便查看。</dd>
      <dt class="ms-down">劣势</dt><dd>重复写入很难察觉，要自己保证幂等。实测北京/南京相似度 0.741、Mate60/Mate70 0.772，都超过 0.6 阈值，具体取值会被误召回。</dd>
      <dt class="ms-sum">总结</dt><dd>字段名适合语义匹配，但 WHERE 里的"华北""北京"必须一字不差 → <b>全文检索</b>。</dd>
    </dl>
  </div>
</div>

<div class="ms-item ms-s2">
  <div class="ms-dot">04</div>
  <div class="ms-card">
    <div class="ms-head"><span class="ms-tag ms-s2">检索与 RAG</span><h3>全文检索 Elasticsearch + IK</h3></div>
    <p class="ms-q">解决什么问题：按关键词精确查找维度字段的真实取值。</p>
    <dl>
      <dt class="ms-ok">成果</dt><dd>把 10 个维度字段的 75 个真实取值写进 ES，用 IK 中文分词；文档 <code>_id</code> 固定为"表.字段.值"，重跑直接覆盖，不会重复。</dd>
      <dt class="ms-up">优势</dt><dd>精确，取值变化时直接写入即可，不用重新算向量。</dd>
      <dt class="ms-down">劣势</dt><dd>不懂同义词，"销售额"找不到"订单金额"。</dd>
      <dt class="ms-sum">总结</dt><dd>向量查字段、ES 查取值，两者分工协作。下一步是把检索结果组织好交给大模型 → <b>RAG</b>。</dd>
    </dl>
  </div>
</div>

<div class="ms-item ms-s2">
  <div class="ms-dot">05</div>
  <div class="ms-card">
    <div class="ms-head"><span class="ms-tag ms-s2">检索与 RAG</span><h3>RAG 检索增强生成</h3></div>
    <p class="ms-q">解决什么问题：先检索相关资料，再交给模型回答，让模型能用上私有数据。</p>
    <dl>
      <dt class="ms-ok">成果</dt><dd>字段、指标、取值三路召回后合并，再从元数据库补上表的主外键。"统计华北地区的销售总额"能召回 <code>order_amount</code>、指标 GMV 和取值"华北"。</dd>
      <dt class="ms-up">优势</dt><dd>不用把全部元数据塞给模型，上下文短、成本低、干扰少。</dd>
      <dt class="ms-down">劣势</dt><dd>检索质量决定上限，检索错了后面全错；主外键这类信息语义检索召回不到，要程序补。</dd>
      <dt class="ms-sum">总结</dt><dd>模型现在能"看懂"数据了，但它只会输出文字，没法自己去查库 → <b>Tool Calling</b>。</dd>
    </dl>
  </div>
</div>

<div class="ms-item ms-s3">
  <div class="ms-dot">06</div>
  <div class="ms-card">
    <div class="ms-head"><span class="ms-tag ms-s3">Agent 与工作流</span><h3>Tool Calling 工具调用</h3></div>
    <p class="ms-q">解决什么问题：让模型调用函数，比如搜索、查天气、做计算、查数据库。</p>
    <dl>
      <dt class="ms-ok">成果</dt><dd>用 <code>@tool</code> 封装 Tavily 网络搜索，模型分 3 次搜索后给出回答；写了天气工具和计算工具，计算工具用 <code>ast</code> 安全求值，不用 <code>eval</code>。</dd>
      <dt class="ms-up">优势</dt><dd>模型从"只会说"变成"能做事"。</dd>
      <dt class="ms-down">劣势</dt><dd>模型可能选错工具、传错参数，或者反复调用；每个应用都要自己写一遍工具接入。</dd>
      <dt class="ms-sum">总结</dt><dd>工具多了以后，需要一个统一的接入方式，写一次就能给多个 AI 应用用 → <b>MCP</b>。</dd>
    </dl>
  </div>
</div>

<div class="ms-item ms-s3">
  <div class="ms-dot">07</div>
  <div class="ms-card">
    <div class="ms-head"><span class="ms-tag ms-s3">Agent 与工作流</span><h3>MCP 模型上下文协议</h3></div>
    <p class="ms-q">解决什么问题：工具接入的统一协议。</p>
    <dl>
      <dt class="ms-ok">成果</dt><dd>日常工作里通过 SQL MCP 让 AI 助手只读查询数仓，用来核对口径、跑验证 SQL；只读权限由 MCP 服务端控制，写操作会被拒绝。</dd>
      <dt class="ms-up">优势</dt><dd>一个工具写一次，多个 AI 应用都能接；权限可以在服务端统一管。</dd>
      <dt class="ms-down">劣势</dt><dd>多一层服务要部署和维护；MCP 只解决"能调用"，不解决"该怎么做"。</dd>
      <dt class="ms-sum">总结</dt><dd>有了工具，还要告诉模型做一件事的步骤和经验 → <b>Skill</b>。</dd>
    </dl>
  </div>
</div>

<div class="ms-item ms-s3">
  <div class="ms-dot">08</div>
  <div class="ms-card">
    <div class="ms-head"><span class="ms-tag ms-s3">Agent 与工作流</span><h3>Skill 技能</h3></div>
    <p class="ms-q">解决什么问题：把操作流程和业务经验写成可复用的说明。</p>
    <dl>
      <dt class="ms-ok">成果</dt><dd>把数仓看板重构沉淀成一个五阶段 Skill：盘点旧链路 → 评估复用 → 设计字段契约 → 分批生成脚本 → 只读对账，以后重构看板直接按它执行。</dd>
      <dt class="ms-up">优势</dt><dd>经验沉淀下来，不用每次重新交代。</dd>
      <dt class="ms-down">劣势</dt><dd>还是靠模型读懂并照做，流程一复杂仍可能跑偏，没有强制保证。</dd>
      <dt class="ms-sum">总结</dt><dd>要让步骤每次都按同一条路走，就得用代码把流程固定下来 → <b>Workflow</b>。</dd>
    </dl>
  </div>
</div>

<div class="ms-item ms-s3">
  <div class="ms-dot">09</div>
  <div class="ms-card">
    <div class="ms-head"><span class="ms-tag ms-s3">Agent 与工作流</span><h3>Workflow 工作流 LangGraph</h3></div>
    <p class="ms-q">解决什么问题：把流程编排成有并行、有分支、有循环的图。</p>
    <dl>
      <dt class="ms-ok">成果</dt><dd>用 12 个节点搭出问数工作流：3 路并行召回、2 路并行精筛、EXPLAIN 校验后纠错再校验，最多 3 次。"统计华北地区的销售总额"生成多表 JOIN 的 SQL，结果 41099.5。</dd>
      <dt class="ms-up">优势</dt><dd>每次走同一条路，结果稳定；出错能定位到具体节点；并行阶段耗时取最慢的一路，不是相加。</dd>
      <dt class="ms-down">劣势</dt><dd>只能处理设计好的流程。同一超步里一个节点失败，并行的节点会一起失败，排查时容易找错对象。</dd>
      <dt class="ms-sum">总结</dt><dd>单次取数用工作流足够，但"GMV 为什么下降"要多步分析，步骤事先定不下来 → <b>Agent</b>。</dd>
    </dl>
  </div>
</div>

<div class="ms-item ms-s3">
  <div class="ms-dot">10</div>
  <div class="ms-card">
    <div class="ms-head"><span class="ms-tag ms-s3">Agent 与工作流</span><h3>Agent 智能体 Deep Agents</h3></div>
    <p class="ms-q">解决什么问题：模型自己规划步骤、调用工具、整理结果。</p>
    <dl>
      <dt class="ms-ok">成果</dt><dd>用 <code>create_deep_agent</code> 加 Tavily 搜索做出能自己规划的调研智能体，并能解析出消息、待办和文件。对比了开源版和托管版，选开源版自己部署，只付大模型费用。</dd>
      <dt class="ms-up">优势</dt><dd>能处理多步、开放式的任务。</dd>
      <dt class="ms-down">劣势</dt><dd>更慢更贵，结果不稳定；一个智能体包揽所有事情，上下文会越来越长。</dd>
      <dt class="ms-sum">总结</dt><dd>任务一多，就要把活拆给专门的智能体，各自上下文干净 → <b>子智能体</b>。</dd>
    </dl>
  </div>
</div>

<div class="ms-item ms-s3">
  <div class="ms-dot">11</div>
  <div class="ms-card">
    <div class="ms-head"><span class="ms-tag ms-s3">Agent 与工作流</span><h3>子智能体</h3></div>
    <p class="ms-q">解决什么问题：主智能体负责规划，把子任务派给专门的智能体。</p>
    <dl>
      <dt class="ms-ok">成果</dt><dd>做了 1 个主智能体 + 3 个子智能体（翻译、天气、计算）。能从消息轨迹里看出主智能体派了什么活、派给了谁，发现并修复了主智能体汇总时改写结果的问题。</dd>
      <dt class="ms-up">优势</dt><dd>分工清楚，每个子智能体只拿自己需要的工具和上下文。</dd>
      <dt class="ms-down">劣势</dt><dd>多一层转述就多一次出错机会，主智能体可能改写或编造结果，要在提示词里约束。</dd>
      <dt class="ms-sum">总结</dt><dd>技术点都学过了，最后要把它们组合成一个别人能用的服务 → <b>工程落地</b>。</dd>
    </dl>
  </div>
</div>

<div class="ms-item ms-s4">
  <div class="ms-dot">12</div>
  <div class="ms-card">
    <div class="ms-head"><span class="ms-tag ms-s4">工程落地</span><h3>Text2SQL 智能问数服务</h3></div>
    <p class="ms-q">解决什么问题：业务人员用自然语言提问，系统自动生成 SQL 并返回结果。</p>
    <dl>
      <dt class="ms-ok">成果</dt><dd>用 FastAPI 把工作流做成流式接口：进程级连接由 lifespan 管理，请求级 Session 由 yield 依赖管理；SSE 实时推送每一步进度；请求 ID 贯穿所有节点日志，实测一次完整问数 9667ms。</dd>
      <dt class="ms-up">优势</dt><dd>把检索、工作流、校验纠错组合起来，结果可追溯，出了问题能从日志找到具体节点。</dd>
      <dt class="ms-down">劣势</dt><dd>还没有准确率评测集；EXPLAIN 只能保证 SQL 能跑，不能保证口径算对；接口还没有鉴权。</dd>
      <dt class="ms-sum">总结</dt><dd>下一站：建 30~50 题评测集测准确率，做语义层让 SQL 按固定口径生成，再把工作流包装成工具交给 Agent。</dd>
    </dl>
    <p class="ms-link"><a href="../text2sql/">查看完整项目 →</a></p>
  </div>
</div>

</div>

## 我自己学习的优势和短板

| | 内容 |
|---|---|
| 优势 | 熟悉元数据、指标口径和星型模型，知道 Text2SQL 难在"口径"而不在"语法"；习惯用数据验证结论，比如用实测相似度决定检索方案 |
| 短板 | Python 和 LangGraph 还在入门阶段，异步、类型标注这些基础还在补；项目目前只验证了单个问题跑通，还没有准确率评测集 |

想看每一块的细节：[基础概念](basics.md) · [检索与 RAG](rag.md) · [Agent 与工作流](agent.md) · [Text2SQL 项目](text2sql.md)
