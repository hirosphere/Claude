(x) => x.valueAsNumber + 555;
export var pl;
(function (pl) {
    pl.key = (key, createNode) => new PartsPlace.Key(key, createNode);
    pl.each = (model, createNode) => new PartsPlace.Each(model, createNode);
})(pl || (pl = {}));
export class PartsPlace {
    #_typetag = plTag;
}
const plTag = Symbol();
(function (PartsPlace) {
    class Key extends PartsPlace {
        key;
        createNode;
        constructor(key, createNode) {
            super();
            this.key = key;
            this.createNode = createNode;
        }
    }
    PartsPlace.Key = Key;
    class Each extends PartsPlace {
        model;
        createNode;
        constructor(model, createNode) {
            super();
            this.model = model;
            this.createNode = createNode;
        }
    }
    PartsPlace.Each = Each;
})(PartsPlace || (PartsPlace = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiREQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90cy1zcmMvTWVoL0RPTS9ERC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUEyRUEsQ0FBRSxDQUFvQixFQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBYSxHQUFHLEdBQUcsQ0FBRTtBQTRDbkQsTUFBTSxLQUFXLEVBQUUsQ0FlbEI7QUFmRCxXQUFpQixFQUFFO0lBRUwsTUFBRyxHQUFHLENBRWxCLEdBQWdCLEVBQ2hCLFVBQTRDLEVBRTNDLEVBQUUsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUcsR0FBRyxFQUFHLFVBQVUsQ0FBRSxDQUFBO0lBRS9CLE9BQUksR0FBRyxDQUVuQixLQUFrQixFQUNsQixVQUFnRCxFQUUvQyxFQUFFLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFHLEtBQUssRUFBRyxVQUFVLENBQUUsQ0FBRTtBQUNsRCxDQUFDLEVBZmdCLEVBQUUsS0FBRixFQUFFLFFBZWxCO0FBRUQsTUFBTSxPQUFnQixVQUFVO0lBRS9CLFNBQVMsR0FBRyxLQUFLLENBQUU7Q0FDbkI7QUFFRCxNQUFNLEtBQUssR0FBRyxNQUFNLEVBQUcsQ0FBRTtBQUV6QixXQUFpQixVQUFVO0lBRTFCLE1BQWEsR0FBVSxTQUFRLFVBQVU7UUFJdkI7UUFDQTtRQUhqQixZQUVpQixHQUFnQixFQUNoQixVQUE0QztZQUUzRCxLQUFLLEVBQUcsQ0FBRTtZQUhLLFFBQUcsR0FBSCxHQUFHLENBQWE7WUFDaEIsZUFBVSxHQUFWLFVBQVUsQ0FBa0M7UUFFaEQsQ0FBQztLQUNkO0lBUlksY0FBRyxNQVFmLENBQUE7SUFFRCxNQUFhLElBQVcsU0FBUSxVQUFVO1FBSXhCO1FBQ0E7UUFIakIsWUFFaUIsS0FBa0IsRUFDbEIsVUFBdUQ7WUFFdEUsS0FBSyxFQUFHLENBQUU7WUFISyxVQUFLLEdBQUwsS0FBSyxDQUFhO1lBQ2xCLGVBQVUsR0FBVixVQUFVLENBQTZDO1FBRTNELENBQUM7S0FDZDtJQVJZLGVBQUksT0FRaEIsQ0FBQTtBQUNGLENBQUMsRUFyQmdCLFVBQVUsS0FBVixVQUFVLFFBcUIxQiJ9