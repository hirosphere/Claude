import { lf_refs, lf_sub, lf_agg, lv_get, lv_set, agg_echan } from "./symbols.js";
import { Life } from "./Life.js";
const log = console.log;
/**
 * 	リアクティブステートモデルの基底クラス。
 *  値の変更を ref に通知。
 */
const vchan = Symbol();
export class Live extends Life {
    /** 値をセットして、変更を refs と agg に通知。 */
    [lv_set](new_v, agg) {
        this[lf_refs].forEach(ref => ref.vchan(new_v));
        if (agg && agg == this[lf_agg])
            agg[agg_echan]();
    }
    /** ref を追加して、ref に最初の変更通知。 */
    [lf_sub](ref) {
        super[lf_sub](ref);
        ref.vchan(this[lv_get]());
    }
}
/** Live オブジェクトへのアクセサ */
(function (Live) {
    /** 値の取得 */
    Live.get = (lv) => {
        return lv[lv_get]();
    };
    Live.set = (lv, new_v, agg) => {
        lv[lv_set](new_v, agg);
    };
})(Live || (Live = {}));
(function (Live) {
    const val = Symbol();
    /**
     *  V型の値の実体を保持する、ステート構造の末端になるクラス。
     */
    class Entity extends Live {
        [val];
        constructor(iv) {
            super();
            this[val] = iv;
        }
        /** 値設定の実装 */
        [lv_set](new_v, agg) {
            if (new_v === this[val])
                return;
            this[val] = new_v;
            super[lv_set](new_v, agg);
        }
        /** 値取得の実装 */
        [lv_get]() {
            return this[val];
        }
    }
    Live.Entity = Entity;
})(Live || (Live = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3RzLXNyYy9NZWgvTW9kZWwvTGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRyxNQUFNLEVBQWEsTUFBTSxFQUFHLE1BQU0sRUFBRSxTQUFTLEVBQUUsTUFBTSxjQUFjLENBQUU7QUFDaEcsT0FBTyxFQUFFLElBQUksRUFBUSxNQUFNLFdBQVcsQ0FBRTtBQUV4QyxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFFO0FBR3pCOzs7R0FHRztBQUVILE1BQU0sS0FBSyxHQUFHLE1BQU0sRUFBRyxDQUFFO0FBRXpCLE1BQU0sT0FBZ0IsSUFBWSxTQUFRLElBQXVCO0lBT2hFLGtDQUFrQztJQUVsQyxDQUFFLE1BQU0sQ0FBRSxDQUFHLEtBQVMsRUFBRyxHQUFXO1FBRW5DLElBQUksQ0FBRyxPQUFPLENBQUUsQ0FBQyxPQUFPLENBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFHLEtBQUssQ0FBRSxDQUFFLENBQUU7UUFDekQsSUFBSyxHQUFHLElBQUksR0FBRyxJQUFJLElBQUksQ0FBRyxNQUFNLENBQUU7WUFBSSxHQUFHLENBQUcsU0FBUyxDQUFFLEVBQUcsQ0FBRTtJQUM3RCxDQUFDO0lBR0QsOEJBQThCO0lBRXJCLENBQUUsTUFBTSxDQUFFLENBQUcsR0FBb0I7UUFFekMsS0FBSyxDQUFHLE1BQU0sQ0FBRSxDQUFHLEdBQUcsQ0FBRSxDQUFFO1FBQzFCLEdBQUcsQ0FBQyxLQUFLLENBQUcsSUFBSSxDQUFHLE1BQU0sQ0FBRSxFQUFHLENBQUUsQ0FBRTtJQUNuQyxDQUFDO0NBQ0Q7QUFvQkQsd0JBQXdCO0FBRXhCLFdBQWlCLElBQUk7SUFFcEIsV0FBVztJQUVFLFFBQUcsR0FBRyxDQUFRLEVBQWlCLEVBQU8sRUFBRTtRQUVwRCxPQUFPLEVBQUUsQ0FBRyxNQUFNLENBQUUsRUFBRyxDQUFFO0lBQzFCLENBQUMsQ0FBQTtJQUVZLFFBQUcsR0FBRyxDQUFRLEVBQWUsRUFBRyxLQUFTLEVBQUcsR0FBVyxFQUFVLEVBQUU7UUFFL0UsRUFBRSxDQUFHLE1BQU0sQ0FBRSxDQUFHLEtBQUssRUFBRyxHQUFHLENBQUUsQ0FBRTtJQUNoQyxDQUFDLENBQUE7QUFDRixDQUFDLEVBYmdCLElBQUksS0FBSixJQUFJLFFBYXBCO0FBRUQsV0FBaUIsSUFBSTtJQUVwQixNQUFNLEdBQUcsR0FBRyxNQUFNLEVBQUcsQ0FBRTtJQUV2Qjs7T0FFRztJQUVILE1BQWEsTUFBYSxTQUFRLElBQVU7UUFFM0MsQ0FBRSxHQUFHLENBQUUsQ0FBTTtRQUViLFlBQWMsRUFBTTtZQUVuQixLQUFLLEVBQUcsQ0FBRTtZQUNWLElBQUksQ0FBRyxHQUFHLENBQUUsR0FBRyxFQUFFLENBQUU7UUFDcEIsQ0FBQztRQUVELGFBQWE7UUFFSixDQUFFLE1BQU0sQ0FBRSxDQUFHLEtBQVMsRUFBRyxHQUFXO1lBRTVDLElBQUssS0FBSyxLQUFLLElBQUksQ0FBRyxHQUFHLENBQUU7Z0JBQUksT0FBUTtZQUV2QyxJQUFJLENBQUcsR0FBRyxDQUFFLEdBQUcsS0FBSyxDQUFFO1lBQ3RCLEtBQUssQ0FBRyxNQUFNLENBQUUsQ0FBRyxLQUFLLEVBQUcsR0FBRyxDQUFFLENBQUU7UUFDbkMsQ0FBQztRQUVELGFBQWE7UUFFSixDQUFFLE1BQU0sQ0FBRTtZQUVsQixPQUFPLElBQUksQ0FBRyxHQUFHLENBQUUsQ0FBRTtRQUN0QixDQUFDO0tBQ0Q7SUExQlksV0FBTSxTQTBCbEIsQ0FBQTtBQUNGLENBQUMsRUFuQ2dCLElBQUksS0FBSixJQUFJLFFBbUNwQiJ9