import { _decorator, Component, Node, sys } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TCS3D_GameData')
export class TCS3D_GameData {

    public maxScore: number = 0;

    public static _instance: TCS3D_GameData = null;

    public static get Instance(): TCS3D_GameData {
        if (TCS3D_GameData._instance == null) {
            TCS3D_GameData.ReadDate();
        }
        return TCS3D_GameData._instance;
    }

    public static DateSave() {
        let json = JSON.stringify(TCS3D_GameData.Instance);
        sys.localStorage.setItem("TCS3D_DATA", json);
        console.log("游戏存档");
    }

    public static ReadDate() {
        let name = sys.localStorage.getItem("TCS3D_DATA");
        if (name != "" && name != null) {
            console.log("读取存档");
            TCS3D_GameData._instance = Object.assign(new TCS3D_GameData(), JSON.parse(name));
        } else {
            console.log("新建存档");
            TCS3D_GameData._instance = new TCS3D_GameData();

        }


    }
}


