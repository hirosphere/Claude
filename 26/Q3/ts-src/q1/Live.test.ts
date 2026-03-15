/**
 * Live.ts テストコード
 *
 * テスト対象：
 *   - Live.Entity の基本動作（初期値・値の取得/設定）
 *   - lf_sub による Ref 登録と即時通知（vchan）
 *   - lf_unsub による Ref 解除（unsub コールバック）
 *   - lf_term による全 Ref への終了通知
 *   - 同値再セット時の無通知（最適化）
 *   - 複数 Ref への同時通知
 *   - Live.get / Live.set ヘルパー
 *   - Agg 連携（agg_echan の呼び出し）
 *
 * 実行方法：
 *   npx tsx q1/Live.test.ts
 */

import { Life , Agg }       from "../Meh/Model/Life.js" ;
import { Live }             from "../Meh/Model/Live.js" ;
import { lf_sub , lf_unsub , lf_term , lf_agg , lv_get , lv_set , agg_echan } from "../Meh/Model/symbols.js" ;

// ─── ユーティリティ ────────────────────────────────────────────────────────────

let passed = 0 ;
let failed = 0 ;

function assert ( label : string , cond : boolean ) : void
{
	if ( cond )
	{
		console.log ( `  ✅ PASS : ${ label }` ) ;
		passed ++ ;
	}
	else
	{
		console.error ( `  ❌ FAIL : ${ label }` ) ;
		failed ++ ;
	}
}

function section ( title : string ) : void
{
	console.log ( `\n── ${ title } ──` ) ;
}

/** テスト用のシンプルな Live.Ref 実装 */
function makeRef < V > () : Live.Ref < V > & { values : V [] , unsubCalled : boolean }
{
	return {
		values      : [] ,
		unsubCalled : false ,
		vchan ( v : V ) { this.values.push ( v ) ; } ,
		unsub ()       { this.unsubCalled = true ; } ,
	} ;
}

/** テスト用の Agg 実装 */
function makeAgg () : Agg & { count : number }
{
	return {
		count : 0 ,
		[ agg_echan ] () { this.count ++ ; } ,
	} ;
}

// ─── テスト開始 ───────────────────────────────────────────────────────────────

console.log ( "=== Live.ts テスト ===" ) ;

// ─── 1. Entity 初期値 ─────────────────────────────────────────────────────────

section ( "1. Live.Entity 初期値" ) ;

const e1 = new Live.Entity < number > ( 42 ) ;

assert ( "lv_get() で初期値を取得できる"       , e1 [ lv_get ] () === 42 ) ;
assert ( "Live.get() でも初期値を取得できる"   , Live.get ( e1 )  === 42 ) ;

const e2 = new Live.Entity < string > ( "hello" ) ;
assert ( "文字列型の初期値を取得できる"        , Live.get ( e2 ) === "hello" ) ;

const e3 = new Live.Entity < null > ( null ) ;
assert ( "null を初期値にできる"               , Live.get ( e3 ) === null ) ;

// ─── 2. lf_sub : 登録直後に現在値が vchan される ──────────────────────────────

section ( "2. lf_sub : 登録直後の即時通知" ) ;

const e4   = new Live.Entity < number > ( 10 ) ;
const ref1 = makeRef < number > () ;

e4 [ lf_sub ] ( ref1 ) ;

assert ( "sub 直後に vchan が 1 回呼ばれる"          , ref1.values.length === 1 ) ;
assert ( "sub 直後の vchan 値が現在値と一致する"     , ref1.values [ 0 ] === 10 ) ;
assert ( "sub 直後は unsub が呼ばれていない"         , ! ref1.unsubCalled ) ;

// ─── 3. lv_set : 値変更と通知 ────────────────────────────────────────────────

section ( "3. lv_set : 値変更と Ref への通知" ) ;

e4 [ lv_set ] ( 20 ) ;

assert ( "set 後に vchan が追加で呼ばれる"           , ref1.values.length === 2 ) ;
assert ( "set 後の vchan 値が新しい値と一致する"     , ref1.values [ 1 ] === 20 ) ;
assert ( "lv_get() が新しい値を返す"                 , e4 [ lv_get ] () === 20 ) ;
assert ( "Live.get() も新しい値を返す"               , Live.get ( e4 )  === 20 ) ;

// ─── 4. 同値再セット時は通知しない ───────────────────────────────────────────

section ( "4. 同値再セットは通知しない（Entity の最適化）" ) ;

const before = ref1.values.length ;
e4 [ lv_set ] ( 20 ) ; // 同じ値
assert ( "同値の set では vchan が増えない"          , ref1.values.length === before ) ;

// ─── 5. Live.set ヘルパー ────────────────────────────────────────────────────

section ( "5. Live.set ヘルパー" ) ;

Live.set ( e4 , 99 ) ;
assert ( "Live.set() で値が変更される"               , Live.get ( e4 ) === 99 ) ;
assert ( "Live.set() 後に vchan が呼ばれる"          , ref1.values [ ref1.values.length - 1 ] === 99 ) ;

// ─── 6. 複数 Ref への同時通知 ────────────────────────────────────────────────

section ( "6. 複数 Ref への同時通知" ) ;

const e5   = new Live.Entity < string > ( "a" ) ;
const refA = makeRef < string > () ;
const refB = makeRef < string > () ;

e5 [ lf_sub ] ( refA ) ;
e5 [ lf_sub ] ( refB ) ;

e5 [ lv_set ] ( "b" ) ;

assert ( "refA に値変更が通知される"                 , refA.values.includes ( "b" ) ) ;
assert ( "refB に値変更が通知される"                 , refB.values.includes ( "b" ) ) ;

// ─── 7. lf_unsub : Ref の解除 ────────────────────────────────────────────────

section ( "7. lf_unsub : Ref の解除" ) ;

e5 [ lf_unsub ] ( refA ) ;

assert ( "unsub で ref.unsub() が呼ばれる"           , refA.unsubCalled ) ;

const lenBeforeSet = refA.values.length ;
e5 [ lv_set ] ( "c" ) ;

assert ( "unsub 後は解除された ref に通知されない"   , refA.values.length === lenBeforeSet ) ;
assert ( "unsub されていない refB には通知が届く"    , refB.values.includes ( "c" ) ) ;

// ─── 8. lf_term : 全 Ref への終了通知 ────────────────────────────────────────

section ( "8. lf_term : 全 Ref への終了通知" ) ;

const e6   = new Live.Entity < number > ( 0 ) ;
const refC = makeRef < number > () ;
const refD = makeRef < number > () ;

e6 [ lf_sub ] ( refC ) ;
e6 [ lf_sub ] ( refD ) ;

e6 [ lf_term ] () ;

assert ( "term で refC.unsub() が呼ばれる"           , refC.unsubCalled ) ;
assert ( "term で refD.unsub() が呼ばれる"           , refD.unsubCalled ) ;

// term 後は refs が空なので set しても何も起きない
let threwAfterTerm = false ;
try { e6 [ lv_set ] ( 999 ) ; }
catch { threwAfterTerm = true ; }
assert ( "term 後に lv_set しても例外が出ない"       , ! threwAfterTerm ) ;

// ─── 9. Agg 連携 ─────────────────────────────────────────────────────────────

section ( "9. Agg 連携（agg_echan の呼び出し）" ) ;

const e7  = new Live.Entity < number > ( 1 ) ;
const agg = makeAgg () ;

// lf_agg をセットする
e7 [ lf_agg ] = agg ;

e7 [ lv_set ] ( 2 , agg ) ;
assert ( "set 時に agg_echan が 1 回呼ばれる"        , agg.count === 1 ) ;

e7 [ lv_set ] ( 3 , agg ) ;
assert ( "set のたびに agg_echan が呼ばれる"         , agg.count === 2 ) ;

// agg が一致しない場合は agg_echan が呼ばれない
const otherAgg = makeAgg () ;
e7 [ lv_set ] ( 4 , otherAgg ) ;
assert ( "異なる agg インスタンスでは agg_echan が呼ばれない" , agg.count === 2 ) ;

// ─── 10. unsub 未定義 Ref ─────────────────────────────────────────────────────

section ( "10. unsub 未定義の Ref" ) ;

const e8 = new Live.Entity < boolean > ( false ) ;
const refNoUnsub : Live.Ref < boolean > = { vchan () {} } ; // unsub なし

e8 [ lf_sub ] ( refNoUnsub ) ;

let threwNoUnsub = false ;
try { e8 [ lf_term ] () ; }
catch { threwNoUnsub = true ; }
assert ( "unsub 未定義の Ref を term しても例外が出ない" , ! threwNoUnsub ) ;

// ─── 結果サマリー ────────────────────────────────────────────────────────────

console.log ( `\n=== 結果 : ${ passed } passed / ${ failed } failed ===\n` ) ;

// if ( failed > 0 ) process.exit ( 1 ) ;
