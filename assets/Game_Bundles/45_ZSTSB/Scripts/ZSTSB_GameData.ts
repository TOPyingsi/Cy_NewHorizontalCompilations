import { _decorator, Component, Node, sys } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ZSTSB_GameData')
export class ZSTSB_GameData {
    // //地图ID
    // public mapID: number = 0;
    //地图是否解锁
    public mapLockArr: boolean[] = [true, false, false, false, false];
    //地图点亮进度
    public mapProgressArr: number[] = [0, 0, 0, 0, 0];

    public isMapFirst: boolean = true;
    public isGameFirst: boolean = true;

    public mapData: { MapID: number; BuildingName: string; State: boolean; fillArr: boolean[] }[] = [
        { MapID: 1, BuildingName: "1-1", State: false, fillArr: [] },
        { MapID: 1, BuildingName: "1-2", State: false, fillArr: [] },
        { MapID: 1, BuildingName: "1-3", State: false, fillArr: [] },
        { MapID: 1, BuildingName: "1-4", State: false, fillArr: [] },
        { MapID: 1, BuildingName: "1-5", State: false, fillArr: [] },
        { MapID: 1, BuildingName: "1-6", State: false, fillArr: [] },
        { MapID: 1, BuildingName: "1-7", State: false, fillArr: [] },
        { MapID: 1, BuildingName: "1-8", State: false, fillArr: [] },
        { MapID: 1, BuildingName: "1-9", State: false, fillArr: [] },
        { MapID: 1, BuildingName: "1-10", State: false, fillArr: [] },
        { MapID: 1, BuildingName: "1-11", State: false, fillArr: [] },
        { MapID: 1, BuildingName: "1-12", State: false, fillArr: [] },

        { MapID: 2, BuildingName: "2-1", State: false, fillArr: [] },
        { MapID: 2, BuildingName: "2-2", State: false, fillArr: [] },
        { MapID: 2, BuildingName: "2-3", State: false, fillArr: [] },
        { MapID: 2, BuildingName: "2-31", State: false, fillArr: [] },
        { MapID: 2, BuildingName: "2-32", State: false, fillArr: [] },
        { MapID: 2, BuildingName: "2-4", State: false, fillArr: [] },
        { MapID: 2, BuildingName: "2-5", State: false, fillArr: [] },
        { MapID: 2, BuildingName: "2-6", State: false, fillArr: [] },
        { MapID: 2, BuildingName: "2-7", State: false, fillArr: [] },
        { MapID: 2, BuildingName: "2-71", State: false, fillArr: [] },
        { MapID: 2, BuildingName: "2-8", State: false, fillArr: [] },
        { MapID: 2, BuildingName: "2-81", State: false, fillArr: [] },
        { MapID: 2, BuildingName: "2-9", State: false, fillArr: [] },
        { MapID: 2, BuildingName: "2-91", State: false, fillArr: [] },
        { MapID: 2, BuildingName: "2-10", State: false, fillArr: [] },
        { MapID: 2, BuildingName: "2-101", State: false, fillArr: [] },
    ];

    public getMapDataByID(mapID: number): { MapID: number; BuildingName: string; State: boolean }[] {
        let resArr: { MapID: number; BuildingName: string; State: boolean }[] = [];
        for (let i = 0; i < this.mapData.length; i++) {
            if (this.mapData[i].MapID == mapID) {
                resArr.push(this.mapData[i]);
            }
        }
        return resArr;
    }


    public getMapDataByName(mapID: number, buildingName: string): { MapID: number; BuildingName: string; State: boolean; fillArr: boolean[] } {
        for (let i = 0; i < this.mapData.length; i++) {
            if (this.mapData[i].MapID == mapID && this.mapData[i].BuildingName == buildingName) {
                return this.mapData[i];
            }
        }

        return null;

    }

    public saveBuildingData(mapID: number, buildingName: string, fillArr: boolean[]) {
        for (let i = 0; i < this.mapData.length; i++) {
            if (this.mapData[i].MapID == mapID && this.mapData[i].BuildingName == buildingName) {
                this.mapData[i].fillArr = fillArr;
            }
        }

        return null;
    }

    //道具数据
    public propData: { PropName: string; PropNum: number }[] = [
        { PropName: "消除当前数字索引", PropNum: 10 },
    ]

    getPropByName(propName: string) {
        for (let i = 0; i < this.propData.length; i++) {
            if (this.propData[i].PropName === propName) {
                return this.propData[i].PropNum;
            }
        }

        return null;
    }

    pushPropByName(propName: string, propNum: number) {
        for (let i = 0; i < this.propData.length; i++) {
            if (this.propData[i].PropName === propName) {
                this.propData[i].PropNum += propNum;
                console.log("添加道具" + this.propData[i].PropName + "成功");
                return true;
            }
        }

        console.log("获得道具失败");
        return null;
    }

    subPropByName(propName: string, propNum: number) {
        for (let i = 0; i < this.propData.length; i++) {
            if (this.propData[i].PropName === propName && this.propData[i].PropNum >= 0) {
                this.propData[i].PropNum -= propNum;
                console.log("移除道具" + this.propData[i].PropName + "成功");
                return true;
            }
        }

        console.log("道具移除失败");
        return null;
    }

    private static instance: ZSTSB_GameData = null;

    public static get Instance(): ZSTSB_GameData {
        if (!ZSTSB_GameData.instance) {
            this.ReadDate();
        }
        return ZSTSB_GameData.instance;
    }


    public TimeDate: number[] = [];
    public static DateSave() {
        let json = JSON.stringify(ZSTSB_GameData.Instance);
        sys.localStorage.setItem("HJMSJ_DATA", json);
        console.log("游戏存档");
    }
    public static ReadDate() {
        let name = sys.localStorage.getItem("HJMSJ_DATA");
        if (name != "" && name != null) {
            console.log("读取存档");
            ZSTSB_GameData.instance = Object.assign(new ZSTSB_GameData(), JSON.parse(name));
        } else {
            console.log("新建存档");
            ZSTSB_GameData.instance = new ZSTSB_GameData();
        }


    }
}


