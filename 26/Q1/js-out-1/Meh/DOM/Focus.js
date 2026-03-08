/* Renn の Order をキーとした選択・フォーカスシステム */
const ud = undefined;
class RennSelector {
    curr;
    constructor(curr) {
        this.curr = curr;
    }
    set(o = ud) {
        this.curr.$ = o;
    }
}
class Item {
    constructor() { }
    keydown() { }
}
export {};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRm9jdXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90cy1zcmMvTWVoL0RPTS9Gb2N1cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxxQ0FBcUM7QUFLckMsTUFBTSxFQUFFLEdBQUcsU0FBUyxDQUFFO0FBRXRCLE1BQU0sWUFBWTtJQUlBO0lBRmpCLFlBRWlCLElBQWdDO1FBQWhDLFNBQUksR0FBSixJQUFJLENBQTRCO0lBRWhELENBQUM7SUFFSyxHQUFHLENBQUcsSUFBdUIsRUFBRTtRQUVyQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUU7SUFDbEIsQ0FBQztDQUNEO0FBRUQsTUFBTSxJQUFJO0lBRVQsZ0JBRUMsQ0FBQztJQUVRLE9BQU8sS0FBYyxDQUFDO0NBRWhDIn0=