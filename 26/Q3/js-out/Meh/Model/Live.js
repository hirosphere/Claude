import { lf_refs, lf_sub, lf_agg, lf_term, lv_get, lv_set, agg_echan } from "./symbols.js";
import { Life } from "./Life.js";
const log = console.log;
export var Live;
(function (Live) {
    /** リードオンリー用の基底インターフェース */
    /** * Leaf の生成 **/
    Live.create = (iniv, agg) => {
        return new Live.Leaf(iniv, agg);
    };
    Live.sub = (liv, ref) => {
        liv[lf_sub](ref);
    };
    /** * 値の取得 **/
    Live.get = (liv) => {
        return liv[lv_get]();
    };
    /** * 値の設定 **/
    Live.set = (liv, new_v, agg) => {
        liv[lv_set](new_v, agg);
    };
    /** 値の加工 */
    Live.mute = (liv, fn) => {
        liv[lv_set](fn(liv[lv_get]()));
    };
    /** * 変換 Live の生成 */
    Live.trans = (source, tr) => {
        return new Live.Trans(source, typeof tr == "function" ? { get: tr } : tr);
    };
})(Live || (Live = {}));
(function (Live) {
    /**
     * 	リアクティブステートモデルの基底クラス。
     *  値の変更を ref に通知。
     */
    class Base extends Life {
        /**
         *   値を設定する基底メソッド。 変更を refs に vchan として通知。
         * 	 changer が agg と異なれば agg にも通知。
         */
        [lv_set](new_v, changer) {
            this[lf_refs].forEach(ref => ref.vchan(new_v));
            if (changer != this[lf_agg]) {
                this[lf_agg]?.[agg_echan]?.();
            }
        }
        /** ref を追加して、ref に最初の変更通知。 */
        [lf_sub](ref) {
            super[lf_sub](ref);
            ref.vchan(this[lv_get]());
        }
    }
    Live.Base = Base;
    /** -- -- -- -- -- -- -- -- -- -- */
    /**
     *  class Leaf < V >
     *
     *  V型の値の実体を保持する、ステート構造の末端になるクラス。
     *  ( Entity => Leaf に改名 )
     */
    const leaf_val = Symbol();
    class Leaf extends Base {
        [leaf_val];
        constructor(iv, agg) {
            super(agg);
            this[leaf_val] = iv;
        }
        /** 値設定の実装 */
        [lv_set](new_v, agg) {
            if (new_v === this[leaf_val])
                return;
            this[leaf_val] = new_v;
            super[lv_set](new_v, agg);
        }
        /** 値取得の実装 */
        [lv_get]() {
            return this[leaf_val];
        }
    }
    Live.Leaf = Leaf;
    /**
     *  class Trans
     *
     * 	変換関数 fn を用い、 source の変換値の変更通知と読み書きを提供。
     *  source 数値の 0 ~ 1 を、文字列の "0%" ~ "100%" などの変換につかう。
     */
    class Trans extends Base {
        source;
        fn;
        constructor(source, fn) {
            super();
            this.source = source;
            this.fn = fn;
            const ref = {
                vchan: new_v => {
                    super[lv_set](this.fn.get(new_v));
                },
                unsub: () => this[lf_term](),
            };
            source[lf_sub](ref);
        }
        /** source からの変換値を提供 */
        [lv_get]() {
            return this.fn.get(this.source[lv_get]());
        }
        /** 値を source の型に変換して source を更新 */
        [lv_set](new_v, changer) {
            super[lv_set](new_v, changer);
            if (this.fn.set) {
                this.source[lv_set](this.fn.set(new_v));
            }
        }
    }
    Live.Trans = Trans;
})(Live || (Live = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3RzLXNyYy9NZWgvTW9kZWwvTGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRyxNQUFNLEVBQUcsT0FBTyxFQUFHLE1BQU0sRUFBRyxNQUFNLEVBQUUsU0FBUyxFQUFFLE1BQU0sY0FBYyxDQUFFO0FBQ2hHLE9BQU8sRUFBRSxJQUFJLEVBQVEsTUFBTSxXQUFXLENBQUU7QUFFeEMsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBRTtBQVN6QixNQUFNLEtBQVcsSUFBSSxDQThEcEI7QUE5REQsV0FBaUIsSUFBSTtJQUVwQiwwQkFBMEI7SUFnQjFCLGtCQUFrQjtJQUVMLFdBQU0sR0FBRyxDQUFRLElBQVEsRUFBRyxHQUFXLEVBQWdCLEVBQUU7UUFFckUsT0FBTyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUcsSUFBSSxFQUFHLEdBQUcsQ0FBRSxDQUFFO0lBQ3RDLENBQUMsQ0FBQTtJQUVZLFFBQUcsR0FBRyxDQUFRLEdBQTZCLEVBQUcsR0FBb0IsRUFBVSxFQUFFO1FBRTFGLEdBQUcsQ0FBRyxNQUFNLENBQUUsQ0FBRyxHQUFHLENBQUUsQ0FBRTtJQUN6QixDQUFDLENBQUE7SUFFRCxjQUFjO0lBRUQsUUFBRyxHQUFHLENBQVEsR0FBa0IsRUFBTyxFQUFFO1FBRXJELE9BQU8sR0FBRyxDQUFHLE1BQU0sQ0FBRSxFQUFHLENBQUU7SUFDM0IsQ0FBQyxDQUFBO0lBRUQsY0FBYztJQUVELFFBQUcsR0FBRyxDQUFRLEdBQWdCLEVBQUcsS0FBUyxFQUFHLEdBQVcsRUFBVSxFQUFFO1FBRWhGLEdBQUcsQ0FBRyxNQUFNLENBQUUsQ0FBRyxLQUFLLEVBQUcsR0FBRyxDQUFFLENBQUU7SUFDakMsQ0FBQyxDQUFBO0lBRUQsV0FBVztJQUVFLFNBQUksR0FBRyxDQUFRLEdBQWdCLEVBQUcsRUFBcUIsRUFBVSxFQUFF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