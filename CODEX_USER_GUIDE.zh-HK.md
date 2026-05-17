# Meal Planner Codex User Guide

Audience: users asking Codex to operate Meal Planner data.

呢份文件係俾使用者交俾 Codex 參考，用嚟直接操作 Obsidian Meal Planner 插件資料。插件本身嘅開發規則喺 `AGENTS.md`；如果只係想排餐、加 recipe、整理 shopping list，跟呢份就夠。

## 基本資料位置

- 插件目錄：repo / plugin root
- 插件設定同 meal plan：`data.json`
- Recipe notes folder：由 `data.json.recipeFolder` 決定，預設 `recipe/`
- Ingredient notes folder：由 `data.json.ingredientsFolder` 決定，預設 `ingredients/`
- Obsidian 載入檔案：`manifest.json`、`main.js`、`styles.css`

重要：如果 Codex 只係幫你排餐、改 recipe、整理 ingredient metadata，通常唔需要改 `src/` 或 build 插件。只有改插件功能先要跟 `AGENTS.md` 入面嘅 test/build workflow。

## 你可以點叫 Codex

可以直接咁講：

```text
幫我用 meal-planner 排下星期一至星期日晚餐，優先用已有 recipe，唔好覆蓋現有 breakfast/lunch。
```

```text
幫我將 2026-05-18 至 2026-05-24 嘅 meal plan 匯出成可以貼去 WhatsApp 嘅文字。
```

```text
幫我新增一個 recipe note：蕃茄牛肉飯，2 servings，材料有牛肉 250g、蕃茄 2個、飯 2碗。
```

```text
幫我生成今個星期 shopping list，pantry item 分開列出，順便指出邊啲 ingredient 冇份量。
```

```text
幫我將星期三晚餐 copy 去星期五晚餐，servings 改做 2。
```

## Meal Plan 資料格式

Meal plan 存喺 `data.json.plans`：

```json
{
  "2026-05-18": {
    "Dinner": [
      {
        "path": "recipe/Salmon Pasta.md",
        "name": "Salmon Pasta",
        "targetServings": 2
      }
    ]
  }
}
```

規則：

- 日期用 `YYYY-MM-DD`。
- Meal name 用現有 `defaultMeals`，通常係 `Breakfast`、`Lunch`、`Dinner`；需要時可以加 `Snack` 等自訂 meal。
- `path` 要指向 recipe note。
- `name` 應該同 recipe frontmatter `name` 或檔名一致。
- `targetServings` 可選；唔填就用 recipe 原本 servings。
- 合併新計劃時，避免刪走同一日期入面無關 meal。

## Recipe Note 格式

建議 recipe note 放喺 `recipe/`，用以下格式：

```markdown
---
type: recipe
name: Salmon Pasta
servings: 2
tags:
  - dinner
ingredients:
  - Salmon
  - Pasta
  - Cream
image: salmon-pasta.jpg
---

## Ingredients / 材料

- [[Salmon]] 250g
- [[Pasta]] 180g
- [[Cream]] 100ml

## Method / 做法

1. ...
```

插件會讀：

- `name`：顯示名稱。
- `servings`：用嚟按 `targetServings` 自動 scale 份量。
- `tags`：recipe picker 搜尋用。
- `ingredients`：ingredient 清單。
- `## Ingredients / 材料` 入面 `- [[Ingredient]] 份量`：用嚟生成 ingredient detail、shopping list、nutrition。
- `image`、`cover`、`thumbnail`、`banner` 或 note 入面第一張圖：用嚟顯示 recipe image。

注意：`ingredients` frontmatter 入面嘅名稱要同 `[[Ingredient]]` 連結名一致，咁插件先可以配對份量。

## Ingredient Note 格式

Ingredient note 建議放喺 `ingredients/`，檔名要同 recipe 入面嘅 ingredient 名一樣，例如 `ingredients/Salmon.md`。

```markdown
---
category: Seafood
pantry: false
nutrition_ref:
  - Protein
energy_per_100g: 208
protein_per_100g: 20
fat_per_100g: 13
---
```

Shopping category 可用：

- `category`
- `grocery_category`
- `shopping_category`

Pantry / 常備標記可用：

- `pantry`
- `staple`
- `usually_stocked`

如果冇 category，插件會用名稱推斷，例如菜類入 `Produce`、魚蝦入 `Seafood`、肉蛋豆腐入 `Protein`、奶類入 `Dairy`、米麵入 `Dry Goods`、調味料入 `Seasonings`。

## Nutrition Metadata

插件會讀 ingredient note frontmatter 入面類似以下欄位：

```yaml
energy_per_100g: 208
protein_per_100g: 20
fat_per_100g: 13
carbs_per_100g: 0
sodium_per_100g: 59
```

支援基準：

- `_per_100g`
- `_per_100ml`
- `_per_1g`
- `_per_tbsp`
- `_per_tsp`
- `_per_pack`
- `_per_unit`

營養單位規則：

- `energy` 顯示 `kcal`
- `sodium`、`calcium`、`potassium` 顯示 `mg`
- 其他營養預設顯示 `g`

## Import / Export 文字格式

插件支援以下純文字格式，適合貼去 WhatsApp 或再 import：

```text
Meal Plan: 2026-05-18 to 2026-05-24

2026-05-18 Mon
Breakfast
- Oatmeal
Dinner
- Salmon Pasta (servings: 2)
```

Import 行為：

- `Merge`：保留現有計劃，跳過完全相同 duplicate。
- `Replace date range`：先清空 import range 入面嘅計劃，再寫入。
- Recipe 會用 exact name、path、case-insensitive name 配對。
- 配對唔到都可以 import，但會顯示 missing recipe，之後補返 recipe note 就會正常。

## Codex 操作守則

叫 Codex 改 meal-planner 資料時，可以要求佢跟呢啲規則：

- 先讀 `data.json`，確認 `recipeFolder`、`ingredientsFolder`、`defaultMeals`。
- 改 meal plan 時只改 `data.json.plans` 相關日期，唔好重排全檔或改 unrelated settings。
- 新增 recipe 時建立 Markdown note，並用 wiki links 寫 ingredient。
- 新增 ingredient metadata 時建立或更新對應 ingredient note。
- 需要 shopping list 時，用 recipe ingredients、servings、targetServings 同 pantry/category metadata 計算；唔好憑感覺漏項。
- 如果要改插件功能，先讀 `AGENTS.md`，改 `src/**/*.ts`，跑 `npm test` 同 `npm run build`，並保留 `main.js` release artifact。

## 常用 Obsidian UI 功能

喺 Obsidian 入面：

- Command palette 執行 `Meal Planner: Open meal planner`。
- Ribbon calendar icon 可以打開 Meal Planner view。
- Calendar / Shopping segmented control 切換日曆同購物清單。
- Month / Week / Day 切換日曆範圍。
- Recipe / Ingredients / Nutrition 切換每個 recipe card 顯示內容。
- Meals / All day 切換按 meal 分組或每日總覽。
- `Import` / `Export` 可匯入匯出 meal plan text。
- Recipe card 右上角 menu 可 move、copy、set target servings、remove。
- Shopping view 可選 from/to 日期，亦可 toggle Pantry。
