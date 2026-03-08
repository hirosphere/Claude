# Meh Todo サンプルアプリ

Meh ライブラリを使ったシンプルな Todo アプリです。

## 使用している Meh の機能

| 機能 | 用途 |
|------|------|
| `Live<V>` | 入力テキスト・フィルターキーのリアクティブな値 |
| `Ease<V>` | TodoItem オブジェクトを再帰的にリアクティブ化 |
| `Renn<T>` | Todo リストのリアクティブなコレクション |
| `ef.xxx()` | HTML要素をファクトリー関数で宣言的に生成 |
| `pl.each()` | Renn をそのまま DOM リストに展開（差分更新） |
| `biBind.chChan` | チェックボックス ↔ `Live<boolean>` 双方向バインド |
| `biBind.vInp` | テキスト input ↔ `Live<string>` 双方向バインド |
| `trans_r()` | `Live<string>` をフィルターボタンの `Live<boolean>` に変換 |
| `shadow` (CSS) | Shadow DOM + CSSStyleSheet API でスタイルをカプセル化 |
| `add()` | document.body へのマウント |

## ファイル構成

```
sample-todo/
├── index.html      ← エントリーHTML
├── app.js          ← アプリ本体 (ESM)
└── README.md       ← このファイル
```

## セットアップ

`app.js` の先頭の import パスを、tsc のビルド出力先に合わせて書き換えてください。

```js
// 例: outDir が Q1/js/ の場合
import { Live, Ease, Renn, ef, pl, add } from "../js/Meh/Meh.js" ;

// 例: outDir が Q1/ts-src/ と同階層の Q1/dist/ の場合
import { Live, Ease, Renn, ef, pl, add } from "../dist/Meh/Meh.js" ;
```

## 機能

- テキスト入力 → 「追加」ボタン or Enter でタスクを追加
- チェックボックスで完了／未完了を切り替え
- ✕ ボタンで個別削除
- フィルター（すべて／未完了／完了済み）
- 「完了済みを削除」で一括削除
