import { v3 } from "cc";

export class WGYQ_GameData {

    private static instance: WGYQ_GameData;
    public static get Instance(): WGYQ_GameData {
        if (!this.instance) {
            this.instance = new WGYQ_GameData;
            this.instance.Init();
        }
        return this.instance;
    }

    private Init() {
        let array = ["Coins", "Level", "Experience", "Hp", "HomeTutorial", "YardTutorial", "YardTutorial2", "BattleTutorial", "CurrentCar", "IsCatch", "Fence", "ZJZG", "DogNumber"];
        for (let i = 0; i < array.length; i++) {
            const element = array[i];
            if (localStorage.getItem("WGYQ_" + element) == null || localStorage.getItem("WGYQ_" + element) == "") localStorage.setItem("WGYQ_" + element, element == "Level" ? "1" : element == "Hp" ? "100" : element == "CurrentCar" ? "-1" : "0");
        }
        let array2 = ["DogHouse", "Dog", "Car", "Items", "BGDogs", "Shop", "Weapons", "Voucher", "Date"];
        for (let i = 0; i < array2.length; i++) {
            const element = array2[i];
            if (localStorage.getItem("WGYQ_" + element) == null || localStorage.getItem("WGYQ_" + element) == "") localStorage.setItem("WGYQ_" + element, JSON.stringify(element == "DogHouse" ? [v3(-1745, 1655)] : element == "Car" ? [0, 0, 0] : element == "Shop" ? [[1, 0, 0], [1, 0, 0], [1, 0, 0]] : element == "Weapons" || element == "Voucher" ? [0, 0, 0] : element == "Date" ? [[], [], [], []] : []));
        }
        let array3 = ["CurrentDog"];
        for (let i = 0; i < array3.length; i++) {
            const element = array3[i];
            if (localStorage.getItem("WGYQ_" + element) == null || localStorage.getItem("WGYQ_" + element) == "") localStorage.setItem("WGYQ_" + element, JSON.stringify({}));
        }
    }

    public getNumberData(str: string): number {
        let data = localStorage.getItem("WGYQ_" + str);
        return parseInt(data);
    }

    public setNumberData(str: string, value: number) {
        localStorage.setItem("WGYQ_" + str, value.toString());
    }

    public getArrayData<T>(str: string): T[] {
        let data = localStorage.getItem("WGYQ_" + str);
        return JSON.parse(data);
    }

    public setArrayData<T>(str: string, value: T[]) {
        localStorage.setItem("WGYQ_" + str, JSON.stringify(value));
    }

    public getObjectData(str: string) {
        console.log("WGYQ_CurrentDog", "WGYQ_" + str)
        let data = localStorage.getItem("WGYQ_" + str);
        return JSON.parse(data);
    }

    public setObjectData(str: string, value) {
        localStorage.setItem("WGYQ_" + str, JSON.stringify(value));
    }

}

export enum WGYQ_DogName {
    "阿柴",
    "二哈",
    "阿柯",
    "格格",
    "黑罗",
    "大白",
    "泰迪",
    "阿拉斯加",
    "小马"
}

export enum WGYQ_DogType {
    "柴犬",
    "哈士奇",
    "柯基",
    "比格",
    "罗威纳",
    "萨摩耶",
    "贵宾",
    "阿拉斯加",
    "马犬"
}
