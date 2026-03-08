/**
 * Meh サンプルアプリ ─ 時刻・日付表示
 *
 * 使用している Meh の機能:
 *   Live<V>    … 毎秒更新されるリアクティブな時刻値
 *   df()       … Meh 組み込みの日付フォーマッター
 *   ef         … HTML要素ファクトリー
 *   add()      … DOMへのマウント
 *   trans_r()  … Live<Date> から各表示文字列を派生
 *   style バインド … フルスクリーンボタン押下で文字サイズを Live で切り替え
 */

import { Live, df, ef, add } from "../js-out-1/Meh/Meh.js" ;

/* ------------------------------------------------------------------ */
/* モデル                                                               */
/* ------------------------------------------------------------------ */

const now        = Live( new Date() ) ;     // Live<Date> : 毎秒更新
const fullscreen = Live( false ) ;          // Live<boolean> : 全画面状態

/* 毎秒 now を更新 */
setInterval( () => { now.$ = new Date() ; } , 1000 ) ;

/* FullscreenAPI と Live<boolean> を同期 */
document.addEventListener( "fullscreenchange", () => {
    fullscreen.$ = !! document.fullscreenElement ;
}) ;

/* ------------------------------------------------------------------ */
/* now から各表示値を派生（Live.trans_r）                               */
/* ------------------------------------------------------------------ */

const dispHH   = now.trans_r( d => df( "hh", d ) ) ;   // "23"
const dispMM   = now.trans_r( d => df( "mm", d ) ) ;   // "59"
const dispSS   = now.trans_r( d => df( "ss", d ) ) ;   // "07"
const dispDate = now.trans_r( d => df( "YYYY年MM月DD日", d ) ) ;
const dispYobi = now.trans_r( d => df( "B", d ) ) ;    // "月"

/* 秒の偶奇でコロンを点滅 */
const colonVis = now.trans_r( d => d.getSeconds() % 2 === 0 ? "1" : "0.15" ) ;

/* ------------------------------------------------------------------ */
/* CSS                                                                  */
/* ------------------------------------------------------------------ */

const css = new CSSStyleSheet() ;
css.replaceSync(`
    :host {
        display: flex ;
        flex-direction: column ;
        align-items: center ;
        justify-content: center ;
        width: 100vw ;
        height: 100vh ;
        background: #0a0a0a ;
        color: #e8e8e8 ;
        font-family: 'Courier New', 'Consolas', monospace ;
        user-select: none ;
        position: relative ;
    }

    /* ── 日付エリア ── */
    .date-row {
        display: flex ;
        align-items: baseline ;
        gap: 0.5em ;
        margin-bottom: 0.4em ;
    }
    .date-text {
        font-size: clamp( 1.1rem, 3.2vw, 2.4rem ) ;
        font-weight: 300 ;
        letter-spacing: 0.15em ;
        color: #999 ;
    }
    .youbi {
        font-size: clamp( 1rem, 2.5vw, 1.9rem ) ;
        font-weight: 400 ;
        color: #666 ;
        letter-spacing: 0.1em ;
    }

    /* ── 時刻エリア ── */
    .time-row {
        display: flex ;
        align-items: center ;
        line-height: 1 ;
    }
    .hh, .mm, .ss-group {
        font-size: clamp( 4rem, 18vw, 16rem ) ;
        font-weight: 100 ;
        letter-spacing: -0.02em ;
    }
    .hh { color: #f0f0f0 ; }
    .mm { color: #c0c0c0 ; }

    .ss-group {
        display: flex ;
        flex-direction: column ;
        align-items: flex-start ;
        justify-content: flex-end ;
        padding-bottom: 0.06em ;
        margin-left: 0.12em ;
    }
    .ss-label {
        font-size: clamp( 0.7rem, 1.8vw, 1.4rem ) ;
        color: #555 ;
        letter-spacing: 0.2em ;
        font-weight: 400 ;
        margin-bottom: 0.2em ;
    }
    .ss {
        font-size: clamp( 1.8rem, 6vw, 5.5rem ) ;
        font-weight: 200 ;
        color: #888 ;
        letter-spacing: 0.02em ;
    }

    /* コロン */
    .colon {
        font-size: clamp( 3rem, 15vw, 13rem ) ;
        font-weight: 100 ;
        color: #888 ;
        margin: 0 0.05em ;
        transition: opacity 0.3s ;
        align-self: center ;
        line-height: 0.85 ;
    }

    /* ── 区切り線 ── */
    .divider {
        width: clamp( 180px, 40vw, 600px ) ;
        height: 1px ;
        background: linear-gradient( 90deg,
            transparent 0%,
            #444 20%,
            #444 80%,
            transparent 100%
        ) ;
        margin: 1.2em 0 0.8em ;
    }

    /* ── 秒のプログレスバー ── */
    .progress-track {
        width: clamp( 180px, 40vw, 600px ) ;
        height: 2px ;
        background: #1e1e1e ;
        border-radius: 1px ;
        overflow: hidden ;
        margin-bottom: 0.5em ;
    }
    .progress-bar {
        height: 100% ;
        background: #666 ;
        border-radius: 1px ;
        transition: width 0.9s linear ;
    }

    /* ── ミリ秒 ── */
    .ms-row {
        font-size: clamp( 0.7rem, 1.6vw, 1.2rem ) ;
        color: #3a3a3a ;
        letter-spacing: 0.3em ;
        font-weight: 400 ;
        margin-top: 0.3em ;
    }

    /* ── コントロール ── */
    .controls {
        position: absolute ;
        bottom: 1.5rem ;
        right: 1.5rem ;
        display: flex ;
        gap: 0.6rem ;
    }
    .ctrl-btn {
        background: transparent ;
        border: 1px solid #333 ;
        color: #555 ;
        font-size: 0.78rem ;
        letter-spacing: 0.1em ;
        padding: 0.4rem 0.8rem ;
        border-radius: 4px ;
        cursor: pointer ;
        font-family: inherit ;
        transition: border-color 0.15s, color 0.15s ;
    }
    .ctrl-btn:hover {
        border-color: #888 ;
        color: #bbb ;
    }
    .ctrl-btn.active {
        border-color: #aaa ;
        color: #ddd ;
    }
`) ;

/* ------------------------------------------------------------------ */
/* ミリ秒 & プログレスバー（setInterval 100ms で更新）                  */
/* ------------------------------------------------------------------ */

const dispMs       = Live( "000" ) ;
const progressPct  = Live( "0%" ) ;

setInterval( () => {
    const d   = new Date() ;
    const ms  = d.getMilliseconds() ;
    const sec = d.getSeconds() ;
    dispMs.$      = String( ms ).padStart( 3, "0" ) ;
    progressPct.$ = ( ( sec * 1000 + ms ) / 60000 * 100 ).toFixed( 2 ) + "%" ;
} , 50 ) ;

/* ------------------------------------------------------------------ */
/* フルスクリーン トグル                                                 */
/* ------------------------------------------------------------------ */

function toggleFullscreen() {
    if ( ! document.fullscreenElement ) {
        document.documentElement.requestFullscreen() ;
    } else {
        document.exitFullscreen() ;
    }
}

/* ------------------------------------------------------------------ */
/* DOM ツリー                                                            */
/* ------------------------------------------------------------------ */

const app = ef.div(
    { shadow: css } ,

    /* 日付行 */
    ef.div(
        { class: "date-row" } ,
        ef.span( { class: "date-text" } , dispDate ) ,
        ef.span( { class: "youbi" } , "（" , dispYobi , "）" ) ,
    ) ,

    /* 時刻行：hh : mm  [ss] */
    ef.div(
        { class: "time-row" } ,

        ef.span( { class: "hh" } , dispHH ) ,

        ef.span( { class: "colon", style: { opacity: colonVis } } , ":" ) ,

        ef.span( { class: "mm" } , dispMM ) ,

        ef.div(
            { class: "ss-group" } ,
            ef.span( { class: "ss-label" } , "SEC" ) ,
            ef.span( { class: "ss" }       , dispSS ) ,
        ) ,
    ) ,

    /* 区切り線 */
    ef.div( { class: "divider" } ) ,

    /* プログレスバー（分内の経過割合） */
    ef.div(
        { class: "progress-track" } ,
        ef.div( {
            class: "progress-bar" ,
            style: { width: progressPct } ,
        }) ,
    ) ,

    /* ミリ秒 */
    ef.div( { class: "ms-row" } , "." , dispMs ) ,

    /* コントロール */
    ef.div(
        { class: "controls" } ,
        ef.button(
            {
                class: { "ctrl-btn": true, active: fullscreen } ,
                active: { click: () => toggleFullscreen() } ,
            } ,
            "[ FULLSCREEN ]" ,
        ) ,
    ) ,
) ;

/* ------------------------------------------------------------------ */
/* マウント                                                              */
/* ------------------------------------------------------------------ */

add( app, document.body ) ;
