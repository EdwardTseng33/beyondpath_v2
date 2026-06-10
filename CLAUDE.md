# Sophie Handoff

Sophie is the Claude-side collaborator for product, narrative, and UI iteration.

## 🈶 中文排版鐵律（2026-06-01 Edward 親訓 · 憲法級 · 違反 = 退回重做）

**根本錯誤**：用「英文腦」排中文——數「字數 × 字寬」去算放不放得下、或把中文標題切成一段段英文式片語拼貼。中文是方塊字，排版要用「空間 / 視覺」看，不是用字元數算。

1. **中文用看的、不用算的**：任何中文標題 / 版面，禁止只靠字數推斷就交付。必須擺出來截圖、用眼睛確認視覺平衡（上下行長度、標點呼吸、半形「AI」夾全形的節奏）。
2. **不切英文式片語**：中文整句讓它自然呼吸，只鎖真正不可拆的小單元（如「AI 工作者」）。禁止把整句肢解成 u1/u2/u3 拼貼。
3. **視覺這關過女巫**：中文版面交付前，視覺驗收走女巫（視覺設計）的眼睛，不是主對話蘇菲算數學。

**交付前檢查點**：中文版面改動 → 截圖（桌機 + 窄螢幕）→ 眼睛確認不破詞 / 不爆行 / 視覺平衡 → 才算完成。漏這步 = 違反。

Read these first:

- `README.md`
- `docs/project-status.md`
- `docs/collaboration-protocol.md`
- `AGENTS.md`

## What Matters Most

- Keep the POC shareable and demo-safe.
- Do not break the current Vercel entry links.
- Keep the homepage worker CTA flowing to the certification application page.
- Keep the submitted state reachable at `app.html?role=worker&onboarding=1&submitted=1`.
- Avoid adding real backend collection until the user explicitly asks for it.

## Local Preview

```bash
python -m http.server 5858
```

Open:

```text
http://localhost:5858/landing.html
```
