/**
 * Meh サンプルアプリ ─ Todoリスト
 *
 * 使用している Meh の機能:
 *   Live<V>       … リアクティブな値
 *   Ease<V>       … オブジェクトを再帰的にリアクティブ化
 *   Renn<T>       … リアクティブなリスト
 *   ef            … HTML要素ファクトリー (Proxy)
 *   pl.each()     … Renn をDOMリストに展開
 *   add()         … DOMへのマウント
 *   biBind        … 双方向バインド (input ↔ Live)
 */

import { Live, Ease, Renn, ef, pl, add } from "../js-out-1/Meh/Meh.js" ;

/* ------------------------------------------------------------------ */
/* モデル定義                                                           */
/* ------------------------------------------------------------------ */

class TodoItem {
    constructor( i = {} ) {
        this.text      = i.text      ?? "" ;
        this.completed = i.completed ?? false ;
    }
}

/* アプリの状態 */
const inputText = Live( "" ) ;          // 入力欄の文字列
const items     = new Renn( [] ) ;      // Todo リスト（Renn<Ease<TodoItem>>）
const filterKey = Live( "all" ) ;       // "all" | "active" | "done"

/* ------------------------------------------------------------------ */
/* ロジック                                                             */
/* ------------------------------------------------------------------ */

function addTodo() {
    const text = inputText.$.trim() ;
    if ( ! text ) return ;
    items.insert( [ Ease( new TodoItem( { text } ) ) ] ) ;
    inputText.$ = "" ;
}

function clearDone() {
    const toDelete = [] ;
    items.each( ( item, order ) => {
        if ( item.completed.$ ) toDelete.unshift( order ) ;
    }) ;
    toDelete.forEach( o => o.delete() ) ;
}

/* ------------------------------------------------------------------ */
/* CSS (Shadow DOM + CSSStyleSheet API)                                 */
/* ------------------------------------------------------------------ */

const css = new CSSStyleSheet() ;
css.replaceSync(`
    :host {
        display: block;
        font-family: 'Segoe UI', system-ui, sans-serif;
        max-width: 500px;
        margin: 2rem auto;
        padding: 2rem 1.5rem;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 4px 24px hsl(220,30%,80%,0.5);
        color: #222;
    }
    h1 {
        font-size: 1.7rem;
        font-weight: 700;
        color: hsl(220,70%,50%);
        margin-bottom: 1.4rem;
        text-align: center;
        letter-spacing: 0.04em;
    }
    .input-row {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }
    input[type=text] {
        flex: 1;
        padding: 0.55rem 0.9rem;
        border: 1.5px solid hsl(220,25%,78%);
        border-radius: 7px;
        font-size: 1rem;
        outline: none;
        transition: border-color 0.15s, box-shadow 0.15s;
    }
    input[type=text]:focus {
        border-color: hsl(220,70%,55%);
        box-shadow: 0 0 0 3px hsl(220,70%,88%);
    }
    button {
        padding: 0.55rem 1.1rem;
        border: none;
        border-radius: 7px;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        background: hsl(220,70%,52%);
        color: #fff;
        transition: background 0.15s;
    }
    button:hover { background: hsl(220,70%,42%); }
    button.danger { background: hsl(0,58%,55%); }
    button.danger:hover { background: hsl(0,58%,44%); }
    .filter-row {
        display: flex;
        gap: 0.4rem;
        margin-bottom: 1rem;
    }
    .filter-btn {
        flex: 1;
        background: transparent;
        color: hsl(220,20%,50%);
        border: 1.5px solid hsl(220,20%,80%);
        border-radius: 6px;
        font-size: 0.88rem;
        font-weight: 500;
        padding: 0.35rem 0;
        cursor: pointer;
        transition: all 0.15s;
    }
    .filter-btn:hover { background: hsl(220,20%,95%); }
    .filter-btn.active {
        background: hsl(220,70%,52%);
        color: #fff;
        border-color: hsl(220,70%,52%);
    }
    ul.todo-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        min-height: 2rem;
    }
    li.todo-item {
        display: flex;
        align-items: center;
        gap: 0.7rem;
        padding: 0.6rem 0.9rem;
        background: hsl(220,18%,97%);
        border-radius: 8px;
        border: 1px solid hsl(220,15%,90%);
        transition: opacity 0.2s;
    }
    li.todo-item.done { opacity: 0.5; }
    li.todo-item input[type=checkbox] {
        width: 1.1rem; height: 1.1rem;
        accent-color: hsl(220,70%,52%);
        cursor: pointer;
        flex-shrink: 0;
    }
    .label {
        flex: 1;
        font-size: 0.97rem;
        word-break: break-all;
        line-height: 1.4;
    }
    li.todo-item.done .label {
        text-decoration: line-through;
        color: #aaa;
    }
    .del-btn {
        background: transparent;
        color: hsl(0,40%,65%);
        border: none;
        font-size: 1rem;
        cursor: pointer;
        padding: 0.1rem 0.4rem;
        border-radius: 5px;
        line-height: 1;
        transition: background 0.12s;
        flex-shrink: 0;
    }
    .del-btn:hover { background: hsl(0,70%,93%); color: hsl(0,60%,45%); }
    .footer-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 1rem;
        padding-top: 0.8rem;
        border-top: 1px solid hsl(220,15%,90%);
        font-size: 0.86rem;
        color: #999;
    }
    .empty-msg {
        text-align: center;
        color: #bbb;
        font-size: 0.9rem;
        padding: 1.2rem 0;
    }
`) ;

/* ------------------------------------------------------------------ */
/* フィルターボタン                                                      */
/* ------------------------------------------------------------------ */

function filterBtn( label, key ) {
    const isActive = filterKey.trans_r( v => v === key ) ;
    return ef.button(
        {
            class: { "filter-btn": true, active: isActive } ,
            active: { click: () => { filterKey.$ = key ; } } ,
        } ,
        label
    ) ;
}

/* ------------------------------------------------------------------ */
/* Todo 1行のDOM                                                        */
/* ------------------------------------------------------------------ */

function todoItemNode( item, order ) {
    const isDone = item.completed ;     // Live<boolean>

    /* フィルターキーに応じて表示/非表示 */
    const visible = Live( true ) ;
    const updateVisible = () => {
        const f = filterKey.$ ;
        const done = isDone.$ ;
        visible.$ =
            f === "all"    ? true :
            f === "active" ? ! done :
            /* done */        done ;
    } ;
    filterKey.add_ref( { vChan: updateVisible } ) ;
    isDone .add_ref( { vChan: updateVisible } ) ;
    updateVisible() ;

    const display = visible.trans_r( v => v ? "" : "none" ) ;

    return ef.li(
        {
            class: { "todo-item": true, done: isDone } ,
            style: { display } ,
        } ,
        ef.input( {
            props : { type: "checkbox" } ,
            biBind: { chChan: isDone } ,
        }) ,
        ef.span( { class: "label" } , item.text.$ ) ,
        ef.button(
            {
                class: "del-btn" ,
                active: { click: () => order.delete() } ,
            } ,
            "✕"
        ) ,
    ) ;
}

/* ------------------------------------------------------------------ */
/* アプリ全体のDOMツリー                                                 */
/* ------------------------------------------------------------------ */

const remainCount = Live( 0 ) ;
const updateCount = () => {
    let n = 0 ;
    items.each( item => { if ( ! item.completed.$ ) n++ ; } ) ;
    remainCount.$ = n ;
} ;

/* Renn の変化 + 各 item.completed の変化を受け取る */
items.add_ref( {
    insert: ( _start, orders ) => {
        orders.forEach( o => o.target.completed.add_ref( { vChan: updateCount } ) ) ;
        updateCount() ;
    } ,
    delete: () => updateCount() ,
} ) ;

const app = ef.div(
    { shadow: css } ,

    ef.h1( {}, "✅ Meh Todo" ) ,

    /* 入力行 */
    ef.div(
        { class: "input-row" } ,
        ef.input( {
            props : { type: "text", placeholder: "新しいタスクを入力…" } ,
            biBind: { vInp: inputText } ,
            active: { keydown: ev => { if ( ev.key === "Enter" ) addTodo() ; } } ,
        }) ,
        ef.button( { active: { click: () => addTodo() } } , "追加" ) ,
    ) ,

    /* フィルター行 */
    ef.div(
        { class: "filter-row" } ,
        filterBtn( "すべて", "all" ) ,
        filterBtn( "未完了", "active" ) ,
        filterBtn( "完了済", "done" ) ,
    ) ,

    /* リスト */
    ef.ul(
        { class: "todo-list" } ,
        pl.each( items, todoItemNode ) ,
    ) ,

    /* フッター */
    ef.div(
        { class: "footer-row" } ,
        ef.span( {}, remainCount, " 件が未完了" ) ,
        ef.button(
            { class: "danger", active: { click: () => clearDone() } } ,
            "完了済みを削除"
        ) ,
    ) ,
) ;

/* ------------------------------------------------------------------ */
/* マウント                                                              */
/* ------------------------------------------------------------------ */

add( app, document.body ) ;
