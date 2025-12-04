export class DMM_DataManager {

    private static instance: DMM_DataManager;
    public static get Instance(): DMM_DataManager {
        if (!this.instance) {
            this.instance = new DMM_DataManager;
            this.instance.Init();
        }
        return this.instance;
    }

    static mapNames = ["AI山海经", "相亲大会", "伪装街2", "孤注陷阱", "尔滨一游", "洞房花烛", "西游", "网红街", "怀旧岁月", "雪地", "办公室", "穿越商·三国·宋", "外太空", "博物馆", "港街", "沙滩", "伪装街", "山海经1", "山海经2", "穿越大唐·白蛇", "奇妙动物园", "古画", "穿越水浒·明朝", "起居室", "街道", "宿舍", "穿越年夜饭", "穿越的婚礼", "穿越的中秋"];

    private Init() {
        // localStorage.clear();
        let array = ["Coin", "PlayerGroup"];
        for (let i = 0; i < array.length; i++) {
            const element = array[i];
            if (localStorage.getItem("GDDSCBASMR_" + element) == null || localStorage.getItem("GDDSCBASMR_" + element) == "") this.setNumberData(element, 0);
        }
        let array2 = ["PlayerGroups", "ShopItems"];
        for (let i = 0; i < array2.length; i++) {
            const element = array2[i];
            if (localStorage.getItem("GDDSCBASMR_" + element) == null || localStorage.getItem("GDDSCBASMR_" + element) == "") this.setArrayData(element, element == "PlayerGroups" ? [1, 0, 0] : []);
        }
    }

    public getNumberData(str: string): number {
        let data = localStorage.getItem("GDDSCBASMR_" + str);
        return parseInt(data);
    }

    public setNumberData(str: string, value: number) {
        localStorage.setItem("GDDSCBASMR_" + str, value.toString());
    }

    public getArrayData<T>(str: string): T[] {
        let data = localStorage.getItem("GDDSCBASMR_" + str);
        return JSON.parse(data);
    }

    public setArrayData<T>(str: string, value: T[]) {
        localStorage.setItem("GDDSCBASMR_" + str, JSON.stringify(value));
    }

    public getRecordData(str: string) {
        let data = localStorage.getItem("GDDSCBASMR_" + str);
        return JSON.parse(data);
    }

    public setRecordData(str: string, value: any) {
        localStorage.setItem("GDDSCBASMR_" + str, JSON.stringify(value));
    }

}


