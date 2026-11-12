# 基础概念

大模型应用最底层的两件事：**怎么跟模型说话**（Prompt），**怎么让机器理解文字的意思**（Embedding）。

| 技术 | 解决什么问题 | 优势 | 劣势 |
|---|---|---|---|
| Prompt | 告诉模型要做什么、用什么格式输出 | 成本最低，改完立刻生效 | 只是软约束，模型不一定遵守；上下文一长效果就下降 |
| Embedding | 把文字转成向量，按语义找相似内容 | "销售额"能匹配到 `order_amount` 这种说法不同、意思相同的内容 | 意思相近但不能混用的值会误召回 |

## 我的实践

**Prompt 是软约束。** 用 Deep Agents 时，同一个问题，模型有时调用 `write_todos` 列待办，有时不调用。需要稳定行为的地方，要用代码保证，不能只靠提示词。

**Embedding 模型和服务是两回事。**

- `bge-large-zh-v1.5` 是模型权重，负责把文字转成 1024 维向量。
- TEI（Text Embeddings Inference）是把模型包装成 HTTP 服务的推理程序。
- 用 LangChain 的 `OpenAIEmbeddings` 调 TEI 时，要设置 `check_embedding_ctx_length=False`。否则 LangChain 会先用 OpenAI 的分词器把文字转成 token id 再发过去，BGE 模型认不出这些 id。

**Embedding 只能"找资料"，不能推理。** 它只判断两段文字像不像，选字段、设计 JOIN、写 SQL 还得交给大模型。所以通常是先用 Embedding 检索缩小范围，再把少量相关内容交给大模型。
