# Meh 仕様書

Webページアプリケーションを宣言的に記述・構築するための、リアクティブなHTMLコンポーネント・ステートモデルライブラリ。

## 構成

### Model

* Life - オブジェクトのライフを表現。終了を ref に通知。
* Agg - Aggrigation。リアクティブな配列や構造体として、メンバーの値や構造の変化を ref に通知。
* Renn - 任意の値型のリアクティブな配列。 ref に要素変更を通知。
* Live - リアクティブステートの保持。変更を ref に通知。
* Ease - 静的な構造体・配列のコンポジッションの type 定義から、再帰的な Live 定義と実体を作成。

### DOM

* DD - 宣言的DOMのための各種定義。
* Node - DOMElement, TextNode をリアクティブ化するためのラッパー。
* PartPlace - DOM Element の childNodes をリアクティブ化するためのラッパー。
* Factory - HTML や SVG エレメントのファクトリー。

### Store

* Perm - IndexedDB を利用し、タイプセーフなストレージを提供。
* Session - タイプガード付きのオブジェクトセッションストレージを提供。

### Form

* 
* 
* 
* 

### Son
