import { _decorator, Component, Node, sys } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ZSTSB_GameData')
export class ZSTSB_GameData {
    // 地图ID
    // public mapID: number = 0;
    // 地图是否解锁
    // 正常版
    public mapLockArr: boolean[] = [true, false, false, false, false];

    // 全部解锁版
    // public mapLockArr: boolean[] = [true, true, true, true, true];

    // //地图点亮进度
    // public mapProgressArr: number[] = [0, 0, 0, 0, 0];

    public static isText: boolean = false;

    public isMapFirst: boolean = true;
    public isGameFirst: boolean = true;
    public isFillFirst: boolean = false;

    public mapData: { MapID: number; BuildingName: string; State: boolean; fillArr: boolean[] }[] = [
        { MapID: 1, BuildingName: "1-1", State: false, fillArr: [] },
        { MapID: 1, BuildingName: "1-2", State: false, fillArr: [] },
        { MapID: 1, BuildingName: "1-3", State: false, fillArr: [] },
        { MapID: 1, BuildingName: "1-10", State: false, fillArr: [] },
        { MapID: 1, BuildingName: "1-4", State: false, fillArr: [] },
        { MapID: 1, BuildingName: "1-5", State: false, fillArr: [] },
        { MapID: 1, BuildingName: "1-11", State: false, fillArr: [] },
        { MapID: 1, BuildingName: "1-6", State: false, fillArr: [] },
        { MapID: 1, BuildingName: "1-7", State: false, fillArr: [] },
        { MapID: 1, BuildingName: "1-14", State: false, fillArr: [] },
        { MapID: 1, BuildingName: "1-12", State: false, fillArr: [] },
        { MapID: 1, BuildingName: "1-8", State: false, fillArr: [] },
        { MapID: 1, BuildingName: "1-9", State: false, fillArr: [] },
        { MapID: 1, BuildingName: "1-13", State: false, fillArr: [] },

        { MapID: 2, BuildingName: "2-101", State: false, fillArr: [] },
        { MapID: 2, BuildingName: "2-10", State: false, fillArr: [] },
        { MapID: 2, BuildingName: "2-2", State: false, fillArr: [] },
        { MapID: 2, BuildingName: "2-71", State: false, fillArr: [] },
        { MapID: 2, BuildingName: "2-7", State: false, fillArr: [] },
        { MapID: 2, BuildingName: "2-1", State: false, fillArr: [] },
        { MapID: 2, BuildingName: "2-4", State: false, fillArr: [] },
        { MapID: 2, BuildingName: "2-5", State: false, fillArr: [] },
        { MapID: 2, BuildingName: "2-3", State: false, fillArr: [] },
        { MapID: 2, BuildingName: "2-31", State: false, fillArr: [] },
        { MapID: 2, BuildingName: "2-32", State: false, fillArr: [] },
        { MapID: 2, BuildingName: "2-6", State: false, fillArr: [] },
        { MapID: 2, BuildingName: "2-8", State: false, fillArr: [] },
        { MapID: 2, BuildingName: "2-81", State: false, fillArr: [] },
        { MapID: 2, BuildingName: "2-82", State: false, fillArr: [] },
        { MapID: 2, BuildingName: "2-83", State: false, fillArr: [] },
        { MapID: 2, BuildingName: "2-9", State: false, fillArr: [] },
        { MapID: 2, BuildingName: "2-91", State: false, fillArr: [] },

        { MapID: 3, BuildingName: "3-4", State: false, fillArr: [] },
        { MapID: 3, BuildingName: "3-5", State: false, fillArr: [] },
        { MapID: 3, BuildingName: "3-6", State: false, fillArr: [] },
        { MapID: 3, BuildingName: "3-7", State: false, fillArr: [] },
        { MapID: 3, BuildingName: "3-1", State: false, fillArr: [] },
        { MapID: 3, BuildingName: "3-2", State: false, fillArr: [] },
        { MapID: 3, BuildingName: "3-3", State: false, fillArr: [] },
        { MapID: 3, BuildingName: "3-8", State: false, fillArr: [] },
        { MapID: 3, BuildingName: "3-9", State: false, fillArr: [] },
        { MapID: 3, BuildingName: "3-10", State: false, fillArr: [] },
        { MapID: 3, BuildingName: "3-11", State: false, fillArr: [] },
        { MapID: 3, BuildingName: "3-12", State: false, fillArr: [] },
        { MapID: 3, BuildingName: "3-13", State: false, fillArr: [] },
        { MapID: 3, BuildingName: "3-14", State: false, fillArr: [] },
        { MapID: 3, BuildingName: "3-15", State: false, fillArr: [] },

        { MapID: 4, BuildingName: "4-1", State: false, fillArr: [] },
        { MapID: 4, BuildingName: "4-2", State: false, fillArr: [] },
        { MapID: 4, BuildingName: "4-8", State: false, fillArr: [] },
        { MapID: 4, BuildingName: "4-4", State: false, fillArr: [] },
        { MapID: 4, BuildingName: "4-5", State: false, fillArr: [] },
        { MapID: 4, BuildingName: "4-3", State: false, fillArr: [] },
        { MapID: 4, BuildingName: "4-6", State: false, fillArr: [] },
        { MapID: 4, BuildingName: "4-9", State: false, fillArr: [] },
        { MapID: 4, BuildingName: "4-10", State: false, fillArr: [] },
        { MapID: 4, BuildingName: "4-7", State: false, fillArr: [] },
        { MapID: 4, BuildingName: "4-11", State: false, fillArr: [] },

        { MapID: 5, BuildingName: "5-1", State: false, fillArr: [] },
        { MapID: 5, BuildingName: "5-2", State: false, fillArr: [] },
        { MapID: 5, BuildingName: "5-8", State: false, fillArr: [] },
        { MapID: 5, BuildingName: "5-5", State: false, fillArr: [] },
        { MapID: 5, BuildingName: "5-6", State: false, fillArr: [] },
        { MapID: 5, BuildingName: "5-10", State: false, fillArr: [] },
        { MapID: 5, BuildingName: "5-7", State: false, fillArr: [] },
        { MapID: 5, BuildingName: "5-3", State: false, fillArr: [] },
        { MapID: 5, BuildingName: "5-4", State: false, fillArr: [] },
        { MapID: 5, BuildingName: "5-9", State: false, fillArr: [] },


    ];

    // 使用Map存储显示数量数据，提高查找效率并节省空间
    private static startShowData = new Map<string, number>([
        // Map 1 buildings
        ["1-1", 5], ["1-2", 3], ["1-3", 5], ["1-4", 3], ["1-5", 5],
        ["1-6", 3], ["1-7", 5], ["1-8", 3], ["1-9", 5], ["1-10", 5],
        ["1-11", 5], ["1-12", 5], ["1-13", 3], ["1-14", 5],

        // Map 2 buildings
        ["2-1", 5], ["2-2", 5], ["2-3", 5], ["2-31", 3], ["2-32", 5],
        ["2-4", 5], ["2-5", 5], ["2-6", 5], ["2-7", 3], ["2-71", 3],
        ["2-8", 3], ["2-81", 3], ["2-82", 3], ["2-83", 3], ["2-9", 3],
        ["2-91", 3], ["2-10", 3], ["2-101", 3],

        // Map 3 buildings
        ["3-1", 3], ["3-2", 3], ["3-3", 3], ["3-4", 3], ["3-5", 3],
        ["3-6", 2], ["3-7", 2], ["3-8", 5], ["3-9", 3], ["3-10", 3],
        ["3-11", 5], ["3-12", 3], ["3-13", 3], ["3-14", 5], ["3-15", 3],

        // Map 4 buildings
        ["4-1", 5], ["4-2", 5], ["4-3", 5], ["4-4", 3], ["4-5", 3], ["4-6", 5],
        ["4-7", 5], ["4-8", 3], ["4-9", 3], ["4-10", 5], ["4-11", 5],

        // Map 4 buildings
        ["5-1", 5], ["5-2", 5], ["5-3", 5], ["5-4", 5], ["5-5", 4],
        ["5-6", 4], ["5-7", 3], ["5-8", 5], ["5-9", 5], ["5-10", 5],
    ]);

    //道具数据
    public propData: { PropName: string; PropNum: number }[] = [
        { PropName: "消除当前数字索引", PropNum: 10 },
    ]

    public static getShowNumByName(buildingName: string): number {
        return this.startShowData.get(buildingName) ?? null;
    }


    public getMapDataByID(mapID: number): { MapID: number; BuildingName: string; State: boolean }[] {
        return this.mapData.filter(item => item.MapID === mapID)
            .map(({ MapID, BuildingName, State }) => ({ MapID, BuildingName, State }));
    }

    public getMapDataByName(mapID: number, buildingName: string): {
        MapID: number; BuildingName: string; State: boolean
    } {
        const item = this.mapData.find(item => item.MapID === mapID && item.BuildingName === buildingName);
        const data = { MapID: item.MapID, BuildingName: item.BuildingName, State: item.State };
        return data;
    }

    public BuildingMap: { [key: string]: boolean[] } = {};

    public getBuildingData(mapID: number, buildingName: string): boolean[] {
        const key = mapID + buildingName;
        return this.BuildingMap[key] || null;
    }

    public setBuildingData(mapID: number, buildingName: string, flag: boolean) {
        for (let data of this.mapData) {
            if (data.MapID === mapID && data.BuildingName === buildingName) {
                data.State = flag;
                break;
            }
        }
    }

    public saveBuildingData(mapID: number, buildingName: string, fillArr: boolean[]) {
        const item = this.mapData.find(item => item.MapID === mapID && item.BuildingName === buildingName);
        const key = mapID + buildingName;

        if (!fillArr) {
            delete this.BuildingMap[key];
            item.State = true;
            return;
        }

        if (item) {
            item.fillArr = fillArr;
            this.BuildingMap[key] = fillArr; // 直接存储
        }
    }



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
        sys.localStorage.setItem("ZSTSB_DATA", json);
        console.log("游戏存档");
    }
    public static ReadDate() {
        let name = sys.localStorage.getItem("ZSTSB_DATA");
        if (name != "" && name != null) {
            console.log("读取存档");
            ZSTSB_GameData.instance = Object.assign(new ZSTSB_GameData(), JSON.parse(name));
        } else {
            console.log("新建存档");
            ZSTSB_GameData.instance = new ZSTSB_GameData();
        }
    }
}


