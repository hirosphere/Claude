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
import { Life, monitor } from "../Meh/Model/Life.js";
import { lf_sub, lf_unsub, lf_term } from "../Meh/Model/symbols.js";
// ─── ユーティリティ ────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
function assert(label, cond) {
    if (cond) {
        console.log(`  ✅ PASS : ${label}`);
        passed++;
    }
    else {
        console.error(`  ❌ FAIL : ${label}`);
        failed++;
    }
}
function section(title) {
    console.log(`\n── ${title} ──`);
}
// ─── テスト開始 ───────────────────────────────────────────────────────────────
console.log("=== Life.ts テスト ===");
// ─── 1. インスタンス生成と RU ──────────────────────────────────────────────────
section("1. インスタンス生成と RU");
const beforeNext = monitor.next_ru;
const lf1 = new Life();
const lf2 = new Life();
assert("new Life() ごとに next_ru が増加する", monitor.next_ru === beforeNext + 2);
const ru1 = Life.ru(lf1);
const ru2 = Life.ru(lf2);
assert("Life.ru() は文字列を返す", typeof ru1 === "string");
assert("異なるインスタンスは異なる RU を持つ", ru1 !== ru2);
assert("RU は 'RU_' プレフィックスを持つ", ru1.startsWith("RU_"));
// ─── 2. monitor.balance ────────────────────────────────────────────────────────
section("2. monitor.balance（生成時にインクリメント）");
const balBefore = monitor.balance;
const lf3 = new Life();
assert("生成で balance が +1 される", monitor.balance === balBefore + 1);
// ─── 3. sub : Ref の登録 ──────────────────────────────────────────────────────
section("3. sub : Ref の登録");
let ltermCalled = false;
const ref1 = { unsub() { ltermCalled = true; } };
lf1[lf_sub](ref1);
assert("sub 直後は lterm が呼ばれていない", !ltermCalled);
// ─── 4. unsub : Ref の削除 ────────────────────────────────────────────────────
section("4. unsub : Ref の削除");
lf1[lf_unsub](ref1);
assert("unsub で ref の lterm() が呼ばれる", ltermCalled);
// unsub 後に再度 unsub しても例外が出ないことを確認
let threw = false;
try {
    lf1[lf_unsub](ref1);
}
catch {
    threw = true;
}
assert("未登録 ref を unsub しても例外が出ない", !threw);
// ─── 5. terminate : 全 Ref への通知 ──────────────────────────────────────────
section("5. terminate : 全 Ref への通知");
const called = [];
const refA = { unsub() { called.push("A"); } };
const refB = { unsub() { called.push("B"); } };
const refC = {}; // lterm 未定義
lf2[lf_sub](refA);
lf2[lf_sub](refB);
lf2[lf_sub](refC);
const balBeforeTerminate = monitor.balance;
lf2[lf_term]();
assert("terminate で refA.lterm() が呼ばれる", called.includes("A"));
assert("terminate で refB.lterm() が呼ばれる", called.includes("B"));
assert("lterm 未定義の ref でも例外が出ない", !threw);
assert("terminate で balance が -1 される", monitor.balance === balBeforeTerminate - 1);
// terminate 後に再度 terminate しても refs は空なので何も起きない
const balAfterTerminate = monitor.balance;
lf2[lf_term]();
assert("terminate 後の再 terminate は balance を変えない", monitor.balance === balAfterTerminate - 1);
// ─── 6. lterm 未定義 Ref の sub / terminate ───────────────────────────────────
section("6. lterm 未定義の Ref");
const lf4 = new Life();
const refNoLterm = {};
lf4[lf_sub](refNoLterm);
let threwNoLterm = false;
try {
    lf4[lf_term]();
}
catch {
    threwNoLterm = true;
}
assert("lterm 未定義 ref を terminate しても例外が出ない", !threwNoLterm);
// ─── 結果サマリー ────────────────────────────────────────────────────────────
console.log(`\n=== 結果 : ${passed} passed / ${failed} failed ===\n`);
// if ( failed > 0 ) process.exit ( 1 ) ;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGlmZS50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdHMtc3JjL3ExL0xpZmUudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7O0dBWUc7QUFFSCxPQUFPLEVBQUUsSUFBSSxFQUFHLE9BQU8sRUFBRSxNQUFNLHNCQUFzQixDQUFFO0FBQ3ZELE9BQU8sRUFBRSxNQUFNLEVBQUcsUUFBUSxFQUFHLE9BQU8sRUFBRSxNQUFNLHlCQUF5QixDQUFFO0FBRXZFLDJFQUEyRTtBQUUzRSxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUU7QUFDaEIsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFFO0FBRWhCLFNBQVMsTUFBTSxDQUFHLEtBQWMsRUFBRyxJQUFjO0lBRWhELElBQUssSUFBSSxFQUNULENBQUM7UUFDQSxPQUFPLENBQUMsR0FBRyxDQUFHLGNBQWUsS0FBTSxFQUFFLENBQUUsQ0FBRTtRQUN6QyxNQUFNLEVBQUcsQ0FBRTtJQUNaLENBQUM7U0FFRCxDQUFDO1FBQ0EsT0FBTyxDQUFDLEtBQUssQ0FBRyxjQUFlLEtBQU0sRUFBRSxDQUFFLENBQUU7UUFDM0MsTUFBTSxFQUFHLENBQUU7SUFDWixDQUFDO0FBQ0YsQ0FBQztBQUVELFNBQVMsT0FBTyxDQUFHLEtBQWM7SUFFaEMsT0FBTyxDQUFDLEdBQUcsQ0FBRyxRQUFTLEtBQU0sS0FBSyxDQUFFLENBQUU7QUFDdkMsQ0FBQztBQUVELDRFQUE0RTtBQUU1RSxPQUFPLENBQUMsR0FBRyxDQUFHLHFCQUFxQixDQUFFLENBQUU7QUFFdkMseUVBQXlFO0FBRXpFLE9BQU8sQ0FBRyxpQkFBaUIsQ0FBRSxDQUFFO0FBRS9CLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUU7QUFDcEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxJQUFJLEVBQUcsQ0FBRTtBQUN6QixNQUFNLEdBQUcsR0FBRyxJQUFJLElBQUksRUFBRyxDQUFFO0FBRXpCLE1BQU0sQ0FBRyw4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