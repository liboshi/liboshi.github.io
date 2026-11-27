---
layout: post
title: Cell 网关：一个端口，所有 Agent 用任意供应商的模型
description: 介绍本地模型网关 Cell：同端口四种协议互转、协议无关的 IR、直通优先、别名与回退、任务感知路由，以及鉴权与脱敏边界。
lang: zh-CN
tags: [cell, llm, gateway]
---

## 缘起：配置碎片化

用多个 AI 编码 Agent 的时候，很快会遇到一件麻烦事：每个客户端说的协议不一样，每个模型供应商的地址和 Key 也不一样。

- Claude Code 说 Anthropic Messages 协议；
- Codex 说 OpenAI Responses 协议；
- 各种 OpenAI SDK 和 OpenCode、pi 说 Chat Completions；
- Gemini CLI 说 Gemini `generateContent`。

想让 Claude Code 用 DeepSeek、让 Codex 用智谱、让 Zed 用火山，就得逐个改客户端配置，还得记住每个供应商的 endpoint 和 Key。换一次模型，所有 Agent 都要动一遍。

Cell 的思路是把它收敛成一个本地入口：**在本机跑一个网关，一个端口同时说四种协议，Agent 只改一次配置指向它，之后在面板里换模型就行。** 它是我写在 `/Users/liboshi/Code/Personal/cell` 的 Tauri 桌面应用，Rust 后端 + Vue 前端，默认监听 `127.0.0.1:9527`。

## 同一个端口，四种协议

网关把四个入口挂在同一个端口上：

| 协议 | 请求地址 | 典型客户端 |
| --- | --- | --- |
| OpenAI Chat Completions | `POST /v1/chat/completions` | 各类 OpenAI SDK、OpenCode、pi |
| OpenAI Responses | `POST /v1/responses` | Codex |
| Anthropic Messages | `POST /v1/messages` | Claude Code |
| Gemini generateContent | `POST /v1beta/models/{model}:generateContent` | Gemini CLI |

关键不在于"能转发"，而在于**四种协议可以任意互转**，而且流式输出、工具调用、推理内容（thinking）都参与转换。所以可以让 Claude Code 用 DeepSeek 的模型，客户端一行配置都不用改——它以为自己在跟 Anthropic 说话，网关在背后翻成了上游听得懂的协议。

模型名统一写成 `供应商/模型`，例如 `zhipu/glm-5.3`、`volcengine/deepseek-v4.1-flash`、`openrouter/anthropic/claude-sonnet-4`（供应商 id 之后允许再带 `/`）。前缀必须是已经添加的供应商 id，未知前缀直接 404，不会悄悄落到唯一的供应商上——这条约束看着小，但避免了"模型名写错却浑然不觉"这类难查的问题。

## 底层：协议无关的中间表示

四种协议能互转，靠的是一套共同的中间表示（IR，`src-tauri/src/protocol/ir.rs`）。网关先把任何协议的请求翻成 IR，再按上游真正支持的协议翻回去。每个协议适配器只做三件事：把请求解析成 IR、把 IR 序列化成自己的请求体、把响应和流解析回 IR 再序列化给客户端。

真正费心思的是语义对齐。几个例子：

- **系统提示**：Anthropic 的顶层 `system`、Gemini 的 `systemInstruction`、Responses 的 `instructions`，进 IR 后统一成第一条 system 消息；出去时再合并回对应协议的字段。
- **工具调用**：统一成 `ToolUse`（助手侧）和 `ToolResult`（工具消息），到 Chat 变成 `role: "tool"`，到 Anthropic 变成 `user` 消息里的 `tool_result` 块，到 Gemini 变成 `functionResponse`。
- **推理内容**：DeepSeek 的 `reasoning_content`、Anthropic 的带签名 `thinking`、Gemini 的 `thought`、Responses 的 reasoning 摘要，统一成 `Thinking { text, signature }`。签名（门票）只在不跨协议时原样回传，跨协议就清空，免得上游校验失败。
- **结束原因与用量**：统一成 `FinishReason` 和 `Usage`，缓存读写、推理 token 尽力而为。

这样做的好处是网关逻辑对协议无感：鉴权、路由、回退、用量统计只写一遍，新增协议只要实现一个 trait。

## 直通优先

互转能力有了，但并不是每个请求都翻译一遍。网关遵循**直通优先**：客户端协议和上游协议一致时，按原字节转发，只把 `model` 字段换回网关侧的名字，不重新序列化。

原因是 JSON 里的未知字段。各家客户端经常塞一些网关不认识的参数，一旦解析再重组就可能丢掉，进而改变上游行为。跨协议不得不翻译时才走 IR；同协议直通既保住了未知字段，也省掉了序列化开销。流式转发同理：同协议直接转发字节流，跨协议才逐帧解析、转成 IR 事件再编回去。

## 路由：别名、回退与任务感知

### 别名与失败回退

最常用的是模型别名：客户端写 `model: "cell/fast"`，网关按别名配置的 targets 顺序尝试。这样 Agent 永远指向一个稳定的名字，换模型只改别名映射。

别名天然和多目标结合成**失败回退**：前一个目标返回 429、5xx 或连不上时，自动换下一个。切换只发生在还没向客户端吐出第一字节之前——一旦开始流式输出就没法中途换目标了。每次切换都会单独记一条用量，带上"回退自"字段，在用量页能看到这次请求到底经历了几次切换。

几个约束是刻意的：别名不能嵌套、不能和供应商同名、会出现在 `/v1/models` 里，所以 Agent 的模型选择器能直接选到别名；仍被别名引用的供应商不能删除，得先改掉别名。

### 任务感知路由

再往前一步是 `cell/fast`、`cell/auto`、`cell/closure` 三个内置入口。它们不是简单别名，而是**确定性的规则路由**：用请求头里的任务类型、阶段、风险、能力约束，按协议、工具、图片、上下文长度、输出预算逐项硬过滤出候选模型，再按质量阶梯选择。

设计上刻意区分了两件事：**传输失败换目标**（429/5xx，属于 `attempt_targets`）和**模型能力不足而升级**（属于 `escalation_ladder`）。前者是重试，后者是质量问题，混在一起会把成本账算乱。

还有 shadow 模式：记录"准备怎么路由"，实际只执行显式配置的 baseline 目标，方便拿计划目标和基线做对比。路由决定会写进用量和任务记录里，是可解释的——不像交给另一个 LLM 判断那样说不清为什么选了这个模型。

第一版明确不做的事也值得记一笔：不用 LLM 判断复杂度，不做自动探索、多模型竞速，Cell 也不直接执行仓库里的测试或命令。

## 安全与资源边界

一个监听在本机的网关，安全边界要划清楚。

**鉴权**：可以配客户端 Key 列表；为空时接受任意 Key（本机方便）。但浏览器来源例外——带 `Origin` 的请求必须把 Origin 精确列入 `cors_origins`，而且必须配置客户端 Key，否则 403。这是为了防止本机上的任意网页偷偷调用网关。

**隐私脱敏**：可选在请求离开本机前，把密码、Token、API Key、邮箱等替换成稳定占位符，响应和工具调用参数回来后再还原。映射只存在进程内存里，默认关闭。它依赖规则识别，不能保证发现所有敏感数据；启用后模型看到的是占位符，无法直接分析敏感值本身。

**月度额度**：可以给供应商设每月 token 上限，用量到 80% 提醒一次，超限后选择"只提醒"或"拦截"（402）。

**请求边界**：上游响应头、非流式响应体、流式空闲等待都有超时；非流式响应体和单条 SSE 事件都有字节上限。局域网访问只做 Key 鉴权、不做 TLS，所以只建议在可信内网开启。

**AICP 隔离**：可选的上下文接力子系统（Project / Task / Session / 交接 / 知识存成本地 JSON）是独立的 `/cell/v1/aicp/*` 子树，仅回环、独立 Bearer Key，Key 不进 WebView，不改变 `/v1/*` 的行为。任务反馈端点也用独立的 `task_api_key`，拒绝任何带 `Origin` 或跨站标记的请求。

## Agent 接管

网关本身只是个服务，真正省事的是面板里的 Agent 接管：自动检测本机的 Claude Code、Codex、OpenCode、pi、dsh、Zed，把它们的模型指向 Cell，可以一键切模型。

改配置这件事很克制：JSON 用值合并、TOML 用 `toml_edit`、YAML 用 `serde_yaml::Value`，只改必要字段，保留注释和其它字段；改动前备份到 `backups/`。首次接管前的备份作为退出基线，后续切换不再覆盖，退出接管时先展示恢复范围再确认。

有个细节挺典型：Claude Code 的 auto 模式默认要 Anthropic **服务端**审查，经 Cell 转给智谱、火山这类上游时，审查字段没人执行也没人回传，Claude Code 就会把每个待检查动作降级成逐个询问。接管时会先看 Cell 能触达的模型——只要有一个第三方模型，就写 `CLAUDE_CODE_AUTO_MODE_SERVER=0`，让 Claude Code 改用自带的本地分类器；全都支持服务端审查时才撤掉这个键。而且只认自己写进去的值，用户自己设过的不会被覆盖。

## 一点取舍

Cell 有意把网关做窄：不做插件系统、会话库、路由组的完整形态，也不做多租户计费，聚焦在"一个入口"这件事上。它是菜单栏常驻应用，关窗口不退出，托盘里可以开面板、启停网关、打开数据目录。

配置和数据都在本地：默认 `~/Library/Application Support/com.oshi.cell`，用量是本地 JSONL，导出配置不含任何凭据。这些取舍让它更像一个趁手的本机工具，而不是一套平台——这大概也是它存在的理由：**Agent 和供应商会越来越多，但入口应该只有一个。**

## 自己试一下

网关起来后，把客户端的 base URL 指向 Cell，就可以用 curl 直接验证：

```bash
curl http://127.0.0.1:9527/v1/chat/completions \
  -H 'content-type: application/json' \
  -d '{"model":"zhipu/glm-5.3","stream":true,"messages":[{"role":"user","content":"你好"}]}'

curl http://127.0.0.1:9527/v1/models | jq '.data[].id'

# 同一个端口说 Anthropic 协议
curl http://127.0.0.1:9527/v1/messages \
  -H 'content-type: application/json' \
  -H 'anthropic-version: 2023-06-01' \
  -d '{"model":"zhipu/glm-5.3","max_tokens":64,"messages":[{"role":"user","content":"你好"}]}'
```

代码、设计文档与已知限制见 [cell 仓库](https://github.com/liboshi/personal)。
