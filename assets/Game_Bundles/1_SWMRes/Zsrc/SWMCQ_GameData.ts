
export default class GameData2 {
    public static LoadScene = "";
    private static _instance: GameData2 = null;
    public static get Instance(): GameData2 {
        if (!this._instance) {
            this.ReadData();
        }
        return this._instance;
    }
    public get Datas() {
        return this.datas;
    }
    public set Datas(value: number[]) {
        this.datas = value;
        GameData2.DataSave();
    }
    public get Upgrades(): Map<string, (number | boolean | string)[]> {
        return this.upgrades;
    }
    public set Upgrades(value: Map<string, (number | boolean | string)[]>) {
        this.upgrades = value;
        GameData2.DataSave();
    }
    public get Tutorial(): boolean {
        return this.tutorial;
    }

    public set Tutorial(value: boolean) {
        this.tutorial = value;
        GameData2.DataSave();
    }

    private tutorial = false;

    private datas = [0, 1, 0, 120, 7];

    private upgrades = new Map([
        ["assistant", [2100, false, "培训你的店员，更快补充配料。"],],
        ["knife", [525, false, "一把更好的刀，帮你更快地切沙威玛。"]],
        ["grenadine", [975, false, "沙威玛里加一点石榴糖浆，会更美味！"]],
        ["tea", [225, false, "凉爽且清新的菊花茶，非常适合在炎热的夏天来一杯。"]],
        ["banana", [750, false, "丰富你的菜单，这是美味的香蕉"]],
        ["cake", [650, false, "更好的面饼，提高价格"]],
        ["package", [1200, false, "再也不需要手动去包装了，这台机器会帮你"]],
        ["sandwich", [250, false, "更好的配料，提高价格"]],
        ["price", [3100, false, "更好的包装，提高价格"]],
        ["drinksMach", [525, false, "吃完沙威玛后再来一杯爽口的气泡饮料"]],
        ["fryMach", [1000, false, "炸薯条花太长时间了吗？试试这个！"]],
        ["frenchFry", [1800, false, "法式炸薯条，与沙威玛搭配会更美味。"]],
        ["potato", [150, false, "更快地切土豆"]],
        ["4thGuest", [1850, false, "扩展你的餐厅，能够容纳第四名顾客"]],
        ["wall", [1800, false, "现在的墙壁有些破旧了，让我们修理一下，顺便提高沙威玛的价格"]],
        ["iron", [375, false, "烤过的沙威玛更加美味，并且可以提高价格"]],
        ["punch", [750, false, "当你的客人感到不耐烦时，可以让他们感受一下你沙包那么大的拳头。"]]
    ]);

    private jsonUpgrades;

    public static DataSave() {
        GameData2.Instance.jsonUpgrades = Object.fromEntries(GameData2.Instance.upgrades.entries());
        let json = JSON.stringify(GameData2.Instance);
        localStorage.setItem("GameData", json);
        console.log("游戏存档");
    }
    public static ReadData() {
        let name = localStorage.getItem("GameData");
        if (name != "" && name != null && name != undefined) {
            GameData2._instance = Object.assign(new GameData2(), JSON.parse(name));
            GameData2.Instance.Upgrades = new Map(Object.entries(GameData2.Instance.jsonUpgrades));
            console.log(GameData2.Instance.Upgrades);

        } else {
            GameData2._instance = new GameData2();
        }
    }

    /**
     * Returns a floating-point random number between min (inclusive) and max (exclusive).
     *
     * @method randomRange
     * @param {number} min
     * @param {number} max
     * @return {number} the random number
     */
    static randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Clamps a value between a minimum float and maximum float value.
     *
     * @method clamp
     * @param {number} val
     * @param {number} min
     * @param {number} max
     * @return {number}
     */
    static clamp(val, min, max) {
        console.log(val < min);
        console.log(max < val);
        var num = val < min ? min : (val > max ? max : val);
        console.log(num);
        return val < min ? min : (val > max ? max : val);
    }
}

export enum Upgrades {
    assistant = "assistant",
    knife = "knife",
    grenadine = "grenadine",
    tea = "tea",
    banana = "banana",
    cake = "cake",
    package = "package",
    sandwich = "sandwich",
    price = "price",
    kobe = "kobe",
    drinksMach = "drinksMach",
    grill = "grill",
    fryMach = "fryMach",
    frenchFry = "frenchFry",
    potato = "potato",
    FthGuest = "4thGuest",
    wall = "wall",
    iron = "iron",
    punch = "punch"
}
