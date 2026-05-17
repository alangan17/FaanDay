# Meal Planner

廣東話 | [English](README.md)

Meal Planner 幫你喺 Obsidian 入面用 Markdown 食譜做一星期煮飯計劃，再自動整合買餸清單。

Meal Planner 將一個 Markdown 食譜 folder 變成實用煮飯 workflow：

- 將食譜加入 calendar，按早餐、午餐、晚餐，或者自訂 meal name 分類。
- Planning 時切換 recipe、ingredients、nutrition view。
- 按任何日期範圍生成 supermarket-style 買餸清單。
- Export meal plan 做 plain text，方便直接貼去 WhatsApp。

適合已經用 Obsidian 記食譜、想每星期 plan 早餐/午餐/晚餐、買餸前想一次過睇清楚要買咩嘅人。

## 快速開始

1. 喺 recipe folder 建立食譜 note。預設 folder 係 `recipe`。
2. 用 ribbon 或 command palette 開 Meal Planner。
3. 揀一日，加一個 recipe，然後切去 Shopping 生成買餸清單。

如果你已經有 Obsidian 食譜庫，先跟下面嘅食譜格式對齊 frontmatter 同 ingredients 寫法。如果由零開始，先整一個 dinner recipe，成功生成一次 shopping list，再慢慢補齊成個星期。

## 食譜格式

Meal Planner 會由 frontmatter 讀食譜 metadata，並由 note body 讀食材份量。

```markdown
---
name: Salmon Pasta
servings: 2
tags:
  - dinner
  - pasta
ingredients:
  - Salmon
  - Tomato
  - Pasta
  - Salt
---

## Ingredients

- Salmon: 250g
- Tomato: 200g
- Pasta: 180g
- Salt: 1 tsp
```

常用 recipe fields：

- `name`：Planner 入面顯示嘅食譜名。如果無填，就用 note title。
- `servings`：預設份量，用嚟按人數調整食材份量。
- `tags`：搜尋同 recipe detail 入面顯示嘅標籤。
- `ingredients`：用嚟 lookup ingredient note 同整理 shopping list 嘅食材名。

## 食材 notes

Ingredient notes 唔係必須，但可以令買餸清單更準。預設 folder 係 `ingredients`。

```markdown
---
category: Produce
pantry: false
energy_per_100g: 18
---
```

Shopping category 支援以下 aliases：

- `category`
- `grocery_category`
- `shopping_category`

Pantry 支援以下 aliases：

- `pantry`
- `staple`
- `usually_stocked`

常用調味料可以設成 pantry item，咁買餸時可以選擇隱藏，唔會同真正要買嘅食材撈埋一齊。

## 買餸清單

開 Meal Planner view，從 Calendar 切去 Shopping。揀 from date 同 to date，就可以將指定日期範圍內所有 planned recipes 嘅 ingredients 整合成買餸清單。

Meal Planner 會按 category 分組、合併相同食材份量、顯示每樣食材來自邊幾個 recipes 同日子，亦可以隱藏 pantry staples。

## Import 同 export

Toolbar 入面嘅 Import / Export 可以將 meal plan 轉成 plain text。Shopping mode 會 export 目前 shopping range；Calendar mode 會 export 目前可見嘅 calendar range。

```text
Meal Plan: 2026-05-18 to 2026-05-24

2026-05-18 Mon
Breakfast
- Oatmeal
Dinner
- Salmon Pasta (servings: 2)
```

Import 支援同一個 plain text format。你可以揀 Merge 保留現有 plan 並跳過完全重複嘅 entries，或者揀 Replace date range 先清空 imported date range 再寫入新 plan。

Recipes 會用 exact name、path，或者 case-insensitive name 去 match。未 match 到嘅 recipe 仍然會以 name 形式 import，之後建立返對應 recipe note 就會正常顯示。

## Using Codex

你可以用 Codex 幫手操作 Meal Planner vault data。可以叫佢將粗略 meal ideas 變成有日期嘅 plan、按格式建立 recipe notes、補 ingredient metadata、整理 pantry categories，或者準備一份方便分享嘅 export text。

例子：

- 「幫我用現有 recipe notes plan 下星期 dinner。」
- 「幫我為 shopping list 入面未有 metadata 嘅食材建立 ingredient notes。」
- 「將呢個 meal plan 整成方便貼去 WhatsApp 嘅格式。」
- 「將呢幾個 recipes 調整成 4 人份量，然後更新 meal plan。」

完整 workflow 可以睇 [CODEX_USER_GUIDE.md](CODEX_USER_GUIDE.md)。

## Settings

Meal Planner settings 可以設定：

- Recipe folder
- Ingredients folder
- Default meal names
- Stable release update checks

預設 meals 係 `Breakfast`、`Lunch`、`Dinner`，但你可以喺 settings 或 planning 時加自訂 meal names。

## 喺 Obsidian 入面 update

Plugin 可以喺 Obsidian 入面檢查 GitHub 最新 stable release：

1. 開 Settings。
2. 去 Community plugins。
3. 開 Meal Planner settings。
4. 喺 Stable release updates 揀 Check and install。

呢個動作會由相應 `release/vX.Y.Z` branch 下載 `manifest.json`、`main.js`、`styles.css`。安裝後 reload Obsidian 就會完成 update。
