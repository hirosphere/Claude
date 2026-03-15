/**
 * Life.ts テストコード
 *
 * テスト対象：
 *   - Life クラスの基本動作（sub / unsub / terminate）
 *   - Life.monitor による RU カウンター管理
 *   - Life.ru() によるランタイムユニーク値の取得
 *
 * 実行方法（Node.js + tsx の場合）：
 *   npx tsx q1/Life.test.ts
 *
 * ※ このテストは外部テストフレームワーク不要のシンプルなアサーション形式です。
 */

import { Life , monitor } from "../Meh/Model/Life.js" ;
import { lf_sub , lf_unsub , lf_term } from "../Meh/Model/symbols.js" ;

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

// ─── テスト開始 ───────────────────────────────────────────────────────────────

console.log ( "=== Life.ts テスト ===" ) ;

// ─── 1. インスタンス生成と RU ──────────────────────────────────────────────────

section ( "1. インスタンス生成と RU" ) ;

const beforeNext = monitor.next_ru ;
const lf1 = new Life () ;
const lf2 = new Life () ;

assert ( "new Life() ごとに next_ru が増加する" , monitor.next_ru === beforeNext + 2 ) ;

const ru1 = Life.ru ( lf1 ) ;
const ru2 = Life.ru ( lf2 ) ;

assert ( "Life.ru() は文字列を返す" , typeof ru1 === "string" ) ;
assert ( "異なるインスタンスは異なる RU を持つ" , ru1 !== ru2 ) ;
assert ( "RU は 'RU_' プレフィックスを持つ" , ru1.startsWith ( "RU_" ) ) ;

// ─── 2. monitor.balance ────────────────────────────────────────────────────────

section ( "2. monitor.balance（生成時にインクリメント）" ) ;

const balBefore = monitor.balance ;
const lf3 = new Life () ;
assert ( "生成で balance が +1 される" , monitor.balance === balBefore + 1 ) ;

// ─── 3. sub : Ref の登録 ──────────────────────────────────────────────────────

section ( "3. sub : Ref の登録" ) ;

let ltermCalled = false ;
const ref1 : Life.Ref = { unsub () { ltermCalled = true ; } } ;

lf1 [ lf_sub ] ( ref1 ) ;
assert ( "sub 直後は lterm が呼ばれていない" , ! ltermCalled ) ;

// ─── 4. unsub : Ref の削除 ────────────────────────────────────────────────────

section ( "4. unsub : Ref の削除" ) ;

lf1 [ lf_unsub ] ( ref1 ) ;
assert ( "unsub で ref の lterm() が呼ばれる" , ltermCalled ) ;

// unsub 後に再度 unsub しても例外が出ないことを確認
let threw = false ;
try
{
	lf1 [ lf_unsub ] ( ref1 ) ;
}
catch
{
	threw = true ;
}
assert ( "未登録 ref を unsub しても例外が出ない" , ! threw ) ;

// ─── 5. terminate : 全 Ref への通知 ──────────────────────────────────────────

section ( "5. terminate : 全 Ref への通知" ) ;

const called : string [] = [] ;

const refA : Life.Ref = { unsub () { called.push ( "A" ) ; } } ;
const refB : Life.Ref = { unsub () { called.push ( "B" ) ; } } ;
const refC : Life.Ref = {} ; // lterm 未定義

lf2 [ lf_sub ] ( refA ) ;
lf2 [ lf_sub ] ( refB ) ;
lf2 [ lf_sub ] ( refC ) ;

const balBeforeTerminate = monitor.balance ;
lf2 [ lf_term ] () ;

assert ( "terminate で refA.lterm() が呼ばれる" , called.includes ( "A" ) ) ;
assert ( "terminate で refB.lterm() が呼ばれる" , called.includes ( "B" ) ) ;
assert ( "lterm 未定義の ref でも例外が出ない" , ! threw ) ;
assert ( "terminate で balance が -1 される" , monitor.balance === balBeforeTerminate - 1 ) ;

// terminate 後に再度 terminate しても refs は空なので何も起きない
const balAfterTerminate = monitor.balance ;
lf2 [ lf_term ] () ;
assert ( "terminate 後の再 terminate は balance を変えない" , monitor.balance === balAfterTerminate - 1 ) ;

// ─── 6. lterm 未定義 Ref の sub / terminate ───────────────────────────────────

section ( "6. lterm 未定義の Ref" ) ;

const lf4 = new Life () ;
const refNoLterm : Life.Ref = {} ;
lf4 [ lf_sub ] ( refNoLterm ) ;

let threwNoLterm = false ;
try { lf4 [ lf_term ] () ; }
catch { threwNoLterm = true ; }

assert ( "lterm 未定義 ref を terminate しても例外が出ない" , ! threwNoLterm ) ;

// ─── 結果サマリー ────────────────────────────────────────────────────────────

console.log ( `\n=== 結果 : ${ passed } passed / ${ failed } failed ===\n` ) ;

// if ( failed > 0 ) process.exit ( 1 ) ;
